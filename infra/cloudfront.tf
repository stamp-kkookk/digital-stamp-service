# =============================================================================
# CloudFront Distribution (Single entry point)
#   /* → S3 Frontend (default)
#   /api/* → Gateway EC2 (backend proxy)
# =============================================================================

# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.project_name}-s3-oac"
  description                       = "OAC for S3 frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "KKOOKK - Frontend + API"
  price_class         = "PriceClass_200" # NA + EU + Asia (includes Seoul)

  aliases = var.domain_name != "" ? [var.domain_name] : []

  # --- Origin 1: S3 Frontend ---
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  # --- Origin 2: Gateway EC2 (API proxy) ---
  # CloudFront requires domain name, not IP. Use gw.domain or EC2 public DNS.
  origin {
    domain_name = var.domain_name != "" && var.route53_zone_id != "" ? "gw.${var.domain_name}" : aws_instance.gateway.public_dns
    origin_id   = "gateway-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # Gateway nginx listens on HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # --- Default behavior: S3 Frontend ---
  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400  # 1 day
    max_ttl     = 604800 # 7 days
  }

  # --- /api/* behavior: Forward to Gateway ---
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "gateway-api"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Accept", "Origin"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0 # No caching for API
    max_ttl     = 0
  }

  # /oauth/* is now a frontend SPA route (/oauth/complete).
  # Backend OAuth callbacks are at /api/public/oauth2/callback/* (covered by /api/*).
  # No separate /oauth/* behavior needed — falls through to default S3 behavior.

  # SPA: custom error response to handle client-side routing
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  # SSL Certificate
  viewer_certificate {
    acm_certificate_arn            = var.domain_name != "" ? aws_acm_certificate_validation.main[0].certificate_arn : null
    cloudfront_default_certificate = var.domain_name == ""
    ssl_support_method             = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version       = var.domain_name != "" ? "TLSv1.2_2021" : null
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = { Name = "${var.project_name}-cdn" }

  depends_on = [aws_route53_record.gateway]
}

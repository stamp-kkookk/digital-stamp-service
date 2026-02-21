# =============================================================================
# Route 53 + ACM Certificate (conditional on domain_name)
# =============================================================================

# ACM Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "main" {
  count    = var.domain_name != "" ? 1 : 0
  provider = aws.us_east_1

  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = { Name = "${var.project_name}-cert" }

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation record in Route 53
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in(var.domain_name != "" ? aws_acm_certificate.main[0].domain_validation_options : []) :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    } if var.route53_zone_id != ""
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60

  allow_overwrite = true
}

# Wait for certificate validation
resource "aws_acm_certificate_validation" "main" {
  count    = var.domain_name != "" ? 1 : 0
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = var.route53_zone_id != "" ? [for r in aws_route53_record.cert_validation : r.fqdn] : []
}

# A record: domain → CloudFront
resource "aws_route53_record" "main" {
  count = var.route53_zone_id != "" && var.domain_name != "" ? 1 : 0

  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# A record: Gateway subdomain for CloudFront origin (CF requires domain, not IP)
resource "aws_route53_record" "gateway" {
  count = var.route53_zone_id != "" && var.domain_name != "" ? 1 : 0

  zone_id = var.route53_zone_id
  name    = "gw.${var.domain_name}"
  type    = "A"
  ttl     = 60
  records = [aws_eip.gateway.public_ip]
}

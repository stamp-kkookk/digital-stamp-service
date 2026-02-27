output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_url" {
  description = "CloudFront HTTPS URL"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "N/A"
}

output "bastion_public_ip" {
  description = "Bastion/Gateway EC2 public IP"
  value       = aws_eip.gateway.public_ip
}

output "backend_private_ip" {
  description = "Backend EC2 private IP"
  value       = aws_instance.backend.private_ip
}

output "monitoring_private_ip" {
  description = "Monitoring EC2 private IP"
  value       = aws_instance.monitoring.private_ip
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_address" {
  description = "RDS MySQL address (without port)"
  value       = aws_db_instance.mysql.address
}

output "s3_frontend_bucket" {
  description = "S3 bucket for frontend hosting"
  value       = aws_s3_bucket.frontend.id
}

output "s3_artifacts_bucket" {
  description = "S3 bucket for deployment artifacts"
  value       = aws_s3_bucket.artifacts.id
}

output "s3_images_bucket" {
  description = "S3 bucket for image storage (store icons, stampcard images, migration photos)"
  value       = aws_s3_bucket.images.id
}

output "ssh_config" {
  description = "SSH config snippet for easy access"
  value       = <<-EOT

    # Add to ~/.ssh/config
    Host kkookk-bastion
        HostName ${aws_eip.gateway.public_ip}
        User ubuntu
        IdentityFile ~/.ssh/${var.key_pair_name}.pem

    Host kkookk-backend
        HostName ${aws_instance.backend.private_ip}
        User ubuntu
        IdentityFile ~/.ssh/${var.key_pair_name}.pem
        ProxyJump kkookk-bastion

    Host kkookk-monitoring
        HostName ${aws_instance.monitoring.private_ip}
        User ubuntu
        IdentityFile ~/.ssh/${var.key_pair_name}.pem
        ProxyJump kkookk-bastion
  EOT
}

output "ssh_tunnels" {
  description = "Useful SSH tunnel commands"
  value       = <<-EOT

    # Grafana:     ssh -L 3000:${aws_instance.monitoring.private_ip}:3000 kkookk-bastion
    # Prometheus:  ssh -L 9090:${aws_instance.monitoring.private_ip}:9090 kkookk-bastion
    # RDS MySQL:   ssh -L 3307:${aws_db_instance.mysql.address}:3306 kkookk-bastion
    # Backend:     ssh -L 7070:${aws_instance.backend.private_ip}:7070 kkookk-bastion
  EOT
}

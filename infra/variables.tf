variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "key_pair_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into bastion (your IP)"
  type        = list(string)
}

variable "domain_name" {
  description = "Custom domain name (e.g. kkookk.com)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for the domain (leave empty to skip DNS)"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "kkookkuser"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "kkookkdb"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "kkookk"
}

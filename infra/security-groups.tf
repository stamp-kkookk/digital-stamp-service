# =============================================================================
# Security Group: Gateway/Bastion (Public)
# =============================================================================

resource "aws_security_group" "gateway" {
  name_prefix = "${var.project_name}-gateway-"
  description = "Gateway/Bastion - SSH + HTTP from CloudFront"
  vpc_id      = aws_vpc.main.id

  # SSH from allowed IPs only
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # HTTP from anywhere (CloudFront origin requests)
  ingress {
    description = "HTTP from CloudFront"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # NAT: Allow all traffic from private subnets (for NAT forwarding)
  ingress {
    description = "NAT from private subnets"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.10.0/24", "10.0.20.0/24"]
  }

  # All outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-gateway" }

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Security Group: Backend (Private)
# — Metrics ingress from Monitoring added via separate rule (avoid cycle)
# =============================================================================

resource "aws_security_group" "backend" {
  name_prefix = "${var.project_name}-backend-"
  description = "Backend EC2 - HTTP from Gateway, metrics from Monitoring"
  vpc_id      = aws_vpc.main.id

  # HTTP from Gateway (nginx reverse proxy)
  ingress {
    description     = "HTTP from Gateway"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  # SSH from Gateway (bastion hop)
  ingress {
    description     = "SSH from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  # All outbound (via NAT instance)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-backend" }

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Security Group: Monitoring (Private)
# — Loki ingress from Backend added via separate rule (avoid cycle)
# =============================================================================

resource "aws_security_group" "monitoring" {
  name_prefix = "${var.project_name}-monitoring-"
  description = "Monitoring EC2 - Grafana/Prometheus/Loki/AlertManager"
  vpc_id      = aws_vpc.main.id

  # SSH from Gateway (bastion hop)
  ingress {
    description     = "SSH from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  # Monitoring ports from Gateway (SSH tunnel access)
  ingress {
    description     = "Grafana via SSH tunnel"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  ingress {
    description     = "Prometheus via SSH tunnel"
    from_port       = 9090
    to_port         = 9090
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  ingress {
    description     = "Loki via SSH tunnel"
    from_port       = 3100
    to_port         = 3100
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  ingress {
    description     = "AlertManager via SSH tunnel"
    from_port       = 9093
    to_port         = 9093
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  # All outbound (via NAT instance)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-monitoring" }

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Cross-reference rules (separate to avoid circular dependency)
# =============================================================================

# Monitoring → Backend: Prometheus scrapes metrics from Backend
resource "aws_security_group_rule" "backend_metrics_from_monitoring" {
  type                     = "ingress"
  from_port                = 7070
  to_port                  = 7070
  protocol                 = "tcp"
  description              = "Prometheus metrics from Monitoring"
  security_group_id        = aws_security_group.backend.id
  source_security_group_id = aws_security_group.monitoring.id
}

# Backend → Monitoring: Backend sends logs to Loki
resource "aws_security_group_rule" "monitoring_loki_from_backend" {
  type                     = "ingress"
  from_port                = 3100
  to_port                  = 3100
  protocol                 = "tcp"
  description              = "Loki log ingestion from Backend"
  security_group_id        = aws_security_group.monitoring.id
  source_security_group_id = aws_security_group.backend.id
}

# =============================================================================
# Security Group: RDS (Private)
# =============================================================================

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  description = "RDS MySQL - access from Backend only"
  vpc_id      = aws_vpc.main.id

  # MySQL from Backend
  ingress {
    description     = "MySQL from Backend"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  # MySQL from Gateway (for SSH tunnel access from laptop)
  ingress {
    description     = "MySQL via SSH tunnel"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }

  tags = { Name = "${var.project_name}-sg-rds" }

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# RDS MySQL (Private Subnet, Single-AZ)
# =============================================================================

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db-subnet"
  description = "RDS subnet group across 2 AZs"
  subnet_ids  = [aws_subnet.private_a.id, aws_subnet.private_c.id]

  tags = { Name = "${var.project_name}-db-subnet" }
}

resource "aws_db_instance" "mysql" {
  identifier     = "${var.project_name}-db"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t4g.micro"

  allocated_storage     = 20
  max_allocated_storage = 50 # Autoscaling up to 50GB
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = false # Single-AZ for cost
  publicly_accessible    = false
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.project_name}-db-final-snapshot"

  backup_retention_period = 7
  backup_window           = "03:00-04:00" # UTC (KST 12:00-13:00)
  maintenance_window      = "sun:04:00-sun:05:00"

  parameter_group_name = aws_db_parameter_group.mysql.name

  tags = { Name = "${var.project_name}-db" }
}

resource "aws_db_parameter_group" "mysql" {
  name_prefix = "${var.project_name}-mysql8-"
  family      = "mysql8.0"
  description = "KKOOKK MySQL 8.0 parameters"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "time_zone"
    value = "Asia/Seoul"
  }

  parameter {
    name  = "slow_query_log"
    value = "1"
  }

  parameter {
    name  = "long_query_time"
    value = "1"
  }

  lifecycle {
    create_before_destroy = true
  }
}

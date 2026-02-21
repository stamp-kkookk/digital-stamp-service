# =============================================================================
# Gateway / Bastion / NAT Instance (Public Subnet)
# =============================================================================

resource "aws_instance" "gateway" {
  ami                    = data.aws_ami.ubuntu_arm.id
  instance_type          = "t4g.micro"
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.gateway.id]
  iam_instance_profile   = aws_iam_instance_profile.gateway.name

  # NAT instance requires source/dest check disabled
  source_dest_check = false

  root_block_device {
    volume_size = 10
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = file("${path.module}/scripts/user-data-gateway.sh")

  tags = { Name = "${var.project_name}-gateway" }

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# Elastic IP for stable public address
resource "aws_eip" "gateway" {
  instance = aws_instance.gateway.id
  domain   = "vpc"

  tags = { Name = "${var.project_name}-gateway-eip" }
}

# Auto Recovery: restart on system status check failure (~5 min recovery)
resource "aws_cloudwatch_metric_alarm" "gateway_recovery" {
  alarm_name          = "${var.project_name}-gateway-auto-recovery"
  alarm_description   = "Auto-recover Gateway EC2 on status check failure"
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_System"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"

  dimensions = {
    InstanceId = aws_instance.gateway.id
  }

  alarm_actions = [
    "arn:aws:automate:${var.aws_region}:ec2:recover"
  ]
}

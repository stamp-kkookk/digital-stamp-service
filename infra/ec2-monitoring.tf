# =============================================================================
# Monitoring EC2 (Private Subnet)
# =============================================================================

resource "aws_instance" "monitoring" {
  ami                    = data.aws_ami.ubuntu_arm.id
  instance_type          = "t4g.micro"
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.private_a.id
  vpc_security_group_ids = [aws_security_group.monitoring.id]
  iam_instance_profile   = aws_iam_instance_profile.monitoring.name

  root_block_device {
    volume_size = 15
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = file("${path.module}/scripts/user-data-monitoring.sh")

  tags = { Name = "${var.project_name}-monitoring" }

  depends_on = [aws_instance.gateway] # NAT must be ready for outbound

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

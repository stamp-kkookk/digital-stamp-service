# =============================================================================
# Backend EC2 (Private Subnet)
# =============================================================================

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu_arm.id
  instance_type          = "t4g.small"
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.private_a.id
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = aws_iam_instance_profile.backend.name

  root_block_device {
    volume_size = 15
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = templatefile("${path.module}/scripts/user-data-backend.sh", {
    s3_artifacts_bucket = aws_s3_bucket.artifacts.id
    monitoring_ip       = aws_instance.monitoring.private_ip
  })

  tags = { Name = "${var.project_name}-backend" }

  depends_on = [aws_instance.gateway] # NAT must be ready for outbound

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

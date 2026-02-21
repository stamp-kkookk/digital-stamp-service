# =============================================================================
# IAM Role: EC2 instances (SSM + S3 access)
# =============================================================================

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# --- Backend EC2 Role ---

resource "aws_iam_role" "backend" {
  name               = "${var.project_name}-backend-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

# SSM managed instance (for remote command execution)
resource "aws_iam_role_policy_attachment" "backend_ssm" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# S3 access for artifact download
resource "aws_iam_policy" "backend_s3" {
  name        = "${var.project_name}-backend-s3"
  description = "Allow backend to download artifacts from S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.artifacts.arn,
          "${aws_s3_bucket.artifacts.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backend_s3" {
  role       = aws_iam_role.backend.name
  policy_arn = aws_iam_policy.backend_s3.arn
}

resource "aws_iam_instance_profile" "backend" {
  name = "${var.project_name}-backend-profile"
  role = aws_iam_role.backend.name
}

# --- Gateway EC2 Role ---

resource "aws_iam_role" "gateway" {
  name               = "${var.project_name}-gateway-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "gateway_ssm" {
  role       = aws_iam_role.gateway.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "gateway" {
  name = "${var.project_name}-gateway-profile"
  role = aws_iam_role.gateway.name
}

# --- Monitoring EC2 Role ---

resource "aws_iam_role" "monitoring" {
  name               = "${var.project_name}-monitoring-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "monitoring_ssm" {
  role       = aws_iam_role.monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# S3 access for monitoring config download
resource "aws_iam_role_policy_attachment" "monitoring_s3" {
  role       = aws_iam_role.monitoring.name
  policy_arn = aws_iam_policy.backend_s3.arn
}

resource "aws_iam_instance_profile" "monitoring" {
  name = "${var.project_name}-monitoring-profile"
  role = aws_iam_role.monitoring.name
}

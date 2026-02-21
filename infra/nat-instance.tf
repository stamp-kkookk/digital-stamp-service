# =============================================================================
# NAT Instance Configuration
# =============================================================================
#
# The Gateway EC2 instance doubles as a NAT instance.
# NAT iptables rules are configured in user-data-gateway.sh.
# This file contains the supplementary AWS-level configuration.
#
# source_dest_check = false is set on the Gateway instance in ec2-gateway.tf.
# The private route table (vpc.tf) routes 0.0.0.0/0 through the Gateway ENI.
#
# No additional Terraform resources needed — all NAT logic is in:
#   1. ec2-gateway.tf   → source_dest_check = false
#   2. vpc.tf           → private route table → Gateway ENI
#   3. user-data-gateway.sh → iptables MASQUERADE rules

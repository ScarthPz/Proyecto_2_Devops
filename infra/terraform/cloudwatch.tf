# =============================================================
# CloudWatch — Observabilidad básica (logs y métricas)
# Log Group para el control plane del clúster EKS (api, audit,
# authenticator), habilitado directamente en aws_eks_cluster.eks
# (ver eks.tf: enabled_cluster_log_types).
# Retención de 7 días para no acumular costos en AWS Academy.
# =============================================================

resource "aws_cloudwatch_log_group" "eks_cluster_logs" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 7

  tags = {
    Name    = "${var.project_name}-eks-logs"
    Project = var.project_name
  }
}

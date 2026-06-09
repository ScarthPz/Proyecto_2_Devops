output "frontend_ecr" {
  value = aws_ecr_repository.frontend.repository_url
}

output "backend_despachos_ecr" {
  value = aws_ecr_repository.backend_despachos.repository_url
}

output "backend_ventas_ecr" {
  value = aws_ecr_repository.backend_ventas.repository_url
}

output "cluster_name" {
  value = aws_eks_cluster.eks.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.eks.endpoint
}

output "security_group_id" {
  value = aws_security_group.eks_nodes_sg.id
}

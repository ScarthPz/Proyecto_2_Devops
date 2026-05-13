output "backend_despachos" {
  value = aws_ecr_repository.backend_despachos.repository_url
}
output "backend_ventas" {
  value = aws_ecr_repository.backend_ventas.repository_url
}
output "frontend_ecr" {
  value = aws_ecr_repository.frontend.repository_url
}
output "mysql_ip" {
  value       = aws_instance.db.private_ip
  description = "IP privada de la EC2 MySQL (solo accesible desde la VPC)"
}
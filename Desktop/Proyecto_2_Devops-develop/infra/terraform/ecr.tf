resource "aws_ecr_repository" "frontend" {
  name         = "frontend_despacho"
  force_delete = true
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_repository" "backend_despachos" {
  name         = "backend_despachos"
  force_delete = true
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_repository" "backend_ventas" {
  name         = "backend_ventas"
  force_delete = true
  image_scanning_configuration { scan_on_push = true }
}
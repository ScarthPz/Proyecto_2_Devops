
#Elastic Container Service

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

data "aws_iam_role" "lab" {
  name = "LabRole"
}
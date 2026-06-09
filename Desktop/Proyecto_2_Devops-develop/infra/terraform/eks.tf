data "aws_iam_role" "labrole" {
  name = "LabRole"
}

resource "aws_eks_cluster" "eks" {
  name     = var.cluster_name
  role_arn = data.aws_iam_role.labrole.arn

  vpc_config {
    subnet_ids         = [aws_subnet.public.id, aws_subnet.public_b.id]
    security_group_ids = [aws_security_group.eks_nodes_sg.id]
  }
}

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.eks.name
  node_group_name = "${var.project_name}-workers"
  node_role_arn   = data.aws_iam_role.labrole.arn
  subnet_ids      = [aws_subnet.public.id, aws_subnet.public_b.id]

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  instance_types = ["t3.medium"]
  capacity_type  = "ON_DEMAND"
}
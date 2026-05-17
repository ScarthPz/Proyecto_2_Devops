resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([

    {
      name  = "backend_ventas"
      image = "${aws_ecr_repository.backend_ventas.repository_url}:latest"

      portMappings = [
        {
          containerPort = 8080
        }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health/readiness || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 5
        startPeriod = 120
      }

      environment = [
        { name = "DB_ENDPOINT", value = aws_instance.db.private_ip },
        { name = "DB_PORT", value = "3306" },
        { name = "DB_NAME", value = var.db_ven },
        { name = "DB_USERNAME", value = var.db_user },
        { name = "DB_PASSWORD", value = var.db_password }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name,
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "backend_ventas"
        }
      }
    },
    {
      name  = "backend_despachos"
      image = "${aws_ecr_repository.backend_despachos.repository_url}:latest"

      portMappings = [
        {
          containerPort = 8081
        }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8081/actuator/health/readiness || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 5
        startPeriod = 120
      }

      environment = [
        { name = "DB_ENDPOINT", value = aws_instance.db.private_ip },
        { name = "DB_PORT", value = "3306" },
        { name = "DB_NAME", value = var.db_desp },
        { name = "DB_USERNAME", value = var.db_user },
        { name = "DB_PASSWORD", value = var.db_password }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name,
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "backend_despachos"
        }
      }
    },

    {
      name  = "frontend"
      image = "${aws_ecr_repository.frontend.repository_url}:latest"

      portMappings = [
        {
          containerPort = 80
        }
      ]

      dependsOn = [
        {
          containerName = "backend_ventas",
          condition     = "HEALTHY"
        },
        {
          containerName = "backend_despachos",
          condition     = "HEALTHY"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name,
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "frontend"
        }
      }
    }

  ])
}
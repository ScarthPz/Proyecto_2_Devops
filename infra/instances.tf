data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "db" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.db_mysql.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    set -xe
    exec > /var/log/user-data.log 2>&1

    dnf update -y
    dnf install -y docker --allowerasing

    systemctl start docker
    systemctl enable docker

    sleep 5
    until docker info > /dev/null 2>&1; do
      echo "Esperando Docker..."
      sleep 3
    done

    docker system prune -af

    docker run -d \
      --name mysql \
      -e MYSQL_ROOT_PASSWORD="${var.db_password}" \
      -e MYSQL_ROOT_HOST=% \
      -p 3306:3306 \
      --log-opt max-size=10m \
      --log-opt max-file=3 \
      --restart unless-stopped \
      mysql:8-oracle \
      --bind-address=0.0.0.0 \
      --performance-schema=OFF

    echo "Esperando que MySQL esté listo..."
    sleep 20

    until docker exec mysql mysqladmin ping -uroot -p"${var.db_password}" --silent 2>/dev/null; do
      echo "MySQL aún no responde, esperando..."
      sleep 5
    done

    echo "MySQL listo. Creando bases de datos..."

    docker exec mysql mysql -uroot -p"${var.db_password}" -e "
      CREATE DATABASE IF NOT EXISTS db_ventas;
      CREATE DATABASE IF NOT EXISTS db_despachos;
    "

    echo "Script finalizado correctamente"
  EOF

  tags = {
    Name = "${var.project_name}-mysql"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 7
}
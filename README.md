# Innovatech Chile — Sistema de Gestión de Despachos

> Sistema de gestión de despachos y ventas desarrollado con arquitectura de microservicios, desplegado en AWS con ECS Fargate e infraestructura como código con Terraform, automatizado mediante GitHub Actions.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Nginx |
| Backend Ventas | Spring Boot 3 + Java 17 + JPA/Hibernate + Actuator |
| Backend Despachos | Spring Boot 3 + Java 17 + JPA/Hibernate + Actuator |
| Base de datos | MySQL 8 (EC2 en subred privada) |
| Contenedorización | Docker + Docker Compose |
| Infraestructura | AWS ECS Fargate + ECR + VPC — IaC con Terraform |
| CI/CD | GitHub Actions |

---

## Estructura del proyecto

```
Proyecto_2_Devops/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Pipeline CI — build y tests (rama develop)
│       └── cd.yml                     # Pipeline CD — build, push ECR y deploy ECS (rama deploy)
├── front_despacho/                    # Frontend React (puerto 80)
│   ├── Dockerfile
│   └── nginx.conf                     # Proxy inverso hacia backends
├── back-Ventas_SpringBoot/
│   └── Springboot-API-REST/           # Backend Ventas (puerto 8080)
│       ├── Dockerfile
│       └── entrypoint.sh
├── back-Despachos_SpringBoot/
│   └── Springboot-API-REST-DESPACHO/  # Backend Despachos (puerto 8081)
│       ├── Dockerfile
│       └── entrypoint.sh
├── infra/                             # Infraestructura como código (Terraform)
│   ├── main.tf
│   ├── vpc.tf
│   ├── instances.tf
│   ├── ecs.tf
│   ├── task_app.tf
│   ├── service.tf
│   ├── security_groups.tf
│   ├── ecr.tf
│   ├── variables.tf
│   └── outputs.tf
├── docker-compose.yml                 # Stack completo para ejecución local
└── README.md
```

---

## Arquitectura AWS

```
Internet
    │
    ▼
┌─────────────────────────────────────────────┐
│              VPC devops_vpc                  │
│              10.0.0.0/16                     │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │         Subred Pública              │     │
│  │  ┌──────────────────────────────┐   │     │
│  │  │     ECS Fargate Task         │   │     │
│  │  │                              │   │     │
│  │  │  [Frontend  :80  ]  ◄── Internet │   │
│  │  │  [Backend Ventas :8080]       │   │     │
│  │  │  [Backend Despachos :8081]    │   │     │
│  │  └──────────────────────────────┘   │     │
│  └─────────────────────────────────────┘     │
│                    │                         │
│  ┌─────────────────────────────────────┐     │
│  │         Subred Privada              │     │
│  │  ┌──────────────────────────────┐   │     │
│  │  │   EC2 MySQL :3306            │   │     │
│  │  │   db_ventas + db_despachos   │   │     │
│  │  └──────────────────────────────┘   │     │
│  └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

Los tres microservicios corren en la misma **ECS Fargate Task** con red `awsvpc`, compartiendo `localhost`. El Nginx del frontend actúa como proxy inverso:

- `/api/ventas/*` → `localhost:8080`
- `/api/despachos/*` → `localhost:8081`

MySQL corre en una EC2 dentro de la subred privada, accesible únicamente desde el Security Group de ECS.

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Terraform CLI >= 1.0](https://www.terraform.io/)
- Git

---

## Ejecución local con Docker Compose

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Proyecto_2_Devops
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
MYSQL_ROOT_PASSWORD=rootsecreto
MYSQL_DATABASE_VENTAS=db_ventas
MYSQL_DATABASE_DESPACHOS=db_despachos
```

### 3. Levantar los servicios

```bash
docker compose up --build -d
```

### 4. Acceder a la aplicación

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend Ventas | http://localhost:8080 |
| Backend Despachos | http://localhost:8081 |
| Swagger Ventas | http://localhost:8080/swagger-ui.html |
| Swagger Despachos | http://localhost:8081/swagger-ui.html |

### 5. Detener los servicios

```bash
docker compose down

# Para eliminar también los volúmenes (borra la BD)
docker compose down -v
```

---

## Ejecución de tests

Los tests usan H2 como base de datos en memoria para no depender de MySQL.

### Backend Ventas

```bash
cd back-Ventas_SpringBoot/Springboot-API-REST
mvn clean install
```

### Backend Despachos

```bash
cd back-Despachos_SpringBoot/Springboot-API-REST-DESPACHO
mvn clean install
```

Los tests de contexto (`contextLoads`) verifican que el contexto de Spring Boot levanta correctamente con el perfil `test`, el cual usa H2 en memoria en vez de MySQL.

---

## Despliegue en AWS con Terraform

### 1. Configurar credenciales AWS Academy

Obtén los valores desde **AWS Academy → Start Lab → AWS Details → AWS CLI**:

```bash
aws configure
# O exportar directamente:
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

### 2. Crear archivo de variables

Dentro de la carpeta `infra/`, crea `terraform.tfvars` (ignorado por `.gitignore`):

```hcl
db_password   = "tu_password"
key_pair_name = "nombre_de_tu_keypair"
```

### 3. Desplegar infraestructura

```bash
cd infra
terraform init
terraform plan
terraform apply
```

Esto crea:
- VPC `devops_vpc` (10.0.0.0/16) con subredes pública y privada
- NAT Gateway para salida de la subred privada
- ECS Cluster + Task Definition + Service (Fargate)
- EC2 con MySQL en subred privada
- Repositorios ECR: `devops-e2-frontend`, `devops-e2-backend-ventas`, `devops-e2-backend-despachos`
- Security Groups con acceso controlado
- CloudWatch Log Group `/ecs/devops-e2` con retención de 7 días

### 4. Obtener outputs

```bash
terraform output
```

---

## Pipeline CI/CD

El proyecto tiene dos pipelines separados siguiendo buenas prácticas:

### CI — `ci.yml` (rama `develop`)

Se ejecuta en cada push a `develop` y en pull requests. Verifica que el código compila y los tests pasan antes de hacer merge.

```
push/PR → develop
    │
    ├── frontend-build   → npm install + npm run build
    ├── backend-ventas-build   → mvn clean install
    └── backend-despachos-build → mvn clean install
```

### CD — `cd.yml` (rama `deploy`)

Se ejecuta solo cuando se hace push a `deploy`. Requiere que el CI haya pasado primero.

```
push → deploy
    │
    ├── build-and-push
    │   ├── docker build + push frontend → ECR
    │   ├── docker build + push backend-ventas → ECR
    │   └── docker build + push backend-despachos → ECR
    │
    └── deploy
        └── aws ecs update-service --force-new-deployment
```

### GitHub Secrets requeridos

Configura estos secrets en **Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access Key de AWS Academy |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key de AWS Academy |
| `AWS_SESSION_TOKEN` | Session Token de AWS Academy |
| `ECR_REPO_FRONTEND` | `devops-e2-frontend` |
| `ECR_REPO_BACKEND_VENTAS` | `devops-e2-backend-ventas` |
| `ECR_REPO_BACKEND_DESPACHOS` | `devops-e2-backend-despachos` |

---

## Persistencia de datos

Los datos de MySQL se persisten mediante un **named volume** de Docker (`mysql_data`), montado en `/var/lib/mysql` dentro del contenedor, garantizando que la información no se pierda al reiniciar los contenedores.

Se eligió **named volume** sobre bind mount porque:
- Es gestionado completamente por Docker, sin depender de rutas absolutas del sistema host.
- Es portable entre distintos sistemas operativos (Linux, Mac, Windows).
- Facilita operaciones de backup mediante la API de volúmenes de Docker.

En AWS, la base de datos corre en una EC2 con volumen EBS `gp3` de 30 GB.

---

## Endpoints principales

> ⚠️ La IP pública cambia cada vez que se reinicia el laboratorio de AWS Academy.
> Obtén la IP actual desde: **AWS Console → ECS → devops-e2-cluster → Tasks → Task activa → Network → Public IP**

### Backend Ventas — `http://<IP_PUBLICA>/api/ventas/`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/ventas` | Obtener todas las ventas |
| GET | `/ventas/{id}` | Obtener venta por ID |
| POST | `/ventas` | Crear nueva venta |
| PUT | `/ventas/{id}` | Actualizar venta |
| DELETE | `/ventas/{id}` | Eliminar venta |

### Backend Despachos — `http://<IP_PUBLICA>/api/despachos/`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/despachos` | Obtener todos los despachos |
| GET | `/despachos/{id}` | Obtener despacho por ID |
| POST | `/despachos` | Crear nuevo despacho |
| PUT | `/despachos/{id}` | Actualizar despacho |
| DELETE | `/despachos/{id}` | Eliminar despacho |

### Swagger UI

| Servicio | URL |
|---|---|
| Ventas | `http://<IP_PUBLICA>:8080/swagger-ui.html` |
| Despachos | `http://<IP_PUBLICA>:8081/swagger-ui.html` |

---

## Reproducir el proyecto en otro equipo

```bash
# 1. Iniciar lab en AWS Academy y actualizar los secrets en GitHub

# 2. Clonar el repositorio
git clone <url-del-repositorio>
cd Proyecto_2_Devops

# 3. Configurar credenciales AWS
aws configure

# 4. Recrear infraestructura
cd infra
terraform init
terraform apply

# 5. Activar el pipeline haciendo push a deploy
git checkout deploy
git commit --allow-empty -m "chore: forzar redespliegue"
git push origin deploy

# 6. Obtener la IP pública del frontend en ECS
# AWS Console → ECS → devops-e2-cluster → Tasks → Task → Network → Public IP
```

---

##  Buenas prácticas aplicadas 

- **Multi-stage Dockerfiles** para imágenes limpias y de menor tamaño.
- **Secretos gestionados** con GitHub Secrets y `terraform.tfvars` (en `.gitignore`), nunca en el código fuente.
- **Infraestructura como código** con Terraform, reproducible en cualquier cuenta AWS Academy.
- **Proxy inverso Nginx** que enruta ambos backends sin exponer puertos adicionales al exterior.
- **Health checks** en los contenedores ECS usando Spring Boot Actuator (`/actuator/health/readiness`).
- **Logs centralizados** en CloudWatch con retención de 7 días.
- **CI/CD separado** en dos pipelines: CI para validar código en `develop`, CD para desplegar desde `deploy`.
- **Tests con perfil de base de datos en memoria** (H2) para no depender de MySQL en el entorno de CI.
- **Named volumes** para persistencia de datos resiliente ante reinicios de contenedores.

---

© 2025 Innovatech Chile — DuocUC | Introducción a Herramientas DevOps  ᓚᘏᗢ
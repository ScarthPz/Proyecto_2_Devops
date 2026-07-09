# Stage 1: crea el .jar
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: ejecutar la api (imagen minimalista: solo JRE, sin herramientas de compilación)
FROM eclipse-temurin:17-jre
RUN apt-get update && apt-get install -y --no-install-recommends dos2unix && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
COPY entrypoint.sh /app/entrypoint.sh

RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8081
#ENTRYPOINT ejecuta el script
ENTRYPOINT ["./entrypoint.sh"]

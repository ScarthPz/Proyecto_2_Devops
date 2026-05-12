#!/bin/sh

echo "Esperando base de datos..."
sleep 10

echo "Iniciando Spring Boot..."
exec java -jar app.jar
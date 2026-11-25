# syntax=docker/dockerfile:1

# ---------- Etapa 1: build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cachea dependencias mientras el pom no cambie
COPY pom.xml ./
RUN mvn -B -ntp -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -ntp -DskipTests package

# ---------- Etapa 2: runtime ----------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuario sin privilegios
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=build /app/target/*.jar /app/app.jar
RUN chown spring:spring /app/app.jar

USER spring

ENV PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

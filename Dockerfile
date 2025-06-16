# Stage 1: Build the application
# Use Eclipse Temurin JDK 21 as the base image for the build stage.
FROM eclipse-temurin:21-jdk AS build

# Set the working directory inside the container.
WORKDIR /app

# Copy Maven configuration file (pom.xml) to the working directory.
COPY pom.xml .
# Copy the source code directory (src) to the working directory.
COPY src ./src
# Copy the Maven Wrapper script (mvnw) to the working directory.
COPY mvnw .
# Copy the Maven Wrapper configuration directory (.mvn) to the working directory.
COPY .mvn ./.mvn

# Give executable permission to the Maven Wrapper script.
RUN chmod +x mvnw

# Build the project using Maven Wrapper, skipping tests to speed up the build.
RUN ./mvnw package -DskipTests

# Stage 2: Run the application
# Use Eclipse Temurin JDK 21 as the base image for the runtime stage.
FROM eclipse-temurin:21-jdk

# Set the working directory inside the container.
WORKDIR /app

# Copy the built JAR file from the 'build' stage to the current stage.
# The JAR file is expected to be in /app/target/ inside the build stage.
# It's renamed to app.jar for simplicity.
COPY --from=build /app/target/*.jar app.jar

# Set the PORT environment variable to 8080.
# Render automatically sets the $PORT environment variable,
# so the application will listen on the port provided by Render.
ENV PORT=8080
# Expose port 8080, indicating that the container listens on this port.
EXPOSE 8080

# Command to run the Spring Boot application.
# It uses the -Dserver.port=${PORT} to dynamically set the port based on the environment variable,
# which is crucial for platforms like Render.
CMD ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]

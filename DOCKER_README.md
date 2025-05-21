# Travel App Docker Setup

This document provides instructions on how to build and run the Travel App using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine (included with Docker Desktop for Windows/Mac)

## Building and Running with Docker Compose

The easiest way to get started is using Docker Compose:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:5000

## Building and Running with Docker

Alternatively, you can use Docker directly:

```bash
# Build the Docker image
docker build -t travel-app .

# Run the container
docker run -p 5000:80 -d --name travel-app-container travel-app

# Stop the container
docker stop travel-app-container
docker rm travel-app-container
```

## Environment Variables

To customize the application configuration, you can modify the environment variables in the docker-compose.yml file.

## Production Deployment

For production deployment, consider the following:

1. Use a proper domain name and configure SSL using a reverse proxy or by extending the Nginx configuration.
2. Set up proper environment configuration for production settings.
3. Consider using Docker Swarm or Kubernetes for orchestration in production environments.

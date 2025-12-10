# Docker Deployment Guide

This guide explains how to build and deploy the Next.js application using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Hub account (for pushing images)

## Building the Docker Image

### Option 1: Using npm scripts
```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

### Option 2: Using Docker commands directly
```bash
# Build the image
docker build -t gacoan-dcms .

# Run the container
docker run -p 3000:3000 gacoan-dcms
```

## Using Docker Compose (Recommended for development)

To run the application with a PostgreSQL database:

```bash
# Start all services
npm run docker:compose:up

# Stop all services
npm run docker:compose:down
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
# Add other environment variables as needed
```

## Pushing to Docker Hub

### 1. Tag your image
```bash
# Replace YOUR_USERNAME with your Docker Hub username
docker tag gacoan-dcms YOUR_USERNAME/gacoan-dcms:latest
```

### 2. Push to Docker Hub
```bash
# Log in to Docker Hub
docker login

# Push the image
docker push YOUR_USERNAME/gacoan-dcms:latest
```

## Deploying on a Server

Once the image is on Docker Hub, you can deploy it on any server with Docker installed:

```bash
# Pull the image
docker pull YOUR_USERNAME/gacoan-dcms:latest

# Run the container with environment variables
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your-production-database-url" \
  -e NODE_ENV="production" \
  YOUR_USERNAME/gacoan-dcms:latest
```

### Using docker-compose on the server

Create a `docker-compose.prod.yml` on the server:

```yaml
version: '3.8'

services:
  app:
    image: YOUR_USERNAME/gacoan-dcms:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@host:5432/database
      # Add other production environment variables
    restart: unless-stopped
```

Then run:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Production Considerations

1. **Database**: Use a managed database service or set up PostgreSQL separately
2. **Environment Variables**: Never commit secrets to your repository
3. **HTTPS**: Use a reverse proxy like Nginx or Traefik for SSL termination
4. **Health Checks**: Configure health checks in your docker-compose file
5. **Logging**: Configure proper logging for production
6. **Backups**: Regularly backup your database and any user uploads

## Troubleshooting

- If the build fails, ensure all dependencies are properly listed in package.json
- Check that Prisma client is generated during the build process
- Ensure the database is accessible from the container
- Check the container logs: `docker logs <container-id>`
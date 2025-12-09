# TruckTrack Docker Deployment Guide

## 📋 Overview

This guide explains how to deploy TruckTrack using Docker containers. The application consists of three services:
- **MongoDB**: Database
- **Backend**: Node.js/Express API
- **Frontend**: React SPA served by Nginx

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                         │
│                  (trucktrack-network)                    │
│                                                          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐     │
│  │          │      │          │      │          │     │
│  │ MongoDB  │◄─────┤ Backend  │◄─────┤ Frontend │     │
│  │  :27017  │      │  :5000   │      │  :3000   │     │
│  │          │      │          │      │  (Nginx) │     │
│  └──────────┘      └──────────┘      └──────────┘     │
│       │                                                 │
│       ▼                                                 │
│  [Volume: mongodb_data]                                │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings (especially change the JWT_SECRET and MongoDB password in production).

### 2. Production Deployment

Build and start all services:
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f
```

Stop all services:
```bash
docker-compose down
```

### 3. Development Mode

For development with hot-reloading:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will:
- Mount source code as volumes
- Enable hot-reloading for both backend and frontend
- Run backend with nodemon
- Run frontend with Vite dev server on port 5173

## 📦 Service Details

### MongoDB
- **Image**: `mongo:7.0`
- **Port**: 27017 (configurable via `MONGO_PORT`)
- **Volumes**: 
  - `mongodb_data` - Persistent database storage
  - `mongodb_config` - MongoDB configuration
- **Health Check**: Ping test every 10s

### Backend (Node.js/Express)
- **Build**: Multi-stage Dockerfile with Alpine Linux
- **Port**: 5000 (configurable via `BACKEND_PORT`)
- **Environment Variables**:
  - `NODE_ENV` - production/development
  - `MONGODB_URI` - Auto-configured to connect to MongoDB service
  - `JWT_SECRET` - Secret key for JWT tokens
  - `JWT_EXPIRE` - Token expiration time
- **Health Check**: HTTP GET to root endpoint every 30s
- **Security**: Runs as non-root user in production

### Frontend (React/Nginx)
- **Build**: Multi-stage Dockerfile
  - Stage 1: Build React app with Vite
  - Stage 2: Serve with Nginx
- **Port**: 3000 (configurable via `FRONTEND_PORT`)
- **Environment Variables**:
  - `VITE_API_URL` - Backend API URL
- **Features**:
  - Gzip compression
  - Security headers
  - Static asset caching
  - SPA routing support
- **Health Check**: HTTP GET every 30s

## 🔧 Configuration

### Environment Variables

| Variable              | Description                 | Default     |
| --------------------- | --------------------------- | ----------- |
| `NODE_ENV`            | Environment mode            | `production` |
| `BUILD_TARGET`        | Docker build target         | `production` |
| `MONGO_ROOT_USERNAME` | MongoDB admin username      | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password      | `admin123` |
| `MONGO_DB_NAME`       | Database name               | `trucktrack` |
| `MONGO_PORT`          | MongoDB port                | `27017` |
| `BACKEND_PORT`        | Backend API port            | `5000` |
| `JWT_SECRET`          | JWT signing secret          | ⚠️ Change in production! |
| `JWT_EXPIRE`          | JWT expiration              | `7d` |
| `FRONTEND_PORT`       | Frontend port               | `3000` |
| `VITE_API_URL`        | API endpoint URL            | `http://localhost:5000/api` |

### Production Security Checklist

Before deploying to production:

- [ ] Change `MONGO_ROOT_PASSWORD` to a strong password
- [ ] Change `JWT_SECRET` to a cryptographically secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Review and update CORS settings in backend
- [ ] Configure proper domain names
- [ ] Enable HTTPS (use reverse proxy like Traefik or Nginx)
- [ ] Set up backup strategy for MongoDB volumes
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts

## 🛠️ Common Commands

### Build Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Start/Stop Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands in Containers
```bash
# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123

# Run npm commands in backend
docker-compose exec backend npm install <package>
docker-compose exec backend npm test
```

### Inspect Services
```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Inspect network
docker network inspect trucktrack-network

# Inspect volumes
docker volume ls
docker volume inspect trucktrack-mongodb-data
```

## 🔍 Troubleshooting

### Backend can't connect to MongoDB
```bash
# Check if MongoDB is healthy
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Verify network connectivity
docker-compose exec backend ping mongodb
```

### Frontend can't reach Backend
- Check `VITE_API_URL` in `.env`
- Ensure backend is running: `docker-compose ps backend`
- Check backend logs: `docker-compose logs backend`
- Verify CORS configuration in backend

### Port already in use
```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac

# Change port in .env file
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Container keeps restarting
```bash
# Check logs for errors
docker-compose logs <service-name>

# Check health status
docker inspect <container-name> | grep -A 10 Health
```

### Clear everything and start fresh
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose up -d --build
```

## 📊 Monitoring

### Health Checks
All services have health checks configured:
```bash
# View health status
docker-compose ps

# Inspect health details
docker inspect trucktrack-backend | grep -A 20 Health
```

### Resource Monitoring
```bash
# Real-time resource usage
docker stats

# Container processes
docker-compose top
```

## 🔄 Updates and Maintenance

### Update Application Code
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Update Dependencies
```bash
# Backend
docker-compose exec backend npm update

# Frontend
docker-compose exec frontend npm update

# Rebuild images
docker-compose build
```

### Backup MongoDB Data
```bash
# Create backup
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup to host
docker cp trucktrack-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore MongoDB Data
```bash
# Copy backup to container
docker cp ./mongodb-backup trucktrack-mongodb:/data/restore

# Restore
docker-compose exec mongodb mongorestore /data/restore
```

## 🌐 Accessing the Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017 (use MongoDB Compass)

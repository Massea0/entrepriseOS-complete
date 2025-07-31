#!/bin/bash

# EntrepriseOS Production Deployment Script
# Usage: ./scripts/deploy-production.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${DEPLOY_ENV:-"production"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"registry.enterpriseos.com"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
BACKUP_ENABLED=${BACKUP_ENABLED:-"true"}

echo -e "${BLUE}🚀 EntrepriseOS Production Deployment${NC}"
echo -e "${BLUE}=================================${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production file not found${NC}"
        exit 1
    fi
    
    # Check SSL certificates
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        echo -e "${YELLOW}⚠️  SSL certificates not found. Generating self-signed certificates...${NC}"
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=FR/ST=Paris/L=Paris/O=EntrepriseOS/CN=app.enterpriseos.com"
    fi
    
    echo -e "${GREEN}✅ All prerequisites satisfied${NC}"
}

# Function to backup current deployment
backup_current() {
    if [ "$BACKUP_ENABLED" = "true" ]; then
        echo -e "\n${YELLOW}💾 Backing up current deployment...${NC}"
        
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p $BACKUP_DIR
        
        # Backup volumes
        docker run --rm \
            -v enterpriseos_app-cache:/data/app-cache:ro \
            -v enterpriseos_redis-data:/data/redis:ro \
            -v $PWD/$BACKUP_DIR:/backup \
            alpine tar czf /backup/volumes.tar.gz -C /data .
        
        # Backup environment
        cp .env.production $BACKUP_DIR/
        
        echo -e "${GREEN}✅ Backup completed: $BACKUP_DIR${NC}"
    fi
}

# Function to run tests
run_tests() {
    echo -e "\n${YELLOW}🧪 Running production tests...${NC}"
    
    # Test database connection
    npm run test:connections
    
    # Run E2E tests
    npm run test:e2e:ci
    
    # Check TypeScript
    npm run type-check
    
    echo -e "${GREEN}✅ All tests passed${NC}"
}

# Function to build application
build_application() {
    echo -e "\n${YELLOW}🔨 Building application...${NC}"
    
    # Build Docker image
    docker build \
        --build-arg NODE_ENV=production \
        --tag $DOCKER_REGISTRY/enterpriseos:$IMAGE_TAG \
        --tag $DOCKER_REGISTRY/enterpriseos:latest \
        .
    
    echo -e "${GREEN}✅ Build completed${NC}"
}

# Function to deploy application
deploy_application() {
    echo -e "\n${YELLOW}🚀 Deploying application...${NC}"
    
    # Stop current containers
    docker-compose -f docker-compose.production.yml down
    
    # Pull latest images
    docker-compose -f docker-compose.production.yml pull
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for health checks
    echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
    sleep 30
    
    # Check health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
        docker-compose -f docker-compose.production.yml logs app
        exit 1
    fi
}

# Function to run post-deployment tasks
post_deployment() {
    echo -e "\n${YELLOW}📝 Running post-deployment tasks...${NC}"
    
    # Clear caches
    docker exec enterpriseos-redis redis-cli FLUSHALL
    
    # Warm up cache
    curl -s http://localhost:3000/ > /dev/null
    
    # Send deployment notification
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 EntrepriseOS deployed to production (v$IMAGE_TAG)\"}" \
            $SLACK_WEBHOOK
    fi
    
    echo -e "${GREEN}✅ Post-deployment completed${NC}"
}

# Function to show deployment info
show_info() {
    echo -e "\n${GREEN}🎉 Deployment Successful!${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo -e "Application URL: ${BLUE}https://app.enterpriseos.com${NC}"
    echo -e "Monitoring: ${BLUE}http://localhost:3001${NC} (Grafana)"
    echo -e "Version: ${BLUE}$IMAGE_TAG${NC}"
    echo -e "\n${YELLOW}📊 Services Status:${NC}"
    docker-compose -f docker-compose.production.yml ps
}

# Main deployment flow
main() {
    check_prerequisites
    backup_current
    run_tests
    build_application
    deploy_application
    post_deployment
    show_info
}

# Run deployment
main

echo -e "\n${GREEN}✨ Deployment completed successfully!${NC}"
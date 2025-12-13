#!/bin/bash

# djask VPS Deployment Script
# This script helps you deploy to your VPS

set -e  # Exit on error

echo "=========================================="
echo "  djask - VPS Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo ""
    echo "Please create .env file with:"
    echo "  cp .env.production .env"
    echo "  nano .env  # Edit with your values"
    echo ""
    exit 1
fi

# Check if SECRET_KEY is set
if grep -q "REPLACE_WITH_SECURE_RANDOM_KEY" .env; then
    echo -e "${RED}ERROR: SECRET_KEY not configured!${NC}"
    echo ""
    echo "Generate a secure key:"
    echo "  python3 -c \"import secrets; print(secrets.token_hex(32))\""
    echo ""
    echo "Then update .env file"
    exit 1
fi

# Check if nginx domain is configured
if grep -q "yourdomain.com" nginx/nginx.conf; then
    echo -e "${YELLOW}WARNING: nginx.conf still has placeholder domain${NC}"
    echo "Replace 'yourdomain.com' with your actual domain"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Configuration looks good!"
echo ""

# Build and start services
echo "Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}✓${NC} Services started!"
echo ""

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Check status
echo ""
echo "Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Access your application:"
echo "  - Public: http://YOUR_DOMAIN"
echo "  - Admin:  http://admin.YOUR_DOMAIN"
echo ""
echo "View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Next steps:"
echo "  1. Point your domain to this server's IP"
echo "  2. Setup SSL with: sudo certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com"
echo "  3. Update nginx.conf to enable HTTPS"
echo "  4. Restart nginx: docker-compose -f docker-compose.prod.yml restart nginx"
echo ""

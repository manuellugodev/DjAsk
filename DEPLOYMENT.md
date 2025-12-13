# VPS Deployment Guide

## Prerequisites

### 1. VPS Setup
- Ubuntu 22.04 LTS
- 1GB+ RAM
- Root or sudo access
- SSH access

### 2. Domain (Optional)
- Domain name pointing to your VPS IP
- Example: polls.yourdomain.com

### 3. What You'll Install
- Docker & Docker Compose
- Nginx (reverse proxy)
- Certbot (SSL certificates)
- PostgreSQL (optional, recommended)

---

## Step 1: Initial VPS Setup

### Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### Update System
```bash
apt update && apt upgrade -y
```

### Create Non-Root User
```bash
adduser djask
usermod -aG sudo djask
su - djask
```

### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker-compose --version
```

---

## Step 2: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## Step 3: Upload Your Code

### Option A: Git (Recommended)
```bash
# On VPS
cd /home/djask
git clone https://github.com/YOUR_USERNAME/djask.git
cd djask
```

### Option B: SCP
```bash
# From your PC
scp -r /home/manuel/Documents/Projects/djask djask@YOUR_VPS_IP:/home/djask/
```

---

## Step 4: Production Configuration

### Create Production Docker Compose
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: djask-backend
    restart: always
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL:-sqlite:///djask.db}
      - FLASK_ENV=production
    volumes:
      - ./backend:/app
      - backend-db:/app
    networks:
      - djask-network
    ports:
      - "127.0.0.1:5000:5000"

  frontend-manager:
    build: ./frontend-manager
    container_name: djask-manager
    restart: always
    volumes:
      - ./frontend-manager:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - djask-network
    ports:
      - "127.0.0.1:3000:3000"

  frontend-public:
    build: ./frontend-public
    container_name: djask-public
    restart: always
    volumes:
      - ./frontend-public:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - djask-network
    ports:
      - "127.0.0.1:3001:3001"

  nginx:
    image: nginx:alpine
    container_name: djask-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
      - frontend-manager
      - frontend-public
    networks:
      - djask-network

volumes:
  backend-db:

networks:
  djask-network:
    driver: bridge
```

### Create Environment File
```bash
nano .env
```

Add:
```env
SECRET_KEY=your-super-secret-random-key-here
DATABASE_URL=sqlite:///djask.db
```

Generate secret key:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Step 5: Setup Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend-public {
        server frontend-public:3001;
    }

    upstream frontend-manager {
        server frontend-manager:3000;
    }

    # Redirect HTTP to HTTPS (after SSL setup)
    # server {
    #     listen 80;
    #     server_name yourdomain.com;
    #     return 301 https://$server_name$request_uri;
    # }

    # Public Voting Interface
    server {
        listen 80;
        server_name yourdomain.com;

        # For Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://frontend-public;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }

    # Admin Panel
    server {
        listen 80;
        server_name admin.yourdomain.com;

        # For Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://frontend-manager;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket
        location /socket.io/ {
            proxy_pass http://backend/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## Step 6: Deploy

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## Step 7: Setup SSL (HTTPS)

### Install Certbot
```bash
sudo apt install certbot
```

### Get SSL Certificate
```bash
# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com

# Start nginx again
docker-compose -f docker-compose.prod.yml start nginx
```

### Update nginx.conf for HTTPS
Add SSL configuration to nginx.conf (see full example below)

### Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e
# Add line:
0 3 * * * certbot renew --quiet --post-hook "docker-compose -f /home/djask/djask/docker-compose.prod.yml restart nginx"
```

---

## Step 8: Monitoring & Maintenance

### Check Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update Application
```bash
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
# Backup SQLite
docker cp djask-backend:/app/djask.db ./backup-$(date +%Y%m%d).db

# Or setup automated backups
```

---

## Troubleshooting

### Can't Connect to VPS
```bash
# Check firewall
sudo ufw status

# Check if services are running
docker-compose ps

# Check nginx
docker logs djask-nginx
```

### Database Issues
```bash
# Enter backend container
docker exec -it djask-backend bash

# Check database
ls -la djask.db
```

### Frontend Not Loading
```bash
# Check if frontend containers are running
docker ps

# Rebuild frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend-public
```

---

## Performance Optimization

### Enable Gzip in Nginx
Add to nginx.conf http block:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Limit Upload Size
Add to nginx.conf server block:
```nginx
client_max_body_size 10M;
```

### Add Caching Headers
For static files in nginx

---

## Security Checklist

- [ ] Firewall enabled (ufw)
- [ ] SSH key-based auth (disable password auth)
- [ ] SSL/HTTPS enabled
- [ ] Strong SECRET_KEY set
- [ ] Database backed up regularly
- [ ] Admin panel on separate subdomain
- [ ] Regular updates: `apt update && apt upgrade`
- [ ] Monitor logs for suspicious activity

---

## Cost Estimate

- VPS: $5-10/month
- Domain: $10/year
- SSL: FREE (Let's Encrypt)
- **Total: ~$6-11/month**

---

## Access URLs After Deployment

- Public voting: https://yourdomain.com
- Admin panel: https://admin.yourdomain.com
- Backend API: https://yourdomain.com/api/polls

---

## Quick Commands Reference

```bash
# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Stop everything
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Update and redeploy
git pull && docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker cp djask-backend:/app/djask.db ./backup.db
```

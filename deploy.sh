#!/bin/bash

# ============================================
# DevSchool Pro - Docker Deployment Script
# Run this on your AWS EC2 instance
# ============================================

set -e

echo "🚀 DevSchool Pro - Docker Deployment"
echo "====================================="

# 1. Pull latest code
echo ""
echo "📥 Step 1: Pulling latest code from GitHub..."
git pull origin main

# 2. Stop existing containers (if any)
echo ""
echo "🛑 Step 2: Stopping existing containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

# 3. Build and start containers
echo ""
echo "🔨 Step 3: Building Docker images..."
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache

echo ""
echo "🚀 Step 4: Starting containers..."
docker compose up -d 2>/dev/null || docker-compose up -d

# 4. Show status
echo ""
echo "📊 Step 5: Container Status:"
docker compose ps 2>/dev/null || docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Frontend:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_EC2_IP'):80"
echo "🔧 Backend:   http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_EC2_IP'):4000"
echo ""
echo "📋 Useful commands:"
echo "   docker compose logs -f backend    # Backend logs"
echo "   docker compose logs -f frontend   # Frontend logs"
echo "   docker compose restart             # Restart all"
echo "   docker compose down                # Stop all"

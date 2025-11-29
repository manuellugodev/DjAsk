#!/bin/bash

echo "=========================================="
echo "  djask - Interactive Polling System"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
echo ""
echo "Starting djask services..."
echo ""

# Start Docker Compose
docker-compose up

echo ""
echo "=========================================="
echo "Services stopped. Run this script again to restart."
echo "=========================================="

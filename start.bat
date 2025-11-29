@echo off
echo ==========================================
echo   djask - Interactive Polling System
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker is not installed!
    echo Please install Docker from: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker Compose is not installed!
    echo Please install Docker Compose
    pause
    exit /b 1
)

echo √ Docker is installed
echo √ Docker Compose is installed
echo.
echo Starting djask services...
echo.

REM Start Docker Compose
docker-compose up

echo.
echo ==========================================
echo Services stopped. Run this script again to restart.
echo ==========================================
pause

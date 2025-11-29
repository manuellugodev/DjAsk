# Quick Start Guide

## Docker Setup (Easiest Method)

### 1. Install Docker
If you don't have Docker installed:
- **Windows/Mac**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: Follow [Docker Engine installation](https://docs.docker.com/engine/install/)

### 2. Run the Project

Open a terminal in the `djask` directory and run:

```bash
docker-compose up
```

Wait for the build to complete (first time takes a few minutes). You'll see:
```
djask-backend    | * Running on http://0.0.0.0:5000
djask-manager    | VITE ready
djask-public     | VITE ready
```

### 3. Access the Applications

Open your browser:
- **Manager Panel**: http://localhost:3000 (Create and manage polls)
- **Public Interface**: http://localhost:3001 (Vote on polls)
- **Backend API**: http://localhost:5000 (API endpoint)

### 4. Create Your First Poll

1. Go to http://localhost:3000
2. Click "Create New Poll"
3. Fill in:
   - Title: "What's your favorite color?"
   - Type: Multiple Choice
   - Options: Red, Blue, Green, Yellow
4. Click "Create Poll"

### 5. Vote on the Poll

1. Go to http://localhost:3001
2. Select the poll you just created
3. Choose an option and click "Submit Vote"
4. See live results!

### 6. View Analytics

1. Back in the manager panel (http://localhost:3000)
2. Click "View Analytics" on your poll
3. Watch the charts update in real-time as people vote

### Stopping the Application

Press `Ctrl+C` in the terminal, or run:
```bash
docker-compose down
```

## Troubleshooting

**Ports already in use?**
```bash
# Check what's using the ports
# On Linux/Mac:
lsof -i :5000
lsof -i :3000
lsof -i :3001

# On Windows:
netstat -ano | findstr :5000
```

**Need to reset the database?**
```bash
docker-compose down -v
docker-compose up
```

**See container logs:**
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Local Setup (Without Docker)

If you prefer to run without Docker:

**Requirements:**
- Python 3.8+
- Node.js 16+

**Steps:**

1. **Start Backend** (Terminal 1):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

2. **Start Manager** (Terminal 2):
```bash
cd frontend-manager
npm install
npm run dev
```

3. **Start Public** (Terminal 3):
```bash
cd frontend-public
npm install
npm run dev
```

Access the same URLs as Docker setup.

## Next Steps

- Explore the Analytics dashboard
- Try creating Open Text polls
- Test multi-select polls
- Check out the real-time updates by opening multiple browser windows
- Read the full [README.md](README.md) for advanced features

Happy polling!

# djask - Interactive Polling System

A real-time interactive polling and questions website with separate manager (admin) and public interfaces.

## Features

- **Manager Panel**: Create, manage, and view analytics for polls
- **Public Interface**: Users can vote on active polls and see live results
- **Real-time Updates**: Live vote counting using WebSockets
- **Multiple Poll Types**:
  - Multiple choice (single or multi-select)
  - Open text responses
- **Analytics Dashboard**: View results with charts and statistics
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Flask**: Python web framework
- **Flask-SocketIO**: Real-time WebSocket support
- **SQLAlchemy**: Database ORM
- **SQLite**: Database (easy to switch to PostgreSQL)

### Frontend
- **React**: UI framework
- **Vite**: Build tool and dev server
- **Socket.IO Client**: Real-time communication
- **Chart.js**: Data visualization
- **Axios**: HTTP client

## Project Structure

```
djask/
├── backend/                    # Flask backend
│   ├── app.py                 # Main Flask application
│   ├── config/
│   │   └── database.py        # Database configuration
│   ├── models/
│   │   ├── poll.py           # Poll model
│   │   └── response.py       # Response model
│   ├── routes/
│   │   ├── polls.py          # Poll CRUD endpoints
│   │   └── analytics.py      # Analytics endpoints
│   ├── sockets/              # WebSocket handlers
│   └── requirements.txt      # Python dependencies
│
├── frontend-manager/          # Admin panel (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreatePoll.jsx
│   │   │   ├── PollList.jsx
│   │   │   └── Analytics.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── frontend-public/           # Public poll viewer (React)
    ├── src/
    │   ├── components/
    │   │   ├── PollSelector.jsx
    │   │   ├── PollView.jsx
    │   │   └── ResultsChart.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Setup Instructions

You can run this project in two ways:
1. **Docker (Recommended)** - Easy setup, no manual installation needed
2. **Local Setup** - Manual installation of dependencies

### Option 1: Docker Setup (Recommended)

**Prerequisites:**
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

**Steps:**

```bash
# Navigate to project directory
cd djask

# Start all services with one command
docker-compose up

# Or run in detached mode (background)
docker-compose up -d

# To stop all services
docker-compose down
```

That's it! All services will be running:
- Backend API: `http://localhost:5000`
- Manager Panel: `http://localhost:3000`
- Public Interface: `http://localhost:3001`

**Docker Commands:**

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Rebuild containers after code changes
docker-compose up --build

# Stop and remove all containers
docker-compose down

# Stop and remove containers + volumes (resets database)
docker-compose down -v
```

### Option 2: Local Setup

**Prerequisites:**
- Python 3.8+ installed
- Node.js 16+ and npm installed
- Git (optional)

**1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

The backend will run on `http://localhost:5000`

**2. Frontend Manager Setup**

Open a new terminal:

```bash
# Navigate to frontend-manager directory
cd frontend-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The manager panel will run on `http://localhost:3000`

**3. Frontend Public Setup**

Open another new terminal:

```bash
# Navigate to frontend-public directory
cd frontend-public

# Install dependencies
npm install

# Start development server
npm run dev
```

The public interface will run on `http://localhost:3001`

## Usage

### Creating a Poll (Manager Panel)

1. Open `http://localhost:3000` in your browser
2. Click "Create New Poll"
3. Fill in the poll details:
   - Title (required)
   - Description (optional)
   - Poll type (Multiple Choice or Open Text)
   - For multiple choice: add options and choose if multi-select is allowed
4. Click "Create Poll"

### Voting (Public Interface)

1. Open `http://localhost:3001` in your browser
2. Select a poll to vote on
3. Choose your answer(s) or enter text
4. Click "Submit Vote"
5. View live results after voting

### Viewing Analytics (Manager Panel)

1. In the manager panel, click "View Analytics" on any poll
2. See real-time vote counts and charts
3. For text polls, see all responses
4. Results update live as new votes come in

## API Endpoints

### Polls

- `GET /api/polls` - Get all polls (query param: `?active=true` for active only)
- `GET /api/polls/:id` - Get specific poll
- `POST /api/polls` - Create new poll
- `PUT /api/polls/:id` - Update poll
- `DELETE /api/polls/:id` - Delete poll
- `POST /api/polls/:id/responses` - Submit a response
- `GET /api/polls/:id/responses` - Get all responses

### Analytics

- `GET /api/analytics/:id` - Get analytics for a poll
- `GET /api/analytics/summary` - Get summary statistics

### WebSocket Events

- `connect` - Client connects to server
- `join_poll` - Join a specific poll room
- `leave_poll` - Leave a poll room
- `new_response` - Broadcast when new response is submitted

## Environment Variables

You can configure the following environment variables:

### Backend
- `SECRET_KEY` - Flask secret key (default: 'dev-secret-key-change-in-production')
- `DATABASE_URL` - Database connection string (default: 'sqlite:///djask.db')

### Frontend
- `VITE_API_URL` - Backend API URL (default: 'http://localhost:5000/api')
- `VITE_SOCKET_URL` - WebSocket server URL (default: 'http://localhost:5000')

## Production Deployment

### Backend

1. Set environment variables:
   ```bash
   export SECRET_KEY="your-secret-key"
   export DATABASE_URL="postgresql://user:pass@host/db"  # For PostgreSQL
   ```

2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn --worker-class eventlet -w 1 app:app
   ```

### Frontend

1. Build the frontend apps:
   ```bash
   # In frontend-manager
   npm run build

   # In frontend-public
   npm run build
   ```

2. Serve the built files with a web server (nginx, Apache, etc.)

## Development Tips

- The backend uses SQLite by default (file: `backend/djask.db`)
- To reset the database, simply delete the `djask.db` file
- All three servers (backend, manager, public) need to be running simultaneously
- Use the manager panel to create and manage polls
- Use the public interface to simulate user voting

## Future Enhancements

- User authentication for managers
- Poll scheduling (start/end dates)
- Export results to CSV/Excel
- Custom themes and branding
- Poll templates
- Email notifications
- Advanced analytics (time-based charts, demographics)
- Poll embedding (iframe support)

## License

MIT License

## Author

Created with djask - Interactive Polling System

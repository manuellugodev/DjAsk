# djask - Project Analysis & Architecture Documentation

**Last Updated:** 2025-12-13
**Project Type:** Real-time Interactive Polling Web Application
**Status:** Production-Deployed at dj.manuellugo.dev

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [WebSocket Events](#websocket-events)
8. [Configuration & Environment](#configuration--environment)
9. [Deployment](#deployment)
10. [Security Considerations](#security-considerations)
11. [Scalability Notes](#scalability-notes)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

**djask** is a modern, full-stack real-time polling system that enables users to create, manage, and participate in interactive polls with live results visualization.

### Core Features

- **Real-time Updates**: WebSocket-powered live vote counting and chart updates
- **Dual Poll Types**: Multiple choice polls and open-text response polls
- **Separate Interfaces**: Admin panel for management, public interface for voting
- **Live Analytics**: Real-time data visualization using Chart.js
- **IP-based Tracking**: Simple duplicate vote prevention without user authentication
- **Production-Ready**: Docker-based deployment with automatic SSL

### Target Use Cases

- Live event polling (presentations, conferences, classes)
- Audience engagement and feedback collection
- Quick surveys and opinion gathering
- Real-time data collection with instant visualization

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11 | Runtime environment |
| Flask | 3.0.0 | Web framework & REST API |
| Flask-SocketIO | 5.3.5 | Real-time WebSocket communication |
| SQLAlchemy | 2.0.23 | ORM for database operations |
| Flask-CORS | 4.0.0 | Cross-Origin Resource Sharing |
| Eventlet | 0.33.3 | Async networking library |
| SQLite/PostgreSQL | - | Database engines |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8 | Build tool and dev server |
| Socket.IO Client | 4.6.1 | Real-time client communication |
| Chart.js | 4.4.0 | Data visualization library |
| React-ChartJS-2 | 5.2.0 | React wrapper for Chart.js |
| Axios | 1.6.0 | HTTP client |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Static file serving & reverse proxy |
| Traefik | Production reverse proxy with automatic SSL |
| Let's Encrypt | Free SSL certificates |

---

## Directory Structure

```
/home/manuel/Documents/Projects/djask/
├── backend/                        # Flask API server
│   ├── app.py                     # Main application entry point
│   ├── config/
│   │   └── database.py            # Database initialization and config
│   ├── models/
│   │   ├── poll.py               # Poll data model
│   │   └── response.py           # Response data model
│   ├── routes/
│   │   ├── polls.py              # Poll CRUD endpoints
│   │   └── analytics.py          # Analytics endpoints
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend container config
│   └── init_db.py                # Database initialization script
│
├── frontend-manager/              # Admin panel (React SPA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreatePoll.jsx    # Poll creation form
│   │   │   ├── PollList.jsx      # List of all polls
│   │   │   └── Analytics.jsx     # Analytics dashboard
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   └── socket.js         # WebSocket service
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile                # Multi-stage build (Node + Nginx)
│
├── frontend-public/               # Public voting interface (React SPA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PollSelector.jsx  # Poll selection UI
│   │   │   ├── PollView.jsx      # Voting interface
│   │   │   └── ResultsChart.jsx  # Live results display
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   └── socket.js         # WebSocket service
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile                # Multi-stage build (Node + Nginx)
│
├── nginx/
│   ├── nginx.conf                # Nginx configuration
│   └── certbot/                  # SSL certificate storage
│
├── docker-compose.yml            # Production orchestration with Traefik
├── .env.example                  # Environment template
├── .env.production               # Production env template
├── deploy-to-vps.sh             # Deployment script
├── start.sh / start.bat         # Local dev startup scripts
├── README.md                     # Comprehensive documentation
├── DEPLOYMENT.md                 # VPS deployment guide
└── QUICKSTART.md                 # Quick start guide
```

---

## Architecture & Design Patterns

### Architectural Pattern: Three-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION LAYER                      │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Frontend Manager │  │ Frontend Public   │   │
│  │   (Admin SPA)    │  │   (Voting SPA)    │   │
│  │   Port 3000      │  │   Port 3001       │   │
│  └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────┘
                    ↓ HTTP/WebSocket ↓
┌─────────────────────────────────────────────────┐
│         APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────┐  │
│  │  Flask REST API + WebSocket Server       │  │
│  │  Port 5000                                │  │
│  │  • Poll Management Routes                │  │
│  │  • Analytics Routes                       │  │
│  │  • Socket.IO Event Handlers              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↓ SQLAlchemy ORM ↓
┌─────────────────────────────────────────────────┐
│         DATA LAYER                              │
│  ┌──────────────────────────────────────────┐  │
│  │  SQLite (dev) / PostgreSQL (prod)        │  │
│  │  • polls table                            │  │
│  │  • responses table                        │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **Blueprint Pattern (Flask)**
   - Modular route organization
   - Clean separation: polls routes vs analytics routes
   - Location: `backend/routes/polls.py`, `backend/routes/analytics.py`

2. **Service Layer Pattern (Frontend)**
   - Dedicated API and Socket services
   - Centralized HTTP client configuration
   - Location: `frontend-*/src/services/`

3. **Repository Pattern**
   - SQLAlchemy models abstract database operations
   - Location: `backend/models/`

4. **Observer Pattern**
   - WebSocket event listeners for real-time updates
   - Clients subscribe to poll-specific rooms

5. **Factory Pattern**
   - Database initialization factory function
   - Location: `backend/config/database.py`

6. **DTO Pattern**
   - Model `to_dict()` methods for JSON serialization
   - Clean separation of internal models from API responses

7. **Microservices-lite**
   - Three independent services
   - Each containerized separately
   - Can scale independently

8. **Real-Time Event-Driven Architecture**
   - WebSocket rooms for poll-specific updates
   - Pub/sub pattern via Socket.IO
   - Poll-level event isolation

---

## Database Schema

### Poll Model
**File:** `backend/models/poll.py`

```python
class Poll(db.Model):
    id: Integer (Primary Key, Auto-increment)
    title: String(200) - Poll title/question
    description: Text - Detailed poll description
    poll_type: String(50) - 'multiple_choice' or 'open_text'
    options: Text (JSON) - Array of poll options (for multiple choice)
    is_active: Boolean - Whether poll accepts responses
    allow_multiple: Boolean - Allow multiple option selection
    created_at: DateTime - Creation timestamp
    updated_at: DateTime - Last update timestamp

    # Relationships
    responses: One-to-Many → Response (cascade delete)
```

**Example Poll Data:**
```json
{
  "id": 1,
  "title": "What's your favorite programming language?",
  "description": "Select your preferred language for web development",
  "poll_type": "multiple_choice",
  "options": ["Python", "JavaScript", "TypeScript", "Go"],
  "is_active": true,
  "allow_multiple": false,
  "created_at": "2025-12-13T10:00:00",
  "updated_at": "2025-12-13T10:00:00"
}
```

### Response Model
**File:** `backend/models/response.py`

```python
class Response(db.Model):
    id: Integer (Primary Key, Auto-increment)
    poll_id: Integer (Foreign Key → polls.id)
    answer: Text (JSON for multiple choice, Text for open text)
    user_identifier: String(100) - IP address for duplicate prevention
    created_at: DateTime - Response submission timestamp

    # Relationships
    poll: Many-to-One → Poll
```

**Example Response Data (Multiple Choice):**
```json
{
  "id": 1,
  "poll_id": 1,
  "answer": "Python",
  "user_identifier": "192.168.1.100",
  "created_at": "2025-12-13T10:05:00"
}
```

**Example Response Data (Open Text):**
```json
{
  "id": 2,
  "poll_id": 2,
  "answer": "I think the feature is great!",
  "user_identifier": "192.168.1.101",
  "created_at": "2025-12-13T10:06:00"
}
```

---

## API Endpoints

**Base URL:** `http://localhost:5000` (dev) or `https://dj.manuellugo.dev` (prod)

### Poll Management Routes
**Blueprint:** `backend/routes/polls.py`
**Prefix:** `/api/polls`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/polls` | List all polls | - | Array of poll objects |
| GET | `/api/polls?active=true` | List active polls only | - | Array of active poll objects |
| GET | `/api/polls/:id` | Get specific poll | - | Poll object |
| POST | `/api/polls` | Create new poll | Poll data (title, description, poll_type, options, allow_multiple) | Created poll object |
| PUT | `/api/polls/:id` | Update existing poll | Poll data (any fields) | Updated poll object |
| DELETE | `/api/polls/:id` | Delete poll | - | Success message |
| POST | `/api/polls/:id/responses` | Submit vote/response | { answer, user_identifier } | Created response object |
| GET | `/api/polls/:id/responses` | Get all poll responses | - | Array of response objects |

### Analytics Routes
**Blueprint:** `backend/routes/analytics.py`
**Prefix:** `/api/analytics`

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/analytics/:id` | Get poll analytics | Vote distribution (multiple choice) or text responses (open text) |
| GET | `/api/analytics/summary` | Dashboard summary | { total_polls, active_polls, total_responses } |

### Example Requests

**Create Poll:**
```bash
POST /api/polls
Content-Type: application/json

{
  "title": "Favorite Framework?",
  "description": "Choose your preferred frontend framework",
  "poll_type": "multiple_choice",
  "options": ["React", "Vue", "Angular", "Svelte"],
  "allow_multiple": false
}
```

**Submit Vote:**
```bash
POST /api/polls/1/responses
Content-Type: application/json

{
  "answer": "React",
  "user_identifier": "192.168.1.100"
}
```

**Get Analytics:**
```bash
GET /api/analytics/1

Response (Multiple Choice):
{
  "poll_id": 1,
  "title": "Favorite Framework?",
  "results": {
    "React": 15,
    "Vue": 8,
    "Angular": 3,
    "Svelte": 12
  }
}
```

---

## WebSocket Events

**Server:** `backend/app.py`
**Technology:** Flask-SocketIO

### Client → Server Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `connect` | - | Client connects to WebSocket |
| `disconnect` | - | Client disconnects from WebSocket |
| `join_poll` | `{ poll_id }` | Subscribe to poll-specific updates |
| `leave_poll` | `{ poll_id }` | Unsubscribe from poll updates |

### Server → Client Events

| Event | Room | Data | Trigger |
|-------|------|------|---------|
| `new_response` | `poll_{id}` | `{ poll_id, response_data }` | When new vote is submitted |

### WebSocket Flow Example

```javascript
// Frontend connects to WebSocket
const socket = io('http://localhost:5000');

// Join poll room to receive updates
socket.emit('join_poll', { poll_id: 1 });

// Listen for new responses
socket.on('new_response', (data) => {
  console.log('New vote received!', data);
  // Update chart in real-time
  updateChart(data);
});

// Leave poll room when component unmounts
socket.emit('leave_poll', { poll_id: 1 });
```

### Room Architecture

- Each poll has its own room: `poll_{poll_id}`
- Only clients in the room receive updates for that poll
- Prevents unnecessary broadcasts to unrelated clients
- Efficient scalability for multiple concurrent polls

---

## Configuration & Environment

### Environment Variables

**Backend (.env):**
```bash
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development  # or 'production'

# Database Configuration
DATABASE_URL=sqlite:///data/polls.db  # or postgresql://...

# CORS Configuration (optional)
CORS_ORIGINS=*  # Comma-separated list of allowed origins
```

**Frontend (.env for Vite):**
```bash
# API URLs (auto-detected if not set)
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Docker Configuration

**Backend Dockerfile:**
- Base: `python:3.11-slim`
- Working directory: `/app`
- Exposes: Port 5000
- Entry point: `python app.py`

**Frontend Dockerfile (Multi-stage):**
- **Build Stage:**
  - Base: `node:18-alpine`
  - Runs: `npm install` and `npm run build`
  - Output: `/app/dist`
- **Runtime Stage:**
  - Base: `nginx:alpine`
  - Copies: Build artifacts from build stage
  - Configuration: SPA routing (all routes → index.html)
  - Exposes: Port 80

### Docker Compose Services

**Development:**
```yaml
services:
  backend:
    ports: ["5000:5000"]
  frontend-manager:
    ports: ["3000:80"]
  frontend-public:
    ports: ["3001:80"]
```

**Production:**
```yaml
services:
  backend:
    labels:
      - traefik.http.routers.backend.rule=Host(`dj.manuellugo.dev`) && PathPrefix(`/api`, `/socket.io`)
  frontend-manager:
    labels:
      - traefik.http.routers.manager.rule=Host(`admin.dj.manuellugo.dev`)
  frontend-public:
    labels:
      - traefik.http.routers.public.rule=Host(`dj.manuellugo.dev`)
```

---

## Deployment

### Development Deployment

**Quick Start:**
```bash
# Option 1: Docker Compose
docker-compose up

# Option 2: Local scripts
./start.sh  # Linux/Mac
start.bat   # Windows
```

**Access Points:**
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000
- Public Interface: http://localhost:3001

### Production Deployment

**Current Production Setup:**
- **Host:** VPS (Virtual Private Server)
- **Domain:** manuellugo.dev
- **Subdomains:**
  - `dj.manuellugo.dev` - Public interface & API
  - `admin.dj.manuellugo.dev` - Admin panel
- **SSL:** Automatic via Let's Encrypt
- **Reverse Proxy:** Traefik

**Deployment Process:**
1. Configure DNS records (A records for domain/subdomains)
2. Set up VPS with Docker and Docker Compose
3. Configure firewall (UFW: allow 80, 443, 22)
4. Clone repository on VPS
5. Configure `.env.production` with proper values
6. Run deployment script: `./deploy-to-vps.sh`
7. Traefik automatically obtains SSL certificates

**SSL Certificate Renewal:**
- Automatic via Traefik's Let's Encrypt integration
- Certificates stored in `./nginx/certbot` volume
- Auto-renewal before expiration

**Persistent Data:**
- Database stored in Docker volume: `djask_backend_data`
- Survives container restarts and updates
- Backup strategy: Regular volume backups recommended

---

## Security Considerations

### Current Security Measures

✅ **Implemented:**
- HTTPS/SSL in production via Let's Encrypt
- Secret key management via environment variables
- IP-based duplicate vote prevention
- Firewall configuration (UFW)
- Container isolation

⚠️ **Considerations & Limitations:**

1. **CORS Configuration:**
   - Currently: `CORS(app, resources={r"/*": {"origins": "*"}})`
   - Wide open for all origins
   - **Recommendation:** Restrict to specific domains in production

2. **No Authentication System:**
   - Admin panel has no login requirement
   - Anyone with URL can create/delete polls
   - **Recommendation:** Add admin authentication

3. **IP-based Tracking:**
   - Simple duplicate prevention
   - Can be bypassed with VPN/proxy
   - **Note:** Sufficient for casual use, not for high-stakes voting

4. **Data Validation:**
   - Basic validation on poll creation
   - **Recommendation:** Add comprehensive input sanitization

5. **Rate Limiting:**
   - Not currently implemented
   - **Recommendation:** Add rate limiting to prevent spam/abuse

### Security Best Practices for Future

```python
# Recommended CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://dj.manuellugo.dev",
            "https://admin.dj.manuellugo.dev"
        ]
    }
})

# Add authentication for admin routes
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

# Add rate limiting
from flask_limiter import Limiter
limiter = Limiter(app, key_func=get_remote_address)
```

---

## Scalability Notes

### Current Scalability

**Good for:**
- Small to medium deployments (100-1000 concurrent users)
- Single VPS deployment
- SQLite: Up to ~10,000 polls with moderate traffic

**Limitations:**
- Single-instance WebSocket (no horizontal scaling)
- SQLite: Limited concurrent writes
- In-memory Socket.IO (doesn't share state across instances)

### Scaling Strategies

**Database Scaling:**
```bash
# Switch to PostgreSQL for better concurrency
DATABASE_URL=postgresql://user:pass@host:5432/djask
```

**WebSocket Scaling (Multi-instance):**
```python
# Add Redis adapter for Socket.IO
from flask_socketio import SocketIO

socketio = SocketIO(app,
    cors_allowed_origins="*",
    message_queue='redis://localhost:6379'  # Share state across instances
)
```

**Horizontal Scaling Architecture:**
```
                    Load Balancer (Traefik)
                            |
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
    Backend-1           Backend-2           Backend-3
        |                   |                   |
        └───────────────────┼───────────────────┘
                            ↓
                    Redis (Message Queue)
                            ↓
                    PostgreSQL Database
```

**Caching Strategy:**
```python
# Add Redis caching for analytics
from flask_caching import Cache

cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://localhost:6379/0'
})

@cache.cached(timeout=60)
def get_poll_analytics(poll_id):
    # Expensive analytics calculation
    pass
```

### Performance Optimizations

1. **Database Indexing:**
   ```python
   # Add indexes to frequently queried columns
   poll_id = db.Column(db.Integer, db.ForeignKey('polls.id'), index=True)
   created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
   ```

2. **Query Optimization:**
   ```python
   # Use eager loading to prevent N+1 queries
   poll = db.session.query(Poll).options(
       joinedload(Poll.responses)
   ).filter_by(id=poll_id).first()
   ```

3. **Frontend Optimization:**
   - Debounce WebSocket events
   - Implement virtual scrolling for long lists
   - Code splitting for faster initial load

---

## Future Enhancements

### Recommended Features

**High Priority:**
1. **Authentication System:**
   - Admin login for poll management
   - User accounts for voting history
   - OAuth integration (Google, GitHub)

2. **Enhanced Security:**
   - CORS restriction to specific domains
   - Rate limiting on API endpoints
   - Input sanitization and validation
   - CSRF protection

3. **Advanced Poll Features:**
   - Scheduled poll activation/deactivation
   - Poll expiration dates
   - Required participant count
   - Poll templates

**Medium Priority:**
4. **Analytics Enhancements:**
   - Export results (CSV, PDF)
   - Historical trend analysis
   - Demographic filtering
   - Custom visualizations

5. **User Experience:**
   - Poll search and filtering
   - Pagination for large datasets
   - Dark mode support
   - Mobile app (React Native)

6. **Notifications:**
   - Email notifications for poll events
   - Webhook support for integrations
   - Slack/Discord integration

**Low Priority:**
7. **Advanced Features:**
   - Multi-language support (i18n)
   - Poll cloning/duplication
   - Custom branding options
   - API key system for third-party access

### Technical Debt

1. **Testing:**
   - Add unit tests (pytest for backend)
   - Add integration tests
   - Add E2E tests (Playwright/Cypress)
   - Set up CI/CD pipeline

2. **Documentation:**
   - API documentation (Swagger/OpenAPI)
   - Code comments and docstrings
   - Architecture diagrams
   - Contributing guidelines

3. **Monitoring:**
   - Application performance monitoring (APM)
   - Error tracking (Sentry)
   - Logging aggregation
   - Uptime monitoring

---

## Quick Reference

### Key Files

| File | Purpose | Lines of Code |
|------|---------|---------------|
| `backend/app.py` | Main Flask application & WebSocket setup | ~100 |
| `backend/models/poll.py` | Poll database model | ~50 |
| `backend/models/response.py` | Response database model | ~30 |
| `backend/routes/polls.py` | Poll CRUD API routes | ~150 |
| `backend/routes/analytics.py` | Analytics API routes | ~75 |
| `frontend-manager/src/App.jsx` | Admin panel main component | ~100 |
| `frontend-public/src/App.jsx` | Public interface main component | ~80 |
| `docker-compose.yml` | Production orchestration | ~80 |

### Port Reference

| Service | Development Port | Production Access |
|---------|------------------|-------------------|
| Backend API | 5000 | dj.manuellugo.dev/api |
| Admin Panel | 3000 | admin.dj.manuellugo.dev |
| Public Interface | 3001 | dj.manuellugo.dev |
| Traefik Dashboard | 8080 | - |

### Common Commands

```bash
# Development
docker-compose up                  # Start all services
docker-compose down                # Stop all services
docker-compose logs -f backend     # View backend logs

# Production
./deploy-to-vps.sh                # Deploy to production
docker-compose -f docker-compose.yml up -d  # Start production
docker-compose ps                  # Check service status

# Database
python backend/init_db.py         # Initialize database
docker-compose exec backend python -c "from app import db; db.create_all()"

# Frontend
cd frontend-manager && npm run dev     # Dev server
cd frontend-public && npm run build    # Build for production
```

---

## Contact & Resources

**Production Deployment:** https://dj.manuellugo.dev
**Admin Panel:** https://admin.dj.manuellugo.dev

**Documentation Files:**
- `README.md` - General project overview
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `PROJECT_ANALYSIS.md` - This document

**Technology Documentation:**
- [Flask](https://flask.palletsprojects.com/)
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- [React](https://react.dev/)
- [Socket.IO](https://socket.io/)
- [Traefik](https://doc.traefik.io/traefik/)

---

**Document Version:** 1.0
**Created:** 2025-12-13
**Maintained By:** Development Team

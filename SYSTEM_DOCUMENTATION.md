# 📋 Anthony's Musings - Complete System Documentation

## 🏗️ System Architecture

**Yes, you have TWO separate Docker containers running independently:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Anthony's Musings System                     │
├─────────────────────────────────┬───────────────────────────────┤
│          BACKEND API            │         FRONTEND WEB          │
│      (Port 8000)               │        (Port 3001)           │
├─────────────────────────────────┼───────────────────────────────┤
│ Directory:                      │ Directory:                    │
│ /Users/tikbalang/               │ /Users/tikbalang/             │
│   anthonys-musings-api/         │   anthonys-musings-web/       │
│                                 │                               │
│ Container: anthonys-musings-    │ Container: anthonys-musings-  │
│           api_api_1             │           web_frontend_1      │
│                                 │                               │
│ Technology:                     │ Technology:                   │
│ • Python 3.9                   │ • Nginx Alpine                │
│ • FastAPI                      │ • Static HTML/CSS/JS          │
│ • SQLite Database              │ • Client-side filtering       │
│ • Uvicorn server               │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

## 🐳 Container Details

### Backend API Container
- **Location**: `/Users/tikbalang/anthonys-musings-api/`
- **Port**: `8000`
- **Image**: Custom Python 3.9-slim
- **Purpose**: REST API for data access
- **Database**: SQLite mounted from host
- **Auto-restart**: Yes

### Frontend Web Container  
- **Location**: `/Users/tikbalang/anthonys-musings-web/`
- **Port**: `3001`
- **Image**: Nginx Alpine
- **Purpose**: Web interface serving static files
- **API Connection**: Connects to backend on port 8000
- **Auto-restart**: Yes

## 📁 Directory Structure

```
📦 Complete System
├── 🔧 /Users/tikbalang/anthonys-musings-api/          ← BACKEND
│   ├── main.py                                        ← FastAPI application
│   ├── requirements.txt                               ← Python dependencies
│   ├── Dockerfile                                     ← Backend container config
│   ├── docker-compose.yml                            ← Backend deployment
│   ├── migrate_database.py                           ← Database utilities
│   └── database/
│       └── anthonys_musings.db → /Users/tikbalang/Desktop/anthonys_musings.db
│
└── 🌐 /Users/tikbalang/anthonys-musings-web/          ← FRONTEND
    ├── frontend/
    │   ├── static/
    │   │   └── index.html                             ← Web interface
    │   ├── Dockerfile                                 ← Frontend container config
    │   └── nginx.conf                                 ← Web server config
    ├── docker-compose.yml                            ← Frontend deployment
    ├── backend_UNUSED_BACKUP/                        ← ❌ Not used
    └── README.md                                      ← Documentation
```

## 🚀 How to Start/Stop the System

### Start Both Services

```bash
# 1. Start Backend API (Port 8000)
cd /Users/tikbalang/anthonys-musings-api
docker-compose up -d

# 2. Start Frontend Web (Port 3001)
cd /Users/tikbalang/anthonys-musings-web
docker-compose up -d

# Verify both are running
docker ps
```

### Stop Both Services

```bash
# Stop Frontend
cd /Users/tikbalang/anthonys-musings-web
docker-compose down

# Stop Backend
cd /Users/tikbalang/anthonys-musings-api
docker-compose down
```

### Check Status

```bash
# List all running containers
docker ps

# Check logs
docker-compose logs -f api      # Backend logs
docker-compose logs -f frontend # Frontend logs
```

## 🔗 Service Communication

### Backend API (Port 8000)
```
http://localhost:8000/
├── /                           ← API info
├── /health                     ← Health check
├── /docs                       ← Swagger documentation
└── /api/
    ├── /writings               ← Get all writings
    ├── /search                 ← Search content
    ├── /stats                  ← Database statistics
    └── /tags                   ← Tag management
```

### Frontend Web (Port 3001)
```
http://localhost:3001/
└── index.html                  ← Web interface
    ├── Search functionality
    ├── Content filtering
    ├── Explicit content toggle
    └── Modal content viewer
```

### Data Flow
```
User Browser → Frontend (3001) → Backend API (8000) → SQLite Database
     ↑              ↓                     ↓                    ↓
   HTML/CSS/JS   Static Files        REST API            Raw Data
```

## ⚙️ Configuration Files

### Backend Configuration
**File**: `/Users/tikbalang/anthonys-musings-api/docker-compose.yml`
```yaml
services:
  api:
    build: .
    ports:
      - \"8000:8000\"
    volumes:
      - /Users/tikbalang/Desktop/anthonys_musings.db:/app/database/anthonys_musings.db
    environment:
      - DATABASE_PATH=/app/database/anthonys_musings.db
      - DEBUG=true
```

### Frontend Configuration  
**File**: `/Users/tikbalang/anthonys-musings-web/docker-compose.yml`
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - \"3001:80\"
    volumes:
      - ./frontend/static:/usr/share/nginx/html:ro
    environment:
      - API_BASE_URL=http://host.docker.internal:8000
```

## 🔧 Development Workflow

### Making Backend Changes
```bash
cd /Users/tikbalang/anthonys-musings-api

# Edit main.py or other Python files
nano main.py

# Restart backend to pick up changes
docker-compose down
docker-compose up -d --build
```

### Making Frontend Changes
```bash
cd /Users/tikbalang/anthonys-musings-web

# Edit frontend/static/index.html
nano frontend/static/index.html

# Restart frontend (or just refresh browser for static changes)
docker-compose restart frontend
```

## 🗄️ Database Management

### Database Location
- **Host Path**: `/Users/tikbalang/Desktop/anthonys_musings.db`
- **Container Path**: `/app/database/anthonys_musings.db`
- **Mounted in**: Backend container only

### Database Operations
```bash
# Access database directly
sqlite3 /Users/tikbalang/Desktop/anthonys_musings.db

# Run migration scripts
cd /Users/tikbalang/anthonys-musings-api
python3 migrate_database.py

# Backup database
cp /Users/tikbalang/Desktop/anthonys_musings.db \
   /Users/tikbalang/Desktop/anthonys_musings_backup_$(date +%Y%m%d).db
```

## 🚨 Troubleshooting

### Backend API Issues
```bash
# Check if API is running
curl http://localhost:8000/health

# View backend logs
cd /Users/tikbalang/anthonys-musings-api
docker-compose logs -f api

# Restart backend
docker-compose restart api
```

### Frontend Web Issues
```bash
# Check if frontend is running
curl http://localhost:3001

# View frontend logs
cd /Users/tikbalang/anthonys-musings-web
docker-compose logs -f frontend

# Restart frontend
docker-compose restart frontend
```

### Container Communication Issues
```bash
# Test API from frontend container
cd /Users/tikbalang/anthonys-musings-web
docker-compose exec frontend curl http://host.docker.internal:8000/health

# Check Docker networks
docker network ls
```

### Common Problems

| Problem | Solution |
|---------|----------|
| \"Port already in use\" | `docker-compose down` then restart |
| \"Database locked\" | Stop all containers, restart backend first |
| \"API connection failed\" | Verify backend is running on port 8000 |
| \"Search not working\" | Check browser console for JavaScript errors |
| \"Explicit content not showing\" | Toggle \"Show Explicit Content\" button |

## 📊 System Resources

### Resource Usage
- **Backend Container**: ~200MB RAM, minimal CPU
- **Frontend Container**: ~50MB RAM, minimal CPU  
- **Database File**: ~50MB (245 writings)
- **Total Disk**: ~500MB including images

### Port Usage
- **8000**: Backend API (FastAPI + Uvicorn)
- **3001**: Frontend Web (Nginx)

## 🔐 Security Notes

### Current Security
- ✅ Containers run as non-root users
- ✅ Database file mounted read-write (backend only)
- ✅ Frontend serves static files only
- ✅ Explicit content warnings implemented

### Production Recommendations
- Add HTTPS/SSL certificates
- Implement API authentication
- Use environment variables for secrets
- Enable container security scanning
- Implement rate limiting

## 📈 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend health  
curl http://localhost:3001

# Container status
docker-compose ps
```

### Log Monitoring
```bash
# Live logs from both services
docker-compose logs -f api      # Backend
docker-compose logs -f frontend # Frontend

# Log files in containers
docker-compose exec api tail -f /var/log/uvicorn.log
docker-compose exec frontend tail -f /var/log/nginx/access.log
```

---

## 📋 Quick Reference

### Essential Commands
```bash
# Start everything
cd /Users/tikbalang/anthonys-musings-api && docker-compose up -d
cd /Users/tikbalang/anthonys-musings-web && docker-compose up -d

# Stop everything  
cd /Users/tikbalang/anthonys-musings-web && docker-compose down
cd /Users/tikbalang/anthonys-musings-api && docker-compose down

# Check status
docker ps

# Access services
open http://localhost:3001  # Web interface
open http://localhost:8000/docs  # API documentation
```

### File Locations
- **Backend Code**: `/Users/tikbalang/anthonys-musings-api/main.py`
- **Frontend Code**: `/Users/tikbalang/anthonys-musings-web/frontend/static/index.html`  
- **Database**: `/Users/tikbalang/Desktop/anthonys_musings.db`

**System Status**: ✅ Both containers running independently, communicating via HTTP API calls

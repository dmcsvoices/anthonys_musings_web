# Backend Setup Required

This directory should contain your existing FastAPI backend files.

Copy your backend files here following this structure:

```
backend/
├── app/
│   ├── main.py          # FastAPI application
│   ├── models.py        # Database models
│   ├── database.py      # Database connection
│   ├── crud.py          # Database operations
│   └── api/             # API endpoints
│       ├── __init__.py
│       ├── writings.py
│       ├── search.py
│       ├── analytics.py
│       └── tags.py
├── requirements.txt     # Python dependencies
├── Dockerfile          # Backend container
└── .env.example        # Backend environment
```

The frontend is configured to proxy API requests to `/api/` which will be handled by your FastAPI backend running on port 8000.

Make sure your backend includes these endpoints:
- GET /api/writings
- GET /api/search  
- GET /api/stats
- GET /api/tags
- GET /health

Refer to the API setup instructions document for the complete backend implementation.

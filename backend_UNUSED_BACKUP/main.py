from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import hashlib
import os
from datetime import datetime, date
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Anthony's Musings API",
    description="API for managing creative writing content",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", "/app/database/anthonys_musings.db")

# Pydantic models
class WritingBase(BaseModel):
    title: str
    content_type: str
    content: str
    notes: Optional[str] = None
    publication_status: str = "draft"

class WritingCreate(WritingBase):
    pass

class WritingUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[str] = None
    content: Optional[str] = None
    notes: Optional[str] = None
    publication_status: Optional[str] = None

class Tag(BaseModel):
    id: int
    name: str
    tag_type: str

class WritingDetail(BaseModel):
    id: int
    title: str
    content_type: str
    content: str
    word_count: int
    character_count: int
    line_count: int
    mood: Optional[str]
    explicit_content: bool
    publication_status: str
    notes: Optional[str]
    file_timestamp: str
    tags: List[Tag] = []

class PaginatedResponse(BaseModel):
    items: List[WritingDetail]
    total: int
    page: int
    limit: int
    pages: int

class DatabaseStats(BaseModel):
    total_writings: int
    total_words: int
    average_words: float
    content_type_distribution: dict
    publication_status_distribution: dict
    top_tags: List[dict]

# Database connection
def get_db_connection():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Helper functions
def calculate_content_hash(content: str) -> str:
    """Calculate MD5 hash of content for duplicate detection"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def get_writing_tags(conn, writing_id: int) -> List[Tag]:
    """Get tags for a specific writing"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.id, t.name, t.tag_type
        FROM tags t
        JOIN writing_tags wt ON t.id = wt.tag_id
        WHERE wt.writing_id = ?
    """, (writing_id,))
    
    return [Tag(id=row['id'], name=row['name'], tag_type=row['tag_type']) 
            for row in cursor.fetchall()]

def row_to_writing(row, tags: List[Tag] = None) -> WritingDetail:
    """Convert database row to WritingDetail object"""
    return WritingDetail(
        id=row['id'],
        title=row['title'],
        content_type=row['content_type'],
        content=row['content'],
        word_count=row['word_count'],
        character_count=row['character_count'],
        line_count=row['line_count'],
        mood=row['mood'],
        explicit_content=bool(row['explicit_content']),
        publication_status=row['publication_status'],
        notes=row['notes'],
        file_timestamp=row['file_timestamp'],
        tags=tags or []
    )

# API Endpoints

@app.get("/")
async def root():
    return {"message": "Anthony's Musings API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM writings")
        count = cursor.fetchone()[0]
        conn.close()
        return {"status": "healthy", "database": "connected", "total_writings": count}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/writings", response_model=PaginatedResponse)
async def get_writings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    content_type: Optional[str] = None,
    publication_status: Optional[str] = None,
    explicit: bool = Query(False)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build WHERE clause
    where_conditions = []
    params = []
    
    if content_type:
        where_conditions.append("content_type = ?")
        params.append(content_type)
    
    if publication_status:
        where_conditions.append("publication_status = ?")
        params.append(publication_status)
    
    if not explicit:
        where_conditions.append("explicit_content = 0")
    
    where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
    
    # Get total count
    count_query = f"SELECT COUNT(*) FROM writings {where_clause}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    query = f"""
        SELECT * FROM writings {where_clause}
        ORDER BY file_timestamp DESC
        LIMIT ? OFFSET ?
    """
    cursor.execute(query, params + [limit, offset])
    
    writings = []
    for row in cursor.fetchall():
        tags = get_writing_tags(conn, row['id'])
        writings.append(row_to_writing(row, tags))
    
    conn.close()
    
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=writings,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@app.get("/api/writings/today", response_model=PaginatedResponse)
async def get_todays_writings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    explicit: bool = Query(False)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    today = date.today().isoformat()
    
    where_conditions = ["date(file_timestamp) = ?"]
    params = [today]
    
    if not explicit:
        where_conditions.append("explicit_content = 0")
    
    where_clause = "WHERE " + " AND ".join(where_conditions)
    
    # Get total count
    count_query = f"SELECT COUNT(*) FROM writings {where_clause}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    query = f"""
        SELECT * FROM writings {where_clause}
        ORDER BY file_timestamp DESC
        LIMIT ? OFFSET ?
    """
    cursor.execute(query, params + [limit, offset])
    
    writings = []
    for row in cursor.fetchall():
        tags = get_writing_tags(conn, row['id'])
        writings.append(row_to_writing(row, tags))
    
    conn.close()
    
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=writings,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@app.get("/api/writings/type/{content_type}", response_model=PaginatedResponse)
async def get_writings_by_type(
    content_type: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    explicit: bool = Query(False)
):
    return await get_writings(page=page, limit=limit, content_type=content_type, explicit=explicit)

@app.get("/api/writings/chapters", response_model=PaginatedResponse)
async def get_chapters(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    explicit: bool = Query(False)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_conditions = [
        "(content_type = 'prose' OR content_type = 'fragment')",
        "(LOWER(content) LIKE '%chapter%' OR LOWER(title) LIKE '%chapter%')"
    ]
    params = []
    
    if not explicit:
        where_conditions.append("explicit_content = 0")
    
    where_clause = "WHERE " + " AND ".join(where_conditions)
    
    # Get total count
    count_query = f"SELECT COUNT(*) FROM writings {where_clause}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    query = f"""
        SELECT * FROM writings {where_clause}
        ORDER BY file_timestamp DESC
        LIMIT ? OFFSET ?
    """
    cursor.execute(query, params + [limit, offset])
    
    writings = []
    for row in cursor.fetchall():
        tags = get_writing_tags(conn, row['id'])
        writings.append(row_to_writing(row, tags))
    
    conn.close()
    
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=writings,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@app.get("/api/writings/{writing_id}", response_model=WritingDetail)
async def get_writing(writing_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM writings WHERE id = ?", (writing_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Writing not found")
    
    tags = get_writing_tags(conn, writing_id)
    writing = row_to_writing(row, tags)
    
    conn.close()
    return writing

@app.put("/api/writings/{writing_id}", response_model=WritingDetail)
async def update_writing(writing_id: int, writing_update: WritingUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if writing exists
    cursor.execute("SELECT * FROM writings WHERE id = ?", (writing_id,))
    existing = cursor.fetchone()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Writing not found")
    
    # Build update query
    update_fields = []
    params = []
    
    if writing_update.title is not None:
        update_fields.append("title = ?")
        params.append(writing_update.title)
    
    if writing_update.content_type is not None:
        update_fields.append("content_type = ?")
        params.append(writing_update.content_type)
    
    if writing_update.content is not None:
        update_fields.append("content = ?")
        update_fields.append("word_count = ?")
        update_fields.append("character_count = ?")
        update_fields.append("line_count = ?")
        update_fields.append("content_hash = ?")
        
        params.append(writing_update.content)
        params.append(len(writing_update.content.split()))
        params.append(len(writing_update.content))
        params.append(len([l for l in writing_update.content.split('\n') if l.strip()]))
        params.append(calculate_content_hash(writing_update.content))
    
    if writing_update.notes is not None:
        update_fields.append("notes = ?")
        params.append(writing_update.notes)
    
    if writing_update.publication_status is not None:
        update_fields.append("publication_status = ?")
        params.append(writing_update.publication_status)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Execute update
    update_query = f"UPDATE writings SET {', '.join(update_fields)} WHERE id = ?"
    params.append(writing_id)
    
    cursor.execute(update_query, params)
    conn.commit()
    
    # Return updated writing
    cursor.execute("SELECT * FROM writings WHERE id = ?", (writing_id,))
    row = cursor.fetchone()
    tags = get_writing_tags(conn, writing_id)
    writing = row_to_writing(row, tags)
    
    conn.close()
    return writing

@app.get("/api/search", response_model=PaginatedResponse)
async def search_writings(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=1000),
    include_explicit: bool = Query(False)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Use FTS for search
    where_conditions = ["writings_fts MATCH ?"]
    params = [q]
    
    if not include_explicit:
        where_conditions.append("w.explicit_content = 0")
    
    where_clause = "WHERE " + " AND ".join(where_conditions)
    
    query = f"""
        SELECT w.*, snippet(writings_fts, 1, '<b>', '</b>', '...', 32) as snippet
        FROM writings_fts 
        JOIN writings w ON writings_fts.rowid = w.id
        {where_clause}
        ORDER BY rank
        LIMIT ?
    """
    
    cursor.execute(query, params + [limit])
    
    writings = []
    for row in cursor.fetchall():
        tags = get_writing_tags(conn, row['id'])
        writing = row_to_writing(row, tags)
        writings.append(writing)
    
    conn.close()
    
    return PaginatedResponse(
        items=writings,
        total=len(writings),
        page=1,
        limit=limit,
        pages=1
    )

@app.get("/api/stats", response_model=DatabaseStats)
async def get_database_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Overall stats
    cursor.execute("SELECT COUNT(*), SUM(word_count), AVG(word_count) FROM writings")
    total, total_words, avg_words = cursor.fetchone()
    
    # By content type
    cursor.execute("""
        SELECT content_type, COUNT(*), 
               SUM(CASE WHEN explicit_content = 1 THEN 1 ELSE 0 END) as explicit_count
        FROM writings GROUP BY content_type ORDER BY COUNT(*) DESC
    """)
    content_type_dist = {}
    for row in cursor.fetchall():
        content_type_dist[row[0]] = {"count": row[1], "explicit": row[2]}
    
    # By status
    cursor.execute("SELECT publication_status, COUNT(*) FROM writings GROUP BY publication_status")
    status_dist = dict(cursor.fetchall())
    
    # Top tags
    cursor.execute("""
        SELECT t.name, COUNT(wt.writing_id) as count
        FROM tags t
        JOIN writing_tags wt ON t.id = wt.tag_id
        GROUP BY t.id, t.name
        ORDER BY count DESC
        LIMIT 10
    """)
    top_tags = [{"name": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return DatabaseStats(
        total_writings=total or 0,
        total_words=total_words or 0,
        average_words=avg_words or 0,
        content_type_distribution=content_type_dist,
        publication_status_distribution=status_dist,
        top_tags=top_tags
    )

@app.get("/api/tags")
async def get_tags():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT t.id, t.name, t.tag_type, COUNT(wt.writing_id) as usage_count
        FROM tags t
        LEFT JOIN writing_tags wt ON t.id = wt.tag_id
        GROUP BY t.id, t.name, t.tag_type
        ORDER BY usage_count DESC, t.name
    """)
    
    tags = []
    for row in cursor.fetchall():
        tags.append({
            "id": row[0],
            "name": row[1],
            "tag_type": row[2],
            "usage_count": row[3]
        })
    
    conn.close()
    return {"tags": tags}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

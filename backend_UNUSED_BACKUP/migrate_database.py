#!/usr/bin/env python3
"""
Database migration script for Anthony's Musings
Adds fields for duplicate detection and performance optimization
"""

import sqlite3
import hashlib
import sys
import os
from datetime import datetime

def get_database_path():
    """Get database path from environment or default"""
    return os.getenv("DATABASE_PATH", "/app/database/anthonys_musings.db")

def calculate_content_hash(content):
    """Calculate MD5 hash of content"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def migrate_database():
    """Run database migration"""
    db_path = get_database_path()
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return False
    
    print(f"🔧 Migrating database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current schema
        cursor.execute("PRAGMA table_info(writings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations_applied = 0
        
        # Add new columns if they don't exist
        new_columns = [
            ("content_hash", "TEXT"),
            ("content_fingerprint", "TEXT"), 
            ("similarity_group_id", "INTEGER"),
            ("is_duplicate", "BOOLEAN DEFAULT 0"),
            ("parent_writing_id", "INTEGER")
        ]
        
        for column_name, column_type in new_columns:
            if column_name not in columns:
                print(f"  ➕ Adding column: {column_name}")
                cursor.execute(f"ALTER TABLE writings ADD COLUMN {column_name} {column_type}")
                migrations_applied += 1
            else:
                print(f"  ✅ Column already exists: {column_name}")
        
        # Create indexes if they don't exist
        indexes = [
            ("idx_writings_content_hash", "writings", "content_hash"),
            ("idx_writings_similarity_group", "writings", "similarity_group_id"),
            ("idx_writings_is_duplicate", "writings", "is_duplicate"),
            ("idx_writings_today", "writings", "date(file_timestamp)"),
            ("idx_writings_content_type", "writings", "content_type"),
            ("idx_writings_publication_status", "writings", "publication_status"),
        ]
        
        for index_name, table_name, column in indexes:
            try:
                cursor.execute(f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name}({column})")
                print(f"  📊 Created index: {index_name}")
            except sqlite3.Error as e:
                print(f"  ⚠️  Index {index_name} may already exist: {e}")
        
        # Populate content_hash for existing records
        cursor.execute("SELECT id, content FROM writings WHERE content_hash IS NULL")
        records_to_update = cursor.fetchall()
        
        if records_to_update:
            print(f"  🔍 Updating content hashes for {len(records_to_update)} records...")
            for record_id, content in records_to_update:
                content_hash = calculate_content_hash(content)
                # Also create a simple fingerprint (first 100 + last 100 chars)
                fingerprint = content[:100] + "..." + content[-100:] if len(content) > 200 else content
                
                cursor.execute("""
                    UPDATE writings 
                    SET content_hash = ?, content_fingerprint = ?
                    WHERE id = ?
                """, (content_hash, fingerprint, record_id))
            
            migrations_applied += len(records_to_update)
        
        # Create useful views
        views = [
            ("todays_writings", """
                SELECT * FROM writings 
                WHERE date(file_timestamp) = date('now')
            """),
            ("potential_duplicates", """
                SELECT 
                    w1.id as writing1_id,
                    w2.id as writing2_id,
                    w1.title as title1,
                    w2.title as title2,
                    w1.content_hash,
                    w1.word_count,
                    w2.word_count
                FROM writings w1
                JOIN writings w2 ON w1.content_hash = w2.content_hash 
                WHERE w1.id < w2.id
            """)
        ]
        
        for view_name, view_sql in views:
            try:
                cursor.execute(f"DROP VIEW IF EXISTS {view_name}")
                cursor.execute(f"CREATE VIEW {view_name} AS {view_sql}")
                print(f"  👁️  Created view: {view_name}")
            except sqlite3.Error as e:
                print(f"  ⚠️  Error creating view {view_name}: {e}")
        
        conn.commit()
        
        # Verify migration
        cursor.execute("SELECT COUNT(*) FROM writings")
        total_writings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM writings WHERE content_hash IS NOT NULL")
        hashed_writings = cursor.fetchone()[0]
        
        print(f"\n✅ Migration completed successfully!")
        print(f"   📈 {migrations_applied} changes applied")
        print(f"   📚 Total writings: {total_writings}")
        print(f"   🔍 Content hashes: {hashed_writings}")
        
        # Check for any potential duplicates
        cursor.execute("SELECT COUNT(*) FROM potential_duplicates")
        duplicate_count = cursor.fetchone()[0]
        if duplicate_count > 0:
            print(f"   ⚠️  Found {duplicate_count} potential duplicate pairs")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def verify_migration():
    """Verify that migration was successful"""
    db_path = get_database_path()
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if new columns exist
        cursor.execute("PRAGMA table_info(writings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        required_columns = ["content_hash", "similarity_group_id", "is_duplicate"]
        missing_columns = [col for col in required_columns if col not in columns]
        
        if missing_columns:
            print(f"❌ Missing columns: {missing_columns}")
            return False
        
        # Check if content hashes are populated
        cursor.execute("SELECT COUNT(*) FROM writings WHERE content_hash IS NULL")
        null_hashes = cursor.fetchone()[0]
        
        if null_hashes > 0:
            print(f"⚠️  {null_hashes} writings missing content hashes")
        
        cursor.execute("SELECT COUNT(*) FROM writings")
        total = cursor.fetchone()[0]
        
        print(f"✅ Migration verification passed")
        print(f"   📚 Total writings: {total}")
        print(f"   🔍 Missing hashes: {null_hashes}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Anthony's Musings Database Migration")
    print("=" * 50)
    
    if "--verify" in sys.argv:
        verify_migration()
    else:
        if migrate_database():
            print("\n🎉 Ready to start the API server!")
            print("   Run: docker-compose up")
        else:
            print("\n💥 Migration failed. Please check the error messages above.")
            sys.exit(1)

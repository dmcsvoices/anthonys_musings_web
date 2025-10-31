FROM python:3.9-slim as development

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY main.py .
COPY migrate_database.py .

# Create database directory
RUN mkdir -p /app/database

# Expose port
EXPOSE 8000

# Development command (with hot reload)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM python:3.9-slim as production

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY main.py .
COPY migrate_database.py .

# Create database directory with proper permissions
RUN mkdir -p /app/database && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Create non-root user for security
USER appuser

# Expose port
EXPOSE 8000

# Production command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

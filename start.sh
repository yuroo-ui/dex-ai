#!/bin/bash
PORT=${PORT:-8000}
cd /app/web && exec uvicorn app:app --host 0.0.0.0 --port $PORT --workers 1

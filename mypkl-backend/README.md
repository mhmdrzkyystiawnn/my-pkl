# MyPKL Backend

## Overview
Backend API untuk MyPKL dibangun dengan FastAPI, SQLAlchemy, dan JWT authentication.

## Setup
1. Copy `.env.example` ke `.env`
2. Update `DATABASE_URL`, `SECRET_KEY`, dan `FRONTEND_ORIGINS`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run
```bash
uvicorn app.main:app --reload
```

## API
- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login dan terima token
- `GET /api/auth/me` - user profile
- `GET /api/health` - health check
- `GET /api/attendance/today` - data absen hari ini

Docs tersedia di `/docs`.

## Testing
Jalankan:
```bash
pytest
```

## Database Migrations
Backend sekarang menggunakan Alembic. Buat dan jalankan migrasi dengan:
```bash
alembic upgrade head
```

## Notes
- `main.py` sekarang menggunakan middleware global untuk error handler
- `app/core/config.py` mengatur environment
- Health endpoint memeriksa koneksi database

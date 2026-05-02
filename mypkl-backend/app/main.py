import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .core.config import FRONTEND_ORIGINS
from .routers import auth, logbook, documents, attendance, settings, health

logger = logging.getLogger("mypkl")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(title="MyPKL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning("HTTP %s: %s", exc.status_code, exc.detail)
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error: %s", exc.errors())
    return JSONResponse({"detail": exc.errors()}, status_code=422)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return JSONResponse({"detail": "Internal server error"}, status_code=500)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(logbook.router,    prefix="/api/logbook",    tags=["Logbook"])
app.include_router(documents.router,  prefix="/api/documents",  tags=["Documents"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(settings.router,   prefix="/api/settings",   tags=["Settings"])
app.include_router(health.router,     prefix="/api",            tags=["Health"])

@app.get("/")
def root():
    return {"message": "MyPKL API is running!"}
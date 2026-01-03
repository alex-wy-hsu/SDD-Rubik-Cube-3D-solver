"""
FastAPI application main entry point
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import cube, health, scramble


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup
    print("🚀 Starting Rubik's Cube Solver API")
    yield
    # Shutdown
    print("👋 Shutting down API")


# Create FastAPI app
app = FastAPI(
    title="Rubik's Cube Solver API",
    description="3D Rubik's Cube Solver Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["health"])
app.include_router(cube.router, prefix="/api/cube", tags=["cube"])
app.include_router(scramble.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Rubik's Cube Solver API",
        "version": "1.0.0",
        "docs": "/docs"
    }

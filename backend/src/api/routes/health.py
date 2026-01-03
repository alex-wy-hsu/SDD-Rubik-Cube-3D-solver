"""
Health check endpoints
"""
from fastapi import APIRouter
from ...database.repository import get_repository

router = APIRouter()


@router.get("/healthz")
async def health_check():
    """Basic health check"""
    return {"status": "healthy"}


@router.get("/readyz")
async def readiness_check():
    """
    Readiness check including database connectivity
    """
    checks = {
        "api": "healthy",
        "database": "unknown",
    }
    
    # Check database connectivity
    try:
        repository = get_repository()
        db_healthy = await repository.check_connection()
        checks["database"] = "healthy" if db_healthy else "unhealthy"
    except Exception as e:
        checks["database"] = "unhealthy"
        print(f"Database health check error: {e}")
    
    all_healthy = all(status == "healthy" for status in checks.values())
    
    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks
    }

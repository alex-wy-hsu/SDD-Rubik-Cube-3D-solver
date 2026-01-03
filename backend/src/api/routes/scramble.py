"""
API routes for scramble operations
Endpoints: POST /api/scramble/generate, GET /api/scramble/{seed}
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from src.services.scramble_service import ScrambleService

router = APIRouter(prefix="/api/scramble", tags=["scramble"])

# Service instance
scramble_service = ScrambleService()


class ScrambleGenerateRequest(BaseModel):
    """Request body for scramble generation"""
    seed: str | None = Field(None, description="Optional seed for deterministic generation")


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_scramble(request: ScrambleGenerateRequest = ScrambleGenerateRequest()):
    """
    Generate a new 25-move scramble sequence.

    Uses deterministic RNG when seed is provided, allowing reproducibility.
    If no seed is provided, generates a random one.

    Args:
        request: Optional seed in request body

    Returns:
        Scramble object with seed, moves, and metadata

    Raises:
        HTTPException: 400 if seed is invalid
    """
    try:
        scramble = scramble_service.generate_scramble(seed=request.seed)
        return scramble.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{seed}")
async def get_scramble_by_seed(seed: str):
    """
    Retrieve a scramble by its seed.

    Returns the same scramble for the same seed (deterministic).
    If seed hasn't been generated yet, creates it.

    Args:
        seed: The seed string

    Returns:
        Scramble object

    Raises:
        HTTPException: 404 if seed not found and cannot be generated
    """
    # Try to get existing scramble
    scramble = scramble_service.get_scramble_by_seed(seed)

    # If not found, generate it with the provided seed
    if scramble is None:
        try:
            scramble = scramble_service.generate_scramble(seed=seed)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    return scramble.to_dict()

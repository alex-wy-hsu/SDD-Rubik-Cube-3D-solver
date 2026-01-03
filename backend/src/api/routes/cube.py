"""
Cube state endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...models import CubeState, Move
from ...services.validation_service import ValidationService

router = APIRouter()


class ValidateRequest(BaseModel):
    """Request model for cube validation"""
    facelets: str = Field(..., min_length=54, max_length=54, pattern="^[URFDLB]{54}$")


class ValidateResponse(BaseModel):
    """Response model for cube validation"""
    is_valid: bool
    is_solved: bool
    error_message: str | None = None


class ApplyMoveRequest(BaseModel):
    """Request model for applying a move"""
    facelets: str = Field(..., min_length=54, max_length=54, pattern="^[URFDLB]{54}$")
    move: dict = Field(..., example={"face": "U", "direction": 1})


class CubeStateResponse(BaseModel):
    """Response model for cube state"""
    facelets: str
    is_valid: bool
    is_solved: bool


@router.post("/validate", response_model=ValidateResponse)
async def validate_cube(request: ValidateRequest):
    """
    Validate a cube state

    Checks:
    - 54 characters
    - Valid characters (U/R/F/D/L/B)
    - Exactly 9 of each color
    - Whether cube is solved
    """
    result = ValidationService.validate_cube_state(request.facelets)

    return ValidateResponse(
        is_valid=result["is_valid"],
        is_solved=result["is_solved"],
        error_message=result.get("error_message")
    )


@router.post("/apply-move", response_model=CubeStateResponse)
async def apply_move(request: ApplyMoveRequest):
    """
    Apply a move to a cube state

    Returns the new cube state after applying the move
    """
    # Validate input state
    is_valid, error = ValidationService.is_valid(request.facelets)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    try:
        # Create cube state
        cube_state = CubeState.from_facelets(request.facelets)

        # Parse and apply move
        move = Move(
            face=request.move["face"],
            direction=request.move["direction"]
        )

        new_state = cube_state.apply_move(move)

        return CubeStateResponse(
            facelets=new_state.facelets,
            is_valid=new_state.is_valid,
            is_solved=new_state.is_solved
        )
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))

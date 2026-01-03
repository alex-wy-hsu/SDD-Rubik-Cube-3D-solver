"""
Scramble model for backend
Represents a 25-move scramble sequence with seed for reproducibility
"""
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from src.models.move import Move


@dataclass(frozen=True)
class Scramble:
    """
    Represents a scramble sequence for the Rubik's cube.

    Attributes:
        seed: String seed for deterministic random generation
        moves: List of 25 moves
        move_count: Number of moves (always 25)
        id: Unique identifier
        created_at: Timestamp of creation
    """
    seed: str
    moves: list[Move]
    move_count: int
    id: str | None = None
    created_at: datetime | None = None

    def __post_init__(self):
        """Validate scramble constraints"""
        if self.move_count != 25:
            raise ValueError(f"Scramble must have exactly 25 moves, got {self.move_count}")

        if len(self.moves) != 25:
            raise ValueError(f"Moves list must contain exactly 25 moves, got {len(self.moves)}")

        if not self.seed or len(self.seed) == 0:
            raise ValueError("Seed cannot be empty")

    @staticmethod
    def create(seed: str, moves: list[Move]) -> 'Scramble':
        """
        Factory method to create a new Scramble with generated ID and timestamp

        Args:
            seed: Seed string for reproducibility
            moves: List of 25 moves

        Returns:
            New Scramble instance with ID and timestamp
        """
        return Scramble(
            seed=seed,
            moves=moves,
            move_count=len(moves),
            id=str(uuid4()),
            created_at=datetime.utcnow()
        )

    def to_dict(self) -> dict:
        """
        Convert to dictionary for API responses

        Returns:
            Dictionary representation matching OpenAPI schema
        """
        return {
            "id": self.id,
            "seed": self.seed,
            "moves": [move.to_dict() for move in self.moves],
            "move_count": self.move_count,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None
        }

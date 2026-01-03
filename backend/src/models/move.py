"""
Move model for Rubik's Cube
"""
from dataclasses import dataclass
from enum import Enum
from typing import Literal


class Face(str, Enum):
    """Face enum using Singmaster notation"""
    U = "U"
    D = "D"
    L = "L"
    R = "R"
    F = "F"
    B = "B"


Direction = Literal[1, -1, 2]


@dataclass(frozen=True)
class Move:
    """
    Represents a single move on the Rubik's Cube

    Attributes:
        face: The face to rotate (U/D/L/R/F/B)
        direction: Rotation direction (1=CW 90°, -1=CCW 90°, 2=180°)
    """
    face: Face
    direction: Direction

    def __post_init__(self):
        if self.direction not in (1, -1, 2):
            raise ValueError(f"Direction must be 1, -1, or 2, got {self.direction}")

    def to_string(self) -> str:
        """Convert to Singmaster notation"""
        if self.direction == 1:
            return self.face.value
        elif self.direction == -1:
            return f"{self.face.value}'"
        return f"{self.face.value}2"

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses"""
        return {
            "face": self.face.value,
            "direction": self.direction
        }

    @classmethod
    def from_string(cls, s: str) -> "Move":
        """Parse Singmaster notation to Move"""
        if not s or len(s) < 1:
            raise ValueError(f"Invalid move string: {s}")

        face_char = s[0].upper()
        try:
            face = Face(face_char)
        except ValueError:
            raise ValueError(f"Invalid face: {face_char}")

        if len(s) == 1:
            return cls(face=face, direction=1)
        elif s[1] == "'":
            return cls(face=face, direction=-1)
        elif s[1] == "2":
            return cls(face=face, direction=2)
        else:
            raise ValueError(f"Invalid move string: {s}")

    def inverse(self) -> "Move":
        """Return the inverse move"""
        if self.direction == 2:
            return self  # 180° is self-inverse
        return Move(face=self.face, direction=-self.direction)  # type: ignore


def moves_to_string(moves: list[Move]) -> str:
    """Convert list of moves to space-separated string"""
    return " ".join(move.to_string() for move in moves)


def string_to_moves(s: str) -> list[Move]:
    """Parse space-separated moves string"""
    if not s.strip():
        return []
    return [Move.from_string(part) for part in s.split() if part.strip()]

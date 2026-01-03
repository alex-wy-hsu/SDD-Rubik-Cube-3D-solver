"""
CubeState model for Rubik's Cube
"""
from dataclasses import dataclass
from typing import Optional

from .move import Move


@dataclass(frozen=True)
class CubeState:
    """
    Represents the complete state of a 3x3x3 Rubik's Cube
    
    Attributes:
        facelets: 54-character string in URFDLB order
        is_valid: Whether the state is valid
        is_solved: Whether the cube is solved
    """
    facelets: str
    is_valid: bool
    is_solved: bool
    
    def __post_init__(self):
        if len(self.facelets) != 54:
            raise ValueError(f"Facelets must be exactly 54 characters, got {len(self.facelets)}")
    
    @classmethod
    def solved(cls) -> "CubeState":
        """Create a solved cube state"""
        facelets = (
            "UUUUUUUUU" +  # U face
            "RRRRRRRRR" +  # R face
            "FFFFFFFFF" +  # F face
            "DDDDDDDDD" +  # D face
            "LLLLLLLLL" +  # L face
            "BBBBBBBBB"    # B face
        )
        return cls(facelets=facelets, is_valid=True, is_solved=True)
    
    @classmethod
    def from_facelets(cls, facelets: str) -> "CubeState":
        """Create CubeState with validation"""
        is_valid = cls._validate_facelets(facelets)
        is_solved = cls._check_solved(facelets) if is_valid else False
        return cls(facelets=facelets, is_valid=is_valid, is_solved=is_solved)
    
    @staticmethod
    def _validate_facelets(facelets: str) -> bool:
        """Validate facelet configuration"""
        if len(facelets) != 54:
            return False
        
        # Count each color
        color_counts = {}
        for facelet in facelets:
            color_counts[facelet] = color_counts.get(facelet, 0) + 1
        
        # Must have exactly 9 of each color
        valid_colors = ['U', 'R', 'F', 'D', 'L', 'B']
        for color in valid_colors:
            if color_counts.get(color, 0) != 9:
                return False
        
        return True
    
    @staticmethod
    def _check_solved(facelets: str) -> bool:
        """Check if cube is solved"""
        if len(facelets) != 54:
            return False
        
        # Check each face has all same colors
        for i in range(6):
            face_start = i * 9
            face_facelets = facelets[face_start:face_start + 9]
            center_color = face_facelets[4]  # Center piece
            if not all(f == center_color for f in face_facelets):
                return False
        
        return True
    
    def apply_move(self, move: Move) -> "CubeState":
        """
        Apply a move to the cube
        
        Note: Full implementation requires complex rotation logic
        This is a simplified placeholder that will be completed in implementation phase
        """
        # TODO: Implement full rotation logic
        # For now, return self to maintain structure
        return self
    
    def apply_moves(self, moves: list[Move]) -> "CubeState":
        """Apply a sequence of moves"""
        state = self
        for move in moves:
            state = state.apply_move(move)
        return state
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "facelets": self.facelets,
            "is_valid": self.is_valid,
            "is_solved": self.is_solved,
        }

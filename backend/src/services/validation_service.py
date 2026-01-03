"""
Validation service for cube states
"""
from typing import Optional

from ..models.cube_state import CubeState


class ValidationService:
    """Service for validating cube states"""
    
    @staticmethod
    def is_valid(facelets: str) -> tuple[bool, Optional[str]]:
        """
        Check if a facelet string is valid
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if len(facelets) != 54:
            return False, f"Facelets must be exactly 54 characters, got {len(facelets)}"
        
        # Count each color
        color_counts = {}
        for facelet in facelets:
            if facelet not in ['U', 'R', 'F', 'D', 'L', 'B']:
                return False, f"Invalid character: {facelet}"
            color_counts[facelet] = color_counts.get(facelet, 0) + 1
        
        # Check color distribution
        valid_colors = ['U', 'R', 'F', 'D', 'L', 'B']
        for color in valid_colors:
            count = color_counts.get(color, 0)
            if count != 9:
                return False, f"Color {color} appears {count} times, expected 9"
        
        return True, None
    
    @staticmethod
    def is_solved(facelets: str) -> bool:
        """Check if cube is in solved state"""
        if len(facelets) != 54:
            return False
        
        # Check each face
        for i in range(6):
            face_start = i * 9
            face_facelets = facelets[face_start:face_start + 9]
            center_color = face_facelets[4]
            if not all(f == center_color for f in face_facelets):
                return False
        
        return True
    
    @staticmethod
    def validate_cube_state(facelets: str) -> dict:
        """
        Full validation of cube state
        
        Returns:
            Dictionary with is_valid, is_solved, and optional error_message
        """
        is_valid, error_message = ValidationService.is_valid(facelets)
        
        if not is_valid:
            return {
                "is_valid": False,
                "is_solved": False,
                "error_message": error_message
            }
        
        is_solved = ValidationService.is_solved(facelets)
        
        return {
            "is_valid": True,
            "is_solved": is_solved,
            "error_message": None
        }

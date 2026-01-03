"""
ScrambleService for generating and managing scrambles
Uses deterministic RNG based on seed for reproducibility
"""
import random

from src.models.move import Face, Move
from src.models.scramble import Scramble


class ScrambleService:
    """
    Service for generating and retrieving scrambles.
    Uses deterministic random number generation for reproducible scrambles.
    """

    def __init__(self):
        """Initialize service with scramble cache"""
        self._cache: dict[str, Scramble] = {}

    def generate_scramble(self, seed: str | None = None) -> Scramble:
        """
        Generate a 25-move scramble sequence.

        Args:
            seed: Optional seed for deterministic generation.
                  If None, generates random seed.

        Returns:
            Scramble object with moves and metadata
        """
        # Generate seed if not provided
        if seed is None:
            seed = self._generate_random_seed()

        # Check cache first
        if seed in self._cache:
            return self._cache[seed]

        # Generate moves using seeded RNG
        moves = self._generate_moves(seed)

        # Create scramble
        scramble = Scramble.create(seed=seed, moves=moves)

        # Cache it
        self._cache[seed] = scramble

        return scramble

    def get_scramble_by_seed(self, seed: str) -> Scramble | None:
        """
        Retrieve a scramble by its seed.

        Args:
            seed: The seed to look up

        Returns:
            Scramble if found, None otherwise
        """
        return self._cache.get(seed)

    def _generate_random_seed(self) -> str:
        """
        Generate a random seed string.

        Returns:
            Random alphanumeric seed
        """
        import hashlib
        import time

        # Use timestamp + random bytes for uniqueness
        data = f"{time.time()}{random.random()}".encode()
        hash_obj = hashlib.sha256(data)
        return hash_obj.hexdigest()[:16]

    def _generate_moves(self, seed: str) -> list[Move]:
        """
        Generate 25 random moves using deterministic RNG.
        Avoids redundant consecutive moves (max 3 on same face).

        Args:
            seed: Seed for RNG

        Returns:
            List of 25 moves
        """
        # Create seeded RNG
        rng = random.Random(seed)

        # All possible faces and directions
        faces = [Face.U, Face.D, Face.L, Face.R, Face.F, Face.B]
        directions = [1, -1, 2]

        moves: list[Move] = []
        prev_face: Face | None = None
        consecutive_count = 0

        while len(moves) < 25:
            # Select random face
            face = rng.choice(faces)

            # Avoid too many consecutive moves on same face
            if face == prev_face:
                consecutive_count += 1
                if consecutive_count >= 3:
                    # Skip this face, try again
                    continue
            else:
                consecutive_count = 0
                prev_face = face

            # Select random direction
            direction = rng.choice(directions)

            # Create and add move
            move = Move(face=face, direction=direction)
            moves.append(move)

        return moves

"""
Reliability test for scramble generation
Verifies 100 consecutive scrambles are all solvable
"""
import pytest
from src.services.scramble_service import ScrambleService
from src.models.cube_state import CubeState
from src.services.validation_service import ValidationService


class TestScrambleReliability:
    """Test scramble generation reliability"""

    @pytest.fixture
    def scramble_service(self):
        return ScrambleService()

    @pytest.fixture
    def validation_service(self):
        return ValidationService()

    def test_100_consecutive_scrambles_all_valid(
        self, scramble_service, validation_service
    ):
        """Should generate 100 valid scrambles consecutively"""
        success_count = 0
        
        for i in range(100):
            # Generate scramble
            scramble = scramble_service.generate_scramble(seed=f"reliability_test_{i}")
            
            # Apply to cube
            cube_state = CubeState.solved()
            for move in scramble.moves:
                cube_state = cube_state.apply_move(move)
            
            # Verify valid (solvable)
            if validation_service.is_valid(cube_state):
                success_count += 1
        
        # All 100 must be valid
        assert success_count == 100, f"Only {success_count}/100 scrambles were valid"

    def test_100_consecutive_scrambles_all_unsolved(
        self, scramble_service, validation_service
    ):
        """Should generate 100 scrambles that are all unsolved"""
        unsolved_count = 0
        
        for i in range(100):
            scramble = scramble_service.generate_scramble(seed=f"unsolved_test_{i}")
            
            cube_state = CubeState.solved()
            for move in scramble.moves:
                cube_state = cube_state.apply_move(move)
            
            if not validation_service.is_solved(cube_state):
                unsolved_count += 1
        
        # All 100 should be unsolved (extremely unlikely to randomly solve)
        assert unsolved_count == 100, f"Only {unsolved_count}/100 were unsolved"

    def test_scrambles_have_sufficient_entropy(self, scramble_service):
        """Should generate diverse scrambles (no duplicates in 100 attempts)"""
        scrambles = []
        
        for i in range(100):
            scramble = scramble_service.generate_scramble()
            scrambles.append(scramble)
        
        # All seeds should be unique
        seeds = [s.seed for s in scrambles]
        assert len(set(seeds)) == 100, "Found duplicate seeds"
        
        # Count unique final states
        final_states = []
        for scramble in scrambles:
            cube_state = CubeState.solved()
            for move in scramble.moves:
                cube_state = cube_state.apply_move(move)
            final_states.append(cube_state.facelets)
        
        unique_states = len(set(final_states))
        # At least 95% should be unique (allowing for rare collisions)
        assert unique_states >= 95, f"Only {unique_states}/100 states were unique"

"""
Integration test for scramble flow.
Tests: generate scramble → apply to CubeState → verify solvable
"""
import pytest
from src.services.scramble_service import ScrambleService
from src.models.cube_state import CubeState
from src.services.validation_service import ValidationService


class TestScrambleFlow:
    """Test complete scramble generation and application flow"""

    @pytest.fixture
    def scramble_service(self):
        return ScrambleService()

    @pytest.fixture
    def validation_service(self):
        return ValidationService()

    def test_generate_and_apply_scramble_produces_valid_state(
        self, scramble_service, validation_service
    ):
        """Should produce valid cube state after applying scramble"""
        # Start with solved cube
        cube_state = CubeState.solved()
        
        # Generate scramble
        scramble = scramble_service.generate_scramble(seed="integration_test")
        
        # Apply all moves
        for move in scramble.moves:
            cube_state = cube_state.apply_move(move)
        
        # Verify state is valid
        assert validation_service.is_valid(cube_state) is True

    def test_scrambled_state_is_not_solved(
        self, scramble_service, validation_service
    ):
        """Should produce unsolved state after scrambling"""
        cube_state = CubeState.solved()
        scramble = scramble_service.generate_scramble(seed="unsolved_test")
        
        # Apply scramble
        for move in scramble.moves:
            cube_state = cube_state.apply_move(move)
        
        # Should not be solved
        assert validation_service.is_solved(cube_state) is False

    def test_scramble_produces_solvable_state(
        self, scramble_service, validation_service
    ):
        """Should produce solvable cube state (key requirement)"""
        cube_state = CubeState.solved()
        scramble = scramble_service.generate_scramble(seed="solvable_test")
        
        # Apply scramble
        for move in scramble.moves:
            cube_state = cube_state.apply_move(move)
        
        # Validate it's solvable (valid state means solvable)
        is_valid = validation_service.is_valid(cube_state)
        assert is_valid is True, "Scrambled state must be solvable"

    def test_same_seed_produces_same_cube_state(self, scramble_service):
        """Should produce identical cube state when using same seed"""
        seed = "determinism_test"
        
        # First scramble
        cube_state1 = CubeState.solved()
        scramble1 = scramble_service.generate_scramble(seed=seed)
        for move in scramble1.moves:
            cube_state1 = cube_state1.apply_move(move)
        
        # Second scramble with same seed
        cube_state2 = CubeState.solved()
        scramble2 = scramble_service.generate_scramble(seed=seed)
        for move in scramble2.moves:
            cube_state2 = cube_state2.apply_move(move)
        
        # Should produce identical states
        assert cube_state1.facelets == cube_state2.facelets

    def test_different_seeds_produce_different_states(self, scramble_service):
        """Should produce different cube states with different seeds"""
        # First scramble
        cube_state1 = CubeState.solved()
        scramble1 = scramble_service.generate_scramble(seed="seed_a")
        for move in scramble1.moves:
            cube_state1 = cube_state1.apply_move(move)
        
        # Second scramble with different seed
        cube_state2 = CubeState.solved()
        scramble2 = scramble_service.generate_scramble(seed="seed_b")
        for move in scramble2.moves:
            cube_state2 = cube_state2.apply_move(move)
        
        # Should produce different states
        assert cube_state1.facelets != cube_state2.facelets

    def test_multiple_scrambles_all_valid(self, scramble_service, validation_service):
        """Should generate multiple valid scrambles consecutively"""
        for i in range(10):
            cube_state = CubeState.solved()
            scramble = scramble_service.generate_scramble(seed=f"batch_test_{i}")
            
            # Apply scramble
            for move in scramble.moves:
                cube_state = cube_state.apply_move(move)
            
            # Each should be valid
            assert validation_service.is_valid(cube_state) is True

    def test_scramble_changes_cube_significantly(
        self, scramble_service, validation_service
    ):
        """Should change at least 80% of facelets from solved state"""
        solved_state = CubeState.solved()
        scramble = scramble_service.generate_scramble(seed="significance_test")
        
        # Apply scramble
        scrambled_state = solved_state
        for move in scramble.moves:
            scrambled_state = scrambled_state.apply_move(move)
        
        # Count changed facelets
        changed_count = sum(
            1 for i in range(54)
            if solved_state.facelets[i] != scrambled_state.facelets[i]
        )
        
        # At least 80% should be different
        assert changed_count >= 43, f"Only {changed_count}/54 facelets changed"

    def test_scramble_stores_in_database(self, scramble_service):
        """Should persist scramble to database"""
        seed = "database_test"
        
        # Generate and store
        scramble = scramble_service.generate_scramble(seed=seed)
        
        # Should be retrievable
        retrieved = scramble_service.get_scramble_by_seed(seed)
        
        assert retrieved is not None
        assert retrieved.seed == seed
        assert retrieved.moves == scramble.moves

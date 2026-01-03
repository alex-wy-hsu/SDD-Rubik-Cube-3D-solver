"""
Unit tests for ScrambleService.
Tests deterministic RNG and 25-move generation.
"""
import pytest
from src.services.scramble_service import ScrambleService
from src.models.move import Face, Move


class TestScrambleService:
    """Test ScrambleService functionality"""

    @pytest.fixture
    def service(self):
        """Create ScrambleService instance"""
        return ScrambleService()

    def test_generate_scramble_without_seed(self, service):
        """Should generate scramble with auto-generated seed"""
        scramble = service.generate_scramble()
        
        assert scramble is not None
        assert scramble.seed is not None
        assert len(scramble.seed) > 0
        assert scramble.move_count == 25
        assert len(scramble.moves) == 25

    def test_generate_scramble_with_seed(self, service):
        """Should generate scramble using provided seed"""
        seed = "test_seed_123"
        scramble = service.generate_scramble(seed=seed)
        
        assert scramble.seed == seed
        assert scramble.move_count == 25
        assert len(scramble.moves) == 25

    def test_generate_scramble_deterministic_rng(self, service):
        """Should produce identical moves for same seed (deterministic RNG)"""
        seed = "deterministic_test"
        
        scramble1 = service.generate_scramble(seed=seed)
        scramble2 = service.generate_scramble(seed=seed)
        
        assert scramble1.seed == scramble2.seed
        assert scramble1.moves == scramble2.moves
        assert scramble1.move_count == scramble2.move_count

    def test_generate_scramble_different_seeds_produce_different_moves(self, service):
        """Should produce different moves for different seeds"""
        scramble1 = service.generate_scramble(seed="seed_one")
        scramble2 = service.generate_scramble(seed="seed_two")
        
        assert scramble1.seed != scramble2.seed
        assert scramble1.moves != scramble2.moves

    def test_generate_scramble_moves_are_valid(self, service):
        """Should generate moves with valid faces and directions"""
        scramble = service.generate_scramble()
        
        valid_faces = {Face.U, Face.D, Face.L, Face.R, Face.F, Face.B}
        valid_directions = {1, -1, 2}
        
        for move in scramble.moves:
            assert isinstance(move, Move)
            assert move.face in valid_faces
            assert move.direction in valid_directions

    def test_generate_scramble_no_redundant_moves(self, service):
        """Should not generate redundant consecutive moves (e.g., U U U U)"""
        scramble = service.generate_scramble(seed="redundancy_check")
        
        # Check for more than 3 consecutive moves on same face
        consecutive_count = 1
        prev_face = None
        
        for move in scramble.moves:
            if prev_face == move.face:
                consecutive_count += 1
                assert consecutive_count <= 3, "Too many consecutive moves on same face"
            else:
                consecutive_count = 1
                prev_face = move.face

    def test_generate_scramble_seed_hashing(self, service):
        """Should handle different seed strings correctly"""
        seeds = ["abc", "ABC", "123", "abc123", "test_seed_with_underscores"]
        
        scrambles = [service.generate_scramble(seed=s) for s in seeds]
        
        # All should be valid
        for scramble in scrambles:
            assert scramble.move_count == 25
            assert len(scramble.moves) == 25
        
        # All should be unique (different seeds -> different moves)
        for i, scr1 in enumerate(scrambles):
            for j, scr2 in enumerate(scrambles):
                if i != j:
                    assert scr1.moves != scr2.moves

    def test_get_scramble_by_seed_returns_existing(self, service):
        """Should retrieve previously generated scramble by seed"""
        seed = "retrieval_test"
        
        # Generate scramble
        original = service.generate_scramble(seed=seed)
        
        # Retrieve it
        retrieved = service.get_scramble_by_seed(seed)
        
        assert retrieved is not None
        assert retrieved.seed == original.seed
        assert retrieved.moves == original.moves

    def test_get_scramble_by_seed_returns_none_for_nonexistent(self, service):
        """Should return None for non-existent seed"""
        result = service.get_scramble_by_seed("nonexistent_seed_xyz")
        
        assert result is None

    def test_generate_scramble_assigns_id(self, service):
        """Should assign UUID to generated scramble"""
        scramble = service.generate_scramble()
        
        assert scramble.id is not None
        assert isinstance(scramble.id, str)
        assert len(scramble.id) == 36  # UUID format

    def test_generate_scramble_assigns_created_at(self, service):
        """Should assign timestamp to generated scramble"""
        import datetime
        
        before = datetime.datetime.utcnow()
        scramble = service.generate_scramble()
        after = datetime.datetime.utcnow()
        
        assert scramble.created_at is not None
        assert before <= scramble.created_at <= after

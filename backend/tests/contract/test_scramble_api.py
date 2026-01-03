"""
Contract tests for Scramble API endpoints.
Tests compliance with openapi.yaml specification.
"""
import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


class TestScrambleGenerateEndpoint:
    """Test POST /api/scramble/generate"""

    def test_generate_without_seed_returns_201(self):
        """Should generate scramble without seed and return 201 Created"""
        response = client.post("/api/scramble/generate", json={})
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify response structure matches schema
        assert "seed" in data
        assert "moves" in data
        assert "move_count" in data
        assert "id" in data
        assert "created_at" in data
        
        # Verify data constraints
        assert isinstance(data["seed"], str)
        assert len(data["seed"]) > 0
        assert isinstance(data["moves"], list)
        assert data["move_count"] == 25
        assert len(data["moves"]) == 25

    def test_generate_with_seed_returns_201(self):
        """Should generate scramble with provided seed and return 201 Created"""
        seed = "test_seed_123"
        response = client.post("/api/scramble/generate", json={"seed": seed})
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["seed"] == seed
        assert data["move_count"] == 25
        assert len(data["moves"]) == 25

    def test_generate_with_same_seed_produces_identical_scramble(self):
        """Should produce identical scrambles when using same seed"""
        seed = "deterministic_seed"
        
        response1 = client.post("/api/scramble/generate", json={"seed": seed})
        response2 = client.post("/api/scramble/generate", json={"seed": seed})
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        
        data1 = response1.json()
        data2 = response2.json()
        
        # Same seed should produce same moves
        assert data1["seed"] == data2["seed"]
        assert data1["moves"] == data2["moves"]

    def test_generate_validates_move_structure(self):
        """Should return moves with valid face and direction"""
        response = client.post("/api/scramble/generate", json={})
        
        assert response.status_code == 201
        moves = response.json()["moves"]
        
        valid_faces = ["U", "D", "L", "R", "F", "B"]
        valid_directions = [1, -1, 2]
        
        for move in moves:
            assert "face" in move
            assert "direction" in move
            assert move["face"] in valid_faces
            assert move["direction"] in valid_directions

    def test_generate_with_invalid_seed_type_returns_400(self):
        """Should return 400 for invalid seed type"""
        response = client.post("/api/scramble/generate", json={"seed": 12345})
        
        assert response.status_code == 400
        assert "detail" in response.json()


class TestScrambleGetBySeedEndpoint:
    """Test GET /api/scramble/{seed}"""

    def test_get_existing_seed_returns_200(self):
        """Should return 200 for existing seed"""
        # First generate a scramble
        seed = "existing_seed_test"
        create_response = client.post("/api/scramble/generate", json={"seed": seed})
        assert create_response.status_code == 201
        
        # Then retrieve it
        response = client.get(f"/api/scramble/{seed}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["seed"] == seed
        assert data["move_count"] == 25
        assert len(data["moves"]) == 25

    def test_get_nonexistent_seed_returns_404(self):
        """Should return 404 for non-existent seed"""
        response = client.get("/api/scramble/nonexistent_seed_xyz")
        
        assert response.status_code == 404
        assert "detail" in response.json()

    def test_get_returns_consistent_scramble_for_seed(self):
        """Should return consistent scramble for same seed"""
        seed = "consistency_test_seed"
        
        # Generate scramble
        client.post("/api/scramble/generate", json={"seed": seed})
        
        # Retrieve multiple times
        response1 = client.get(f"/api/scramble/{seed}")
        response2 = client.get(f"/api/scramble/{seed}")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        assert data1["moves"] == data2["moves"]

    def test_get_response_matches_openapi_schema(self):
        """Should return response matching Scramble schema"""
        seed = "schema_validation_seed"
        client.post("/api/scramble/generate", json={"seed": seed})
        
        response = client.get(f"/api/scramble/{seed}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Required fields
        assert "seed" in data
        assert "moves" in data
        assert "move_count" in data
        
        # Optional fields
        assert "id" in data
        assert "created_at" in data
        
        # Types and constraints
        assert isinstance(data["seed"], str)
        assert isinstance(data["moves"], list)
        assert isinstance(data["move_count"], int)
        assert data["move_count"] == 25

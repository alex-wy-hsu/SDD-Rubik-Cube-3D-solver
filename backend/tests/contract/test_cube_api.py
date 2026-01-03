"""
契約測試：Cube API endpoints
測試 POST /api/cube/validate 和 POST /api/cube/apply-move
"""
import pytest
from fastapi.testclient import TestClient


class TestCubeValidateAPI:
    """測試 POST /api/cube/validate 端點"""

    def test_validate_solved_state(self, client: TestClient):
        """測試已解狀態驗證"""
        response = client.post(
            "/api/cube/validate",
            json={
                "facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is True
        assert data["is_solved"] is True
        assert data["error_message"] is None

    def test_validate_scrambled_state(self, client: TestClient):
        """測試打亂狀態驗證（合法但未解）"""
        # 應用一個簡單移動後的狀態（例如 R 移動後）
        scrambled = "UUUUUUFUURRRRRRRRRBFFFFFFFDDDDDDDDDFLLLLLLLLBBBBBBBBB"
        response = client.post(
            "/api/cube/validate",
            json={"facelets": scrambled}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is True
        assert data["is_solved"] is False

    def test_validate_invalid_length(self, client: TestClient):
        """測試無效長度（不是 54 字元）"""
        response = client.post(
            "/api/cube/validate",
            json={"facelets": "UUUUUU"}  # 只有 6 個字元
        )
        assert response.status_code == 400
        data = response.json()
        assert "error_message" in data or "detail" in data

    def test_validate_invalid_characters(self, client: TestClient):
        """測試無效字元（不在 URFDLB 中）"""
        response = client.post(
            "/api/cube/validate",
            json={
                "facelets": "XYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZXYZ"
            }
        )
        assert response.status_code == 400

    def test_validate_impossible_state(self, client: TestClient):
        """測試不可解狀態（顏色分佈錯誤）"""
        # 全部是 U 顏色（違反 9 個中心塊規則）
        response = client.post(
            "/api/cube/validate",
            json={"facelets": "U" * 54}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is False
        assert data["error_message"] is not None

    def test_validate_missing_facelets(self, client: TestClient):
        """測試缺少 facelets 欄位"""
        response = client.post(
            "/api/cube/validate",
            json={}
        )
        assert response.status_code == 422  # Pydantic validation error


class TestCubeApplyMoveAPI:
    """測試 POST /api/cube/apply-move 端點"""

    def test_apply_u_clockwise(self, client: TestClient):
        """測試應用 U 順時針移動"""
        response = client.post(
            "/api/cube/apply-move",
            json={
                "facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
                "move": {"face": "U", "direction": 1}
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "facelets" in data
        assert len(data["facelets"]) == 54
        assert data["is_valid"] is True
        # U 層應該旋轉，但 D 層不變
        assert data["facelets"][45:54] == "LLLLLLLLL"  # D 層未改變

    def test_apply_r_counterclockwise(self, client: TestClient):
        """測試應用 R 逆時針移動"""
        response = client.post(
            "/api/cube/apply-move",
            json={
                "facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
                "move": {"face": "R", "direction": -1}
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is True
        assert data["facelets"] != "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"

    def test_apply_f_180(self, client: TestClient):
        """測試應用 F 180° 移動"""
        response = client.post(
            "/api/cube/apply-move",
            json={
                "facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
                "move": {"face": "F", "direction": 2}
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is True

    def test_apply_invalid_face(self, client: TestClient):
        """測試無效的面（不在 URFDLB 中）"""
        response = client.post(
            "/api/cube/apply-move",
            json={
                "facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
                "move": {"face": "X", "direction": 1}
            }
        )
        assert response.status_code == 422  # Pydantic validation

    def test_apply_invalid_direction(self, client: TestClient):
        """測試無效的方向（不在 1, -1, 2 中）"""
        response = client.post(
            "/api/cube/apply-move",
            json={
                "facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
                "move": {"face": "U", "direction": 3}
            }
        )
        assert response.status_code == 422

    def test_apply_move_to_invalid_state(self, client: TestClient):
        """測試對無效狀態應用移動"""
        response = client.post(
            "/api/cube/apply-move",
            json={
                "facelets": "U" * 54,  # 無效狀態
                "move": {"face": "U", "direction": 1}
            }
        )
        # 應該拒絕無效狀態或返回錯誤
        assert response.status_code in [400, 422]

    def test_apply_sequence_maintains_validity(self, client: TestClient):
        """測試連續應用移動保持合法性"""
        state = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
        moves = [
            {"face": "R", "direction": 1},
            {"face": "U", "direction": 1},
            {"face": "R", "direction": -1},
            {"face": "U", "direction": -1}
        ]
        
        for move in moves:
            response = client.post(
                "/api/cube/apply-move",
                json={"facelets": state, "move": move}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["is_valid"] is True
            state = data["facelets"]
        
        # 經過 R U R' U' 後，狀態應該與原始不同
        assert state != "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"

    def test_apply_move_and_reverse(self, client: TestClient):
        """測試移動和反向移動應該回到原狀態"""
        original = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
        
        # 應用 R 移動
        response1 = client.post(
            "/api/cube/apply-move",
            json={"facelets": original, "move": {"face": "R", "direction": 1}}
        )
        assert response1.status_code == 200
        state_after_r = response1.json()["facelets"]
        
        # 應用 R' 移動（反向）
        response2 = client.post(
            "/api/cube/apply-move",
            json={"facelets": state_after_r, "move": {"face": "R", "direction": -1}}
        )
        assert response2.status_code == 200
        state_after_reverse = response2.json()["facelets"]
        
        # 應該回到原始狀態
        assert state_after_reverse == original

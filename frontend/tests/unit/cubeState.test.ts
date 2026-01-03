/**
 * 單元測試：CubeState.applyMove
 * 測試方塊狀態應用移動的邏輯
 */
import { describe, it, expect } from 'vitest';
import { CubeState } from '@/lib/cube/CubeState';
import { Move } from '@/lib/cube/Move';

describe('CubeState', () => {
  const SOLVED_STATE = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

  describe('initialization', () => {
    it('should create solved state', () => {
      const cube = CubeState.solved();
      expect(cube.facelets).toBe(SOLVED_STATE);
      expect(cube.isValid).toBe(true);
      expect(cube.isSolved).toBe(true);
    });

    it('should create from valid facelet string', () => {
      const cube = CubeState.fromString(SOLVED_STATE);
      expect(cube.facelets).toBe(SOLVED_STATE);
      expect(cube.isValid).toBe(true);
    });

    it('should reject invalid length', () => {
      expect(() => CubeState.fromString('UUUUUU')).toThrow();
    });

    it('should reject invalid characters', () => {
      expect(() => CubeState.fromString('X'.repeat(54))).toThrow();
    });
  });

  describe('applyMove', () => {
    it('should apply U clockwise move', () => {
      const cube = CubeState.solved();
      const move: Move = { face: 'U', direction: 1 };
      const newCube = cube.applyMove(move);
      
      expect(newCube.facelets).not.toBe(SOLVED_STATE);
      expect(newCube.isValid).toBe(true);
      expect(newCube.isSolved).toBe(false);
      // U 層旋轉後，D 層應該不變
      expect(newCube.facelets.slice(45, 54)).toBe('LLLLLLLLL');
    });

    it('should apply R counterclockwise move', () => {
      const cube = CubeState.solved();
      const move: Move = { face: 'R', direction: -1 };
      const newCube = cube.applyMove(move);
      
      expect(newCube.isValid).toBe(true);
      expect(newCube.isSolved).toBe(false);
      expect(newCube.facelets).not.toBe(SOLVED_STATE);
    });

    it('should apply F 180° move', () => {
      const cube = CubeState.solved();
      const move: Move = { face: 'F', direction: 2 };
      const newCube = cube.applyMove(move);
      
      expect(newCube.isValid).toBe(true);
      expect(newCube.isSolved).toBe(false);
    });

    it('should handle all six faces', () => {
      const faces: Array<'U' | 'D' | 'L' | 'R' | 'F' | 'B'> = ['U', 'D', 'L', 'R', 'F', 'B'];
      const cube = CubeState.solved();
      
      faces.forEach(face => {
        const move: Move = { face, direction: 1 };
        const newCube = cube.applyMove(move);
        expect(newCube.isValid).toBe(true);
        expect(newCube.facelets).not.toBe(SOLVED_STATE);
      });
    });

    it('should be immutable (not modify original)', () => {
      const cube = CubeState.solved();
      const originalFacelets = cube.facelets;
      const move: Move = { face: 'R', direction: 1 };
      
      cube.applyMove(move);
      
      expect(cube.facelets).toBe(originalFacelets);
      expect(cube.facelets).toBe(SOLVED_STATE);
    });

    it('should reverse with opposite direction', () => {
      const cube = CubeState.solved();
      const forward: Move = { face: 'R', direction: 1 };
      const backward: Move = { face: 'R', direction: -1 };
      
      const afterForward = cube.applyMove(forward);
      const afterReverse = afterForward.applyMove(backward);
      
      expect(afterReverse.facelets).toBe(SOLVED_STATE);
      expect(afterReverse.isSolved).toBe(true);
    });

    it('should handle 180° as two 90° moves', () => {
      const cube = CubeState.solved();
      const move180: Move = { face: 'U', direction: 2 };
      const move90: Move = { face: 'U', direction: 1 };
      
      const after180 = cube.applyMove(move180);
      const after90Twice = cube.applyMove(move90).applyMove(move90);
      
      expect(after180.facelets).toBe(after90Twice.facelets);
    });
  });

  describe('applyMoves (sequence)', () => {
    it('should apply multiple moves in order', () => {
      const cube = CubeState.solved();
      const moves: Move[] = [
        { face: 'R', direction: 1 },
        { face: 'U', direction: 1 },
        { face: 'R', direction: -1 },
        { face: 'U', direction: -1 }
      ];
      
      const result = cube.applyMoves(moves);
      
      expect(result.isValid).toBe(true);
      expect(result.facelets).not.toBe(SOLVED_STATE);
    });

    it('should handle empty move sequence', () => {
      const cube = CubeState.solved();
      const result = cube.applyMoves([]);
      
      expect(result.facelets).toBe(SOLVED_STATE);
      expect(result.isSolved).toBe(true);
    });

    it('should maintain validity through long sequence', () => {
      const cube = CubeState.solved();
      const moves: Move[] = Array(25).fill(null).map((_, i) => ({
        face: ['U', 'R', 'F', 'D', 'L', 'B'][i % 6] as any,
        direction: [1, -1, 2][i % 3] as any
      }));
      
      const result = cube.applyMoves(moves);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validation', () => {
    it('should detect solved state correctly', () => {
      const cube = CubeState.solved();
      expect(cube.isSolved).toBe(true);
      
      const moved = cube.applyMove({ face: 'R', direction: 1 });
      expect(moved.isSolved).toBe(false);
    });

    it('should validate color distribution', () => {
      // 每個顏色應該恰好 9 個
      const invalidState = 'U'.repeat(54);
      expect(() => CubeState.fromString(invalidState)).toThrow();
    });

    it('should check facelet count', () => {
      expect(() => CubeState.fromString('U'.repeat(53))).toThrow();
      expect(() => CubeState.fromString('U'.repeat(55))).toThrow();
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const cube = CubeState.solved();
      const json = cube.toJSON();
      
      expect(json).toEqual({
        facelets: SOLVED_STATE,
        isValid: true,
        isSolved: true
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        facelets: SOLVED_STATE,
        isValid: true,
        isSolved: true
      };
      
      const cube = CubeState.fromJSON(json);
      expect(cube.facelets).toBe(SOLVED_STATE);
      expect(cube.isValid).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle four 90° moves as identity', () => {
      const cube = CubeState.solved();
      const move: Move = { face: 'R', direction: 1 };
      
      let result = cube;
      for (let i = 0; i < 4; i++) {
        result = result.applyMove(move);
      }
      
      expect(result.facelets).toBe(SOLVED_STATE);
      expect(result.isSolved).toBe(true);
    });

    it('should handle two 180° moves as identity', () => {
      const cube = CubeState.solved();
      const move: Move = { face: 'U', direction: 2 };
      
      const result = cube.applyMove(move).applyMove(move);
      
      expect(result.facelets).toBe(SOLVED_STATE);
    });
  });
});

/**
 * 單元測試：Move 轉換函數
 * 測試 moveToString 和 stringToMove
 */
import { describe, it, expect } from 'vitest';
import { Move, moveToString, stringToMove, isValidMove } from '@/lib/cube/Move';

describe('Move', () => {
  describe('moveToString', () => {
    it('should convert U clockwise to "U"', () => {
      const move: Move = { face: 'U', direction: 1 };
      expect(moveToString(move)).toBe('U');
    });

    it('should convert R counterclockwise to "R\'"', () => {
      const move: Move = { face: 'R', direction: -1 };
      expect(moveToString(move)).toBe("R'");
    });

    it('should convert F 180° to "F2"', () => {
      const move: Move = { face: 'F', direction: 2 };
      expect(moveToString(move)).toBe('F2');
    });

    it('should handle all six faces', () => {
      const faces: Array<'U' | 'D' | 'L' | 'R' | 'F' | 'B'> = ['U', 'D', 'L', 'R', 'F', 'B'];
      faces.forEach(face => {
        const move: Move = { face, direction: 1 };
        expect(moveToString(move)).toBe(face);
      });
    });

    it('should handle all three directions', () => {
      const move1: Move = { face: 'U', direction: 1 };
      const move2: Move = { face: 'U', direction: -1 };
      const move3: Move = { face: 'U', direction: 2 };
      
      expect(moveToString(move1)).toBe('U');
      expect(moveToString(move2)).toBe("U'");
      expect(moveToString(move3)).toBe('U2');
    });
  });

  describe('stringToMove', () => {
    it('should parse "U" as U clockwise', () => {
      const move = stringToMove('U');
      expect(move).toEqual({ face: 'U', direction: 1 });
    });

    it('should parse "R\'" as R counterclockwise', () => {
      const move = stringToMove("R'");
      expect(move).toEqual({ face: 'R', direction: -1 });
    });

    it('should parse "F2" as F 180°', () => {
      const move = stringToMove('F2');
      expect(move).toEqual({ face: 'F', direction: 2 });
    });

    it('should handle all six faces', () => {
      const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
      faces.forEach(face => {
        const move = stringToMove(face);
        expect(move.face).toBe(face);
        expect(move.direction).toBe(1);
      });
    });

    it('should be case sensitive', () => {
      expect(() => stringToMove('u')).toThrow();
      expect(() => stringToMove('r')).toThrow();
    });

    it('should reject invalid notation', () => {
      expect(() => stringToMove('X')).toThrow();
      expect(() => stringToMove('U3')).toThrow();
      expect(() => stringToMove('RR')).toThrow();
      expect(() => stringToMove('')).toThrow();
    });

    it('should handle whitespace', () => {
      expect(stringToMove(' U ')).toEqual({ face: 'U', direction: 1 });
      expect(stringToMove(' R\' ')).toEqual({ face: 'R', direction: -1 });
    });
  });

  describe('round-trip conversion', () => {
    it('should convert back and forth consistently', () => {
      const moves: Move[] = [
        { face: 'U', direction: 1 },
        { face: 'R', direction: -1 },
        { face: 'F', direction: 2 },
        { face: 'D', direction: 1 },
        { face: 'L', direction: -1 },
        { face: 'B', direction: 2 }
      ];

      moves.forEach(move => {
        const str = moveToString(move);
        const parsed = stringToMove(str);
        expect(parsed).toEqual(move);
      });
    });

    it('should handle move sequences', () => {
      const sequence = "R U R' U'";
      const moves = sequence.split(' ').map(stringToMove);
      const reconstructed = moves.map(moveToString).join(' ');
      expect(reconstructed).toBe(sequence);
    });
  });

  describe('isValidMove', () => {
    it('should accept valid moves', () => {
      expect(isValidMove({ face: 'U', direction: 1 })).toBe(true);
      expect(isValidMove({ face: 'R', direction: -1 })).toBe(true);
      expect(isValidMove({ face: 'F', direction: 2 })).toBe(true);
    });

    it('should reject invalid face', () => {
      expect(isValidMove({ face: 'X' as any, direction: 1 })).toBe(false);
    });

    it('should reject invalid direction', () => {
      expect(isValidMove({ face: 'U', direction: 3 as any })).toBe(false);
      expect(isValidMove({ face: 'U', direction: 0 as any })).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(isValidMove(null as any)).toBe(false);
      expect(isValidMove(undefined as any)).toBe(false);
      expect(isValidMove({} as any)).toBe(false);
    });
  });

  describe('move arrays', () => {
    it('should parse move notation string', () => {
      const notation = "R U R' U' R' F R2 U' R' U' R U R' F'";
      const moves = notation.split(' ').map(stringToMove);
      
      expect(moves).toHaveLength(14);
      expect(moves[0]).toEqual({ face: 'R', direction: 1 });
      expect(moves[2]).toEqual({ face: 'R', direction: -1 });
      expect(moves[6]).toEqual({ face: 'R', direction: 2 });
    });

    it('should convert move array to notation', () => {
      const moves: Move[] = [
        { face: 'R', direction: 1 },
        { face: 'U', direction: 1 },
        { face: 'R', direction: -1 },
        { face: 'U', direction: -1 }
      ];
      
      const notation = moves.map(moveToString).join(' ');
      expect(notation).toBe("R U R' U'");
    });
  });

  describe('inverse moves', () => {
    it('should calculate inverse direction', () => {
      expect(inverseDirection(1)).toBe(-1);
      expect(inverseDirection(-1)).toBe(1);
      expect(inverseDirection(2)).toBe(2); // 180° is self-inverse
    });

    it('should create inverse move', () => {
      const move: Move = { face: 'R', direction: 1 };
      const inverse = inverseMove(move);
      
      expect(inverse).toEqual({ face: 'R', direction: -1 });
    });

    it('should handle 180° inverse', () => {
      const move: Move = { face: 'U', direction: 2 };
      const inverse = inverseMove(move);
      
      expect(inverse).toEqual({ face: 'U', direction: 2 });
    });
  });
});

// Helper functions that should be implemented in Move.ts
function inverseDirection(dir: 1 | -1 | 2): 1 | -1 | 2 {
  if (dir === 2) return 2;
  return dir === 1 ? -1 : 1;
}

function inverseMove(move: Move): Move {
  return {
    face: move.face,
    direction: inverseDirection(move.direction)
  };
}

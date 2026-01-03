/**
 * Scramble model for frontend
 * Represents a 25-move scramble sequence with seed for reproducibility
 */

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
export type Direction = 1 | -1 | 2; // 1=CW 90°, -1=CCW 90°, 2=180°

export interface ScrambleMove {
  face: Face;
  direction: Direction;
}

export interface Scramble {
  id: string;
  seed: string;
  moves: ScrambleMove[];
  moveCount: number;
  createdAt: string;
}

/**
 * Generate a scramble from API response
 */
export const scrambleFromAPI = (data: any): Scramble => {
  return {
    id: data.id,
    seed: data.seed,
    moves: data.moves.map((m: any) => ({
      face: m.face as Face,
      direction: m.direction as Direction,
    })),
    moveCount: data.move_count,
    createdAt: data.created_at,
  };
};

/**
 * Convert scramble move to string notation (e.g., "U", "R'", "F2")
 */
export const moveToString = (move: ScrambleMove): string => {
  const directionMap: Record<Direction, string> = {
    1: '',
    '-1': "'",
    2: '2',
  };
  
  return `${move.face}${directionMap[move.direction]}`;
};

/**
 * Convert moves array to space-separated string
 */
export const movesToString = (moves: ScrambleMove[]): string => {
  return moves.map(moveToString).join(' ');
};

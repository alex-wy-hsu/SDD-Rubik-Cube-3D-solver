/**
 * Face enum representing the six faces of a Rubik's Cube
 * Using Singmaster notation
 */
export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

/**
 * Direction enum for cube rotations
 * 1: Clockwise 90°
 * -1: Counter-clockwise 90°
 * 2: 180°
 */
export type Direction = 1 | -1 | 2;

/**
 * Represents a single move on the Rubik's Cube
 */
export interface Move {
  face: Face;
  direction: Direction;
}

/**
 * Convert a Move object to Singmaster notation string
 * @param move The move to convert
 * @returns String representation (e.g., "U", "R'", "F2")
 */
export function moveToString(move: Move): string {
  if (move.direction === 1) return move.face;
  if (move.direction === -1) return `${move.face}'`;
  return `${move.face}2`;
}

/**
 * Parse Singmaster notation string to Move object
 * @param s Singmaster notation (e.g., "U", "R'", "F2")
 * @returns Move object
 * @throws Error if string is invalid
 */
export function stringToMove(s: string): Move {
  const face = s[0] as Face;
  
  if (!['U', 'D', 'L', 'R', 'F', 'B'].includes(face)) {
    throw new Error(`Invalid face: ${face}`);
  }
  
  if (s.length === 1) return { face, direction: 1 };
  if (s[1] === "'") return { face, direction: -1 };
  if (s[1] === '2') return { face, direction: 2 };
  
  throw new Error(`Invalid move string: ${s}`);
}

/**
 * Get the inverse of a move
 * @param move The move to inverse
 * @returns The inverse move
 */
export function inverseMove(move: Move): Move {
  if (move.direction === 2) return move; // 180° is self-inverse
  return { ...move, direction: (-move.direction) as Direction };
}

/**
 * Convert array of moves to Singmaster notation string
 * @param moves Array of moves
 * @returns Space-separated string (e.g., "U R' F2 D")
 */
export function movesToString(moves: Move[]): string {
  return moves.map(moveToString).join(' ');
}

/**
 * Parse Singmaster notation string to array of moves
 * @param s Space-separated moves (e.g., "U R' F2 D")
 * @returns Array of Move objects
 */
export function stringToMoves(s: string): Move[] {
  return s.split(' ').filter(Boolean).map(stringToMove);
}

/**
 * Check if a move is valid
 * @param move The move to validate
 * @returns true if move is valid
 */
export function isValidMove(move: any): boolean {
  if (!move || typeof move !== 'object') return false;
  if (!['U', 'D', 'L', 'R', 'F', 'B'].includes(move.face)) return false;
  if (![1, -1, 2].includes(move.direction)) return false;
  return true;
}


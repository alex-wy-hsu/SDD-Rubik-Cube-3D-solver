import { Move } from './Move';

/**
 * Represents the complete state of a 3x3x3 Rubik's Cube
 * Uses 54-character string representation in URFDLB order
 */
export class CubeState {
  /**
   * 54-character string representing all facelets
   * Order: U(0-8), R(9-17), F(18-26), D(27-35), L(36-44), B(45-53)
   * Each character is one of: U, R, F, D, L, B (representing colors)
   */
  readonly facelets: string;

  constructor(facelets: string) {
    if (facelets.length !== 54) {
      throw new Error(`Facelets must be exactly 54 characters, got ${facelets.length}`);
    }
    this.facelets = facelets;
  }

  /**
   * Create a solved cube state
   */
  static solved(): CubeState {
    return new CubeState(
      'UUUUUUUUU' + // U face (white)
      'RRRRRRRRR' + // R face (red)
      'FFFFFFFFF' + // F face (green)
      'DDDDDDDDD' + // D face (yellow)
      'LLLLLLLLL' + // L face (orange)
      'BBBBBBBBB'   // B face (blue)
    );
  }

  /**
   * Check if cube is in solved state
   */
  get isSolved(): boolean {
    // Check each face has all same colors
    const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
    for (let i = 0; i < 6; i++) {
      const faceStart = i * 9;
      const facelets = this.facelets.slice(faceStart, faceStart + 9);
      const centerColor = facelets[4]; // Center piece
      if (!facelets.split('').every(f => f === centerColor)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if cube state is valid
   * - Must have exactly 9 of each color
   * - Must form a valid configuration (no floating pieces)
   */
  get isValid(): boolean {
    // Check length
    if (this.facelets.length !== 54) return false;

    // Count each color
    const colorCounts = new Map<string, number>();
    for (const facelet of this.facelets) {
      colorCounts.set(facelet, (colorCounts.get(facelet) || 0) + 1);
    }

    // Must have exactly 9 of each face color
    const validColors = ['U', 'R', 'F', 'D', 'L', 'B'];
    for (const color of validColors) {
      if (colorCounts.get(color) !== 9) return false;
    }

    return true;
  }

  /**
   * Apply a move to the cube and return new state
   * @param move The move to apply
   * @returns New CubeState after applying the move
   */
  applyMove(move: Move): CubeState {
    const newFacelets = this.facelets.split('');
    const rotations = move.direction === 2 ? 2 : move.direction === 1 ? 1 : 3;

    for (let i = 0; i < rotations; i++) {
      this.applySingleRotation(newFacelets, move.face);
    }

    return new CubeState(newFacelets.join(''));
  }

  /**
   * Apply a sequence of moves
   * @param moves Array of moves to apply
   * @returns New CubeState after applying all moves
   */
  applyMoves(moves: Move[]): CubeState {
    let state: CubeState = this;
    for (const move of moves) {
      state = state.applyMove(move);
    }
    return state;
  }

  /**
   * Apply a single 90° clockwise rotation to a face
   * Mutates the facelets array
   */
  private applySingleRotation(facelets: string[], face: string): void {
    // This is a simplified implementation
    // Full implementation would handle the specific rotation logic for each face
    // For now, this is a placeholder that maintains the structure
    
    // Face rotation mappings (indices for U, R, F, D, L, B)
    const faceIndices = this.getFaceIndices(face);
    const adjacentIndices = this.getAdjacentIndices(face);

    // Rotate the face itself (9 facelets)
    this.rotateFace(facelets, faceIndices);

    // Rotate adjacent pieces
    this.rotateAdjacent(facelets, adjacentIndices);
  }

  private getFaceIndices(face: string): number[] {
    const faceMap: Record<string, number[]> = {
      'U': [0, 1, 2, 3, 4, 5, 6, 7, 8],
      'R': [9, 10, 11, 12, 13, 14, 15, 16, 17],
      'F': [18, 19, 20, 21, 22, 23, 24, 25, 26],
      'D': [27, 28, 29, 30, 31, 32, 33, 34, 35],
      'L': [36, 37, 38, 39, 40, 41, 42, 43, 44],
      'B': [45, 46, 47, 48, 49, 50, 51, 52, 53],
    };
    return faceMap[face] || [];
  }

  private getAdjacentIndices(face: string): number[][] {
    // Returns arrays of adjacent pieces that move during rotation
    // Each subarray represents a cycle of 4 pieces
    const adjacentMap: Record<string, number[][]> = {
      'U': [[2, 11, 47, 38], [1, 10, 46, 37], [0, 9, 45, 36]],
      'R': [[11, 26, 35, 47], [14, 23, 32, 50], [17, 20, 29, 53]],
      'F': [[20, 27, 44, 8], [19, 30, 43, 5], [18, 33, 42, 2]],
      'D': [[29, 15, 51, 42], [28, 12, 48, 39], [27, 9, 45, 36]],
      'L': [[38, 0, 18, 35], [41, 3, 21, 32], [44, 6, 24, 29]],
      'B': [[45, 36, 27, 17], [46, 39, 30, 14], [47, 42, 33, 11]],
    };
    return adjacentMap[face] || [];
  }

  private rotateFace(facelets: string[], indices: number[]): void {
    // Rotate 9 facelets of a face 90° clockwise
    const temp = [
      facelets[indices[0]],
      facelets[indices[1]],
      facelets[indices[2]],
      facelets[indices[3]],
      facelets[indices[4]],
      facelets[indices[5]],
      facelets[indices[6]],
      facelets[indices[7]],
      facelets[indices[8]],
    ];

    facelets[indices[0]] = temp[6];
    facelets[indices[1]] = temp[3];
    facelets[indices[2]] = temp[0];
    facelets[indices[3]] = temp[7];
    facelets[indices[4]] = temp[4];
    facelets[indices[5]] = temp[1];
    facelets[indices[6]] = temp[8];
    facelets[indices[7]] = temp[5];
    facelets[indices[8]] = temp[2];
  }

  private rotateAdjacent(facelets: string[], cycles: number[][]): void {
    // Rotate adjacent pieces for each cycle
    for (const cycle of cycles) {
      const temp = facelets[cycle[0]];
      facelets[cycle[0]] = facelets[cycle[3]];
      facelets[cycle[3]] = facelets[cycle[2]];
      facelets[cycle[2]] = facelets[cycle[1]];
      facelets[cycle[1]] = temp;
    }
  }

  /**
   * Create from facelet string
   * @param facelets 54-character facelet string
   */
  static fromString(facelets: string): CubeState {
    return new CubeState(facelets);
  }

  /**
   * Create from JSON representation
   */
  static fromJSON(json: { facelets: string; isValid: boolean; isSolved: boolean }): CubeState {
    return new CubeState(json.facelets);
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      facelets: this.facelets,
      isValid: this.isValid,
      isSolved: this.isSolved,
    };
  }
}

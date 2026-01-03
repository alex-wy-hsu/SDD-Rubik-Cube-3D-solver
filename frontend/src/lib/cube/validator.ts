import { CubeState } from './CubeState';

/**
 * Validation result for cube states
 */
export interface ValidationResult {
  isValid: boolean;
  isSolved: boolean;
  errors: string[];
}

/**
 * Validate a cube state thoroughly
 * @param cubeState The cube state to validate
 * @returns Validation result with errors if any
 */
export function validateCubeState(cubeState: CubeState): ValidationResult {
  const errors: string[] = [];

  // Check length
  if (cubeState.facelets.length !== 54) {
    errors.push(`Facelets must be exactly 54 characters, got ${cubeState.facelets.length}`);
    return { isValid: false, isSolved: false, errors };
  }

  // Check color distribution
  const colorCounts = new Map<string, number>();
  for (const facelet of cubeState.facelets) {
    colorCounts.set(facelet, (colorCounts.get(facelet) || 0) + 1);
  }

  const validColors = ['U', 'R', 'F', 'D', 'L', 'B'];
  for (const color of validColors) {
    const count = colorCounts.get(color) || 0;
    if (count !== 9) {
      errors.push(`Color ${color} appears ${count} times, expected 9`);
    }
  }

  // Check for invalid characters
  for (const facelet of cubeState.facelets) {
    if (!validColors.includes(facelet)) {
      errors.push(`Invalid character: ${facelet}`);
      break;
    }
  }

  const isValid = errors.length === 0;
  const isSolved = isValid && cubeState.isSolved();

  return { isValid, isSolved, errors };
}

/**
 * Check if a cube state is solvable
 * This is a basic check; full solvability requires more complex validation
 * @param cubeState The cube state to check
 * @returns True if the state appears solvable
 */
export function isSolvable(cubeState: CubeState): boolean {
  const validation = validateCubeState(cubeState);
  return validation.isValid;
}

/**
 * Quick validation for API responses
 * @param facelets The 54-character facelet string
 * @returns True if valid format
 */
export function isValidFaceletString(facelets: string): boolean {
  if (facelets.length !== 54) return false;

  const validChars = ['U', 'R', 'F', 'D', 'L', 'B'];
  for (const char of facelets) {
    if (!validChars.includes(char)) return false;
  }

  const colorCounts = new Map<string, number>();
  for (const char of facelets) {
    colorCounts.set(char, (colorCounts.get(char) || 0) + 1);
  }

  for (const color of validChars) {
    if (colorCounts.get(color) !== 9) return false;
  }

  return true;
}

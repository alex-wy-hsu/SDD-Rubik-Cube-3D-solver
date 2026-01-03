/**
 * Zustand store for cube state management
 */
import { create } from 'zustand';
import { CubeState } from '@/lib/cube/CubeState';
import { Move } from '@/lib/cube/Move';

/**
 * Layer type for cube selection
 */
export type Layer = 'U' | 'D' | 'L' | 'R' | 'F' | 'B' | null;

/**
 * Solver type
 */
export type SolverType = 'algorithm' | 'slm';

/**
 * Cube store state interface
 */
interface CubeStore {
  // State
  cubeState: CubeState;
  selectedLayer: Layer;
  isAnimating: boolean;
  solverType: SolverType;
  solution: Move[] | null;
  
  // Actions
  setCubeState: (state: CubeState) => void;
  selectLayer: (layer: Layer) => void;
  executeRotation: (move: Move) => void;
  setAnimating: (isAnimating: boolean) => void;
  setSolverType: (type: SolverType) => void;
  setSolution: (moves: Move[] | null) => void;
  reset: () => void;
}

/**
 * Initial cube state (solved)
 */
const initialCubeState = CubeState.solved();

/**
 * Cube store
 */
export const useCubeStore = create<CubeStore>((set) => ({
  // Initial state
  cubeState: initialCubeState,
  selectedLayer: null,
  isAnimating: false,
  solverType: 'algorithm',
  solution: null,

  // Actions
  setCubeState: (cubeState) => set({ cubeState }),

  selectLayer: (layer) => set({ selectedLayer: layer }),

  executeRotation: (move) =>
    set((state) => {
      if (state.isAnimating) return state;
      const newCubeState = state.cubeState.applyMove(move);
      return {
        cubeState: newCubeState,
        selectedLayer: null,
      };
    }),

  setAnimating: (isAnimating) => set({ isAnimating }),

  setSolverType: (solverType) => set({ solverType }),

  setSolution: (solution) => set({ solution }),

  reset: () =>
    set({
      cubeState: initialCubeState,
      selectedLayer: null,
      isAnimating: false,
      solution: null,
    }),
}));

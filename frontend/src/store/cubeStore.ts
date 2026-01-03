/**
 * Zustand store for cube state management
 */
import { create } from 'zustand';
import { CubeState } from '@/lib/cube/CubeState';
import { Move } from '@/lib/cube/Move';
import { Scramble, scrambleFromAPI } from '@/lib/cube/Scramble';
import { apiClient } from '@/services/api';

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
  scrambleSeed: string | null;
  currentScramble: Scramble | null;
  
  // Actions
  setCubeState: (state: CubeState) => void;
  selectLayer: (layer: Layer) => void;
  executeRotation: (move: Move) => void;
  setAnimating: (isAnimating: boolean) => void;
  setSolverType: (type: SolverType) => void;
  setSolution: (moves: Move[] | null) => void;
  initializeScramble: () => Promise<void>;
  regenerateScramble: () => Promise<void>;
  reset: () => void;
}

/**
 * Initial cube state (solved)
 */
const initialCubeState = CubeState.solved();

/**
 * Cube store
 */
export const useCubeStore = create<CubeStore>((set, get) => ({
  // Initial state
  cubeState: initialCubeState,
  selectedLayer: null,
  isAnimating: false,
  solverType: 'algorithm',
  solution: null,
  scrambleSeed: null,
  currentScramble: null,

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

  initializeScramble: async () => {
    try {
      set({ isAnimating: true });
      
      // Generate new scramble without seed (random)
      const response = await apiClient.post('/api/scramble/generate', {});
      const scramble = scrambleFromAPI(response.data);
      
      // Apply scramble to cube state
      let cubeState = CubeState.solved();
      for (const move of scramble.moves) {
        cubeState = cubeState.applyMove(move);
      }
      
      set({
        cubeState,
        scrambleSeed: scramble.seed,
        currentScramble: scramble,
        isAnimating: false,
      });
    } catch (error) {
      console.error('Failed to initialize scramble:', error);
      set({ isAnimating: false });
    }
  },

  regenerateScramble: async () => {
    try {
      set({ isAnimating: true });
      
      // Generate new scramble
      const response = await apiClient.post('/api/scramble/generate', {});
      const scramble = scrambleFromAPI(response.data);
      
      // Apply scramble to cube state
      let cubeState = CubeState.solved();
      for (const move of scramble.moves) {
        cubeState = cubeState.applyMove(move);
      }
      
      set({
        cubeState,
        scrambleSeed: scramble.seed,
        currentScramble: scramble,
        selectedLayer: null,
        solution: null,
        isAnimating: false,
      });
    } catch (error) {
      console.error('Failed to regenerate scramble:', error);
      set({ isAnimating: false });
    }
  },

  reset: () =>
    set({
      cubeState: initialCubeState,
      selectedLayer: null,
      isAnimating: false,
      solution: null,
      scrambleSeed: null,
      currentScramble: null,
    }),
}));

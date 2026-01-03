/**
 * API client for backend communication
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { CubeState } from '@/lib/cube/CubeState';
import { Move } from '@/lib/cube/Move';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * API client instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Error handling interceptor
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage = error.response?.data || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

/**
 * Validation response interface
 */
export interface ValidationResponse {
  is_valid: boolean;
  is_solved: boolean;
  error_message?: string;
}

/**
 * API service for cube operations
 */
export const api = {
  /**
   * Validate a cube state
   */
  async validateCube(facelets: string): Promise<ValidationResponse> {
    const response = await apiClient.post<ValidationResponse>('/api/cube/validate', {
      facelets,
    });
    return response.data;
  },

  /**
   * Apply a move to a cube state
   */
  async applyMove(facelets: string, move: Move): Promise<CubeState> {
    const response = await apiClient.post('/api/cube/apply-move', {
      facelets,
      move: {
        face: move.face,
        direction: move.direction,
      },
    });
    
    const data = response.data;
    return new CubeState(data.facelets);
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await apiClient.get('/healthz');
    return response.data;
  },

  /**
   * Readiness check
   */
  async readinessCheck(): Promise<{ status: string; checks: Record<string, string> }> {
    const response = await apiClient.get('/readyz');
    return response.data;
  },
};

export default api;

export { apiClient };

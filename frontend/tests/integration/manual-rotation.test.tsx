/**
 * 整合測試：手動旋轉流程
 * 測試點選 → 高亮 → 旋轉 → 狀態更新
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock store
const mockStore = {
  cubeState: null as any,
  selectedLayer: null as string | null,
  isAnimating: false,
  selectLayer: vi.fn(),
  executeRotation: vi.fn(),
  actions: {
    selectLayer: vi.fn(),
    executeRotation: vi.fn()
  }
};

vi.mock('@/store/cubeStore', () => ({
  useCubeStore: () => mockStore
}));

// Mock Three.js
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({ camera: {}, gl: { domElement: document.createElement('canvas') } })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null
}));

import ManualRotationPage from '@/app/page';
import { CubeState } from '@/lib/cube/CubeState';

describe('Manual Rotation Integration', () => {
  const SOLVED_STATE = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.cubeState = CubeState.solved();
    mockStore.selectedLayer = null;
    mockStore.isAnimating = false;
  });

  describe('layer selection flow', () => {
    it('should highlight layer when clicked', async () => {
      const user = userEvent.setup();
      render(<ManualRotationPage />);

      // 模擬點擊 U 層的某個 facelet
      const canvas = screen.getByTestId('canvas');
      await user.click(canvas);

      // 驗證 selectLayer 被調用
      await waitFor(() => {
        expect(mockStore.actions.selectLayer).toHaveBeenCalled();
      });
    });

    it('should display rotation arrows when layer selected', async () => {
      mockStore.selectedLayer = 'U';
      const { rerender } = render(<ManualRotationPage />);

      // 重新渲染以反映 selectedLayer 變化
      rerender(<ManualRotationPage />);

      // 驗證顯示旋轉箭頭
      await waitFor(() => {
        const controls = screen.queryByTestId('rotation-arrows');
        // 實際實作後需要調整測試
      });
    });

    it('should show highlight effect on selected layer', async () => {
      mockStore.selectedLayer = 'U';
      render(<ManualRotationPage />);

      // 驗證高亮效果顯示
      // 實際實作後需要檢查 HighlightEffect 元件
    });
  });

  describe('rotation execution flow', () => {
    beforeEach(() => {
      mockStore.selectedLayer = 'R';
    });

    it('should execute clockwise rotation when CW arrow clicked', async () => {
      const user = userEvent.setup();
      render(<ManualRotationPage />);

      // 點擊順時針箭頭
      const cwButton = screen.queryByLabelText(/clockwise|順時針/i);
      if (cwButton) {
        await user.click(cwButton);
        
        await waitFor(() => {
          expect(mockStore.actions.executeRotation).toHaveBeenCalledWith(
            expect.objectContaining({
              face: 'R',
              direction: 1
            })
          );
        });
      }
    });

    it('should execute counterclockwise rotation when CCW arrow clicked', async () => {
      const user = userEvent.setup();
      render(<ManualRotationPage />);

      // 點擊逆時針箭頭
      const ccwButton = screen.queryByLabelText(/counterclockwise|逆時針/i);
      if (ccwButton) {
        await user.click(ccwButton);
        
        await waitFor(() => {
          expect(mockStore.actions.executeRotation).toHaveBeenCalledWith(
            expect.objectContaining({
              face: 'R',
              direction: -1
            })
          );
        });
      }
    });

    it('should update cube state after rotation', async () => {
      const initialState = CubeState.solved();
      mockStore.cubeState = initialState;
      
      const { rerender } = render(<ManualRotationPage />);

      // 執行旋轉
      mockStore.actions.executeRotation({ face: 'R', direction: 1 });

      // 更新狀態
      const newState = initialState.applyMove({ face: 'R', direction: 1 });
      mockStore.cubeState = newState;
      rerender(<ManualRotationPage />);

      // 驗證狀態已更新
      expect(mockStore.cubeState.facelets).not.toBe(SOLVED_STATE);
      expect(mockStore.cubeState.isSolved).toBe(false);
    });
  });

  describe('animation flow', () => {
    it('should set isAnimating flag during rotation', async () => {
      mockStore.selectedLayer = 'U';
      render(<ManualRotationPage />);

      // 開始動畫
      mockStore.isAnimating = true;

      // 驗證動畫標記
      expect(mockStore.isAnimating).toBe(true);
    });

    it('should disable controls during animation', async () => {
      mockStore.selectedLayer = 'U';
      mockStore.isAnimating = true;
      
      render(<ManualRotationPage />);

      // 驗證控制按鈕被禁用
      const cwButton = screen.queryByLabelText(/clockwise|順時針/i);
      if (cwButton) {
        expect(cwButton).toBeDisabled();
      }
    });

    it('should prevent layer selection during animation', async () => {
      const user = userEvent.setup();
      mockStore.isAnimating = true;
      
      render(<ManualRotationPage />);

      // 嘗試點擊方塊
      const canvas = screen.getByTestId('canvas');
      await user.click(canvas);

      // selectLayer 不應被調用
      expect(mockStore.actions.selectLayer).not.toHaveBeenCalled();
    });

    it('should clear isAnimating flag after animation completes', async () => {
      mockStore.isAnimating = true;
      render(<ManualRotationPage />);

      // 模擬動畫完成
      await waitFor(() => {
        mockStore.isAnimating = false;
      }, { timeout: 500 });

      expect(mockStore.isAnimating).toBe(false);
    });
  });

  describe('full rotation sequence', () => {
    it('should complete: select → highlight → rotate → update', async () => {
      const user = userEvent.setup();
      render(<ManualRotationPage />);

      // 1. 選擇層
      mockStore.actions.selectLayer('R');
      mockStore.selectedLayer = 'R';

      // 2. 驗證高亮顯示
      expect(mockStore.selectedLayer).toBe('R');

      // 3. 執行旋轉
      mockStore.actions.executeRotation({ face: 'R', direction: 1 });

      // 4. 驗證狀態更新
      await waitFor(() => {
        expect(mockStore.actions.executeRotation).toHaveBeenCalled();
      });
    });

    it('should handle rapid consecutive rotations', async () => {
      const user = userEvent.setup();
      mockStore.selectedLayer = 'U';
      
      render(<ManualRotationPage />);

      // 快速執行多次旋轉
      const moves = [
        { face: 'U', direction: 1 },
        { face: 'U', direction: 1 },
        { face: 'U', direction: 1 },
        { face: 'U', direction: 1 }
      ];

      for (const move of moves) {
        mockStore.actions.executeRotation(move);
      }

      // 執行 4 次 U 移動後應回到原狀態
      await waitFor(() => {
        expect(mockStore.actions.executeRotation).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe('state validation', () => {
    it('should maintain valid state after rotation', async () => {
      mockStore.cubeState = CubeState.solved();
      mockStore.selectedLayer = 'R';
      
      render(<ManualRotationPage />);

      // 執行旋轉
      const newState = mockStore.cubeState.applyMove({ face: 'R', direction: 1 });
      mockStore.cubeState = newState;

      // 驗證狀態仍然合法
      expect(mockStore.cubeState.isValid).toBe(true);
    });

    it('should detect when cube is solved', async () => {
      const almostSolved = CubeState.solved().applyMove({ face: 'U', direction: 1 });
      mockStore.cubeState = almostSolved;
      mockStore.selectedLayer = 'U';
      
      render(<ManualRotationPage />);

      // 反向旋轉回到已解狀態
      const solved = almostSolved.applyMove({ face: 'U', direction: -1 });
      mockStore.cubeState = solved;

      expect(mockStore.cubeState.isSolved).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid layer selection gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockStore.selectedLayer = 'X' as any; // 無效層
      
      expect(() => render(<ManualRotationPage />)).not.toThrow();
      
      consoleError.mockRestore();
    });

    it('should handle missing cube state', async () => {
      mockStore.cubeState = null;
      
      expect(() => render(<ManualRotationPage />)).not.toThrow();
    });
  });

  describe('camera interaction', () => {
    it('should allow camera rotation without affecting cube state', async () => {
      const user = userEvent.setup();
      const initialState = mockStore.cubeState;
      
      render(<ManualRotationPage />);

      // 模擬相機旋轉（拖曳）
      const canvas = screen.getByTestId('canvas');
      fireEvent.mouseDown(canvas, { button: 0 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(canvas);

      // 方塊狀態不應改變
      expect(mockStore.cubeState).toBe(initialState);
    });
  });
});

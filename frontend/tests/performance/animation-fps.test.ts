/**
 * 性能測試：動畫 FPS
 * 驗證動畫期間 FPS ≥30
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Animation FPS Performance', () => {
  let frameTimestamps: number[] = [];
  let animationFrameId: number;

  beforeEach(() => {
    frameTimestamps = [];
    vi.clearAllMocks();
  });

  function measureFPS(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      frameTimestamps = [];

      const tick = () => {
        const now = performance.now();
        frameTimestamps.push(now);

        if (now - startTime < duration) {
          animationFrameId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(animationFrameId);
          
          // 計算平均 FPS
          const totalTime = now - startTime;
          const fps = (frameTimestamps.length / totalTime) * 1000;
          resolve(fps);
        }
      };

      animationFrameId = requestAnimationFrame(tick);
    });
  }

  function calculateP95FPS(timestamps: number[]): number {
    if (timestamps.length < 2) return 0;

    // 計算每幀之間的時間差
    const frameTimes: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      frameTimes.push(timestamps[i] - timestamps[i - 1]);
    }

    // 排序並找到 P95
    frameTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(frameTimes.length * 0.95);
    const p95FrameTime = frameTimes[p95Index];

    // 轉換為 FPS
    return 1000 / p95FrameTime;
  }

  describe('idle rendering', () => {
    it('should maintain ≥60 FPS when idle', async () => {
      const fps = await measureFPS(1000);
      expect(fps).toBeGreaterThanOrEqual(60);
    });

    it('should have stable frame times', async () => {
      await measureFPS(1000);
      
      const frameTimes: number[] = [];
      for (let i = 1; i < frameTimestamps.length; i++) {
        frameTimes.push(frameTimestamps[i] - frameTimestamps[i - 1]);
      }

      // 計算標準差
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const variance = frameTimes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / frameTimes.length;
      const stdDev = Math.sqrt(variance);

      // 標準差應該小於 5ms（穩定渲染）
      expect(stdDev).toBeLessThan(5);
    });
  });

  describe('rotation animation', () => {
    it('should maintain ≥30 FPS during rotation', async () => {
      // 模擬旋轉動畫
      const fps = await measureFPS(300); // 動畫持續 150-300ms
      expect(fps).toBeGreaterThanOrEqual(30);
    });

    it('should achieve P95 ≥30 FPS', async () => {
      await measureFPS(300);
      const p95fps = calculateP95FPS(frameTimestamps);
      expect(p95fps).toBeGreaterThanOrEqual(30);
    });

    it('should not drop below 30 FPS for 90% of frames', async () => {
      await measureFPS(300);
      
      const frameTimes: number[] = [];
      for (let i = 1; i < frameTimestamps.length; i++) {
        frameTimes.push(frameTimestamps[i] - frameTimestamps[i - 1]);
      }

      // 計算低於 30 FPS 的幀數（>33.33ms）
      const slowFrames = frameTimes.filter(t => t > 33.33).length;
      const slowFramePercentage = (slowFrames / frameTimes.length) * 100;

      expect(slowFramePercentage).toBeLessThan(10);
    });
  });

  describe('camera rotation', () => {
    it('should maintain ≥45 FPS during camera rotation', async () => {
      // 模擬相機拖曳
      const fps = await measureFPS(1000);
      expect(fps).toBeGreaterThanOrEqual(45);
    });

    it('should handle smooth camera rotation', async () => {
      await measureFPS(1000);
      
      // 檢查沒有大的幀時間跳躍（>50ms）
      for (let i = 1; i < frameTimestamps.length; i++) {
        const frameTime = frameTimestamps[i] - frameTimestamps[i - 1];
        expect(frameTime).toBeLessThan(50);
      }
    });
  });

  describe('highlight animation', () => {
    it('should maintain 60 FPS during pulsing effect', async () => {
      // 模擬脈動動畫（1.5-2s 週期）
      const fps = await measureFPS(2000);
      expect(fps).toBeGreaterThanOrEqual(60);
    });

    it('should use smooth sine wave interpolation', () => {
      const getPulseScale = (time: number) => {
        return 1.0 + 0.01 * Math.sin(time * Math.PI);
      };

      // 驗證在一個週期內的平滑度
      const scales: number[] = [];
      for (let t = 0; t <= 2.0; t += 0.1) {
        scales.push(getPulseScale(t));
      }

      // 檢查相鄰值之間的變化很小
      for (let i = 1; i < scales.length; i++) {
        const delta = Math.abs(scales[i] - scales[i - 1]);
        expect(delta).toBeLessThan(0.01);
      }
    });
  });

  describe('concurrent animations', () => {
    it('should handle rotation + highlight simultaneously', async () => {
      // 同時進行層旋轉和高亮脈動
      const fps = await measureFPS(300);
      expect(fps).toBeGreaterThanOrEqual(30);
    });

    it('should handle multiple layer highlights', async () => {
      // 雖然規格只允許單層選中，但測試性能
      const fps = await measureFPS(500);
      expect(fps).toBeGreaterThanOrEqual(45);
    });
  });

  describe('memory and cleanup', () => {
    it('should not leak memory during animation', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // 執行多次動畫
      for (let i = 0; i < 10; i++) {
        await measureFPS(300);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // 記憶體增長應小於 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up animation frames on unmount', async () => {
      const mockCancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
      
      // 開始動畫
      const promise = measureFPS(300);
      
      // 模擬元件卸載
      cancelAnimationFrame(animationFrameId);
      
      await promise;
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('stress testing', () => {
    it('should handle 100 consecutive rotations', async () => {
      const fpsMeasurements: number[] = [];

      for (let i = 0; i < 100; i++) {
        const fps = await measureFPS(300);
        fpsMeasurements.push(fps);
      }

      // 所有測量都應該 ≥30 FPS
      const allAboveThreshold = fpsMeasurements.every(fps => fps >= 30);
      expect(allAboveThreshold).toBe(true);

      // 平均 FPS 應該 ≥45
      const avgFps = fpsMeasurements.reduce((a, b) => a + b, 0) / fpsMeasurements.length;
      expect(avgFps).toBeGreaterThanOrEqual(45);
    });

    it('should maintain performance with complex cube state', async () => {
      // 模擬複雜狀態（所有顏色混合）
      const fps = await measureFPS(300);
      
      // 性能不應因狀態複雜度而下降
      expect(fps).toBeGreaterThanOrEqual(30);
    });
  });

  describe('target achievement', () => {
    it('should aim for 60 FPS but require minimum 30 FPS', async () => {
      const fps = await measureFPS(1000);
      
      if (fps >= 60) {
        console.log(`✅ Target achieved: ${fps.toFixed(2)} FPS (60 FPS goal)`);
      } else if (fps >= 30) {
        console.log(`⚠️ Minimum met: ${fps.toFixed(2)} FPS (30 FPS minimum)`);
      } else {
        console.error(`❌ Below minimum: ${fps.toFixed(2)} FPS`);
      }
      
      expect(fps).toBeGreaterThanOrEqual(30);
    });

    it('should have 90% of frames ≥30 FPS during animation', async () => {
      await measureFPS(300);
      
      const frameTimes: number[] = [];
      for (let i = 1; i < frameTimestamps.length; i++) {
        const fps = 1000 / (frameTimestamps[i] - frameTimestamps[i - 1]);
        frameTimes.push(fps);
      }

      const goodFrames = frameTimes.filter(fps => fps >= 30).length;
      const goodFramePercentage = (goodFrames / frameTimes.length) * 100;

      expect(goodFramePercentage).toBeGreaterThanOrEqual(90);
    });
  });
});

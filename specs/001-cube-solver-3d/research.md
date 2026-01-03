# 研究文檔：3D 魔術方塊求解器

**功能**：001-cube-solver-3d  
**日期**：2026-01-03  
**階段**：第 0 階段（技術研究）

## 概述

此文檔記錄對規格中識別的技術決策和未知因素的研究結果。每個研究項目包含決策、理由和考慮的替代方案。

## 研究任務

### 1. Three.js + React Three Fiber 整合最佳實踐

**決策**：使用 React Three Fiber (R3F) + @react-three/drei 進行 3D 渲染

**理由**：
- R3F 提供 React 化的 Three.js API，更好地與 Next.js 整合
- @react-three/drei 提供現成的 OrbitControls、OutlinePass 等工具
- 宣告式場景定義更容易維護和測試
- 社群活躍，文檔完善，適合 WebGL 2.0 需求

**最佳實踐**：
- 使用 `'use client'` 指令確保 3D 元件僅在客戶端渲染
- 使用 `<Canvas>` 元件包裝整個 3D 場景
- 使用 `useFrame` hook 處理動畫循環（60 FPS 目標）
- 使用 `<EffectComposer>` + `<OutlinePass>` 實現發光邊框效果
- 使用 drei 的 `<OrbitControls>` 處理相機旋轉（左鍵拖曳）
- 將方塊狀態（CubeState）與 Three.js 物件分離，遵循模型-視圖分離

**替代方案考慮**：
- **原生 Three.js**：更多控制權但開發效率低，與 React 整合困難
- **Babylon.js**：功能豐富但體積較大（>600KB gzipped），超出記憶體預算
- **A-Frame**：過於抽象，不適合複雜的自定義互動

**參考資源**：
- React Three Fiber 文檔：https://docs.pmnd.rs/react-three-fiber
- @react-three/drei：https://github.com/pmndrs/drei
- Three.js 性能優化：https://threejs.org/manual/#en/optimize

---

### 2. Qwen2.5 ONNX Runtime Web 整合

**決策**：使用 Qwen2.5-0.5B ONNX 格式 + ONNX Runtime Web + WebGPU 後備 WASM

**理由**：
- Qwen2.5-0.5B 記憶體佔用約 500MB，符合 <2GB 總記憶體限制
- ONNX Runtime Web 支援瀏覽器內推理，無需後端 API
- WebGPU 提供硬體加速，WASM 提供廣泛兼容性
- Alibaba Qwen 系列在邏輯推理任務上表現優異
- Apache 2.0 授權，商業友善

**技術實作**：
1. 從 Hugging Face 下載 Qwen2.5-0.5B ONNX 模型
2. 使用 `onnxruntime-web` 套件載入模型
3. 偵測 WebGPU 支援，回退至 WASM
4. 實作 prompt 工程：將方塊狀態編碼為 Singmaster 標記法
5. 解析模型輸出為移動序列（U, D, L, R, F, B, U', D'等）
6. 驗證每個移動的合法性，檢測非法輸出

**模型載入策略**：
- 使用 dynamic import 延遲載入模型（不影響初始頁面載入）
- 顯示載入進度（<10秒 目標）
- 快取已載入模型於記憶體中

**降級策略**：
- 如果 SLM 生成非法移動 → 切換到演算法求解器
- 如果推理時間 >5秒 → 顯示進度指示，允許取消
- 如果模型載入失敗 → 禁用 SLM 選項，僅顯示演算法求解器

**替代方案考慮**：
- **Phi-3 Mini 3.8B**：參數更多但記憶體佔用 2-4GB，可能超出限制
- **Gemma 2B**：推理能力較弱，可能無法可靠生成解法
- **TinyLLaMA 1.1B**：訓練數據較舊，邏輯推理能力不足
- **後端 SLM 服務**：增加延遲和基礎設施成本，違背「嵌入專案」需求

**參考資源**：
- ONNX Runtime Web：https://onnxruntime.ai/docs/tutorials/web/
- Qwen2.5 Hugging Face：https://huggingface.co/Qwen/Qwen2.5-0.5B
- WebGPU 瀏覽器支援：https://caniuse.com/webgpu

---

### 3. 高亮效果實作（發光邊框 + 半透明覆蓋 + 脈動）

**決策**：組合 Three.js EffectComposer + OutlinePass + Material opacity + Animation

**技術實作**：

**1. 發光邊框（Outline Pass）**：
```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

// 在 R3F 中：
<EffectComposer>
  <outlinePass 
    selectedObjects={highlightedLayer} 
    edgeStrength={3}
    edgeGlow={1}
    edgeThickness={1}
    pulsePeriod={0}  // 無自動脈動，手動控制
    visibleEdgeColor={0xffffff}
  />
</EffectComposer>
```

**2. 半透明覆蓋**：
```typescript
// 在選中的 facelet 材質上
<meshStandardMaterial 
  color={baseColor}
  opacity={isHighlighted ? 0.7 : 1.0}  // 30% 透明 = 0.7 opacity
  transparent={isHighlighted}
/>
// 疊加白色發光
{isHighlighted && (
  <meshBasicMaterial 
    color={0xffffff}
    opacity={0.25}
    transparent
    blending={AdditiveBlending}
  />
)}
```

**3. 脈動動畫**：
```typescript
// 使用 useFrame 實現平滑脈動
const pulseRef = useRef(0)
useFrame((state, delta) => {
  if (isHighlighted) {
    pulseRef.current += delta
    const scale = 1 + 0.01 * Math.sin(pulseRef.current * Math.PI / 1.75)  // 1.75s 週期
    groupRef.current.scale.setScalar(scale)  // 1-2% 幅度
  }
})
```

**性能考慮**：
- OutlinePass 是後處理效果，對 FPS 有輕微影響（~5-10%）
- 限制同時高亮的物件數量（最多 9 個 facelet）
- 使用 `useMemo` 快取不變的幾何體和材質

**替代方案考慮**：
- **純顏色加亮**：視覺效果不夠明顯，無法滿足「柔和舒適」需求
- **邊框線條**：需要自定義幾何體，維護成本高
- **Bloom 效果**：影響整個場景，無法精確控制單一層

**參考資源**：
- Three.js Post-processing：https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing
- R3F Effects：https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe

---

### 4. 魔術方塊演算法求解器（Kociemba 或類似）

**決策**：使用 Python `kociemba` 庫（後端）或 JavaScript 移植版本（前端）

**Python 後端方案（推薦）**：
```python
# backend/src/solvers/kociemba_solver.py
import kociemba

def solve_cube(cube_string: str) -> str:
    """
    cube_string: 54 字元的 facelet 字串（URFDLB 順序）
    返回：解法字串，例如 "U R U' R' F' U F"
    """
    solution = kociemba.solve(cube_string)
    return solution
```

**理由**：
- Kociemba 演算法保證 <20 步最優解
- Python kociemba 庫高度優化，P95 <200ms
- 已驗證的實作，廣泛使用於魔術方塊社群

**方塊狀態編碼**：
- 使用標準 Singmaster 標記法
- 54 個 facelet 字串：UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
- U/R/F/D/L/B 代表六個面的中心顏色

**JavaScript 前端備選方案**：
- 使用 `cubejs` 或 `cube-solver` npm 套件
- 優點：無需後端 API 呼叫
- 缺點：性能較 Python 版本慢 2-3倍

**替代方案考慮**：
- **IDA* 搜尋**：理論最優但計算成本高（>5秒）
- **CFOP 模擬**：更人性化但步數較多（>40 步）
- **Thistlethwaite**：類似 Kociemba 但實作較少

**參考資源**：
- Kociemba Python：https://pypi.org/project/kociemba/
- 演算法說明：http://kociemba.org/cube.htm

---

### 5. WebGPU 加速與回退策略

**決策**：優先使用 WebGPU，回退至 WebGL 2.0，最終回退至 WASM

**檢測邏輯**：
```typescript
async function detectCapabilities() {
  // 1. 檢測 WebGPU
  if ('gpu' in navigator) {
    const adapter = await navigator.gpu?.requestAdapter()
    if (adapter) return 'webgpu'
  }
  
  // 2. 檢測 WebGL 2.0
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2')
  if (gl) return 'webgl2'
  
  // 3. 回退至 WASM
  return 'wasm'
}
```

**ONNX Runtime 配置**：
```typescript
import * as ort from 'onnxruntime-web'

const executionProvider = await detectCapabilities()
const session = await ort.InferenceSession.create(modelPath, {
  executionProviders: [executionProvider],
  graphOptimizationLevel: 'all',
})
```

**性能基準**（估計）：
- WebGPU：推理時間 ~1-2秒
- WebGL：推理時間 ~2-4秒
- WASM：推理時間 ~4-6秒（仍在 <5秒 限制內）

**用戶反饋**：
- 在 SLM 選項旁顯示「使用 WebGPU 加速」或「使用 CPU 推理（較慢）」
- 首次推理時顯示載入指示器

**瀏覽器支援**：
- WebGPU：Chrome 113+, Edge 113+（2023 穩定）
- WebGL 2.0：Chrome 56+, Firefox 51+, Safari 15+（廣泛支援）
- WASM：所有現代瀏覽器

**參考資源**：
- WebGPU 規範：https://gpuweb.github.io/gpuweb/
- ONNX Runtime Web 執行提供者：https://onnxruntime.ai/docs/execution-providers/

---

### 6. 狀態持久化與 Seed 管理

**決策**：使用 PostgreSQL 儲存 scramble seeds 和可選的求解記錄

**資料庫 Schema**：
```sql
CREATE TABLE scrambles (
    id SERIAL PRIMARY KEY,
    seed VARCHAR(64) UNIQUE NOT NULL,
    moves TEXT NOT NULL,  -- JSON array of moves
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solve_sessions (
    id SERIAL PRIMARY KEY,
    scramble_id INTEGER REFERENCES scrambles(id),
    solver_type VARCHAR(20) NOT NULL,  -- 'algorithm' or 'slm'
    moves_count INTEGER,
    solve_time_ms INTEGER,
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**前端 Seed 處理**：
- 使用 `crypto.randomUUID()` 生成唯一 seed
- 顯示於 UI 供用戶記錄/分享
- 支援 URL 參數：`?seed=abc123` 重現相同打亂

**理由**：
- PostgreSQL 提供 ACID 保證，適合記錄和分析
- Supabase/Neon 提供免費層級，適合開發和小規模部署
- seed 機制支援競技性使用（統一打亂比賽）

**替代方案考慮**：
- **LocalStorage**：簡單但無法跨設備同步
- **IndexedDB**：客戶端儲存，適合離線但無法分享
- **Redis**：快速但非持久化，不適合長期記錄

**參考資源**：
- Supabase Postgres：https://supabase.com/docs/guides/database
- FastAPI + SQLAlchemy：https://fastapi.tiangolo.com/tutorial/sql-databases/

---

## 研究結果摘要

| 研究項目 | 決策 | 風險等級 | 緩解措施 |
|---------|------|---------|---------|
| 3D 渲染 | Three.js + R3F | 低 | 成熟技術，豐富文檔 |
| SLM 整合 | Qwen2.5 + ONNX Runtime | 中 | 降級機制，性能基準測試 |
| 高亮效果 | EffectComposer + OutlinePass | 低 | 性能優化，限制物件數 |
| 演算法求解 | Kociemba (Python) | 低 | 已驗證實作 |
| 硬體加速 | WebGPU → WebGL → WASM | 低 | 多層回退策略 |
| 狀態持久化 | PostgreSQL (Supabase) | 低 | 託管服務，自動備份 |

**未解決的問題**：無（所有關鍵技術決策已明確）

**下一步**：進入第 1 階段，生成 data-model.md 和 API contracts

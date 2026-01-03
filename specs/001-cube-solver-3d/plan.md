# 實作計劃：3D 魔術方塊求解器

**分支**：`001-cube-solver-3d` | **日期**：2026-01-03 | **規格**：[spec.md](./spec.md)
**輸入**：來自 `/specs/001-cube-solver-3d/spec.md` 的功能規格

**注意**：此模板由 `/speckit.plan` 命令填寫。請參閱 `.specify/templates/commands/plan.md` 了解執行工作流程。

## 摘要

實作一個互動式 3D 魔術方塊求解器，支援：
- **手動操作**：用戶可以旋轉相機視角、點擊選擇層並執行 90° 旋轉
- **演算法求解**：使用高效演算法（Kociemba 或類似方法）自動求解
- **SLM 求解**：Qwen2.5 小型語言模型驅動的替代求解方案
- **視覺效果**：組合發光邊框、半透明覆蓋和脈動動畫的高亮效果

技術方法：
- **前端**：Next.js + Three.js (React Three Fiber) + Zustand
- **後端**：Python FastAPI + PostgreSQL
- **SLM 服務**：Qwen2.5-0.5B/1.5B + ONNX Runtime + WebGPU

## 技術背景

**語言/版本**：
- 前端：TypeScript 5.x + React 18 + Next.js 14
- 後端：Python 3.11+

**主要依賴項**：
- 前端：Three.js, React Three Fiber (R3F), @react-three/drei, Zustand
- 後端：FastAPI, Uvicorn, SQLAlchemy, asyncpg
- SLM：ONNX Runtime Web, Qwen2.5-0.5B or Qwen2.5-1.5B (ONNX format)

**儲存**：PostgreSQL (Supabase / Neon) - 用於儲存 seed、求解記錄、用戶配置

**測試**：
- 前端：Vitest + React Testing Library + Playwright (E2E)
- 後端：pytest + pytest-asyncio

**目標平台**：現代瀏覽器 (Chrome 90+, Firefox 88+, Safari 15+) with WebGL 2.0 + WebGPU support

**專案類型**：網頁應用 (Frontend + Backend + SLM Service)

**性能目標**：
- 3D 渲染：≥30 FPS（目標 60 FPS）
- 演算法求解：P95 <200ms
- 狀態驗證：<10ms
- 打亂生成：<100ms (25 次移動)
- SLM 推理：<5s 單次請求

**限制條件**：
- 記憶體：<200MB 基礎佔用，載入 SLM 後 <2GB
- 初始載入：<3s 至首次可互動
- 動畫持續時間：150-300ms 單次旋轉
- 脈動週期：1.5-2s

**規模/範圍**：
- 4 個用戶故事（2 P1, 1 P2, 1 P3）
- 27 個功能需求 (FR-001 至 FR-027)
- 15 個成功標準
- 6 個核心實體 (CubeState, Move, Scramble, Solution, Solver, Animation)

## 憲章檢查

*閘門：必須在第 0 階段研究前通過。在第 1 階段設計後重新檢查。*

### 一、代碼品質
- [x] 單一職責：每個模組有清晰、專注的目的（分離：CubeState, Solver, Renderer, Animation）
- [x] DRY 原則：無代碼重複；共享邏輯已提取（共用 Three.js 工具、ONNX Runtime 包裝）
- [x] 命名：整體使用描述性、一致的名稱（Singmaster 標記法、標準 REST endpoints）
- [x] 文檔：公共 API 和複雜邏輯已記錄（OpenAPI 規範、JSDoc、Python docstrings）
- [x] 代碼審查：審查流程已定義並執行（PR 模板、至少一位審查者）

### 二、測試標準（不可妥協）
- [x] 測試優先：測試在實作前編寫（TDD 強制執行）
- [x] 覆蓋率：單元測試最低 80%，用戶故事整合測試 100%（pytest, Vitest 配置）
- [x] 測試組織：測試按類型組織（frontend/tests/{unit,integration,e2e}, backend/tests/{unit,integration}）
- [x] 測試獨立性：測試可獨立運行（使用 fixtures, setup/teardown）
- [x] 邊界情況：邊界條件和錯誤已覆蓋（測試非法移動、SLM 降級、動畫中斷）

### 三、用戶體驗一致性
- [x] 視覺一致性：渲染慣例已定義（標準配色方案、Three.js 場景設置）
- [x] 方塊標記法：使用標準 Singmaster 標記法（U/D/L/R/F/B 層標記）
- [x] 互動模式：跨功能的輸入處理保持一致（統一的滑鼠/觸控事件處理）
- [x] 反饋：用戶操作提供即時反饋（高亮效果、箭頭顯示、動畫）
- [x] 錯誤訊息：清晰、可操作的錯誤訊息（「SLM 求解失敗，已切換到演算法版本」）
- [x] 無障礙性：支援鍵盤導航（規格中定義為可選功能）

### 四、性能要求
- [x] 渲染：3D 操作目標 60 FPS（規格：≥30 FPS 目標 60 FPS）
- [x] 演算法：<10ms 驗證、<5s 求解、<100ms 打亂（規格：P95 <200ms 求解）
- [x] 記憶體：<200MB 佔用，無記憶體洩漏（規格：<200MB 基礎，<2GB 含 SLM）
- [x] 載入時間：<3s 初始載入、<500ms 功能初始化（規格：<3s 首次可互動）
- [x] 可擴展性：支援 100+ 步移動狀態而不降低性能（規格：狀態序列化支援）

**需要註明理由的違規**：無

## 專案結構

### 文檔（此功能）

```text
specs/[###-feature]/
├── plan.md              # 本檔案（/speckit.plan 命令輸出）
├── research.md          # 第 0 階段輸出（/speckit.plan 命令）
├── data-model.md        # 第 1 階段輸出（/speckit.plan 命令）
├── quickstart.md        # 第 1 階段輸出（/speckit.plan 命令）
├── contracts/           # 第 1 階段輸出（/speckit.plan 命令）
└── tasks.md             # 第 2 階段輸出（/speckit.tasks 命令 - 不由 /speckit.plan 建立）
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── src/
│   ├── app/                # Next.js 14 app router
│   │   ├── page.tsx        # 主頁面（魔術方塊介面）
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Cube3D/         # Three.js 魔術方塊渲染
│   │   │   ├── Cube.tsx
│   │   │   ├── Layer.tsx
│   │   │   ├── Facelet.tsx
│   │   │   └── HighlightEffect.tsx
│   │   ├── Controls/       # 用戶控制介面
│   │   │   ├── RotationArrows.tsx
│   │   │   ├── SolverSelector.tsx
│   │   │   └── ScrambleButton.tsx
│   │   └── Animation/      # 動畫管理
│   ├── lib/
│   │   ├── cube/           # 方塊狀態邏輯
│   │   │   ├── CubeState.ts
│   │   │   ├── Move.ts
│   │   │   └── validator.ts
│   │   ├── solvers/        # 求解器介面
│   │   │   ├── Solver.ts   # 抽象介面
│   │   │   ├── AlgorithmSolver.ts
│   │   │   └── SLMSolver.ts
│   │   └── three-utils/    # Three.js 工具
│   ├── store/              # Zustand 狀態管理
│   │   └── cubeStore.ts
│   └── services/
│       ├── api.ts          # Backend API 客戶端
│       └── onnx-runtime.ts # ONNX Runtime 包裝
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                # Playwright E2E
└── public/
    └── models/             # Qwen2.5 ONNX 模型檔案

backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── cube.py     # 方塊狀態 endpoints
│   │   │   ├── solve.py    # 求解 endpoints
│   │   │   └── scramble.py # 打亂 endpoints
│   │   └── main.py         # FastAPI 應用程式
│   ├── models/
│   │   ├── cube_state.py
│   │   ├── move.py
│   │   └── solution.py
│   ├── services/
│   │   ├── solver_service.py
│   │   ├── scramble_service.py
│   │   └── validation_service.py
│   ├── solvers/
│   │   └── kociemba_solver.py  # 演算法求解器實作
│   └── database/
│       ├── models.py       # SQLAlchemy models
│       └── repository.py
├── tests/
│   ├── unit/
│   └── integration/
└── requirements.txt

slm-service/
├── src/
│   ├── api/
│   │   └── main.py         # SLM 推理 API
│   ├── models/
│   │   └── qwen_solver.py  # Qwen2.5 ONNX 推理邏輯
│   └── utils/
│       └── onnx_utils.py   # ONNX Runtime 工具
├── tests/
└── requirements.txt
```

**結構決策**：選擇選項 2（網頁應用程式）並擴展為三個獨立服務：
1. **frontend**：Next.js + Three.js，client-side 3D 渲染
2. **backend**：FastAPI，核心業務邏輯和演算法求解
3. **slm-service**：獨立 SLM 推理服務，可獨立擴展和部署

## 複雜度追蹤

> **僅在憲章檢查有必須註明理由的違規時填寫**

| 違規項 | 為何需要 | 被拒絕的更簡單替代方案及原因 |
|--------|---------|---------------------------|
| [例如：第 4 個專案] | [當前需求] | [為何 3 個專案不足夠] |
| [例如：Repository 模式] | [具體問題] | [為何直接存取資料庫不足夠] |

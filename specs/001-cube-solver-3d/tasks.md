# 任務清單：3D 魔術方塊求解器

**輸入**：來自 `/specs/001-cube-solver-3d/` 的設計文檔
**前置條件**：plan.md、spec.md、research.md、data-model.md、contracts/openapi.yaml、quickstart.md

**測試策略**：根據憲章原則二（測試標準 - 不可妥協），本專案採用 TDD 方法論。所有實作任務前必須先編寫對應測試。

**組織原則**：任務按用戶故事分組，每個故事可獨立實作、測試和交付。

---

## 格式：`- [ ] [TaskID] [P?] [Story?] 描述`

- **[P]**：可並行執行（不同檔案，無依賴關係）
- **[Story]**：任務所屬用戶故事（US1、US2、US3、US4）
- 描述中包含確切檔案路徑

---

## 第 1 階段：設置（專案初始化）

**目的**：建立專案基礎結構和開發環境

- [ ] T001 根據 plan.md 建立三服務目錄結構（frontend/, backend/, slm-service/, infra/docker/）
- [ ] T002 [P] 初始化 frontend: Next.js 14 + TypeScript + pnpm (frontend/package.json, tsconfig.json)
- [ ] T003 [P] 初始化 backend: Python 3.11+ + FastAPI + Poetry (backend/pyproject.toml, requirements.txt)
- [ ] T004 [P] 初始化 slm-service: Python 3.11+ + ONNX Runtime (slm-service/requirements.txt)
- [ ] T005 [P] 配置 ESLint + Prettier (frontend/.eslintrc.json, .prettierrc)
- [ ] T006 [P] 配置 Ruff + Black (backend/ruff.toml, slm-service/ruff.toml)
- [ ] T007 [P] 建立 Dockerfile.web (infra/docker/Dockerfile.web)
- [ ] T008 [P] 建立 Dockerfile.api (infra/docker/Dockerfile.api)
- [ ] T009 建立 docker-compose.local.yml (infra/docker/docker-compose.local.yml) - web/api/db 服務定義
- [ ] T010 [P] 配置 Vitest + React Testing Library (frontend/vitest.config.ts, tests/setup.ts)
- [ ] T011 [P] 配置 pytest + pytest-asyncio (backend/pytest.ini, conftest.py)
- [ ] T012 建立 PostgreSQL schema (backend/database/schema.sql) - scrambles 和 solve_sessions 表
- [ ] T013 [P] 建立 .env.example 檔案 (frontend/.env.example, backend/.env.example)
- [ ] T014 建立 README.md 並引用 quickstart.md 作為主要設置指南

---

## 第 2 階段：基礎（阻塞性前置條件）

**目的**：必須在任何用戶故事實作前完成的共享基礎設施

**⚠️ 關鍵**：在此階段完成前，不能開始任何用戶故事工作

### 核心數據模型（所有故事依賴）

- [ ] T015 [P] 建立 Move 類型定義 (frontend/src/lib/cube/Move.ts) - Face, Direction, moveToString, stringToMove
- [ ] T016 [P] 建立 CubeState 類別 (frontend/src/lib/cube/CubeState.ts) - facelets, isValid, isSolved, applyMove
- [ ] T017 [P] 建立 Move 模型 (backend/src/models/move.py) - Face enum, Move dataclass, validation
- [ ] T018 [P] 建立 CubeState 模型 (backend/src/models/cube_state.py) - CubeState dataclass, validation, apply_move
- [ ] T019 實作 CubeState 驗證邏輯 (frontend/src/lib/cube/validator.ts) - 檢查 54 facelet, 顏色分佈, 可解性
- [ ] T020 實作 CubeState 驗證邏輯 (backend/src/services/validation_service.py) - is_valid, is_solved

### API 基礎設施

- [ ] T021 建立 FastAPI 應用程式入口 (backend/src/api/main.py) - CORS, router 註冊, exception handlers
- [ ] T022 [P] 實作健康檢查端點 (backend/src/api/routes/health.py) - GET /healthz, GET /readyz (含 DB 連線檢查)
- [ ] T023 [P] 建立 API 客戶端 (frontend/src/services/api.ts) - axios 配置, 錯誤處理, 類型定義
- [ ] T024 設置 SQLAlchemy (backend/src/database/models.py) - ScrambleModel, SolveSessionModel
- [ ] T025 實作 database repository (backend/src/database/repository.py) - CRUD 操作, 連線管理

### 狀態管理（前端）

- [ ] T026 建立 Zustand store 架構 (frontend/src/store/cubeStore.ts) - cubeState, selectedLayer, isAnimating, solverType

**檢查點**：基礎就緒 - 可開始並行實作用戶故事

---

## 第 3 階段：用戶故事 4 - 初始化和打亂管理（優先級：P1）🎯 MVP 基礎

**目標**：應用程式啟動時自動生成合法打亂狀態，支援 seed 重現和重新打亂

**獨立測試**：啟動應用程式 → 驗證方塊已打亂 → 檢查 seed 顯示 → 點擊「重新打亂」→ 驗證新 seed 和新狀態

**為何優先**：所有其他故事都依賴合法的打亂狀態作為起點

### 用戶故事 4 的測試（TDD 強制）✅

- [ ] T027 [P] [US4] 契約測試：POST /api/scramble/generate (backend/tests/contract/test_scramble_api.py)
- [ ] T028 [P] [US4] 契約測試：GET /api/scramble/{seed} (backend/tests/contract/test_scramble_api.py)
- [ ] T029 [P] [US4] 單元測試：ScrambleService (backend/tests/unit/test_scramble_service.py) - 確定性 RNG, 25 moves
- [ ] T030 [P] [US4] 單元測試：Scramble 前端邏輯 (frontend/tests/unit/scramble.test.ts)
- [ ] T031 [US4] 整合測試：生成打亂 → 應用到 CubeState → 驗證可解 (backend/tests/integration/test_scramble_flow.py)
- [ ] T032 [US4] E2E 測試：啟動應用 → 驗證打亂顯示 → 重新打亂 (frontend/tests/e2e/scramble.spec.ts)

### 用戶故事 4 的實作

> **前置條件**：測試 T027-T032 必須已編寫且失敗

- [ ] T033 [P] [US4] 建立 Scramble 模型 (frontend/src/lib/cube/Scramble.ts) - seed, moves, moveCount, generate
- [ ] T034 [P] [US4] 建立 Scramble 模型 (backend/src/models/scramble.py) - Scramble dataclass
- [ ] T035 [US4] 實作 ScrambleService (backend/src/services/scramble_service.py) - generate_scramble(seed?), 確定性 RNG
- [ ] T036 [US4] 實作 POST /api/scramble/generate (backend/src/api/routes/scramble.py)
- [ ] T037 [US4] 實作 GET /api/scramble/{seed} (backend/src/api/routes/scramble.py)
- [ ] T038 [US4] 實作 ScrambleButton 元件 (frontend/src/components/Controls/ScrambleButton.tsx)
- [ ] T039 [US4] 整合 scramble 到 cubeStore (frontend/src/store/cubeStore.ts) - initializeScramble, regenerateScramble
- [ ] T040 [US4] 實作啟動時自動打亂 (frontend/src/app/page.tsx) - useEffect 調用 initializeScramble
- [ ] T041 [US4] 顯示 seed 在 UI (frontend/src/components/Controls/SeedDisplay.tsx)
- [ ] T042 [US4] 驗證 100 次連續打亂可解性 (backend/tests/integration/test_scramble_reliability.py)
- [ ] T043 [US4] 添加 scramble 文檔 (backend/src/api/routes/scramble.py docstrings)
- [ ] T044 [US4] 代碼審查：linting 通過，無警告
- [ ] T045 [US4] 性能驗證：打亂生成 <100ms (backend/tests/performance/test_scramble_perf.py)

**檢查點**：用戶故事 4 完成 - 應用程式可啟動並顯示合法打亂狀態

---

## 第 4 階段：用戶故事 1 - 查看並手動操作 3D 魔術方塊（優先級：P1）🎯 MVP 核心

**目標**：用戶可旋轉相機、點選層、執行手動旋轉，流暢動畫，高亮效果

**獨立測試**：啟動應用 → 拖曳旋轉視角 → 點選面片高亮層 → 點擊箭頭執行旋轉 → 驗證動畫流暢

**為何優先**：核心互動體驗，沒有此功能用戶無法使用應用程式

### 用戶故事 1 的測試（TDD 強制）✅

- [ ] T046 [P] [US1] 契約測試：POST /api/cube/validate (backend/tests/contract/test_cube_api.py)
- [ ] T047 [P] [US1] 契約測試：POST /api/cube/apply-move (backend/tests/contract/test_cube_api.py)
- [ ] T048 [P] [US1] 單元測試：CubeState.applyMove (frontend/tests/unit/cubeState.test.ts)
- [ ] T049 [P] [US1] 單元測試：Move 轉換函數 (frontend/tests/unit/move.test.ts)
- [ ] T050 [P] [US1] 單元測試：Cube3D 渲染邏輯 (frontend/tests/unit/cube3d.test.tsx)
- [ ] T051 [P] [US1] 單元測試：HighlightEffect (frontend/tests/unit/highlightEffect.test.tsx)
- [ ] T052 [US1] 整合測試：點選 → 高亮 → 旋轉 → 狀態更新 (frontend/tests/integration/manual-rotation.test.tsx)
- [ ] T053 [US1] E2E 測試：相機旋轉不改變方塊狀態 (frontend/tests/e2e/camera.spec.ts)
- [ ] T054 [US1] E2E 測試：手動旋轉流程 (frontend/tests/e2e/manual-rotation.spec.ts)
- [ ] T055 [US1] 性能測試：動畫期間 FPS ≥30 (frontend/tests/performance/animation-fps.test.ts)

### 用戶故事 1 的實作

> **前置條件**：測試 T046-T055 必須已編寫且失敗

#### 後端 API

- [ ] T056 [P] [US1] 實作 POST /api/cube/validate (backend/src/api/routes/cube.py)
- [ ] T057 [P] [US1] 實作 POST /api/cube/apply-move (backend/src/api/routes/cube.py)

#### Three.js 3D 渲染

- [ ] T058 [P] [US1] 建立 Cube 元件 (frontend/src/components/Cube3D/Cube.tsx) - Canvas, Scene, Camera, Lighting
- [ ] T059 [P] [US1] 建立 Layer 元件 (frontend/src/components/Cube3D/Layer.tsx) - 9 個 facelet 組成一層
- [ ] T060 [P] [US1] 建立 Facelet 元件 (frontend/src/components/Cube3D/Facelet.tsx) - 單個方塊面片，標準配色
- [ ] T061 [US1] 實作 OrbitControls (frontend/src/components/Cube3D/Cube.tsx) - 左鍵拖曳旋轉相機
- [ ] T062 [US1] 實作點選檢測 (frontend/src/components/Cube3D/Facelet.tsx) - Raycaster, onClick handler
- [ ] T063 [US1] 實作 HighlightEffect (frontend/src/components/Cube3D/HighlightEffect.tsx) - OutlinePass + 半透明覆蓋 + 脈動
- [ ] T064 [US1] 實作脈動動畫 (frontend/src/components/Cube3D/HighlightEffect.tsx) - useFrame, 1.5-2s 週期, 1-2% 放大

#### 旋轉控制與動畫

- [ ] T065 [P] [US1] 建立 RotationArrows 元件 (frontend/src/components/Controls/RotationArrows.tsx) - 順時針/逆時針箭頭
- [ ] T066 [US1] 實作動畫管理 (frontend/src/lib/cube/Animation.ts) - AnimationQueue, 150-300ms 插值
- [ ] T067 [US1] 實作層旋轉動畫 (frontend/src/components/Cube3D/Layer.tsx) - useFrame, quaternion slerp
- [ ] T068 [US1] 整合 cubeStore 操作 (frontend/src/store/cubeStore.ts) - selectLayer, executeRotation, isAnimating flag
- [ ] T069 [US1] 實作動畫期間禁用手動操作 (frontend/src/components/Controls/RotationArrows.tsx) - 檢查 isAnimating

#### 整合與優化

- [ ] T070 [US1] 整合所有元件到主頁面 (frontend/src/app/page.tsx) - Cube + Controls
- [ ] T071 [US1] 添加狀態驗證 (frontend/src/lib/cube/validator.ts) - 每次移動後檢查合法性
- [ ] T072 [US1] 優化 Three.js 性能 (frontend/src/lib/three-utils/optimization.ts) - geometry 重用, frustum culling
- [ ] T073 [US1] 添加錯誤處理和用戶反饋 (frontend/src/components/ErrorBoundary.tsx)
- [ ] T074 [US1] 添加文檔註釋 (frontend/src/components/Cube3D/*.tsx JSDoc)
- [ ] T075 [US1] 代碼審查：linting 通過，無警告
- [ ] T076 [US1] 性能驗證：60 FPS 目標，P95 ≥30 FPS (frontend/tests/performance/rendering-fps.test.ts)

**檢查點**：用戶故事 1 完成 - 用戶可完整手動操作魔術方塊，此時已有可交付的 MVP

---

## 第 5 階段：用戶故事 2 - 使用演算法自動求解（優先級：P2）

**目標**：用戶點擊「開始解題」→ 系統計算最優解 → 動畫播放解法 → 方塊恢復已解狀態

**獨立測試**：打亂方塊 → 點擊「開始解題」→ 驗證顯示步數和時間 → 觀察動畫 → 確認已解狀態

### 用戶故事 2 的測試（TDD 強制）✅

- [ ] T077 [P] [US2] 契約測試：POST /api/solve (backend/tests/contract/test_solve_api.py)
- [ ] T078 [P] [US2] 契約測試：GET /api/solve/history (backend/tests/contract/test_solve_api.py)
- [ ] T079 [P] [US2] 單元測試：KociembaSolver (backend/tests/unit/test_kociemba_solver.py)
- [ ] T080 [P] [US2] 單元測試：SolverService (backend/tests/unit/test_solver_service.py)
- [ ] T081 [P] [US2] 單元測試：Solution 模型 (frontend/tests/unit/solution.test.ts)
- [ ] T082 [US2] 整合測試：完整求解流程 (backend/tests/integration/test_solve_flow.py) - scramble → solve → verify solved
- [ ] T083 [US2] E2E 測試：UI 求解按鈕 → 動畫播放 → 已解狀態 (frontend/tests/e2e/algorithm-solve.spec.ts)
- [ ] T084 [US2] 性能測試：求解時間 P95 <200ms (backend/tests/performance/test_solve_perf.py)
- [ ] T085 [US2] 可靠性測試：100 次連續求解成功率 100% (backend/tests/integration/test_solve_reliability.py)

### 用戶故事 2 的實作

> **前置條件**：測試 T077-T085 必須已編寫且失敗

#### 後端求解器

- [ ] T086 [P] [US2] 建立 Solution 模型 (backend/src/models/solution.py) - solver_type, moves, compute_time_ms, success
- [ ] T087 [P] [US2] 建立 Solver 介面 (backend/src/solvers/solver.py) - 抽象 solve(CubeState) 方法
- [ ] T088 [US2] 實作 KociembaSolver (backend/src/solvers/kociemba_solver.py) - 使用 Python kociemba 庫
- [ ] T089 [US2] 實作 SolverService (backend/src/services/solver_service.py) - 選擇求解器, 記錄結果
- [ ] T090 [US2] 實作 POST /api/solve (backend/src/api/routes/solve.py)
- [ ] T091 [US2] 實作 GET /api/solve/history (backend/src/api/routes/solve.py)
- [ ] T092 [US2] 添加 solve_sessions 資料庫操作 (backend/src/database/repository.py)

#### 前端求解 UI

- [ ] T093 [P] [US2] 建立 Solution 類型 (frontend/src/lib/cube/Solution.ts)
- [ ] T094 [P] [US2] 建立 AlgorithmSolver 類別 (frontend/src/lib/solvers/AlgorithmSolver.ts) - 調用後端 API
- [ ] T095 [P] [US2] 建立 SolverSelector 元件 (frontend/src/components/Controls/SolverSelector.tsx) - 演算法/SLM 切換
- [ ] T096 [P] [US2] 建立 SolveButton 元件 (frontend/src/components/Controls/SolveButton.tsx) - 開始/停止按鈕
- [ ] T097 [P] [US2] 建立 SolutionInfo 元件 (frontend/src/components/Controls/SolutionInfo.tsx) - 顯示步數、時間
- [ ] T098 [US2] 整合求解到 cubeStore (frontend/src/store/cubeStore.ts) - startSolve, stopSolve, solution state
- [ ] T099 [US2] 實作解法動畫播放 (frontend/src/lib/cube/Animation.ts) - AnimationQueue 執行 solution.moves
- [ ] T100 [US2] 實作動畫期間禁用手動操作 (frontend/src/components/Controls/RotationArrows.tsx)
- [ ] T101 [US2] 實作「停止」功能 (frontend/src/store/cubeStore.ts) - 取消動畫，恢復狀態
- [ ] T102 [US2] 添加動畫完成驗證 (frontend/src/lib/cube/validator.ts) - 確認 isSolved = true
- [ ] T103 [US2] 添加文檔註釋 (backend/src/solvers/*.py, frontend/src/lib/solvers/*.ts)
- [ ] T104 [US2] 代碼審查：linting 通過，無警告
- [ ] T105 [US2] 性能驗證：求解 P95 <200ms，動畫流暢

**檢查點**：用戶故事 2 完成 - 用戶可使用演算法自動求解，US1+US4 仍可獨立運作

---

## 第 6 階段：用戶故事 3 - 切換並使用 SLM 求解（優先級：P3）

**目標**：用戶可選擇 SLM 版本求解，系統使用 Qwen2.5 模型生成解法，失敗時自動降級

**獨立測試**：切換到 SLM 模式 → 點擊「開始解題」→ 驗證 SLM 推理 → 觀察成功或降級訊息

### 用戶故事 3 的測試（TDD 強制）✅

- [ ] T106 [P] [US3] 單元測試：QwenSolver (slm-service/tests/unit/test_qwen_solver.py)
- [ ] T107 [P] [US3] 單元測試：SLMSolver (frontend/tests/unit/slmSolver.test.ts)
- [ ] T108 [P] [US3] 單元測試：降級邏輯 (frontend/tests/unit/solver-fallback.test.ts)
- [ ] T109 [US3] 整合測試：SLM 推理 → 驗證解法 (slm-service/tests/integration/test_slm_inference.py)
- [ ] T110 [US3] 整合測試：非法移動 → 觸發降級 (frontend/tests/integration/slm-fallback.test.tsx)
- [ ] T111 [US3] E2E 測試：SLM 求解成功流程 (frontend/tests/e2e/slm-solve.spec.ts)
- [ ] T112 [US3] E2E 測試：SLM 失敗降級流程 (frontend/tests/e2e/slm-fallback.spec.ts)
- [ ] T113 [US3] 性能測試：SLM 推理 <5s (slm-service/tests/performance/test_inference_perf.py)
- [ ] T114 [US3] 可靠性測試：100 次 SLM 求解成功率 100%（含降級）(frontend/tests/integration/slm-reliability.test.tsx)

### 用戶故事 3 的實作

> **前置條件**：測試 T106-T114 必須已編寫且失敗

#### SLM 服務

- [ ] T115 [P] [US3] 建立 ONNX Runtime 工具 (slm-service/src/utils/onnx_utils.py) - 模型載入, WebGPU/WebGL/WASM 偵測
- [ ] T116 [US3] 實作 QwenSolver (slm-service/src/models/qwen_solver.py) - tokenize, inference, decode
- [ ] T117 [US3] 實作 SLM 推理 API (slm-service/src/api/main.py) - POST /infer
- [ ] T118 [US3] 添加模型下載腳本 (slm-service/scripts/download-model.sh) - Hugging Face CLI
- [ ] T119 [US3] 配置 ONNX Runtime providers (slm-service/src/api/main.py) - WebGPU → WebGL → WASM 順序

#### 前端 SLM 整合

- [ ] T120 [P] [US3] 建立 SLMSolver 類別 (frontend/src/lib/solvers/SLMSolver.ts) - 調用 slm-service API
- [ ] T121 [US3] 實作解法驗證 (frontend/src/lib/solvers/SLMSolver.ts) - 檢查每個 move 合法性
- [ ] T122 [US3] 實作降級邏輯 (frontend/src/lib/solvers/SLMSolver.ts) - 偵測非法移動 → fallback to AlgorithmSolver
- [ ] T123 [US3] 整合 SLM 選項到 SolverSelector (frontend/src/components/Controls/SolverSelector.tsx)
- [ ] T124 [US3] 更新 cubeStore (frontend/src/store/cubeStore.ts) - solverType state, 動態選擇求解器
- [ ] T125 [US3] 添加降級通知 (frontend/src/components/Controls/SolutionInfo.tsx) - 「SLM 求解失敗，已切換到演算法版本」
- [ ] T126 [US3] 添加 SLM 載入指示器 (frontend/src/components/Controls/SolveButton.tsx) - 載入動畫, 進度條
- [ ] T127 [US3] 實作超時處理 (frontend/src/lib/solvers/SLMSolver.ts) - >5s 自動取消並降級
- [ ] T128 [US3] 添加 SLM 成功率記錄 (frontend/src/services/analytics.ts) - LocalStorage 或 API
- [ ] T129 [US3] 添加文檔註釋 (slm-service/src/**/*.py, frontend/src/lib/solvers/SLMSolver.ts)
- [ ] T130 [US3] 代碼審查：linting 通過，無警告
- [ ] T131 [US3] 性能驗證：SLM 推理 <5s，記憶體 <2GB

**檢查點**：用戶故事 3 完成 - 用戶可切換 SLM 求解，US1+US2+US4 仍可獨立運作

---

## 第 7 階段：Polish & 跨切面關注點

**目的**：最終品質驗證、文檔、性能優化和憲章合規審查

- [ ] T132 [P] 更新 README.md：功能概述、技術棧、快速開始引用
- [ ] T133 [P] 更新 quickstart.md：Docker Compose 驗證步驟、常見問題補充
- [ ] T134 [P] 建立 API 文檔 (backend/docs/api.md) - 基於 OpenAPI spec
- [ ] T135 [P] 建立架構文檔 (docs/architecture.md) - 三服務架構圖、數據流
- [ ] T136 代碼重構：DRY 原則審查 (所有服務) - 提取重複邏輯
- [ ] T137 [P] 性能優化：Three.js 渲染 (frontend/src/lib/three-utils/optimization.ts) - 目標 60 FPS
- [ ] T138 [P] 性能優化：後端求解 (backend/src/solvers/kociemba_solver.py) - 目標 P95 <200ms
- [ ] T139 [P] 性能優化：SLM 推理 (slm-service/src/models/qwen_solver.py) - WebGPU 優化
- [ ] T140 測試覆蓋率驗證：前端 ≥80% (pnpm test:coverage)
- [ ] T141 測試覆蓋率驗證：後端 ≥80% (pytest --cov)
- [ ] T142 測試覆蓋率驗證：slm-service ≥80% (pytest --cov)
- [ ] T143 E2E 測試覆蓋率：所有用戶故事 100% (Playwright)
- [ ] T144 [P] 安全加固：輸入驗證 (backend/src/api/routes/*.py) - Pydantic 嚴格模式
- [ ] T145 [P] 安全加固：CORS 配置 (backend/src/api/main.py) - 生產環境限制
- [ ] T146 無障礙驗證：鍵盤導航 (frontend/src/components/*) - Tab, Enter, Arrow keys
- [ ] T147 無障礙驗證：ARIA 標籤 (frontend/src/components/*) - screen reader 支援
- [ ] T148 最終代碼審查：所有服務 linting 通過，零警告
- [ ] T149 憲章合規審查：代碼品質 (單一職責, DRY, 命名, 文檔)
- [ ] T150 憲章合規審查：測試標準 (TDD, 覆蓋率 ≥80%, 獨立性)
- [ ] T151 憲章合規審查：用戶體驗 (視覺一致性, Singmaster, 反饋, 錯誤訊息)
- [ ] T152 憲章合規審查：性能要求 (60 FPS, <200ms solve, <200MB memory, <3s load)
- [ ] T153 執行 quickstart.md 驗證：從零開始設置 → 所有步驟成功
- [ ] T154 執行 Docker Compose 驗證：docker-compose up → healthz + readyz 通過 → 前端可訪問
- [ ] T155 執行可靠性測試：100 次連續打亂+求解（演算法）→ 成功率 100%
- [ ] T156 執行可靠性測試：100 次連續 SLM 求解（含降級）→ 成功率 100%
- [ ] T157 生成測試報告 (tests/reports/) - 覆蓋率、性能基準、可靠性
- [ ] T158 最終 PR：代碼審查、CI 通過、所有檢查點確認

---

## 依賴關係與執行順序

### 階段依賴

- **設置（第 1 階段）**：無依賴 - 可立即開始
- **基礎（第 2 階段）**：依賴設置完成 - **阻塞所有用戶故事**
- **用戶故事（第 3-6 階段）**：全部依賴基礎階段完成
  - **US4（打亂）**→ 先執行（US1 依賴打亂狀態）
  - **US1（手動操作）**→ 可並行於 US4 後段
  - **US2（演算法求解）**→ 依賴 US1 + US4
  - **US3（SLM 求解）**→ 依賴 US2（共享 Solver 介面）
- **Polish（第 7 階段）**：依賴所有期望用戶故事完成

### 用戶故事依賴

```
基礎階段 (T015-T026)
    ↓
US4: 打亂管理 (T027-T045)
    ↓
US1: 手動操作 (T046-T076)
    ↓
US2: 演算法求解 (T077-T105)
    ↓
US3: SLM 求解 (T106-T131)
    ↓
Polish (T132-T158)
```

**關鍵路徑**：設置 → 基礎 → US4 → US1 → US2 → US3 → Polish

### 並行機會（按階段）

**第 1 階段（設置）**：
- T002-T004: 三個服務初始化可並行
- T005-T006: Linting 配置可並行
- T007-T008: Dockerfile 可並行
- T010-T011: 測試配置可並行

**第 2 階段（基礎）**：
- T015-T018: 數據模型（前端+後端）可並行
- T022-T023: 健康檢查 + API 客戶端可並行

**第 3 階段（US4）**：
- T027-T032: 所有測試可並行編寫
- T033-T034: Scramble 前後端模型可並行

**第 4 階段（US1）**：
- T046-T055: 所有測試可並行編寫
- T056-T057: 後端 API 可並行
- T058-T060: Three.js 元件可並行
- T065, T073: 控制與優化可並行

**第 5 階段（US2）**：
- T077-T085: 所有測試可並行編寫
- T086-T087: Solution 模型 + Solver 介面可並行
- T093-T097: 前端求解 UI 元件可並行

**第 6 階段（US3）**：
- T106-T114: 所有測試可並行編寫
- T115, T118, T119: SLM 基礎設施可並行

**第 7 階段（Polish）**：
- T132-T135: 文檔可並行
- T137-T139: 性能優化可並行（不同服務）
- T140-T142: 覆蓋率驗證可並行
- T144-T145: 安全加固可並行
- T146-T147: 無障礙驗證可並行

---

## 實作策略

### MVP 範圍（最小可行產品）

**階段 1-4**：設置 + 基礎 + US4 + US1
- **交付物**：可運行的 3D 魔術方塊，支援手動操作和打亂
- **價值**：用戶可以練習魔術方塊，體驗核心互動
- **時間估計**：2-3 週（1 位全職開發者）

### 增量交付順序

1. **MVP (Phases 1-4)**：手動操作 + 打亂
2. **演算法版本 (Phase 5)**：自動求解能力
3. **完整版 (Phase 6)**：SLM 實驗功能
4. **Production Ready (Phase 7)**：優化與合規

### 團隊並行工作（如果有多位開發者）

- **開發者 A**：前端（US1 Three.js 渲染）
- **開發者 B**：後端（US2 演算法求解器）
- **開發者 C**：SLM 服務（US3 Qwen2.5 整合）

所有人先完成第 1-2 階段（設置+基礎），然後並行處理各自的用戶故事。

---

## 測試策略總結

### TDD 工作流程（每個用戶故事）

1. **Red**：編寫測試（契約 + 單元 + 整合 + E2E）→ 運行測試 → 確認失敗
2. **Green**：實作最小代碼使測試通過
3. **Refactor**：重構代碼，確保測試仍通過
4. **Repeat**：對下一個任務重複

### 測試覆蓋率目標

- **單元測試**：≥80% 覆蓋率（核心邏輯 ≥90%）
- **整合測試**：每個用戶故事至少 1 個完整流程測試
- **E2E 測試**：100% 用戶故事覆蓋
- **性能測試**：所有憲章性能指標（FPS, 求解時間, 記憶體）
- **可靠性測試**：100 次連續操作成功率 100%

### 測試組織

```
frontend/tests/
  unit/          # 純函數邏輯（CubeState, Move, validator）
  integration/   # 元件整合（store + components）
  e2e/           # Playwright 用戶流程
  performance/   # FPS, 動畫流暢度

backend/tests/
  unit/          # 模型、服務邏輯
  contract/      # API 契約（OpenAPI 規範）
  integration/   # DB + API 整合
  performance/   # 求解時間、打亂生成

slm-service/tests/
  unit/          # ONNX 工具、QwenSolver
  integration/   # 模型推理流程
  performance/   # 推理時間、記憶體使用
```

---

## 成功標準檢查清單

根據 spec.md 的 15 個成功標準：

- [ ] **SC-001**: 首次手動旋轉 <5s（US1 E2E 測試）
- [ ] **SC-002**: 演算法求解 P95 <200ms（US2 性能測試）
- [ ] **SC-003**: 100 次打亂+求解成功率 100%（US2+US4 可靠性測試）
- [ ] **SC-004**: 相機旋轉平均 45+ FPS（US1 性能測試）
- [ ] **SC-005**: 動畫流暢度 90% 幀 ≥30 FPS（US1 性能測試）
- [ ] **SC-006**: 啟動到可互動中位數 <2.5s（E2E 測試）
- [ ] **SC-007**: 首次使用成功率 ≥80%（用戶測試 - Phase 7）
- [ ] **SC-008**: 高亮效果評分 ≥4/5（用戶測試 - Phase 7）
- [ ] **SC-009**: 動畫評分 ≥4/5（用戶測試 - Phase 7）
- [ ] **SC-010**: SLM 降級機制 100% 成功（US3 可靠性測試）
- [ ] **SC-011**: 1 小時運行記憶體增長 <10%（US1 性能測試）
- [ ] **SC-012**: 任意合法狀態求解成功率 100%（US2 可靠性測試）
- [ ] **SC-013**: 核心邏輯測試覆蓋率 ≥90%（Phase 7 覆蓋率驗證）
- [ ] **SC-014**: 每個故事至少 1 個 E2E 測試（Phase 7 驗證）
- [ ] **SC-015**: 新增求解器不影響其他模組（US3 架構驗證）

---

**總任務數**：158
**預估時間**：
- MVP (Phases 1-4): 2-3 週
- 演算法版本 (Phase 5): 1-2 週
- SLM 版本 (Phase 6): 2-3 週
- Polish (Phase 7): 1 週
- **總計**：6-9 週（1 位全職開發者，TDD 流程）

**下一步**：開始 T001（建立專案結構）

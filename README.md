# SDD 魔術方塊 3D 求解器

一個互動式 3D 魔術方塊求解器，支援手動操作和自動求解（演算法/SLM）。

## 功能特色

- **3D 互動視覺化**：使用 Three.js 渲染的可旋轉 3D 魔術方塊
- **手動操作**：點選層並執行旋轉，包含流暢動畫和高亮效果
- **演算法求解**：使用 Kociemba 演算法自動求解（<20 步最優解）
- **SLM 求解**：使用 Qwen2.5 小型語言模型的實驗性求解方案
- **打亂管理**：基於 seed 的確定性打亂生成，可重現相同狀態

## 快速開始

詳細的設置和開發指南請參閱：[quickstart.md](./specs/001-cube-solver-3d/quickstart.md)

### 使用 Docker Compose（推薦）

```bash
# 一鍵啟動完整環境（web + api + db）
docker compose -f infra/docker/docker-compose.local.yml up --build

# 訪問應用
# 前端: http://localhost:3000
# API 文檔: http://localhost:8000/docs
```

### 手動安裝

#### 前端
```bash
cd frontend
pnpm install
pnpm dev
```

#### 後端
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

## 技術棧

- **前端**：Next.js 14, React 18, Three.js, React Three Fiber, Zustand
- **後端**：Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy
- **SLM 服務**：ONNX Runtime, Qwen2.5-0.5B/1.5B
- **測試**：Vitest, Playwright, pytest

## 專案結構

```
├── frontend/          # Next.js 前端應用
├── backend/           # FastAPI 後端 API
├── slm-service/       # SLM 推理服務
├── infra/docker/      # Docker 配置
└── specs/             # 規格文檔
```

## 開發

本專案採用規格驅動開發（SDD）方法構建。方塊狀態、有效移動、約束條件和求解目標首先被規格化，然後逐步實作和驗證。

### 測試
```bash
# 前端
cd frontend
pnpm test              # 單元測試
pnpm test:e2e          # E2E 測試
pnpm test:coverage     # 測試覆蓋率

# 後端
cd backend
pytest                 # 所有測試
pytest --cov           # 覆蓋率報告
```

## 文檔

- [功能規格](./specs/001-cube-solver-3d/spec.md)
- [實作計劃](./specs/001-cube-solver-3d/plan.md)
- [數據模型](./specs/001-cube-solver-3d/data-model.md)
- [API 契約](./specs/001-cube-solver-3d/contracts/openapi.yaml)
- [快速開始指南](./specs/001-cube-solver-3d/quickstart.md)

## 授權

MIT License

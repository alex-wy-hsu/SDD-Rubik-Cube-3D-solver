# 快速開始指南：3D 魔術方塊求解器

**功能**：001-cube-solver-3d  
**更新日期**：2026-01-03

## 概述

本指南將幫助您設置開發環境並運行 3D 魔術方塊求解器。專案分為三個獨立服務：前端（Next.js）、後端（FastAPI）和 SLM 服務（ONNX Runtime）。

---

## 系統需求

### 必需
- **Node.js**: 18.x 或更高
- **Python**: 3.11 或更高
- **PostgreSQL**: 15.x 或更高（或使用 Supabase/Neon 雲端服務）
- **Git**: 用於版本控制

### 推薦
- **pnpm**: 快速的 npm 替代品（`npm install -g pnpm`）
- **Docker**: 可選，用於容器化部署
- **VS Code**: 推薦的 IDE，配合 ESLint, Pylance 擴展

---

## 初始設置

### 1. 克隆儲存庫

```bash
git clone https://github.com/your-org/SDD-Rubik-Cube-3D-solver.git
cd SDD-Rubik-Cube-3D-solver
git checkout 001-cube-solver-3d
```

### 2. 安裝依賴

#### 前端
```bash
cd frontend
pnpm install
```

#### 後端
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### SLM 服務
```bash
cd ../slm-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 配置

### 1. 資料庫設置

#### 選項 A：本地 PostgreSQL
```bash
# 創建資料庫
createdb rubik_cube_solver

# 應用 schema
psql rubik_cube_solver < backend/schema.sql
```

#### 選項 B：Supabase（推薦）
1. 訪問 [supabase.com](https://supabase.com) 並創建免費專案
2. 獲取連接字串（`DATABASE_URL`）
3. 在 Supabase SQL Editor 中執行 `backend/schema.sql`

### 2. 環境變數

#### 前端 `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SLM_SERVICE_URL=http://localhost:8001
```

#### 後端 `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rubik_cube_solver
# 或使用 Supabase URL
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres

CORS_ORIGINS=http://localhost:3000
```

#### SLM 服務 `.env`
```env
MODEL_PATH=./models/qwen2.5-0.5b.onnx
ONNX_EXECUTION_PROVIDER=webgpu  # 或 webgl, wasm
```

---

## 下載 SLM 模型

Qwen2.5 ONNX 模型需要手動下載（檔案較大，不包含在 git 中）：

```bash
cd slm-service/models
# 從 Hugging Face 下載
wget https://huggingface.co/Qwen/Qwen2.5-0.5B-ONNX/resolve/main/model.onnx -O qwen2.5-0.5b.onnx

# 或使用 huggingface-cli
huggingface-cli download Qwen/Qwen2.5-0.5B-ONNX --local-dir ./
```

**替代方案**：首次運行時程式會自動下載（需要網路連接）

---

## 運行服務

### 方法 A：Docker Compose（推薦用於本機整合測試）

**一鍵啟動完整環境**（web + api + db）：

```bash
# 在專案根目錄
docker compose -f infra/docker/docker-compose.local.yml up --build
```

此命令會啟動：
- **web**：Next.js 前端 (http://localhost:3000)
- **api**：FastAPI 後端 (http://localhost:8000)
- **db**：PostgreSQL 16 (localhost:5432)

**停止服務**：
```bash
docker compose -f infra/docker/docker-compose.local.yml down
```

**驗證健康狀態**：
```bash
# 健康檢查
curl http://localhost:8000/healthz

# 就緒檢查（含 DB 連線）
curl http://localhost:8000/readyz
```

> **注意**：v1 不包含 `slm-service`，等 solver 版本端到端測試通過後再加入。

---

### 方法 B：手動運行（開發模式）

使用根目錄的便利腳本：

```bash
# 在專案根目錄
./scripts/dev.sh  # Unix/Mac
# 或
.\scripts\dev.ps1  # Windows PowerShell
```

此腳本會同時啟動：
- 前端：http://localhost:3000
- 後端 API：http://localhost:8000
- SLM 服務：http://localhost:8001

### 單獨運行服務

#### 前端
```bash
cd frontend
pnpm dev
# 訪問 http://localhost:3000
```

#### 後端
```bash
cd backend
source venv/bin/activate
uvicorn src.api.main:app --reload --port 8000
# API 文檔：http://localhost:8000/docs
```

#### SLM 服務
```bash
cd slm-service
source venv/bin/activate
uvicorn src.api.main:app --reload --port 8001
# 可選：首次運行會自動下載模型（~500MB）
```

---

## 驗證安裝

### 1. 檢查後端 API

```bash
curl http://localhost:8000/api/cube/validate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"facelets": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"}'
```

預期輸出：
```json
{
  "is_valid": true,
  "is_solved": true,
  "error_message": null
}
```

### 2. 測試打亂生成

```bash
curl http://localhost:8000/api/scramble/generate \
  -X POST \
  -H "Content-Type: application/json"
```

### 3. 測試演算法求解

```bash
# 使用打亂後的狀態
curl http://localhost:8000/api/solve \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"facelets": "[打亂後的 54 字元字串]"}'
```

### 4. 打開前端

訪問 http://localhost:3000，您應該看到：
- 3D 魔術方塊渲染在螢幕中央
- 相機可透過左鍵拖曳旋轉
- 「重新打亂」和「開始解題」按鈕

---

## 運行測試

### 前端測試
```bash
cd frontend
pnpm test          # 單元測試（Vitest）
pnpm test:e2e      # E2E 測試（Playwright）
pnpm test:coverage # 測試覆蓋率報告
```

### 後端測試
```bash
cd backend
pytest tests/                     # 所有測試
pytest tests/unit/                # 僅單元測試
pytest --cov=src --cov-report=html # 覆蓋率報告
```

### 測試目標
- 單元測試覆蓋率：≥80%
- 所有用戶故事有整合測試
- E2E 測試覆蓋關鍵用戶流程

---

## 常見問題

### Q: 前端顯示 "Cannot connect to API"
**A**: 確保後端服務正在運行（http://localhost:8000），檢查 `.env.local` 中的 `NEXT_PUBLIC_API_URL` 是否正確。

### Q: Three.js 場景顯示空白
**A**: 檢查瀏覽器控制台是否有 WebGL 錯誤。確保瀏覽器支援 WebGL 2.0（Chrome 90+, Firefox 88+, Safari 15+）。

### Q: SLM 模型載入失敗
**A**: 
1. 確認模型檔案存在於 `slm-service/models/qwen2.5-0.5b.onnx`
2. 檔案大小應約 500MB（0.5B 模型）或 1.5GB（1.5B 模型）
3. 嘗試使用 WASM 後備：設置 `ONNX_EXECUTION_PROVIDER=wasm`

### Q: 資料庫連接錯誤
**A**: 
1. 確認 PostgreSQL 正在運行：`pg_isready`
2. 檢查 `DATABASE_URL` 環境變數
3. 確認資料庫已創建：`psql -l | grep rubik`

### Q: 測試失敗「Coverage < 80%」
**A**: 
1. 運行 `pnpm test:coverage` 查看缺失覆蓋的文件
2. 為缺失的函數/分支添加測試
3. TDD 原則：先寫測試再寫代碼

---

## 開發工作流程

### 1. 創建新功能
```bash
# 從 main 分支創建功能分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 編寫測試（TDD）
```bash
# 前端
cd frontend
pnpm test -- --watch  # 監視模式

# 後端
cd backend
pytest --watch
```

### 3. 實作功能
- 遵循 [data-model.md](./data-model.md) 中定義的類型
- 使用 [contracts/openapi.yaml](./contracts/openapi.yaml) 作為 API 參考
- 確保代碼通過 linting：
  ```bash
  pnpm lint   # 前端
  ruff check src/  # 後端
  ```

### 4. 提交代碼
```bash
git add .
git commit -m "feat(cube): add highlight effect with pulsing animation"
# 使用約定式提交格式
```

### 5. 推送並創建 PR
```bash
git push origin feature/your-feature-name
# 在 GitHub 創建 Pull Request
# 確保 CI 通過（測試、linting、覆蓋率）
```

---

## 性能基準測試

### 3D 渲染
```bash
# 在瀏覽器開發工具中運行
performance.mark('render-start')
// 執行場景操作
performance.mark('render-end')
performance.measure('render', 'render-start', 'render-end')
// 目標：60 FPS（~16ms per frame）
```

### 演算法求解
```bash
# 使用 backend 內建的基準測試
cd backend
python -m src.benchmarks.solver_benchmark
# 目標：P95 < 200ms
```

### SLM 推理
```bash
cd slm-service
python -m src.benchmarks.slm_benchmark
# 目標：<5 秒單次請求
```

---

## 部署

### 生產環境檢查清單
- [ ] 所有測試通過且覆蓋率 ≥80%
- [ ] Linting 無警告
- [ ] 憲章符合性驗證通過
- [ ] 性能基準達標
- [ ] 環境變數已配置（生產 DATABASE_URL, API 金鑰等）
- [ ] SLM 模型已上傳到 CDN 或 S3

### Docker 部署（可選）
```bash
# 建構映像
docker-compose build

# 運行所有服務
docker-compose up -d

# 檢查日誌
docker-compose logs -f
```

---

## 資源連結

- **專案規格**：[spec.md](./spec.md)
- **數據模型**：[data-model.md](./data-model.md)
- **API 文檔**：[contracts/openapi.yaml](./contracts/openapi.yaml)
- **研究筆記**：[research.md](./research.md)
- **憲章**：[.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

## 獲取幫助

- **Slack**：#rubik-cube-solver 頻道
- **Email**：dev-team@example.com
- **Issues**：[GitHub Issues](https://github.com/your-org/SDD-Rubik-Cube-3D-solver/issues)
- **文檔**：[Wiki](https://github.com/your-org/SDD-Rubik-Cube-3D-solver/wiki)

---

**最後更新**：2026-01-03  
**維護者**：SDD Rubik Cube Team

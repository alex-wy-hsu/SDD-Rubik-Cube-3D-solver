技術選型（決策）

### 前端（Web）
- Framework：Next.js（React + TypeScript）
- 3D：Three.js + React Three Fiber (R3F)
- 狀態管理：Zustand
- 渲染策略：3D 必須是 **client-only**（WebGL 不做 SSR）

### 後端（API）
- Python + FastAPI
- Server：Uvicorn（dev），Gunicorn+Uvicorn workers（prod 容器）
- DB：PostgreSQL（Supabase / Neon）

### SLM 推論服務
- 拆成 `slm-service`（獨立容器/部署）

### 一鍵啟動（docker-compose.local.yml）

為了讓開發者在本機能用單一指令跑起整套系統（web/api/db），本專案提供 `infra/docker/docker-compose.local.yml` 作為本機整合環境。

#### 目標
- 一鍵啟動 `web`（Next.js）、`api`（FastAPI）、`db`（PostgreSQL）
- 開發者不需要先手動安裝與設定 Postgres
- 可用於本機端到端測試：scramble → solve → 前端播放 moves → solved

#### Compose 內容（服務與責任）
- `db`
  - PostgreSQL 16
  - 透過 volume 保存資料（避免容器重建後資料消失）
  - 對外暴露 `5432`（僅供本機調試使用）
- `api`
  - FastAPI（容器化）
  - 透過環境變數 `DATABASE_URL` 連線到 `db`
  - 對外暴露 `8000`
- `web`
  - Next.js（容器化）
  - 透過 `NEXT_PUBLIC_API_BASE_URL` 指向 `api`
  - 對外暴露 `3000`

> v1 可先不納入 `slm-service`，等 solver 版端到端跑通後再加入。

#### 啟動與停止（預期工作流程）
- 啟動（build + run）：
  - `docker compose -f infra/docker/docker-compose.local.yml up --build`
- 停止：
  - `docker compose -f infra/docker/docker-compose.local.yml down`

#### 環境變數（最低需求）
- `api`：
  - `DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/cube`
- `web`：
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

#### 成功判定
- `web` 可在 `http://localhost:3000` 打開
- `api` 健康檢查通過（例如 `GET /healthz` 回 200）
- `api` 可成功連線 `db`（例如 `GET /readyz` 回 200）
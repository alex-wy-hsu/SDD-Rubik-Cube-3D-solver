技術選型（決策）

### 3.1 前端（Web）
- Framework：Next.js（React + TypeScript）
- 3D：Three.js + React Three Fiber (R3F)
- 狀態管理：Zustand
- 渲染策略：3D 必須是 **client-only**（WebGL 不做 SSR）

### 3.2 後端（API）
- Python + FastAPI
- Server：Uvicorn（dev），Gunicorn+Uvicorn workers（prod 容器）
- DB：PostgreSQL（Supabase / Neon）

### 3.3 SLM 推論服務
- 拆成 `slm-service`（獨立容器/部署）
# 數據模型：3D 魔術方塊求解器

**功能**：001-cube-solver-3d  
**日期**：2026-01-03  
**階段**：第 1 階段（設計）

## 概述

此文檔定義 3D 魔術方塊求解器的核心數據模型。所有實體遵循領域驅動設計原則，確保類型安全和不可變性。

---

## 核心實體

### 1. CubeState

代表魔術方塊的完整狀態，包含 54 個 facelet 的顏色配置。

**屬性**：
```typescript
interface CubeState {
  facelets: string;  // 54 字元字串，URFDLB 順序
  isValid: boolean;  // 狀態合法性標記
  isSolved: boolean; // 是否已解
}
```

**Python 等效**：
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class CubeState:
    facelets: str  # 長度必須為 54
    is_valid: bool
    is_solved: bool
    
    def __post_init__(self):
        if len(self.facelets) != 54:
            raise ValueError("Facelets must be exactly 54 characters")
```

**驗證規則**：
- `facelets` 長度必須為 54
- 必須包含恰好 9 個 U/R/F/D/L/B 各字元（代表中心塊顏色）
- 邊塊和角塊必須形成有效配置（無浮動塊）

**工廠方法**：
- `CubeState.solved()`: 返回已解狀態
- `CubeState.fromMoves(moves: Move[])`: 從移動序列構建狀態
- `CubeState.fromString(s: string)`: 從 54 字元字串解析

**狀態轉換**：
```typescript
cubeState.applyMove(move: Move): CubeState
cubeState.applyMoves(moves: Move[]): CubeState
```

**序列化**：
- JSON: `{ "facelets": "UUUUUU...", "isValid": true, "isSolved": false }`
- Database: `facelets TEXT NOT NULL`

---

### 2. Move

代表單個魔術方塊移動（層旋轉）。

**屬性**：
```typescript
type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
type Direction = 1 | -1 | 2;  // 順時針 90°, 逆時針 90°, 180°

interface Move {
  face: Face;
  direction: Direction;
}
```

**Python 等效**：
```python
from enum import Enum

class Face(str, Enum):
    U = "U"
    D = "D"
    L = "L"
    R = "R"
    F = "F"
    B = "B"

@dataclass(frozen=True)
class Move:
    face: Face
    direction: int  # 1, -1, or 2
    
    def __post_init__(self):
        if self.direction not in (1, -1, 2):
            raise ValueError("Direction must be 1, -1, or 2")
```

**標記法轉換**：
- Singmaster 標記法：`U`, `U'`, `U2`, `D`, `D'`, etc.
- 轉換函數：
  ```typescript
  function moveToString(move: Move): string {
    if (move.direction === 1) return move.face;
    if (move.direction === -1) return move.face + "'";
    return move.face + "2";
  }
  
  function stringToMove(s: string): Move {
    const face = s[0] as Face;
    if (s.length === 1) return { face, direction: 1 };
    if (s[1] === "'") return { face, direction: -1 };
    if (s[1] === "2") return { face, direction: 2 };
    throw new Error("Invalid move string");
  }
  ```

**反轉移動**：
```typescript
function inverseMove(move: Move): Move {
  if (move.direction === 2) return move;  // 180° 自反
  return { ...move, direction: -move.direction as Direction };
}
```

---

### 3. Scramble

代表打亂序列，包含 seed 用於重現。

**屬性**：
```typescript
interface Scramble {
  id?: string;        // UUID
  seed: string;       // 用於重現的唯一標識
  moves: Move[];      // 移動序列
  moveCount: number;  // 移動數量（固定 25）
  createdAt: Date;
}
```

**Python 等效**：
```python
from uuid import UUID
from datetime import datetime

@dataclass
class Scramble:
    seed: str
    moves: list[Move]
    move_count: int = 25
    id: UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
```

**生成邏輯**：
```typescript
function generateScramble(seed: string): Scramble {
  const rng = seedRandom(seed);  // 確定性隨機數生成器
  const moves: Move[] = [];
  
  for (let i = 0; i < 25; i++) {
    const face = randomFace(rng);
    const direction = randomDirection(rng);
    moves.push({ face, direction });
  }
  
  return {
    seed,
    moves,
    moveCount: 25,
    createdAt: new Date(),
  };
}
```

**Database Schema**：
```sql
CREATE TABLE scrambles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed VARCHAR(64) UNIQUE NOT NULL,
    moves JSONB NOT NULL,  -- Array of Move objects
    move_count INTEGER NOT NULL CHECK (move_count = 25),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4. Solution

代表求解結果，包含移動序列和性能指標。

**屬性**：
```typescript
interface Solution {
  id?: string;
  scrambleId?: string;
  solverType: 'algorithm' | 'slm';
  moves: Move[];
  moveCount: number;
  computeTimeMs: number;  // 計算耗時（毫秒）
  success: boolean;       // 是否成功求解
  errorMessage?: string;  // 失敗原因（如有）
  createdAt: Date;
}
```

**Python 等效**：
```python
from typing import Literal

@dataclass
class Solution:
    solver_type: Literal['algorithm', 'slm']
    moves: list[Move]
    move_count: int
    compute_time_ms: float
    success: bool
    error_message: str | None = None
    id: UUID | None = None
    scramble_id: UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
```

**Database Schema**：
```sql
CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scramble_id UUID REFERENCES scrambles(id),
    solver_type VARCHAR(20) NOT NULL CHECK (solver_type IN ('algorithm', 'slm')),
    moves JSONB NOT NULL,
    move_count INTEGER NOT NULL,
    compute_time_ms REAL NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**驗證**：
```typescript
function verifySolution(initial: CubeState, solution: Solution): boolean {
  const finalState = initial.applyMoves(solution.moves);
  return finalState.isSolved;
}
```

---

### 5. Solver (抽象介面)

定義求解器的統一介面，支援演算法和 SLM 兩種實作。

**TypeScript 介面**：
```typescript
interface Solver {
  readonly type: 'algorithm' | 'slm';
  solve(cubeState: CubeState): Promise<Solution>;
}
```

**演算法求解器實作**：
```typescript
class AlgorithmSolver implements Solver {
  readonly type = 'algorithm';
  
  async solve(cubeState: CubeState): Promise<Solution> {
    const startTime = performance.now();
    
    // 呼叫後端 API
    const response = await fetch('/api/solve', {
      method: 'POST',
      body: JSON.stringify({ facelets: cubeState.facelets }),
    });
    
    const data = await response.json();
    const computeTimeMs = performance.now() - startTime;
    
    return {
      solverType: 'algorithm',
      moves: data.moves.map(stringToMove),
      moveCount: data.moves.length,
      computeTimeMs,
      success: true,
      createdAt: new Date(),
    };
  }
}
```

**SLM 求解器實作**：
```typescript
class SLMSolver implements Solver {
  readonly type = 'slm';
  private session: ort.InferenceSession | null = null;
  
  async loadModel() {
    this.session = await ort.InferenceSession.create('/models/qwen2.5-0.5b.onnx');
  }
  
  async solve(cubeState: CubeState): Promise<Solution> {
    if (!this.session) await this.loadModel();
    
    const startTime = performance.now();
    
    try {
      const prompt = encodeCubeStateToPrompt(cubeState);
      const output = await this.session.run({ input: prompt });
      const moves = parseSLMOutput(output);
      
      // 驗證每個移動
      for (const move of moves) {
        if (!isValidMove(move)) {
          throw new Error(`Invalid move: ${moveToString(move)}`);
        }
      }
      
      const computeTimeMs = performance.now() - startTime;
      
      return {
        solverType: 'slm',
        moves,
        moveCount: moves.length,
        computeTimeMs,
        success: true,
        createdAt: new Date(),
      };
    } catch (error) {
      // 降級到演算法求解器
      console.warn('SLM solver failed, falling back to algorithm', error);
      const algorithmSolver = new AlgorithmSolver();
      const solution = await algorithmSolver.solve(cubeState);
      return {
        ...solution,
        errorMessage: `SLM failed: ${error.message}. Fallback to algorithm solver.`,
      };
    }
  }
}
```

**Python 後端 Solver**：
```python
from abc import ABC, abstractmethod

class Solver(ABC):
    @abstractmethod
    def solve(self, cube_state: CubeState) -> Solution:
        pass

class KociembaSolver(Solver):
    def solve(self, cube_state: CubeState) -> Solution:
        import kociemba
        import time
        
        start_time = time.time()
        solution_string = kociemba.solve(cube_state.facelets)
        compute_time_ms = (time.time() - start_time) * 1000
        
        moves = [string_to_move(m) for m in solution_string.split()]
        
        return Solution(
            solver_type='algorithm',
            moves=moves,
            move_count=len(moves),
            compute_time_ms=compute_time_ms,
            success=True
        )
```

---

### 6. Animation

代表單次層旋轉動畫的狀態。

**屬性**：
```typescript
interface Animation {
  id: string;
  move: Move;
  startTime: number;      // 動畫開始時間（timestamp）
  duration: number;       // 持續時間（ms, 150-300）
  progress: number;       // 0-1 之間的進度
  isComplete: boolean;
}
```

**動畫管理器**：
```typescript
class AnimationQueue {
  private queue: Animation[] = [];
  private current: Animation | null = null;
  
  enqueue(move: Move, duration: number = 200) {
    const animation: Animation = {
      id: crypto.randomUUID(),
      move,
      startTime: 0,  // 設置於開始時
      duration,
      progress: 0,
      isComplete: false,
    };
    this.queue.push(animation);
  }
  
  update(timestamp: number): Animation | null {
    if (!this.current && this.queue.length > 0) {
      this.current = this.queue.shift()!;
      this.current.startTime = timestamp;
    }
    
    if (this.current) {
      const elapsed = timestamp - this.current.startTime;
      this.current.progress = Math.min(elapsed / this.current.duration, 1);
      
      if (this.current.progress >= 1) {
        this.current.isComplete = true;
        const completed = this.current;
        this.current = null;
        return completed;
      }
    }
    
    return this.current;
  }
}
```

---

## 關係圖

```
CubeState ──┬── applies ──> Move
            │
            └── generates ──> Scramble ──> Database (scrambles table)
                                │
                                ├── solves via ──> Solver (interface)
                                │                    ├── AlgorithmSolver
                                │                    └── SLMSolver
                                │
                                └── produces ──> Solution ──> Database (solutions table)

Animation ──> animates ──> Move
```

---

## 類型安全保證

### TypeScript
- 使用 `readonly` 確保不可變性
- 使用字面量類型 (`'algorithm' | 'slm'`) 防止無效值
- 使用品牌類型（branded types）區分不同字串用途

### Python
- 使用 `@dataclass(frozen=True)` 確保不可變性
- 使用 Pydantic models 進行運行時驗證
- 使用 typing 模組的 `Literal` 類型

---

## 數據流

### 1. 打亂流程
```
用戶點擊「重新打亂」
  → 生成 seed (UUID)
  → generateScramble(seed)
  → 返回 Scramble
  → 應用 moves 到 CubeState
  → 更新 UI
  → 可選：保存到 Database
```

### 2. 演算法求解流程
```
用戶點擊「開始解題」（演算法模式）
  → 獲取當前 CubeState
  → AlgorithmSolver.solve(cubeState)
  → POST /api/solve { facelets: string }
  → 後端：KociembaSolver.solve()
  → 返回 Solution
  → AnimationQueue.enqueue(solution.moves)
  → 逐步動畫播放
  → 驗證最終狀態 isSolved
```

### 3. SLM 求解流程
```
用戶切換到「SLM 版本」
  → SLMSolver.loadModel() (首次)
  → 用戶點擊「開始解題」
  → SLMSolver.solve(cubeState)
  → ONNX Runtime 推理
  → 解析輸出為 Move[]
  → 驗證每個 Move 合法性
  → 如果失敗：降級到 AlgorithmSolver
  → 返回 Solution
  → AnimationQueue.enqueue(solution.moves)
```

---

## 驗證規則總結

| 實體 | 驗證規則 |
|------|---------|
| CubeState | - facelets 長度 = 54<br>- 各顏色恰好 9 個<br>- 配置合法（無浮動塊） |
| Move | - face 必須為 U/D/L/R/F/B<br>- direction 必須為 1/-1/2 |
| Scramble | - moveCount 固定為 25<br>- seed 唯一 |
| Solution | - solverType 為 'algorithm' 或 'slm'<br>- 如果 success=false，必須有 errorMessage |
| Animation | - duration 在 150-300ms 範圍<br>- progress 在 0-1 範圍 |

---

## 下一步

- 生成 API contracts（OpenAPI 規範）
- 實作 TypeScript models 於 frontend/src/lib/cube/
- 實作 Python models 於 backend/src/models/
- 編寫單元測試驗證所有驗證規則

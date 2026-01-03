---

description: "功能實作的任務清單模板"
---

# 任務清單：[功能名稱]

**輸入**：來自 `/specs/[###-feature-name]/` 的設計文檔
**前置條件**：plan.md（必需）、spec.md（用戶故事必需）、research.md、data-model.md、contracts/

**測試**：根據憲章原則二（測試標準 - 不可妥協），測試是強制性的，必須在實作之前首先編寫。下面的所有任務都包含測試任務，這些任務必須在相應的實作任務之前完成。

**組織**：任務按用戶故事分組，以實現每個故事的獨立實作和測試。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可並行運行（不同檔案，無依賴）
- **[Story]**：此任務屬於哪個用戶故事（例如：US1、US2、US3）
- 在描述中包含確切的檔案路徑

## 路徑慣例

- **單一專案**：儲存庫根目錄的 `src/`、`tests/`
- **網頁應用**：`backend/src/`、`frontend/src/`
- **行動應用**：`api/src/`、`ios/src/` 或 `android/src/`
- 下面顯示的路徑假設為單一專案 - 根據 plan.md 結構調整

<!-- 
  ============================================================================
  重要：下面的任務僅為範例任務，僅供說明之用。
  
  /speckit.tasks 命令必須根據以下內容用實際任務替換這些任務：
  - 來自 spec.md 的用戶故事（及其優先級 P1、P2、P3...）
  - 來自 plan.md 的功能需求
  - 來自 data-model.md 的實體
  - 來自 contracts/ 的端點
  
  任務必須按用戶故事組織，以便每個故事可以：
  - 獨立實作
  - 獨立測試
  - 作為 MVP 增量交付
  
  請勿在生成的 tasks.md 檔案中保留這些範例任務。
  ============================================================================
-->

## 第 1 階段：設置（共享基礎設施）

**目的**：專案初始化和基本結構

- [ ] T001 根據實作計劃建立專案結構
- [ ] T002 使用 [框架] 依賴項初始化 [語言] 專案
- [ ] T003 [P] 配置 linting 和格式化工具

---

## 第 2 階段：基礎（阻塞性前置條件）

**目的**：必須在任何用戶故事實作之前完成的核心基礎設施

**⚠️ 關鍵**：在此階段完成之前，不能開始任何用戶故事工作

基礎任務範例（根據您的專案調整）：

- [ ] T004 設置資料庫架構和遷移框架
- [ ] T005 [P] 實作身份驗證/授權框架
- [ ] T006 [P] 設置 API 路由和中介軟體結構
- [ ] T007 建立所有故事依賴的基礎模型/實體
- [ ] T008 配置錯誤處理和日誌記錄基礎設施
- [ ] T009 設置環境配置管理

**檢查點**：基礎已就緒 - 用戶故事實作現在可以開始並行進行

---

## 第 3 階段：用戶故事 1 - [標題]（優先級：P1）🎯 MVP

**目標**：[簡要描述此故事提供的內容]

**獨立測試**：[如何單獨驗證此故事有效]

### 用戶故事 1 的測試（憲章規定為強制性）✅

> **憲章原則二：首先編寫這些測試，確保在實作前失敗**

- [ ] T010 [P] [US1] tests/contract/test_[name].py 中 [端點] 的契約測試
- [ ] T011 [P] [US1] tests/integration/test_[name].py 中 [用戶旅程] 的整合測試
- [ ] T012 [P] [US1] tests/unit/test_[name].py 中 [元件] 的單元測試（≥80% 覆蓋率）

### 用戶故事 1 的實作

> **前置條件**：必須編寫測試 T010-T012 且失敗後才能開始實作

- [ ] T013 [P] [US1] 在 src/models/[entity1].py 中建立 [Entity1] 模型
- [ ] T014 [P] [US1] 在 src/models/[entity2].py 中建立 [Entity2] 模型
- [ ] T015 [US1] 在 src/services/[service].py 中實作 [Service]（依賴於 T013、T014）
- [ ] T016 [US1] 在 src/[location]/[file].py 中實作 [端點/功能]
- [ ] T017 [US1] 添加驗證和錯誤處理（憲章：清晰的錯誤訊息）
- [ ] T018 [US1] 添加日誌記錄和文檔（憲章：記錄公共 API）
- [ ] T019 [US1] 代碼審查和 linting 驗證（憲章：零警告）
- [ ] T020 [US1] 性能驗證（憲章：驗證基準達標）

**檢查點**：此時，用戶故事 1 應該完全可用、經過測試（≥80% 覆蓋率）並獨立驗證

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY per Constitution) ✅

> **CONSTITUTION PRINCIPLE II: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T022 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py
- [ ] T023 [P] [US2] Unit tests for [component] in tests/unit/test_[name].py (≥80% coverage)

### Implementation for User Story 2

> **Prerequisites**: Tests T021-T023 MUST be written and FAILING before starting implementation

- [ ] T024 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T025 [US2] Implement [Service] in src/services/[service].py
- [ ] T026 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T027 [US2] Integrate with User Story 1 components (if needed)
- [ ] T028 [US2] Add validation, error handling, and documentation
- [ ] T029 [US2] Code review and linting verification
- [ ] T030 [US2] Performance validation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently with full test coverage

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY per Constitution) ✅

> **CONSTITUTION PRINCIPLE II: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T032 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py
- [ ] T033 [P] [US3] Unit tests for [component] in tests/unit/test_[name].py (≥80% coverage)

### Implementation for User Story 3

> **Prerequisites**: Tests T031-T033 MUST be written and FAILING before starting implementation

- [ ] T034 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T035 [US3] Implement [Service] in src/services/[service].py
- [ ] T036 [US3] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T037 [US3] Add validation, error handling, and documentation
- [ ] T038 [US3] Code review and linting verification
- [ ] T039 [US3] Performance validation

**Checkpoint**: All user stories should now be independently functional with complete test coverage

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality verification

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring (Constitution: DRY, single responsibility)
- [ ] TXXX Performance optimization across all stories (Constitution: verify 60 FPS, <10ms, etc.)
- [ ] TXXX Final test coverage verification (Constitution: ≥80% unit, 100% integration)
- [ ] TXXX Security hardening and edge case validation
- [ ] TXXX Accessibility verification (Constitution: keyboard navigation)
- [ ] TXXX Final code review and linting verification (Constitution: zero warnings)
- [ ] TXXX Run quickstart.md validation
- [ ] TXXX Constitution compliance audit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution Principle II - NON-NEGOTIABLE)
- Models before services
- Services before endpoints
- Core implementation before integration
- Code review and linting before story completion
- Performance validation before story completion
- Story complete (with ≥80% test coverage) before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (MANDATORY per Constitution):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"
Task: "Unit tests for [component] in tests/unit/test_[name].py"

# After tests are written and FAILING, launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Constitution Principle II**: Tests MUST be written first and MUST fail before implementing
- **Constitution Principle I**: Code MUST pass linting with zero warnings
- **Constitution Principle IV**: Verify performance benchmarks after implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

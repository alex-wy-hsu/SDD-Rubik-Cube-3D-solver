<!--
SYNC IMPACT REPORT
==================
Version Change: N/A → 1.0.0
Initial constitution ratification establishing four core principles.

Modified Principles: N/A (Initial version)

Added Sections:
- Core Principles (4 principles: Code Quality, Testing Standards, UX Consistency, Performance)
- Development Standards
- Governance

Removed Sections: N/A (Initial version)

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section aligned with new principles
✅ spec-template.md - Requirements section aligned with quality/performance standards
✅ tasks-template.md - Task categorization reflects test-first and quality principles
✅ checklist-template.md - No changes required (generic template)
✅ agent-file-template.md - No changes required (auto-generated)

Follow-up TODOs: None
-->

# SDD Rubik Cube 3D Solver Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

Code MUST be maintainable, readable, and follow established patterns:

- **Single Responsibility**: Each module, class, and function MUST have one clear purpose
- **DRY Principle**: Code duplication MUST be eliminated; shared logic extracted to reusable
  components
- **Naming Conventions**: Names MUST be descriptive and consistent; avoid abbreviations unless
  domain-standard (e.g., RGB, HTTP)
- **Documentation**: Public APIs, complex algorithms, and non-obvious logic MUST include inline
  documentation
- **Code Reviews**: All code changes MUST be reviewed by at least one other developer before merge
- **Linting**: Code MUST pass automated linting checks with zero warnings; configuration defined
  in repository

**Rationale**: High code quality reduces technical debt, improves team velocity, and enables
confident refactoring. The Rubik's Cube solver involves complex algorithms that require clear,
maintainable code to ensure correctness and extensibility.

### II. Testing Standards (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory; comprehensive test coverage is required:

- **Test-First**: Tests MUST be written before implementation code; tests must fail initially
- **Red-Green-Refactor**: Strictly enforce the TDD cycle: write failing test → implement minimum
  code to pass → refactor
- **Coverage Requirements**:
  - Unit tests: 80% minimum coverage for all modules
  - Integration tests: All public APIs and user scenarios must be tested
  - Contract tests: All external interfaces (if any) must have contract validation
- **Test Organization**: Tests MUST be organized by type (unit, integration, contract) in separate
  directories
- **Test Independence**: Each test MUST be independently runnable and not depend on execution order
- **Edge Cases**: Tests MUST cover boundary conditions, error states, and invalid inputs

**Rationale**: The Rubik's Cube solver has complex state management and algorithmic logic with many
edge cases. TDD ensures correctness, prevents regressions, and provides living documentation of
expected behavior.

### III. User Experience Consistency

User interactions MUST be intuitive, predictable, and consistent:

- **Visual Consistency**: 3D rendering MUST use consistent colors, orientation, and perspective
  conventions
- **Cube Notation**: MUST follow standard Rubik's Cube notation (Singmaster notation) for moves
  and algorithms
- **Interaction Patterns**: User inputs (mouse, keyboard, touch) MUST behave consistently across
  all features
- **Feedback**: User actions MUST provide immediate visual or textual feedback; no silent failures
- **Error Messages**: Error messages MUST be clear, actionable, and user-friendly (not technical
  stack traces)
- **Performance Perception**: Operations MUST feel responsive; use loading indicators for operations
  >200ms
- **Accessibility**: UI MUST be usable with keyboard navigation; provide alternative text for visual
  elements

**Rationale**: A 3D cube solver is inherently visual and interactive. Consistent UX reduces learning
curve and frustration, making the tool accessible to both beginners and speedcubers.

### IV. Performance Requirements

The application MUST meet quantifiable performance benchmarks:

- **Rendering Performance**:
  - 3D cube rendering MUST maintain 60 FPS during animations and rotations
  - Frame drops below 30 FPS are unacceptable
- **Algorithm Performance**:
  - Cube state validation MUST complete in <10ms
  - Solution generation for solvable states MUST complete in <5 seconds for optimal solutions
  - Scramble generation MUST complete in <100ms
- **Memory Constraints**:
  - Application memory footprint MUST stay below 200MB during normal operation
  - No memory leaks; long-running sessions must maintain stable memory usage
- **Load Time**:
  - Initial application load MUST complete in <3 seconds
  - Feature initialization MUST complete in <500ms
- **Scalability**:
  - Must support cube states up to 100 moves deep without performance degradation
  - Must handle rapid user inputs (>10 moves/second) without dropping frames

**Rationale**: Performance directly impacts user satisfaction and utility. Slow rendering creates
a frustrating experience, while slow solving defeats the purpose of an automated solver.
Performance benchmarks ensure the tool remains practical and competitive.

## Development Standards

### Spec-Driven Development (SDD)

All features MUST follow the SDD workflow:

1. **Specification First**: Create detailed spec with user stories, requirements, and acceptance
   criteria
2. **Planning**: Define technical approach, architecture, and task breakdown
3. **Test-First**: Write tests for each user story before implementation
4. **Incremental Implementation**: Build features story-by-story, validating independence
5. **Validation**: Verify each story works independently before proceeding

### Quality Gates

Before merging any code:

- [ ] All tests pass (unit, integration, contract as applicable)
- [ ] Code coverage meets thresholds (80% unit, 100% integration for user stories)
- [ ] Linting passes with zero warnings
- [ ] Code review approved by at least one reviewer
- [ ] Performance benchmarks met (if applicable to change)
- [ ] Documentation updated (README, inline docs, specs)
- [ ] Constitution compliance verified

### Commit Standards

- Commits MUST follow Conventional Commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `chore`
- Commits MUST be atomic and focused; one logical change per commit
- Commit messages MUST reference related spec/task numbers when applicable

## Governance

### Authority

This constitution supersedes all other development practices and conventions. Any conflicts between
this document and other guidelines must be resolved in favor of the constitution.

### Amendment Process

1. Proposed amendments MUST be documented in a separate proposal document
2. Amendments require review and approval by project maintainers
3. Version must be incremented per semantic versioning:
   - **MAJOR**: Backward incompatible changes (removing/redefining principles)
   - **MINOR**: Adding new principles or sections
   - **PATCH**: Clarifications, wording improvements, typo fixes
4. Amendments take effect immediately upon ratification
5. After amendment, dependent templates and docs MUST be updated within 1 week

### Compliance Review

- All code reviews MUST explicitly verify constitution compliance
- Violations MUST be justified and documented in complexity tracking
- Repeated violations without justification are grounds for code rejection

### Complexity Justification

If a feature requires violating constitution principles, it MUST:

- Document the specific violation
- Explain why the violation is necessary
- Describe what simpler alternatives were rejected and why
- Include this justification in the feature plan

### Enforcement

Constitution compliance is enforced through:

- Automated checks (linting, test coverage, performance benchmarks)
- Manual code review verification
- Pre-merge quality gates
- CI/CD pipeline integration

**Version**: 1.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03

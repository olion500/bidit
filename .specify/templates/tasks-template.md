---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile App (Bidit)**: `app/`, `components/`, `hooks/`, `constants/` at repository root
- **Backend API (if needed)**: `api/src/`
- Paths shown below use Bidit's Expo/React Native structure - adjust based on plan.md if needed

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Expo project structure per implementation plan (app/, components/, hooks/, constants/)
- [ ] T002 Install dependencies via `npx expo install <packages>` per plan.md
- [ ] T003 [P] Verify TypeScript strict mode and ESLint configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your mobile app):

- [ ] T004 Setup navigation structure in app/ (Expo Router layouts, tabs)
- [ ] T005 [P] Configure theme system (constants/Colors.ts, useThemeColor hook)
- [ ] T006 [P] Create base UI components in components/ui/ (buttons, inputs, etc.)
- [ ] T007 Setup data storage (expo-sqlite, AsyncStorage, or API client)
- [ ] T008 Configure error boundaries and error handling
- [ ] T009 [P] Setup authentication flow (if required by feature)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Write integration test for [user journey] (if tests requested)
- [ ] T011 [P] [US1] Write component tests for [feature components] (if tests requested)

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create screen component in app/[screen-name].tsx with Expo Router
- [ ] T013 [P] [US1] Create feature components in components/[feature]/
- [ ] T014 [P] [US1] Create custom hooks in hooks/use[FeatureName].ts (if needed)
- [ ] T015 [US1] Implement data layer (API client, SQLite queries, or state management)
- [ ] T016 [US1] Add theme support and dark mode compatibility
- [ ] T017 [US1] Add testID props to interactive components
- [ ] T018 [US1] Add error handling and loading states

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T019 [P] [US2] Write integration test for [user journey] (if tests requested)
- [ ] T020 [P] [US2] Write component tests for [feature components] (if tests requested)

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create screen component in app/[screen-name].tsx
- [ ] T022 [P] [US2] Create feature components in components/[feature]/
- [ ] T023 [US2] Implement data layer and business logic
- [ ] T024 [US2] Add theme support, testID props, and error handling
- [ ] T025 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T026 [P] [US3] Write integration test for [user journey] (if tests requested)
- [ ] T027 [P] [US3] Write component tests for [feature components] (if tests requested)

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create screen component in app/[screen-name].tsx
- [ ] T029 [P] [US3] Create feature components in components/[feature]/
- [ ] T030 [US3] Implement data layer and business logic
- [ ] T031 [US3] Add theme support, testID props, and error handling

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update documentation (README.md, feature docs)
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization (bundle size, animation smoothness)
- [ ] TXXX [P] Accessibility improvements (screen reader labels, contrast)
- [ ] TXXX Test on both iOS and Android devices
- [ ] TXXX [P] Run `npx expo doctor` and fix any issues
- [ ] TXXX Verify theme switching (light/dark mode) works across all screens

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

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

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
# Launch all tests for User Story 1 together (if tests requested):
Task: "Write integration test for [user journey]"
Task: "Write component tests for [feature components]"

# Launch all components for User Story 1 together:
Task: "Create screen component in app/[screen-name].tsx"
Task: "Create feature components in components/[feature]/"
Task: "Create custom hooks in hooks/use[FeatureName].ts"
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
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

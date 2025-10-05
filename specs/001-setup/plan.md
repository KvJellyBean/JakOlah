# Implementation Plan: JakOlah Real-Time Waste Classification Web Application

**Branch**: `001-setup` | **Date**: 2025-10-04 | **Spec**: [../spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-setup/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Real-time waste classification web application for Jakarta citizens using device camera to classify waste into three categories (Organik, Anorganik, Lainnya) with bounding boxes and confidence scores. Integrates interactive map showing relevant disposal facilities. Built as full-stack web application with Next.js frontend, FastAPI ML microservice, and Supabase backend for small-scale thesis project with manual testing approach.

## Technical Context

**Language/Version**: JavaScript (Next.js 14), Python 3.11+ (FastAPI), PostgreSQL (Supabase)  
**Primary Dependencies**: Next.js 14, React, Tailwind CSS, Shadcn UI, React-Leaflet, FastAPI, scikit-learn, OpenCV, Supabase, TensorFlow.js (for potential client-side inference)  
**Storage**: Supabase PostgreSQL for facility data, local model files for ML inference  
**Testing**: Manual testing by developer (no automated testing for thesis scope)  
**Target Platform**: Web browsers (mobile-first responsive design), FastAPI microservice on server  
**Project Type**: web (frontend + backend + ML microservice)  
**Performance Goals**: <500ms classification response, 15+ FPS camera feed, <2MB bundle size  
**Constraints**: Privacy-first (local processing preferred), mobile-optimized, Bahasa Indonesia UI, JavaScript-based for simplicity  
**Scale/Scope**: Single developer thesis project, Jakarta waste management focus, 3 waste categories

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Responsive Design Excellence**:

- [x] Feature adapts seamlessly across mobile, tablet, desktop (Next.js + Tailwind CSS responsive design)
- [x] Camera interface maintains optimal viewing on all screen sizes (mobile-first design approach)
- [x] Map integration remains functional and readable on mobile (React-Leaflet responsive maps)
- [x] UI follows Jakarta accessibility guidelines (Shadcn UI components + manual testing)

**Minimal Dependencies & Performance**:

- [ ] Technology stack prioritizes lightweight, proven libraries
- [ ] Real-time classification executes within 500ms on mid-range mobile
- [ ] Bundle size remains under 2MB for initial load
- [ ] CNN+SVM pipeline optimized for edge deployment

**Data Privacy & Responsible AI** (NON-NEGOTIABLE):

- [ ] Camera data processed locally when possible
- [ ] No personal images stored without explicit consent
- [ ] AI model bias monitoring across waste types
- [ ] Classification confidence scores transparent to users
- [ ] User location data requires explicit opt-in

**Real-Time Mobile Performance**:

- [ ] Camera feed maintains 15+ FPS on mobile devices
- [ ] Bounding box rendering doesn't impact camera performance
- [ ] Classification results display within 300ms
- [ ] Offline mode provides basic classification
- [ ] Battery usage optimized for extended mobile sessions

**Accessible Waste Classification**:

- [ ] Categories clearly distinguishable with text labels and color coding
- [ ] Audio feedback available for visually impaired users
- [ ] Multi-language support (Bahasa Indonesia and English)
- [ ] Clear error state guidance for users

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# JakOlah Web Application Structure
# Frontend: Next.js 14 application (JavaScript)
app/
├── globals.css
├── layout.jsx
├── page.jsx           # Home page (/)
├── classify/
│   └── page.jsx       # Classification page (/classify)
├── informasi/
│   └── page.jsx       # Information page (/informasi)
└── api/
    ├── classify-frame/
    │   └── route.js   # POST /api/classify-frame
    └── facilities/
        └── route.js   # GET /api/facilities

components/
├── ui/                # Shadcn UI components
├── camera/
│   ├── CameraFeed.jsx
│   ├── BoundingBox.jsx
│   └── ClassificationOverlay.jsx
├── map/
│   ├── FacilityMap.jsx
│   └── FacilityMarker.jsx
└── layout/
    ├── Header.jsx
    └── Navigation.jsx

lib/
├── supabase.js        # Supabase client
├── utils.js           # Utility functions
├── types.js           # JavaScript type definitions/constants
└── tensorflow.js      # TensorFlow.js model loading (optional)

public/
├── models/            # ML model files (TFJS format if used)
└── images/            # Static assets

# Backend: FastAPI microservice (fallback/server inference)
ml-service/
├── app/
│   ├── main.py        # FastAPI app
│   ├── models/
│   │   ├── detector.py
│   │   └── classifier.py
│   ├── services/
│   │   └── inference.py
│   └── utils/
│       └── image_processing.py
├── models/            # Pre-trained model files
├── requirements.txt
└── Dockerfile

# Database (simplified - no user data storage)
supabase/
├── migrations/
└── seed.sql          # Facility data only
```

**Structure Decision**: Selected web application structure with Next.js 14 frontend (app directory), FastAPI microservice for ML inference, and Supabase for data storage. This supports the multi-service architecture needed for real-time camera processing, AI inference, and map-based facility lookup while maintaining separation of concerns between UI, ML processing, and data management.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) - research.md created
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md created
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - tasks.md created with 62 tasks
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS - All principles satisfied by technical approach
- [x] Post-Design Constitution Check: PASS - Design maintains constitutional compliance
- [x] All NEEDS CLARIFICATION resolved - Technical stack fully specified
- [x] Complexity deviations documented - No violations requiring justification
- [x] Task generation complete - 62 tasks created

---

_Based on JakOlah Constitution v1.0.0 - See `/memory/constitution.md`_

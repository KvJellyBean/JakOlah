# Implementation Plan: Jakarta Waste Classification Web Application

**Branch**: `001-initial-setup` | **Date**: 2025-09-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-initial-setup/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
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

JakOlah is a comprehensive waste classification web application for Jakarta households that enables users to upload images of waste items and receive instant AI-powered classification (Organik, Anorganik, Lainnya) with confidence scores. The system provides disposal recommendations, facility mapping, user account management, and admin analytics. Technical approach combines Next.js frontend with Supabase backend and a FastAPI microservice for CNN+SVM machine learning inference.

## Technical Context

**Language/Version**: TypeScript (Next.js 14), Python 3.11+ (FastAPI microservice)  
**Primary Dependencies**: Next.js 14, Supabase (Auth/DB/Storage), Tailwind CSS, Shadcn UI, React-Leaflet, FastAPI, CNN+SVM ML pipeline  
**Storage**: Supabase Postgres database, Supabase Storage for images  
**Testing**: Manual testing approach - no automated test suites for this phase  
**Target Platform**: Web browsers (mobile-first responsive design), FastAPI microservice on cloud hosting
**Project Type**: web - determines source structure (frontend + backend + microservice)  
**Performance Goals**: <3 second image classification, <50MB model size, responsive UI across 320px-2560px  
**Constraints**: Mobile-first design, WCAG 2.1 AA compliance, ≤10MB image uploads, Indonesian language primary  
**Scale/Scope**: Jakarta households target audience, role-based access (user/admin), real-time classification with facility mapping

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**I. Mobile-First Responsive Design**: ✅ PASS - Next.js 14 with Tailwind CSS provides responsive design, UI mockups show mobile/desktop versions, progressive enhancement approach planned

**II. Minimal Dependencies & Lightweight Architecture**: ✅ PASS - Limited to essential dependencies (Next.js, Supabase, Tailwind, React-Leaflet), CNN model optimized <50MB, bundle monitoring with Next.js built-in optimization

**III. Data Privacy & User Control**: ✅ PASS - Supabase RLS enforces data isolation, user data deletion capability (FR-014), explicit consent for data processing, images stored securely in Supabase Storage

**IV. Real-Time Performance Standards**: ✅ PASS - 3-second classification target (FR-004), FastAPI async for performance, progressive loading planned, Next.js SSR/RSC for optimal loading

**V. Technical Excellence & Reliability**: ⚠️ PARTIAL - CNN-SVM pipeline planned for >90% accuracy, comprehensive error handling planned, but automated testing deferred to manual testing approach

**AI Ethics & Responsible Development**: ✅ PASS - Confidence score display (FR-003), low confidence warnings (FR-003a), model limitations disclosed to users

**Accessibility & Inclusivity**: ✅ PASS - WCAG 2.1 AA compliance required, Indonesian language primary (FR-017), Tailwind CSS supports accessibility features

**Development Workflow**: ⚠️ PARTIAL - Manual testing approach deviates from TDD requirement, but justified for this development phase

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

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2: Web application - Frontend (Next.js) + Backend (Supabase + FastAPI microservice)

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

### Task Generation Methodology

When the user runs `/tasks`, the system will generate specific implementation tasks based on this comprehensive foundation. The task generation approach will follow these principles:

#### 1. Constitutional-First Task Structuring

- Each task will be prefaced with applicable constitutional compliance requirements
- Mobile-first design considerations embedded in all UI-related tasks
- Data privacy controls integrated into data handling tasks
- Performance benchmarks included in processing-related tasks

#### 2. Dependency-Ordered Task Sequencing

**Phase A: Infrastructure Foundation**

- Supabase project setup and configuration
- Database schema implementation with RLS policies
- Authentication system integration
- File storage configuration for user images

**Phase B: Core Backend Services**

- API route implementation following contract specifications
- ML service FastAPI development and deployment
- Database migration scripts and seed data
- Error handling and logging infrastructure

**Phase C: Frontend Development**

- Next.js project structure and configuration
- Component library setup (Shadcn UI + Tailwind)
- Authentication flow implementation
- Classification workflow UI development

**Phase D: Integration and Features**

- ML service integration with confidence handling
- Interactive mapping with facility discovery
- User profile management and data deletion
- Admin dashboard with analytics

**Phase E: Quality Assurance**

- Quickstart scenario automation
- Performance optimization and monitoring
- Accessibility compliance validation
- Mobile responsiveness testing

#### 3. Task Granularity Strategy

- **Atomic Tasks**: Each task produces deployable, testable outcome
- **Constitutional Gates**: Explicit compliance verification steps
- **Performance Checkpoints**: Measurement and validation stages
- **User Validation**: Quickstart scenario verification integrated

#### 4. Risk Mitigation Integration

Tasks will include built-in risk mitigation for identified constraints:

- **ML Service Reliability**: Fallback UI states and retry mechanisms
- **Map Service Dependencies**: Alternative content strategies
- **Mobile Performance**: Bundle size monitoring and optimization steps
- **Data Privacy**: Audit trail implementation and testing

#### 5. Quality Standards Enforcement

Every task will specify:

- **Acceptance Criteria**: Functional requirement mapping
- **Constitutional Compliance**: Specific principle adherence
- **Performance Targets**: Measurable success metrics
- **Testing Requirements**: Validation approach and tools

### Task Template Structure

Each generated task will follow this format:

```
## Task: [Feature/Component Name]
**Constitutional Principles**: [Applicable principles]
**Functional Requirements**: [FR-XXX references]
**Dependencies**: [Previous tasks required]
**Deliverables**: [Specific outcomes]
**Acceptance Criteria**: [Success conditions]
**Performance Impact**: [Metrics to measure]
**Testing Approach**: [Validation method]
```

### Implementation Readiness

This planning phase establishes complete readiness for task execution:

- ✅ Technical architecture defined with technology stack locked
- ✅ API contracts specify all endpoint requirements
- ✅ Database schema provides complete data model
- ✅ Constitutional constraints clearly documented
- ✅ Functional requirements validated through clarification
- ✅ Performance targets established with measurement criteria
- ✅ Quality assurance approach defined with quickstart scenarios

**Estimated Output**: The `/tasks` command will generate approximately 25-30 specific implementation tasks organized across the five phases, each designed to produce measurable progress toward a constitutional-compliant, performant Jakarta waste classification application.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                          | Why Needed                                                 | Simpler Alternative Rejected Because                                              |
| ---------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Manual testing approach vs TDD     | Early prototype/MVP phase requires rapid iteration         | Full automated test suite would slow initial development and user feedback cycles |
| Partial automated testing coverage | Resource constraints for comprehensive test implementation | Manual testing allows focus on core functionality validation and user experience  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

**Deliverables Completed**:

- [x] constitution.md (v1.0.0)
- [x] spec.md with user clarifications
- [x] research.md with technical decisions
- [x] data-model.md with complete schema
- [x] API contracts (6 files in /contracts/)
- [x] quickstart.md with validation scenarios
- [x] agent-context.md with development guidelines
- [x] Task planning approach documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_

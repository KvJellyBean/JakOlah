# Tasks: JakOlah Real-Time Waste Classification

**Input**: Design documents from `/specs/001-setup/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Tech stack: JavaScript (Next.js 14), FastAPI, Supabase PostgreSQL
   → Structure: Web app with frontend + ML microservice + database
2. Load design documents:
   → data-model.md: WasteItem, Classification, DisposalFacility entities
   → contracts/: classify-frame.md, facilities.md API endpoints
   → quickstart.md: Development workflow and verification steps
3. Generate tasks by user-specified priority:
   → Setup: Project initialization and dependencies
   → Interface: Camera integration and UI components
   → Backend: ML service and API functionality
   → Testing: Manual testing with documented checklist
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Manual testing approach with documentation
5. Number tasks sequentially (T001, T002...)
   → Total: 62 tasks (removed TensorFlow.js and Polish phases)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Project Setup & Dependencies

- [x] **T001** Initialize Next.js 14 project with TypeScript disabled in `package.json`
- [x] **T002** [P] Install and configure Tailwind CSS in `tailwind.config.js`
- [x] **T003** [P] Install and setup Shadcn UI components in `components/ui/`
- [x] **T004** [P] Install React-Leaflet for map functionality in `package.json`
- [x] **T005** [P] Setup Supabase client configuration in `lib/supabase.js`
- [x] **T006** Create project directory structure per plan.md layout
- [x] **T007** [P] Configure ESLint and Prettier for JavaScript code style
- [x] **T008** [P] Setup environment variables template in `.env.example`

## Phase 3.2: Database & Backend Foundation

- [x] **T009** [P] Create Supabase database schema from data-model.md in `supabase/migrations/001_initial_schema.sql`
- [x] **T010** [P] Create facility seed data in `supabase/seed.sql` with Jakarta waste facilities
- [x] **T011** [P] Setup FastAPI project structure in `ml-service/` directory
- [x] **T012** [P] Create basic FastAPI app configuration in `ml-service/app/main.py`
- [x] **T013** [P] Install ML dependencies in `ml-service/requirements.txt`
- [x] **T014** Create API route handlers in `app/api/facilities/route.js` per facilities.md contract
- [x] **T015** Create API route handlers in `app/api/classify-frame/route.js` per classify-frame.md contract

## Phase 3.3: Core UI Components & Interface

- [x] **T016** [P] Create basic layout components in `components/layout/Header.jsx`
- [x] **T017** [P] Create navigation component in `components/layout/Navigation.jsx`
- [x] **T018** [P] Create home page layout in `app/page.jsx`
- [x] **T019** [P] Create classification page layout in `app/classify/page.jsx`
- [x] **T020** [P] Create information page layout in `app/informasi/page.jsx`
- [x] **T021** [P] Setup global styles and responsive design in `app/globals.css`
- [x] **T022** [P] Create utility functions in `lib/utils.js`
- [x] **T023** [P] Create constants and type definitions in `lib/types.js`

## Phase 3.4: Camera Integration & Real-time Processing

- [x] **T024** Create camera feed component in `components/classify/live-camera-view.jsx`
- [x] **T025** [P] Create bounding box overlay component in `components/classify/bounding-box-overlay.jsx`
- [x] **T026** [P] Create classification result overlay in `components/classify/classification-overlay.jsx`
- [x] **T027** Integrate camera permissions and stream handling in `live-camera-view.jsx`
- [x] **T028** Implement real-time frame capture and processing logic in `live-camera-view.jsx`
- [x] **T029** [P] Add camera error handling and fallback states in `live-camera-view.jsx`
- [x] **T030** [P] Optimize camera performance for mobile devices in `live-camera-view.jsx`

## Phase 3.5: Map Integration & Facility Display

- [x] **T031** [P] Create facility map component in `components/map/FacilityMap.jsx`
- [x] **T032** [P] Create facility marker component in `components/map/FacilityMarker.jsx`
- [x] **T033** Integrate map with facilities API in `FacilityMap.jsx`
- [x] **T034** [P] Add geolocation functionality for user position
- [x] **T035** [P] Implement facility filtering by waste category
- [x] **T036** [P] Add distance calculation and sorting
- [x] **T037** [P] Create facility detail popup/modal component

## Phase 3.6: Backend ML Service Implementation

- [x] **T038** [P] Create ML model wrapper classes in `ml-service/app/models/detector.py`
- [x] **T039** [P] Create classification service in `ml-service/app/models/classifier.py`
- [x] **T040** [P] Create image processing utilities in `ml-service/app/utils/image_processing.py`
- [x] **T041** Create inference service logic in `ml-service/app/services/inference.py`
- [x] **T042** Implement classification endpoint logic in FastAPI
- [x] **T043** [P] Add error handling and validation for ML service
- [x] **T044** [P] Setup model loading and caching in ML service
- [x] **T045** [P] Add request/response logging for ML endpoints

## Phase 3.7: API Integration & Data Flow

- [ ] **T046** Connect frontend classification page to classify-frame API
- [ ] **T047** Connect map component to facilities API
- [ ] **T048** [P] Implement client-side image processing for API calls
- [ ] **T049** [P] Add loading states and progress indicators
- [ ] **T050** [P] Implement error handling for API failures
- [ ] **T051** [P] Add request rate limiting and retry logic
- [ ] **T052** [P] Setup session management for classifications

## Phase 3.8: Testing & Validation

- [ ] **T053** Create manual testing checklist file in `tests/manual-testing-checklist.md`
- [ ] **T054** [P] Test camera functionality on multiple mobile devices
- [ ] **T055** [P] Test API endpoints with various image formats and sizes
- [ ] **T056** [P] Validate database queries and facility data accuracy
- [ ] **T057** [P] Test responsive design across screen sizes
- [ ] **T058** [P] Validate map functionality and geolocation accuracy
- [ ] **T059** [P] Test classification accuracy with real waste samples
- [ ] **T060** [P] Performance testing for classification response times (<500ms)
- [ ] **T061** [P] Battery usage testing on mobile devices
- [ ] **T062** Document testing results and create bug tracking system

## Dependencies

### Critical Path

- T001-T008 (Setup) → T009-T015 (Backend) → T016-T023 (UI Foundation)
- T024-T030 (Camera) depends on T016-T023 (UI Foundation)
- T031-T037 (Map) depends on T014 (Facilities API) and T016-T023 (UI Foundation)
- T038-T045 (ML Service) depends on T011-T013 (FastAPI Setup)
- T046-T052 (Integration) depends on T024-T030 (Camera) and T038-T045 (ML Service)
- T053-T062 (Testing) depends on T046-T052 (Integration)

### Parallel Execution Groups

```
Group 1 - Setup:
Task: "Install and configure Tailwind CSS in tailwind.config.js"
Task: "Install and setup Shadcn UI components in components/ui/"
Task: "Install React-Leaflet for map functionality in package.json"
Task: "Setup Supabase client configuration in lib/supabase.js"
Task: "Configure ESLint and Prettier for JavaScript code style"
Task: "Setup environment variables template in .env.example"

Group 2 - Foundation:
Task: "Create Supabase database schema from data-model.md"
Task: "Create facility seed data with Jakarta waste facilities"
Task: "Setup FastAPI project structure in ml-service/"
Task: "Create basic FastAPI app configuration"
Task: "Install ML dependencies in requirements.txt"

Group 3 - UI Components:
Task: "Create basic layout components in components/layout/Header.jsx"
Task: "Create navigation component in components/layout/Navigation.jsx"
Task: "Create home page layout in app/page.jsx"
Task: "Create classification page layout in app/classify/page.jsx"
Task: "Create information page layout in app/informasi/page.jsx"
```

## Notes

- Focus on setup first (T001-T015), then UI/camera (T016-T030), then backend/ML (T031-T052)
- Manual testing approach as specified in plan.md - documented in testing checklist
- Mobile-first development approach throughout all phases
- Privacy-first: no user data storage, local processing when possible
- [P] tasks can be executed in parallel as they modify different files
- TensorFlow.js implementation removed for now - will be added later if needed
- Polish & optimization phase removed - will be addressed in future iterations

## Validation Checklist

- [x] All contracts have corresponding implementation tasks (T014, T015, T042, T046, T047)
- [x] All entities from data-model.md covered (facilities in T009-T010, runtime entities in T024-T028)
- [x] Setup tasks come before implementation (T001-T008 before others)
- [x] UI foundation before specific features (T016-T023 before T024-T037)
- [x] Backend setup before API integration (T038-T045 before T046-T052)
- [x] Testing phase covers all major functionality (T053-T062) with manual approach
- [x] Each task specifies exact file path or component
- [x] Parallel tasks truly independent (different files/components)
- [x] Follows user's priority: setup → interface/camera → backend/ML → testing
- [x] Removed optional TensorFlow.js phase per user request
- [x] Removed polish & optimization phase per user request

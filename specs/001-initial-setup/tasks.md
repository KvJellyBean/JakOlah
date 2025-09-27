# Tasks: Jakarta Waste Classification Web Application

**Input**: Design documents from `/specs/001-initial-setup/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Tech stack: Next.js 14, Supabase, FastAPI, Tailwind CSS, Shadcn UI
   → Structure: Web application (frontend + backend + microservice)
2. Load design documents ✅:
   → data-model.md: 5 entities (User, Classification, Waste_Category, Waste_Facility, Waste_Facility_Category)
   → contracts/: 6 API contract files covering authentication, classification, admin, user, facilities, ML service
   → quickstart.md: 7 validation scenarios for user acceptance testing
   → UI/: Existing Figma designs with mobile/desktop versions for 8 pages
3. Generate tasks by category ✅:
   → Setup: Project initialization, Supabase setup, dependencies
   → Tests: Contract tests for each API endpoint, integration tests for user scenarios
   → Core: Database schema, API routes, UI components following existing designs
   → Integration: Authentication flow, image processing, mapping features
   → Polish: Performance optimization, accessibility, mobile responsiveness
4. Apply constitutional principles ✅:
   → Mobile-first design following existing UI/Phone/ mockups
   → Data privacy controls in user management
   → Performance targets (<3s classification) in ML integration
   → WCAG 2.1 AA compliance in frontend components
5. Tasks ordered by dependencies with parallel opportunities marked [P]
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Constitutional compliance requirements included per task

## Path Conventions

Based on plan.md structure decision: **Web application**

```
frontend/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # UI components
│   ├── lib/          # Utilities
│   └── types/        # TypeScript definitions

ml-service/
├── src/
│   ├── models/       # ML model integration (your trained models)
│   ├── api/          # FastAPI endpoints
│   └── utils/        # Processing utilities

model-result/         # Your existing trained models
├── *.pkl             # Trained SVM models
└── *.ipynb           # Training notebooks

UI/                   # Existing design assets
├── Phone/            # Mobile mockups (Landing, Daftar, Masuk, etc.)
└── PC/               # Desktop mockups (Landing, Daftar, Masuk, etc.)

docs/
└── api/              # API documentation
```

## Phase 3.1: Infrastructure Setup

- [x] **T001** Create Next.js 14 project structure in `frontend/` with TypeScript, Tailwind CSS, and Shadcn UI

  - **Constitutional**: Mobile-first responsive design foundation
  - **Deliverables**: package.json, tsconfig.json, tailwind.config.js, next.config.js
  - **Performance**: Bundle optimization for mobile data usage

- [x] **T002** [P] Initialize Supabase project and configure local development environment

  - **Constitutional**: Data privacy controls with RLS setup
  - **Deliverables**: .env.local with Supabase keys, supabase/ folder configuration
  - **Security**: Environment variable protection for API keys

- [x] **T003** [P] Create FastAPI ML microservice structure in `ml-service/`

  - **Constitutional**: Performance optimization for <3 second classification
  - **Deliverables**: requirements.txt, main.py, Dockerfile for containerization
  - **Performance**: Async FastAPI setup for concurrent processing
  - **Models**: Integration with your existing trained models in model-result/

- [x] **T004** [P] Configure ESLint, Prettier, and TypeScript strict mode for code quality
  - **Constitutional**: Technical excellence standards
  - **Deliverables**: .eslintrc.js, .prettierrc, strict TypeScript configuration
  - **Quality**: Accessibility linting rules for WCAG 2.1 AA compliance

## Phase 3.2: Database & Schema Implementation

- [x] **T005** Create Supabase database schema with all 5 entities from data-model.md

  - **Constitutional**: Data privacy with Row-Level Security policies
  - **Deliverables**: `supabase/migrations/001_initial_schema.sql` (updated for production compatibility)
  - **Entities**: User, Classification, Waste_Category, Waste_Facility, Waste_Facility_Category
  - **Schema Updates**:
    1. Removed `education_content` from waste_categories (now generated dynamically)
    2. Made `address` optional and `city` default to 'Jakarta' for CSV import compatibility
    3. Users table correctly extends Supabase auth.users (email/password handled by Supabase Auth)
  - **Dependencies**: T002 (Supabase setup)

- [x] **T006** [P] Implement RLS policies for user data protection and admin access control

  - **Constitutional**: Complete user control over personal data (FR-014)
  - **Deliverables**: `supabase/migrations/002_rls_policies.sql`
  - **Security**: User isolation, admin read access, cascade deletion rules
  - **Dependencies**: T005 (schema created)

- [x] **T007** [P] Seed database with initial waste category data (Organik, Anorganik, Lainnya)

  - **Deliverables**: `supabase/seed.sql` with category definitions (education content now generated dynamically)
  - **Content**: Indonesian language disposal guidance for Jakarta context
  - **Updated**: Removed static education_content, now uses dynamic generation via education-generator.ts
  - **Dependencies**: T005 (schema created)

- [x] **T008** [P] Create database performance indexes for geospatial queries and user history
  - **Performance**: Optimize classification history and facility mapping queries
  - **Deliverables**: `supabase/migrations/003_performance_indexes.sql`
  - **Indexes**: user+timestamp, facility coordinates, classification analytics
  - **Dependencies**: T005 (schema created)

## Phase 3.3: Testing Approach

**NOTE: Using manual testing approach through browser dev tools and direct UI interaction for validation.**

## Phase 3.4: API Implementation (Manual Testing Approach)

- [x] **T016** Implement POST /api/auth/register in `frontend/src/app/api/auth/register/route.ts`

  - **Constitutional**: Data privacy compliance with minimal data collection
  - **Features**: Supabase Auth integration, validation, email verification
  - **Manual Testing**: Test registration through UI forms and browser dev tools
  - **Dependencies**: T002 (Supabase), T005 (schema)

- [x] **T017** Implement POST /api/auth/login in `frontend/src/app/api/auth/login/route.ts`

  - **Features**: Session management, role-based access control
  - **Manual Testing**: Test login flow through UI and verify session management
  - **Dependencies**: T002 (Supabase), T005 (schema)

- [x] **T018** Implement GET /api/auth/session in `frontend/src/app/api/auth/session/route.ts`

  - **Features**: Session validation, user context retrieval
  - **Manual Testing**: Verify session handling across page refreshes
  - **Dependencies**: T002 (Supabase), T017 (login implementation)

- [x] **T019** Implement POST /api/classify in `frontend/src/app/api/classify/route.ts`

  - **Constitutional**: Performance target <3 seconds, mobile-optimized image processing
  - **Features**: Local image validation, ML service integration, **dynamic education content generation**
  - **Education**: Uses `education-generator.ts` for contextual recommendations based on classification results
  - **Status**: COMPLETED - Dynamic education system implemented, static education_content removed
  - **Manual Testing**: Upload various image types and monitor network performance
  - **Dependencies**: T002 (Supabase), T003 (ML service), T007 (education generator)

- [x] **T020** Implement GET /api/classifications in `frontend/src/app/api/classifications/route.ts`

  - **Constitutional**: User data privacy with RLS enforcement
  - **Features**: User history pagination, image URL generation
  - **Manual Testing**: Test history display with multiple users and pagination
  - **Dependencies**: T006 (RLS policies)

- [x] **T020a** [P] Import CSV facility data (4160+ records) into waste_facilities table

  - **Data Source**: CSV with columns: nama, facility_name, facility_type, longitude, latitude
  - **Import Strategy**: Address/city optional (set city='Jakarta', address=null initially)
  - **Status**: COMPLETED - 4160+ facilities successfully imported
  - **Integration**: All-in-one seed.sql includes facility-category relationships
  - **Dependencies**: T005 (schema fixes)

- [x] **T021** [P] Implement GET /api/admin/analytics in `frontend/src/app/api/admin/analytics/route.ts`

  - **Features**: Classification statistics, user metrics, system analytics
  - **Status**: COMPLETED - Admin analytics with comprehensive dashboard metrics
  - **Implementation**: Classification stats, user metrics, facility analytics, performance monitoring
  - **Manual Testing**: Test admin dashboard with different user roles
  - **Dependencies**: T006 (RLS policies)

- [x] **T022** [P] Implement GET /api/facilities in `frontend/src/app/api/facilities/route.ts`

  - **Features**: Geospatial queries, facility filtering, waste type matching
  - **Status**: COMPLETED - Geospatial facility discovery with 4160+ Jakarta facilities
  - **Implementation**: Location-based search, distance filtering, facility type/category filtering
  - **Data**: Works with imported CSV data (4160 facilities)
  - **Manual Testing**: Test facility map filtering and search functionality
  - **Dependencies**: T020a (CSV import), T008 (indexes)

- [x] **T023** [P] Implement DELETE /api/user/profile in `frontend/src/app/api/user/profile/route.ts`
  - **Constitutional**: Complete data deletion rights with audit trail
  - **Features**: Cascade deletion, image cleanup, user consent validation
  - **Status**: COMPLETED - Complete user account deletion with audit trail and cleanup
  - **Implementation**: Cascade deletion, image storage cleanup, data backup, audit logging
  - **Manual Testing**: Test account deletion and verify complete data removal
  - **Dependencies**: T006 (RLS policies)

## Phase 3.5: ML Inference Service Implementation (Using Your Trained Models)

- [x] **T024** Implement image preprocessing pipeline in `ml-service/src/models/preprocessor.py`

  - **Constitutional**: Performance optimization for mobile image processing
  - **Features**: Image preprocessing matching your training pipeline (01-preprocessing.ipynb approach)
  - **Input**: Raw image from frontend (JPEG/PNG)
  - **Output**: Preprocessed image tensor ready for CNN feature extraction
  - **Pipeline**: Resize, normalize, convert to tensor format compatible with your trained models
  - **Status**: COMPLETED - Full preprocessing pipeline with validation and performance optimization
  - **Dependencies**: T003 (FastAPI structure)

- [x] **T025** Implement CNN feature extraction in `ml-service/src/models/feature_extractor.py`

  - **Features**: CNN feature extraction using ResNet50 and MobileNetV3 (matching 02-feature-extraction.ipynb)
  - **Models**: Load pretrained CNN models (ResNet50/MobileNetV3) for feature extraction
  - **Output**: Feature vectors compatible with your trained SVM models
  - **Performance**: Optimize for inference speed, batch processing capability
  - **Status**: COMPLETED - Full CNN feature extraction with both ResNet50 and MobileNetV3 support
  - **Dependencies**: T024 (preprocessing)

- [x] **T026** Implement SVM inference in `ml-service/src/models/classifier.py`

  - **Features**: Load your trained SVM models from model-result/\*.pkl files
  - **Models**: MobileNetV3_poly_model.pkl, MobileNetV3_rbf_model.pkl, ResNet50_poly_model.pkl, ResNet50_rbf_model.pkl
  - **Input**: CNN feature vectors from T025
  - **Output**: Classification (Organik/Anorganik/Lainnya) with confidence scores
  - **Model Selection**: Logic to choose best performing model or ensemble approach
  - **Status**: COMPLETED - Full SVM classifier with model loading, ensemble support, and confidence scoring
  - **Dependencies**: T025 (feature extraction)

- [x] **T027** Implement POST /classify endpoint in `ml-service/src/api/classification.py`

  - **Constitutional**: Performance <3 seconds total processing time
  - **Features**: Complete inference pipeline integration (preprocess → extract → classify)
  - **Pipeline**: T024 preprocessor → T025 feature extraction → T026 SVM inference
  - **Local Processing**: Frontend handles first-gate validation, ML service processes with your trained models
  - **Validation**: Accept all images, process through your CNN-SVM pipeline, accept bias as research limitation
  - **Logging**: Basic classification logging (timestamp, image info, classification result, confidence) for debugging/tracking
  - **Error Handling**: Graceful degradation for service failures
  - **Status**: COMPLETED - Full API endpoint with health checks, benchmarking, and model info endpoints
  - **Dependencies**: T026 (SVM inference)

- [x] **T051** [P] Implement comprehensive logging system in `ml-service/src/utils/logger.py`
  - **Features**: Classification attempt logging, error tracking, performance monitoring
  - **Logging Details**: Request timestamp, image metadata (size, format), processing time, confidence scores, classification results, error messages
  - **Storage**: Log files with rotation, optional database logging for analytics
  - **Status**: COMPLETED - Full logging system with request tracking, performance monitoring, and error handling
  - **Dependencies**: T003 (FastAPI structure)

## Phase 3.6: Frontend Components (Based on Existing UI/Figma Designs)

- [ ] **T028** [P] Create authentication components in `frontend/src/components/auth/` following UI/Phone/ designs

  - **Constitutional**: Mobile-first responsive design, WCAG 2.1 AA compliance
  - **Components**: LoginForm, RegisterForm, ForgotPasswordForm matching existing mockups
  - **Design Reference**: UI/Phone/Masuk.png, UI/Phone/Daftar.png, UI/Phone/Lupa Password.png
  - **Features**: Indonesian language interface, form validation, responsive layouts
  - **Accessibility**: Screen reader support, keyboard navigation, touch targets ≥44px
  - **Dependencies**: T001 (Next.js setup)

- [ ] **T029** [P] Create classification workflow components in `frontend/src/components/classify/` following UI designs

  - **Constitutional**: Mobile-first design for image capture and upload
  - **Components**: ImageUpload, ClassificationResult, ConfidenceDisplay, CategoryRecommendations
  - **Design Reference**: UI/Phone/Klasifikasi.png, UI/PC/Klasifikasi 1-3.png
  - **Features**: Progressive image loading, error states, retry mechanisms, confidence visualization
  - **Dependencies**: T001 (Next.js setup)

- [ ] **T030** [P] Create home/landing page components in `frontend/src/components/home/` following UI designs

  - **Constitutional**: Mobile-first hero sections, performance optimization
  - **Components**: HeroSection, FeatureOverview, NavigationCard matching Landing.png designs
  - **Design Reference**: UI/Phone/Landing.png, UI/PC/Landing.png
  - **Features**: Responsive hero layouts, call-to-action buttons, feature highlights
  - **Dependencies**: T001 (Next.js setup)

- [ ] **T031** [P] Create user account/profile components in `frontend/src/components/account/` following UI designs

  - **Constitutional**: User data privacy controls, mobile-first navigation
  - **Components**: ProfileHeader, ClassificationHistory, ProfileSettings, DataDeletion
  - **Design Reference**: UI/Phone/Akun.png, UI/PC/Akun.png
  - **Features**: Profile image upload, history pagination, privacy controls
  - **Dependencies**: T001 (Next.js setup)

- [ ] **T032** [P] Create information/educational page components in `frontend/src/components/info/` following UI designs

  - **Components**: InfoSection, WasteGuideCards, EducationalContent
  - **Design Reference**: UI/Phone/Informasi.png, UI/PC/Informasi.png
  - **Features**: Jakarta-specific disposal guidance, interactive educational content
  - **Dependencies**: T001 (Next.js setup)

- [ ] **T033** [P] Create admin dashboard components in `frontend/src/components/admin/` following UI designs

  - **Components**: AnalyticsCharts, UserManagementTable, SystemMetrics, ClassificationStats
  - **Design Reference**: UI/Phone/Dashboard.png, UI/PC/Dashboard .png
  - **Features**: Data visualization, responsive tables, export capabilities, admin controls
  - **Dependencies**: T001 (Next.js setup)

- [ ] **T034** [P] Create interactive map component in `frontend/src/components/map/FacilityMap.tsx`

  - **Constitutional**: Mobile-first touch interactions, performance optimization
  - **Features**: React-Leaflet integration, facility markers, geolocation, responsive design
  - **Accessibility**: Alternative text-based facility list for screen readers
  - **Dependencies**: T001 (Next.js setup)

## Phase 3.7: Page Implementation (Following Existing UI Designs)

- [ ] **T035** Implement landing/home page in `frontend/src/app/page.tsx`

  - **Constitutional**: Mobile-first responsive layout, performance optimization
  - **Design Reference**: UI/Phone/Landing.png, UI/PC/Landing.png
  - **Features**: Hero section, navigation to /klasifikasi and /daftar, feature overview
  - **Performance**: Fast initial load, optimized images, SEO optimization
  - **Dependencies**: T030 (home components)

- [ ] **T036** Implement authentication pages in `frontend/src/app/(auth)/`

  - **Constitutional**: Mobile-first form layouts, accessibility compliance
  - **Pages**: /masuk (login), /daftar (register), /lupa-password (forgot-password)
  - **Design Reference**: UI/Phone/Masuk.png, UI/Phone/Daftar.png, UI/Phone/Lupa Password.png
  - **Features**: Form validation, error handling, redirect logic, Indonesian language
  - **Dependencies**: T028 (auth components), T016-T018 (auth APIs)

- [ ] **T037** Implement classification page in `frontend/src/app/klasifikasi/page.tsx`

  - **Constitutional**: Mobile-first image handling, performance optimization
  - **Design Reference**: UI/Phone/Klasifikasi.png, UI/PC/Klasifikasi 1-3.png
  - **Features**: Image upload, real-time classification, results display, recommendations
  - **Performance**: Progressive loading, image compression, <3 second classification
  - **Dependencies**: T029 (classify components), T019 (classify API)

- [ ] **T038** Implement user account page in `frontend/src/app/akun/page.tsx`

  - **Constitutional**: User data privacy controls, mobile-first navigation
  - **Design Reference**: UI/Phone/Akun.png, UI/PC/Akun.png
  - **Features**: Profile management, classification history, data deletion controls
  - **Privacy**: Complete user control over personal data (FR-014)
  - **Dependencies**: T031 (account components), T020 (classifications API), T023 (profile deletion)

- [ ] **T039** [P] Implement information/educational page in `frontend/src/app/informasi/page.tsx`

  - **Constitutional**: Mobile-first content layout, accessibility compliance
  - **Design Reference**: UI/Phone/Informasi.png, UI/PC/Informasi.png
  - **Features**: Jakarta waste management info, disposal guidelines, educational content
  - **Content**: Indonesian language, contextual disposal recommendations
  - **Dependencies**: T032 (info components), T007 (seed data)

- [ ] **T040** [P] Implement admin dashboard page in `frontend/src/app/dashboard/page.tsx`

  - **Constitutional**: Responsive data visualization, admin access control
  - **Design Reference**: UI/Phone/Dashboard.png, UI/PC/Dashboard .png
  - **Features**: System analytics, user overview, classification statistics, data export
  - **Access Control**: Admin role verification, unauthorized access handling
  - **Dependencies**: T033 (admin components), T021 (analytics API)

- [ ] **T041** [P] Implement facility discovery integration within classification flow

  - **Constitutional**: Mobile-first mapping, accessibility alternatives
  - **Features**: Interactive map within classification results, facility filtering
  - **Integration**: Embedded in classification page results section
  - **Dependencies**: T034 (map component), T022 (facilities API), T037 (classify page)

## Phase 3.8: Integration & Features

- [ ] **T042** Integrate ML service with classification API

  - **Constitutional**: Performance monitoring, error handling for service failures
  - **Features**: HTTP client setup, timeout handling, fallback responses
  - **Integration**: Connect T019 (frontend API) with T027 (ML service endpoint)
  - **Dependencies**: T019 (classify API), T027 (ML service endpoint)

- [ ] **T043** Implement image storage integration with Supabase Storage

  - **Constitutional**: Data privacy with signed URLs, user access control
  - **Features**: Upload handling, automatic cleanup, compression
  - **Dependencies**: T002 (Supabase setup), T037 (classify page)

- [ ] **T044** [P] Implement user location services for facility recommendations

  - **Constitutional**: Privacy controls, explicit consent for location access
  - **Features**: Geolocation API, distance calculations, permission handling
  - **Dependencies**: T041 (facility integration), T022 (facilities API)

- [ ] **T045** [P] Implement educational content system matching UI designs

  - **Features**: Category-specific disposal guidance, Jakarta waste management info
  - **Design Reference**: Educational content sections in existing UI mockups
  - **Content**: Indonesian language educational materials, contextual recommendations
  - **Dependencies**: T007 (seed data), T037 (classify page), T039 (info page)

## Phase 3.9: Quality Assurance & Testing

- [ ] **T046** [P] Manual integration testing for user scenarios

  - **Scenarios**: Registration flow, classification workflow, admin access, data deletion
  - **Coverage**: All 7 quickstart scenarios from quickstart.md
  - **UI Validation**: Test against existing UI/Phone/ and UI/PC/ design references
  - **Manual Approach**: Use browser dev tools, multiple user accounts, direct UI interaction
  - **Dependencies**: T035-T040 (page implementations)

- [ ] **T047** [P] Basic performance monitoring (manual)

  - **Constitutional**: <3 second classification target
  - **Features**: Monitor classification timing through browser network tab
  - **Basic Optimization**: Image compression, lazy loading for mobile
  - **Manual Testing**: Test classification speed with various image sizes
  - **Dependencies**: T037 (classify page), T042 (ML integration)

- [ ] **T048** [P] Basic accessibility validation

  - **Constitutional**: Basic inclusive design, keyboard navigation
  - **Manual Testing**: Tab navigation, screen reader basics, color contrast
  - **Coverage**: Registration, classification, and account management flows
  - **Tools**: Browser accessibility dev tools, manual keyboard testing
  - **Dependencies**: T028-T034 (all components)

- [ ] **T049** [P] Mobile responsiveness testing across common device sizes

  - **Constitutional**: Mobile-first design validation following UI/Phone/ designs
  - **Testing**: Standard mobile breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px), touch interaction
  - **Devices**: Use browser dev tools for mobile simulation (iPhone, Android, tablet)
  - **Design Validation**: Compare implementation with UI/Phone/ and UI/PC/ mockups
  - **Dependencies**: T035-T040 (all pages)

- [ ] **T050** [P] Indonesian language localization and UI design validation

  - **Features**: Complete interface in Indonesian, cultural context appropriateness
  - **Design Compliance**: Verify implementation matches Figma/UI designs exactly
  - **Manual Testing**: UI/UX validation against existing mockups, text content review
  - **Dependencies**: T035-T040 (all pages)

## Dependencies

**Setup Phase**: T001-T004 must complete before other phases
**Database Phase**: T005 → T006, T007, T008 (parallel after T005)
**Testing Phase**: T009-T015 (optional contract tests, manual testing preferred)
**API Phase**: Each API depends on database setup + manual testing approach
**ML Phase**: T024 → T025 → T026 → T027 (sequential, using your trained models), T051 (logging, parallel)
**Frontend Phase**: T028-T034 (parallel components) depend on T001
**Pages Phase**: T035-T041 (pages) depend on their respective components + APIs
**Integration Phase**: T042-T045 depend on both API and ML implementations
**QA Phase**: T046-T050 depend on complete implementation (manual testing approach)

## Parallel Execution Examples

```bash
# Launch optional contract tests together (T009-T015) - manual testing preferred:
Task: "[OPTIONAL] Contract test POST /api/auth/register in frontend/tests/contract/auth.test.ts"
Task: "[OPTIONAL] Contract test POST /api/auth/login in frontend/tests/contract/auth.test.ts"
Task: "[OPTIONAL] Contract test POST /api/classify in frontend/tests/contract/classification.test.ts"
Task: "[OPTIONAL] Contract test GET /api/classifications in frontend/tests/contract/classification.test.ts"
Task: "[OPTIONAL] Contract test GET /api/admin/analytics in frontend/tests/contract/admin.test.ts"
Task: "[OPTIONAL] Contract test GET /api/facilities in frontend/tests/contract/facilities.test.ts"
Task: "[OPTIONAL] Contract test DELETE /api/user/profile in frontend/tests/contract/user.test.ts"

# Launch component development (T028-T034):
Task: "Create authentication components following UI/Phone/Masuk.png design"
Task: "Create classification workflow components following UI/Phone/Klasifikasi.png"
Task: "Create home/landing page components following UI/Phone/Landing.png"
Task: "Create user account/profile components following UI/Phone/Akun.png"
Task: "Create information/educational components following UI/Phone/Informasi.png"
Task: "Create admin dashboard components following UI/Phone/Dashboard.png"
Task: "Create interactive map component for facility discovery"

# Launch page implementations (T035-T041):
Task: "Implement landing/home page matching UI/PC/Landing.png design"
Task: "Implement authentication pages matching UI mockups (Masuk, Daftar, Lupa Password)"
Task: "Implement classification page following UI/PC/Klasifikasi designs"
Task: "Implement user account page following UI/PC/Akun.png design"

# Launch final QA tasks (T046-T050) - manual testing approach:
Task: "Manual integration testing for user scenarios"
Task: "Basic performance monitoring (manual)"
Task: "Basic accessibility validation"
Task: "Mobile responsiveness testing against UI/Phone/ designs"
Task: "Indonesian language and UI design validation against Figma/UI mockups"
```

## Constitutional Compliance Gates

- **Mobile-First**: All UI tasks follow existing UI/Phone/ designs and include standard breakpoint compatibility
- **Design Fidelity**: Implementation must match existing Figma/UI mockups precisely
- **Data Privacy**: User control over personal data, complete deletion rights, RLS enforcement
- **Performance**: <3 second classification, optimized bundles, responsive loading
- **Accessibility**: Basic inclusive design, screen reader support, keyboard navigation
- **Technical Excellence**: TypeScript strict mode, manual testing, error handling
- **Indonesian Language**: Complete interface localization with proper cultural context
- **ML Integration**: Use existing trained models from model-result/ folder

## Notes

- [P] tasks = different files, no dependencies between them
- Contract tests are optional - manual testing through UI preferred for simplicity
- Constitutional principles integrated into acceptance criteria
- **UI Design Reference**: All frontend tasks reference existing UI/Phone/ and UI/PC/ mockups
- **Figma Compliance**: Implementation must match Figma designs exactly
- **Manual Testing**: Browser dev tools, direct UI interaction, network monitoring approach
- **ML Models**: Use your existing trained models (\*.pkl) from model-result/ folder
- Performance targets monitored manually during development
- Commit after each completed task for progress tracking

## Validation Checklist

_GATE: Must verify before task execution begins_

- [x] All 6 contract files have corresponding test tasks
- [x] All 5 entities have database implementation
- [x] Optional tests come before API implementation
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] Constitutional compliance embedded in task requirements
- [x] **UI design references included for all frontend tasks**
- [x] **Existing UI/Phone/ and UI/PC/ mockups integrated into task specifications**
- [x] **ML inference pipeline uses existing trained models from model-result/**
- [x] Performance targets specified for time-critical operations
- [x] Mobile-first design requirements follow existing UI/Phone/ designs

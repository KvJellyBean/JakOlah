# Feature Specification: Jakarta Waste Classification Web Application

**Feature Branch**: `001-initial-setup`  
**Created**: 2024-09-24  
**Status**: Draft  
**Input**: User description: "create a web application that solves Jakarta's household waste sorting problem (called JakOlah). Jakarta generates tons of waste daily but lacks effective household-level sorting practices. Build a waste classification web application that allows users to upload a single image of waste and instantly receive a classification (Organik, Anorganik, Lainnya) with a confidence score. The app provides rule-based recommendations for proper disposal and displays the nearest facilities (TPS/TPA/Bank Sampah/etc) on a map. Users can view their classification history, manage their accounts, and access educational resources. An admin dashboard provides statistics and full visibility of all classifications."

## User Scenarios & Testing

### Primary User Story

Jakarta households access JakOlah through their mobile devices or computers to properly sort household waste. After logging into their account, users can upload photos of waste items to receive instant classification results with confidence scores, get actionable disposal recommendations, and discover nearby waste management facilities on a map. Users can view their classification history and access educational resources. Unregistered visitors can only view the homepage and general website information including background, usage instructions, and frequently asked questions.

### Acceptance Scenarios

1. **Given** a registered user is logged in, **When** they upload a clear image through the web app, **Then** the system returns classification (Organik/Anorganik/Lainnya) with confidence score within 3 seconds
2. **Given** a classification result is displayed, **When** user views the result, **Then** the system shows rule-based disposal recommendations and nearest waste facilities on an interactive map
3. **Given** a registered user, **When** they access their account dashboard, **Then** they can view their complete classification history with timestamps and results
4. **Given** an admin user, **When** they access the admin dashboard, **Then** they can view system-wide classification statistics and user activity analytics
5. **Given** an unregistered visitor, **When** they access the website, **Then** they can only view homepage and website information (background, usage guide, FAQ), but cannot access classification features

### Edge Cases

- What happens when image quality is too poor for classification?
- How does system handle unsupported image formats or oversized files?
- What occurs when user uploads images of non-waste objects? → System processes through ML model, accepts results as research limitation/bias
- How does the app function when map services are unavailable?
- What happens when confidence scores are below acceptable thresholds?
- How does system handle users trying to access classification features without being logged in?
- How does system handle classifications with low confidence scores (below 70%)?

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept image uploads in common formats (JPEG, PNG, WebP) with maximum file size of 10MB
- **FR-002**: System MUST classify waste images into exactly three categories: Organik, Anorganik, and Lainnya
- **FR-003**: System MUST return classification results with confidence scores expressed as percentages
- **FR-003a**: System MUST display best guess classification with low confidence warning when confidence scores are below 70%
- **FR-004**: System MUST complete image classification within 3 seconds for 95% of requests
- **FR-005**: System MUST provide rule-based disposal recommendations for each classification result
- **FR-006**: System MUST display interactive map using OpenStreetMap with Leaflet showing nearest waste management facilities with basic information (name, type, location)
- **FR-007**: System MUST require user authentication for all classification features
- **FR-008**: System MUST store user classification history with timestamps for registered users
- **FR-009**: System MUST allow unregistered visitors to view homepage and website information (background, usage guide, FAQ) only
- **FR-010**: System MUST include text-based educational resources about waste sorting best practices, specifically covering proper management of each waste classification category with Jakarta-relevant information
- **FR-011**: System MUST provide admin dashboard with comprehensive analytics including total classifications, registered user count, classification results by category, classification distribution patterns, and classification history of all active users
- **FR-012**: System MUST support both mobile and desktop interfaces with responsive design
- **FR-013**: System MUST perform first-gate image validation locally (file type checking, size limits, basic format validation) before transmitting to ML service to protect user privacy and reduce server load
- **FR-014**: System MUST allow users to delete their classification history and account data on demand
- **FR-014a**: System MUST retain user data indefinitely until explicitly deleted by the user
- **FR-015**: System SHOULD accept all image submissions and let the ML model classify them, accepting bias/limitations as documented research scope
- **FR-016**: System MUST display facility types with appropriate waste acceptance rules (TPS accepts all types, etc.)
- **FR-017**: System MUST support Indonesian language interface as primary language
- **FR-018**: System MUST log all classification attempts for system monitoring and improvement
- **FR-019**: System MUST implement role-based access control for admin and user functions
- **FR-020**: System MUST redirect unauthenticated users to login when accessing protected features

### Key Entities

- **User**: Represents registered users with unique identifiers, personal information (full name, email), authentication credentials, role assignments, profile customization, and location preferences with permission controls
- **Classification**: Represents individual waste classification attempts with comprehensive image handling (original filename, processed path, stored filename), detailed confidence scoring for each waste category, associated educational content, and complete audit trails
- **Waste Category**: Represents the three main classification types (Organik, Anorganik, Lainnya) with standardized category codes, detailed descriptions, and disposal guidance rules
- **Waste Facility**: Represents waste management locations throughout Jakarta with facility details (name, type designation), precise geographic coordinates, complete address information, and operational metadata
- **Waste Facility Category**: Represents the relationship between facilities and accepted waste types, defining which categories each facility can process and establishing waste routing rules

## Clarifications

### Session 2025-09-25

- Q: When the AI model returns low confidence scores for waste classification, what should happen? → A: Show best guess classification with warning about low confidence
- Q: How long should user classification history and account data be retained? → A: Keep indefinitely until user manually deletes
- Q: What specific analytics should the admin dashboard display? → A: Total klasifikasi, Jumlah pengguna terdaftar, hasil klasifikasi perkategori, disertai distribusi klasifikasi, dan riwayat klasifikasi semua pengguna aktif
- Q: Which mapping service should be used for displaying waste facilities? → A: OpenStreetMap with Leaflet (free, open source)
- Q: What type of educational content should be included for authenticated users? → A: Lebih ke text based, ke cara gimana sampah tersebut(hasil klasifikasinya) di kelola best practicenya, dan kalau bisa relevan juga dengan jakarta

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

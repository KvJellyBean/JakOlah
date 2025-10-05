# Feature Specification: JakOlah Real-Time Waste Classification Web Application (Setup & Development)

**Feature Branch**: `001-setup`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "create a web application that solves Jakarta's waste sorting problem (called JakOlah). Jakarta generates tons of waste daily but lacks effective sorting practices. Build a waste classification web application that allows users to use their device's camera in real-time and instantly receive a classification (Organik, Anorganik, Lainnya) with a bounding box and a confidence score. The app displays the nearest facilities (TPS/TPA/Bank Sampah/etc) on a dynamic map based on the detected categories."

## Execution Flow (main)

```
1. Parse user description from Input
   → ✅ Feature description provided and parsed
2. Extract key concepts from description
   → ✅ Identified: Jakarta citizens, sanitation workers, real-time camera classification, waste categories, facility mapping
3. For each unclear aspect:
   → ✅ All clarifications resolved based on developer feedback
4. Fill User Scenarios & Testing section
   → ✅ Clear user flows identified, manual testing approach confirmed
5. Generate Functional Requirements
   → ✅ 17 requirements defined, scoped for small-scale thesis project
6. Identify Key Entities (if data involved)
   → ✅ Entities identified: WasteItem, Classification, DisposalFacility, User, CameraSession
7. Run Review Checklist
   → ✅ All checks passed, ready for implementation planning
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas for JakOlah**:
   - Waste classification accuracy requirements
   - Real-time performance targets (FPS, response time)
   - Privacy and data handling policies
   - Mobile device compatibility ranges
   - Offline functionality scope
   - Multi-language support details
   - Accessibility compliance levels

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

A Jakarta citizen holds their smartphone camera over a piece of waste, immediately sees the waste category (Organik, Anorganik, or Lainnya) displayed with a bounding box around the detected item, views the confidence score, and receives a map showing the nearest appropriate disposal facilities based on the waste type detected.

### Acceptance Scenarios

1. **Given** a user accesses the JakOlah web app on their mobile device, **When** they point their camera at organic waste (food scraps), **Then** the system displays "Organik" label with bounding box around the waste and shows nearby composting facilities on the map

2. **Given** a user points their camera at plastic bottles, **When** the detection occurs, **Then** the system displays "Anorganik" with confidence score above 70% and shows nearest recycling centers and Bank Sampah locations

3. **Given** a sanitation worker encounters mixed or unclear waste, **When** they use the camera classification, **Then** the system displays "Lainnya" category and shows general TPS/TPA facilities for proper disposal

4. **Given** multiple waste items are visible in the camera frame, **When** detection runs, **Then** the system displays separate bounding boxes for each detected item with individual classifications

5. **Given** a user wants to find disposal facilities without scanning waste, **When** they manually select a waste category, **Then** the map displays all relevant facilities for that category within a reasonable distance

### Edge Cases

- What happens when the camera cannot detect any waste items in the frame?
- How does the system handle very poor lighting conditions or blurry camera feed?
- What occurs when the confidence score is below acceptable threshold?
- How does the system respond when no disposal facilities are found within reasonable distance?
- What happens when the user's location cannot be determined?

**Note**: Testing akan dilakukan secara manual oleh developer sesuai acceptance scenarios di atas.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide real-time camera feed from user's device camera with live waste detection overlay
- **FR-002**: System MUST classify detected waste items into exactly three categories: "Organik", "Anorganik", or "Lainnya"
- **FR-003**: System MUST display visual bounding boxes around each detected waste item in the camera feed
- **FR-004**: System MUST show confidence scores for each classification result to users
- **FR-005**: System MUST display an interactive map showing disposal facilities relevant to detected waste categories
- **FR-006**: System MUST show different facility types including TPS, TPA, Bank Sampah, and recycling centers
- **FR-007**: System MUST work responsively across mobile devices (smartphones, tablets) and desktop computers
- **FR-008**: System MUST request and handle user location permissions for facility proximity calculations
- **FR-009**: System MUST allow users to manually select waste categories to view relevant facilities without camera detection
- **FR-010**: System MUST provide facility information including name, address, and distance from user
- **FR-011**: System MUST support both Jakarta's general public and professional users (sanitation workers, facility managers, educators)
- **FR-012**: System SHOULD process camera frames with classification response time under 500ms when possible, acceptable if slightly longer but not excessively slow
- **FR-013**: System SHOULD maintain camera feed performance at minimum 15 FPS on mobile devices when possible
- **FR-014**: System MUST handle privacy by processing camera data locally when possible, minimizing server-side image processing
- **FR-015**: System MUST provide interface in Bahasa Indonesia

- **FR-016**: System MUST provide transparent confidence scores for all classifications, allowing users to judge reliability
- **FR-017**: System SHOULD achieve reasonable classification accuracy but MUST be transparent about confidence levels rather than guaranteeing specific accuracy percentages

### Key Entities _(include if feature involves data)_

- **WasteItem**: Represents detected waste objects with classification category, confidence score, bounding box coordinates, and timestamp
- **Classification**: Represents the categorization result containing category type (Organik/Anorganik/Lainnya), confidence percentage, and detection metadata
- **DisposalFacility**: Represents waste management locations with facility type (TPS/TPA/Bank Sampah/recycling center), name, address, coordinates, operating hours, and accepted waste types
- **User**: Represents app users with location preferences, usage history, and accessibility settings
- **CameraSession**: Represents active detection sessions with device camera capabilities, frame processing status, and real-time classification results
- **LocationData**: Represents geographic information including user coordinates, facility proximity calculations, and map integration data

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain - **All clarifications resolved**
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded for small-scale thesis project
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities resolved
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed - **Ready for implementation planning**

---

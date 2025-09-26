# JakOlah Development Agent Context

## Project Context

**Project Name**: JakOlah  
**Purpose**: Jakarta waste classification web application using ML-powered image classification  
**Target Users**: Jakarta households seeking proper waste disposal guidance  
**Constitutional Version**: 1.0.0 (reference: constitution.md)

---

## Development Constraints

### Constitutional Compliance (NON-NEGOTIABLE)

1. **Mobile-First Design**: All UI components must work on 320px screens first
2. **Minimal Dependencies**: Justify every new dependency against bundle size impact
3. **Data Privacy**: Users maintain complete control over personal data and images
4. **Performance Standards**: 95% of classification requests must complete within 3 seconds
5. **Technical Excellence**: Comprehensive testing, TypeScript strict mode, accessibility compliance

### Technology Stack (LOCKED)

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (Postgres, Auth, Storage), Next.js API routes
- **ML Service**: FastAPI with Python (CNN feature extraction + SVM classification)
- **Maps**: React-Leaflet with OpenStreetMap tiles
- **Authentication**: Supabase Auth with role-based access control

---

## Functional Requirements Reference

### Core Features (20 Requirements)

- **FR-001**: Image upload with format/size validation
- **FR-002**: Three-category classification (Organik, Anorganik, Lainnya)
- **FR-003**: Confidence scoring with 70% threshold warnings
- **FR-004**: 3-second processing time requirement
- **FR-005**: Disposal recommendations per category
- **FR-006**: Interactive facility mapping
- **FR-007**: User registration and authentication
- **FR-008**: Personal classification history
- **FR-009**: Public information pages (no auth required)
- **FR-010**: Educational content for authenticated users
- **FR-011**: Admin analytics dashboard
- **FR-014**: Complete user data deletion rights
- **FR-015**: Non-waste object validation
- **FR-016**: TPS facility data integration
- **FR-017**: Indonesian language interface
- **FR-019**: User/Admin role separation
- **FR-020**: Authentication-gated classification access

### Data Model (5 Entities)

- **User**: Supabase Auth + custom profile fields
- **Classification**: User submissions with ML results
- **Waste_Category**: Static reference data (3 categories)
- **Waste_Facility**: Jakarta TPS and collection points
- **Waste_Facility_Category**: Junction table for facility-category relationships

---

## Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types except documented exceptions
- **Components**: Functional components with proper TypeScript interfaces
- **API Routes**: Zod schema validation for all request/response bodies
- **Database**: Supabase RLS policies for all user data access
- **Error Handling**: Graceful degradation with user-friendly messages

### File Organization

```
/src
  /app                 # Next.js App Router pages and API routes
  /components          # Reusable UI components
    /ui               # Shadcn UI components
  /lib                # Utility functions and configurations
  /types              # TypeScript type definitions
  /hooks              # Custom React hooks
```

### Testing Strategy

- **Component Testing**: React Testing Library for UI components
- **API Testing**: Integration tests for all API endpoints
- **E2E Testing**: Playwright for critical user journeys
- **Performance Testing**: Web Vitals monitoring and classification timing

### Mobile-First Implementation

- **Breakpoints**: 320px (mobile), 768px (tablet), 1024px (desktop)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Image Optimization**: Progressive loading with Next.js Image component
- **Offline Handling**: Graceful degradation when network unavailable

### Privacy and Security

- **Data Minimization**: Collect only essential user information
- **Image Storage**: Automatic signed URL expiration for user images
- **Authentication**: Supabase RLS policies protect all user data
- **Audit Trail**: Log admin actions for compliance monitoring

---

## API Contract Compliance

### Authentication Endpoints

- `POST /api/auth/register`: User registration with validation
- `POST /api/auth/login`: Session establishment
- `POST /api/auth/logout`: Session termination
- `GET /api/auth/session`: Current user context

### Classification Endpoints

- `POST /api/classify`: Image upload and ML processing
- `GET /api/classifications`: User history with pagination
- `DELETE /api/classifications/{id}`: Single entry deletion

### Admin Endpoints

- `GET /api/admin/analytics`: Dashboard metrics
- `GET /api/admin/users`: User management (basic info only)
- `GET /api/admin/classifications`: System-wide classification data

### User Profile Endpoints

- `GET /api/user/profile`: Current user profile
- `PUT /api/user/profile`: Profile updates
- `DELETE /api/user/profile`: Complete account deletion

### Facilities Endpoints

- `GET /api/facilities`: Jakarta waste facilities with categories
- `GET /api/facilities/nearby`: Location-based facility discovery

---

## ML Service Integration

### FastAPI Service Contract

- **Endpoint**: `POST /classify`
- **Input**: Multipart form with image file
- **Output**: JSON with category, confidence, and processing metadata
- **Timeout**: 5 seconds maximum (allows for 3s user requirement + overhead)
- **Error Handling**: Fallback responses for service unavailability

### Classification Categories

1. **Organik**: Food waste, biodegradable materials
2. **Anorganik**: Plastics, metals, glass, non-biodegradable materials
3. **Lainnya**: Hazardous waste, electronics, textiles

### Confidence Threshold Handling

- **≥70%**: Present result with confidence
- **<70%**: Show result with low confidence warning
- **<50%**: Suggest manual categorization with educational content

---

## Database Schema Validation

### Row-Level Security Policies

- Users can only access their own classifications
- Admin role can read (not modify) aggregated user data
- Public access to waste categories and facilities
- Facility data managed through admin interface only

### Performance Indexes

- Users: email (unique), created_at
- Classifications: user_id + created_at (for history queries)
- Waste_Facilities: lat/lng (for geospatial queries), facility_type

---

## Development Workflow

### Pre-Implementation Checklist

1. ✅ Constitutional compliance review
2. ✅ Functional requirement mapping
3. ✅ API contract validation
4. ✅ Mobile-first design consideration
5. ✅ TypeScript interface definition
6. ✅ Error handling strategy
7. ✅ Performance impact assessment

### Code Review Criteria

- Constitutional principle adherence
- TypeScript strict mode compliance
- Mobile responsiveness (320px minimum)
- Accessibility standards (WCAG 2.1 AA)
- Performance impact measurement
- Privacy control implementation
- Error handling coverage

### Deployment Validation

- All quickstart scenarios pass
- Performance benchmarks met
- Security audit clean
- Constitutional compliance verified
- Mobile device testing complete

---

## Known Constraints and Deviations

### Testing Approach Deviation

**Issue**: Constitution requires TDD, but manual testing approach documented  
**Rationale**: MVP development phase allows manual validation with comprehensive quickstart guide  
**Mitigation**: Transition to automated testing before production deployment  
**Status**: Documented in plan.md complexity tracking table

### Edge Case Handling

**Maps Service Failure**: Graceful fallback to text-based facility list  
**ML Service Downtime**: User-friendly retry mechanism with educational content  
**Low Confidence Results**: Educational guidance with manual categorization option

---

## Success Metrics

### Technical Performance

- Classification processing: 95% < 3 seconds
- UI responsiveness: 320px screen compatibility
- Bundle size: Optimized for mobile data usage
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### User Experience

- Registration completion rate > 80%
- Classification accuracy feedback positive
- Mobile usage accounts for >60% of traffic
- User data deletion requests processed within 24 hours

### Business Objectives

- Active user retention after first classification
- Admin dashboard provides actionable insights
- Educational content engagement metrics
- Jakarta TPS facility data accuracy maintained

---

This context file should be referenced for all development decisions to ensure constitutional compliance and functional requirement adherence.

# JakOlah Quickstart Guide

## User Journey Validation

This quickstart guide provides step-by-step scenarios to validate that the JakOlah system meets all functional requirements from the specification.

### Prerequisites

- Next.js 14 application deployed and accessible
- Supabase project configured with database tables and authentication
- FastAPI ML microservice running and accessible
- Test images prepared (organic, inorganic, and other waste samples)
- Test user accounts created (regular user and admin)

---

## Scenario 1: New User Registration and First Classification

**Objective**: Validate user registration flow and first-time classification experience (FR-007, FR-001, FR-002, FR-003, FR-004)

### Steps:

1. **Navigate to JakOlah homepage**

   - Open browser to application URL
   - **Expected**: Homepage displays with Indonesian language interface (FR-017)
   - **Expected**: Unregistered visitors see homepage and info content only (FR-009)
   - **Expected**: Classification features are not accessible without login

2. **User Registration**

   - Click "Daftar" (Register) button
   - Fill registration form:
     - Full Name: "Test User Jakarta"
     - Email: valid email address
     - Password: secure password (min 8 chars)
   - Submit registration
   - **Expected**: Success message displayed
   - **Expected**: Email verification sent (Supabase Auth)

3. **Email Verification and Login**

   - Check email for verification link
   - Click verification link
   - Return to JakOlah and click "Masuk" (Login)
   - Enter credentials and login
   - **Expected**: Successful login, redirect to dashboard
   - **Expected**: User role set to "user" (FR-019)

4. **First Waste Classification**

   - Navigate to "/classify" page
   - **Expected**: Classification page loads (mobile-first design)
   - Upload test image (e.g., plastic bottle - Anorganik category):
     - File format: JPEG/PNG/WebP (FR-001)
     - File size: ≤ 10MB (FR-001)
   - Submit image for classification
   - **Expected**: Processing completes within 3 seconds (FR-004)
   - **Expected**: Result shows category "Anorganik" (FR-002)
   - **Expected**: Confidence score displayed as percentage (FR-003)
   - **Expected**: If confidence < 70%, low confidence warning shown (FR-003a)

5. **View Classification Results**

   - **Expected**: Disposal recommendations displayed (FR-005)
   - **Expected**: Interactive map shows nearby facilities (FR-006)
   - **Expected**: Facilities relevant to "Anorganik" waste highlighted
   - **Expected**: Map uses OpenStreetMap with Leaflet

6. **Check Classification History**
   - Navigate to account dashboard
   - **Expected**: New classification appears in history (FR-008)
   - **Expected**: Timestamp and category correctly recorded

---

## Scenario 2: Multi-Category Classification and Facility Discovery

**Objective**: Test different waste categories and facility mapping functionality (FR-002, FR-005, FR-006, FR-016)

### Steps:

1. **Organic Waste Classification**

   - Upload image of food scraps
   - **Expected**: Classified as "Organik"
   - **Expected**: Disposal recommendations specific to organic waste
   - **Expected**: Nearby TPS facilities highlighted (TPS accepts all types - FR-016)

2. **"Lainnya" (Other) Category Classification**

   - Upload image of hazardous/electronic waste
   - **Expected**: Classified as "Lainnya"
   - **Expected**: Special disposal recommendations provided
   - **Expected**: Appropriate facilities shown (may include specialized collection points)

3. **Facility Information Validation**

   - Click on facility markers on map
   - **Expected**: Facility name, type, and address displayed
   - **Expected**: Information about accepted waste types shown
   - **Expected**: Facilities within reasonable distance from user location

4. **Location Permission Testing**
   - Grant location permission in browser
   - **Expected**: More accurate facility recommendations
   - **Expected**: Distance calculations displayed
   - Revoke location permission
   - **Expected**: System gracefully handles missing location data

---

## Scenario 3: User Profile Management and Data Control

**Objective**: Validate user profile features and data privacy controls (FR-014, FR-014a)

### Steps:

1. **Profile Management**

   - Navigate to "/account" page
   - Update profile information:
     - Change full name
     - Upload profile image
   - **Expected**: Changes saved successfully
   - **Expected**: Profile image stored in Supabase Storage

2. **Classification History Management**

   - View complete classification history
   - **Expected**: All previous classifications displayed with timestamps
   - **Expected**: Images accessible via signed URLs
   - Delete specific classification entry
   - **Expected**: Entry removed from history
   - **Expected**: Associated image deleted from storage

3. **Data Deletion Rights**
   - Test partial data deletion:
     - Delete all classification history
     - **Expected**: All user classifications removed
     - **Expected**: User account remains active
   - Test complete account deletion:
     - Initiate account deletion process
     - **Expected**: Confirmation required with password
     - **Expected**: All user data deleted (FR-014)
     - **Expected**: Images removed from storage
     - **Expected**: Account cannot be used for login

---

## Scenario 4: Admin Dashboard Analytics

**Objective**: Validate admin functionality and analytics (FR-011, FR-019)

### Steps:

1. **Admin Login**

   - Login with admin credentials
   - **Expected**: Admin role recognized (FR-019)
   - **Expected**: Access to "/dashboard" route

2. **Dashboard Analytics Validation**

   - View admin dashboard
   - **Expected**: Total classifications count displayed
   - **Expected**: Registered users count shown
   - **Expected**: Classification results by category with percentages
   - **Expected**: Classification distribution patterns visible
   - **Expected**: Active user classification history accessible

3. **Analytics Accuracy**

   - Compare dashboard numbers with known test data
   - **Expected**: Counts match actual database entries
   - **Expected**: Percentages calculated correctly
   - **Expected**: Data updates reflect recent classifications

4. **Admin Access Control**
   - Logout admin user, login as regular user
   - Attempt to access "/dashboard"
   - **Expected**: Access denied (FR-019)
   - **Expected**: Redirect to unauthorized page

---

## Scenario 5: Error Handling and Edge Cases

**Objective**: Validate system resilience and error handling

### Steps:

1. **Image Upload Validation**

   - Upload oversized file (>10MB)
   - **Expected**: Error message, file rejected (FR-001)
   - Upload unsupported format (e.g., .txt file)
   - **Expected**: Format validation error
   - Upload corrupted image
   - **Expected**: Graceful error handling

2. **Authentication Edge Cases**

   - Access classification page without login
   - **Expected**: Redirect to login page (FR-020)
   - Use expired session token
   - **Expected**: Re-authentication required
   - Access admin features with user account
   - **Expected**: Access denied

3. **Network and Service Failures**

   - Simulate ML service downtime
   - **Expected**: User-friendly error message
   - **Expected**: Option to retry classification
   - Simulate map service failure
   - **Expected**: Fallback content or error message (as per edge cases)

4. **Low Confidence Scenarios**
   - Upload ambiguous waste image
   - **Expected**: If confidence < 70%, warning displayed (FR-003a)
   - **Expected**: Best guess classification shown with warning
   - Upload non-waste object
   - **Expected**: System validation prevents classification (FR-015)

---

## Scenario 6: Mobile Responsiveness and Performance

**Objective**: Validate mobile-first design and performance requirements

### Steps:

1. **Mobile Device Testing**

   - Access application on mobile device (320px width)
   - **Expected**: Layout responds correctly
   - **Expected**: Touch targets ≥ 44px (constitutional requirement)
   - **Expected**: Classification workflow functional on mobile

2. **Performance Validation**

   - Measure classification processing time
   - **Expected**: 95% of requests complete within 3 seconds (FR-004)
   - Test on various network conditions
   - **Expected**: Progressive loading with feedback
   - **Expected**: Graceful degradation on slow networks

3. **Accessibility Testing**
   - Use screen reader with application
   - **Expected**: WCAG 2.1 AA compliance
   - **Expected**: Alternative text for images
   - **Expected**: Keyboard navigation functional

---

## Scenario 7: Educational Content and Information Access

**Objective**: Validate educational features and public information access (FR-009, FR-010)

### Steps:

1. **Public Information Access**

   - Access "/info" page without login
   - **Expected**: Background information about JakOlah visible
   - **Expected**: Usage instructions and FAQ accessible
   - **Expected**: No classification features available

2. **Authenticated Educational Content**
   - Login as registered user
   - Access educational resources
   - **Expected**: Text-based content about waste management
   - **Expected**: Jakarta-specific disposal best practices
   - **Expected**: Category-specific management guidance

---

## Success Criteria

Each scenario must pass completely for system readiness:

- ✅ All functional requirements (FR-001 through FR-020) validated
- ✅ Constitutional principles compliance verified
- ✅ Performance targets met (3-second classification, mobile responsiveness)
- ✅ Security and privacy controls functional
- ✅ Admin and user role separation enforced
- ✅ Error handling graceful and user-friendly
- ✅ Indonesian language interface working
- ✅ Mobile-first design responsive across screen sizes

## Performance Benchmarks

**Target Metrics** (to be measured during testing):

- Classification accuracy: >90%
- Processing time P95: <3 seconds
- UI loading time: <2 seconds on mobile
- Map rendering: <3 seconds
- Bundle size: Optimized for mobile data usage
- Accessibility score: WCAG 2.1 AA compliance

## Test Data Requirements

Prepare the following test assets:

- Sample waste images for each category (10+ per category)
- Test user accounts (user and admin roles)
- Sample facility data for Jakarta area
- Edge case images (non-waste objects, poor quality, oversized files)
- Performance testing scripts for load validation

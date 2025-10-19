# Research & Technology Decisions: JakOlah

## Technology Stack Research

### Frontend Framework: Next.js 14 with JavaScript

**Decision**: Next.js 14 with App Router using JavaScript (not TypeScript)
**Rationale**:

- Simpler development without TypeScript complexity for single developer project
- Built-in performance optimizations (code splitting, image optimization)
- Server-side rendering for better SEO and initial load performance
- App Router provides modern routing with layouts and nested routes
- Excellent ecosystem for camera and map integrations
- JavaScript is sufficient for thesis scope

**Alternatives considered**:

- Next.js with TypeScript: Added complexity not needed for small project
- Vite + React: Less built-in optimization, requires more configuration
- Vue.js: Smaller ecosystem for camera/ML integrations

### UI Framework: Tailwind CSS + Shadcn UI

**Decision**: Tailwind CSS for styling with Shadcn UI component library
**Rationale**:

- Mobile-first responsive design capabilities
- Small bundle size with purging unused CSS
- Shadcn UI provides accessible, customizable components
- Excellent developer experience and rapid prototyping
- Consistent design system for small team

**Alternatives considered**:

- Material-UI: Heavier bundle size, less customization
- Chakra UI: Good but less TypeScript support than Shadcn
- Plain CSS/SCSS: More development time, less consistency

### Map Integration: React-Leaflet

**Decision**: React-Leaflet with OpenStreetMap
**Rationale**:

- Open source with no API costs (important for thesis project)
- Good mobile performance and responsive design
- Strong React integration
- Sufficient features for facility mapping
- Jakarta map data available through OSM

**Alternatives considered**:

- Google Maps API: Cost prohibitive for small project
- Mapbox: Free tier limitations, more complex integration
- Apple Maps: iOS only, limited web support

### ML Inference Strategy: TensorFlow.js + FastAPI Fallback

**Decision**: Primary client-side inference with TensorFlow.js, FastAPI server as fallback
**Rationale**:

- **Privacy First**: Client-side processing means no image data sent to server
- **Real-time Performance**: Local inference eliminates network latency
- **Offline Capability**: Works without internet once models are cached
- **Cost Effective**: Reduces server processing costs for thesis project
- **User Experience**: Faster response times on capable devices

**Implementation Approach**:

- Convert existing MobileNetV3 + SVM models to TensorFlow.js format
- Load models in browser on first visit, cache for subsequent use
- Fallback to FastAPI service if client device cannot handle inference
- Progressive enhancement: start with server-side, add client-side as enhancement

**Alternatives considered**:

- Server-only FastAPI: Privacy concerns, network dependency, higher latency
- WebAssembly + OpenCV: More complex deployment and debugging
- Pure client-side only: Risk of complete failure on low-end devices

### Database: Supabase (PostgreSQL)

**Decision**: Supabase for backend database and API
**Rationale**:

- PostgreSQL with spatial data support (PostGIS) for facility locations
- Built-in authentication and real-time features (if needed later)
- Easy setup and deployment for small projects
- Generous free tier for thesis work
- REST API auto-generated from schema

**Alternatives considered**:

- Firebase: NoSQL less suitable for relational facility data
- Raw PostgreSQL: More setup overhead, no admin interface
- SQLite: Limited concurrent access, no spatial features

### Machine Learning Pipeline: Hybrid Approach

### Client-Side Inference: TensorFlow.js

**Decision**: TensorFlow.js for browser-based waste classification
**Rationale**:

- **Privacy Compliance**: Images never leave user's device
- **Real-time Performance**: No network latency for inference
- **Mobile Optimization**: Efficient inference on mobile browsers
- **Progressive Loading**: Models download once, cached for future use
- **Existing Models**: Can convert current MobileNetV3 + SVM to TensorFlow.js format

**Technical Implementation**:

- Use `@tensorflow/tfjs` and `@tensorflow/tfjs-converter` for model loading
- Convert MobileNetV3 feature extractor to TensorFlow.js format
- Implement SVM classification in JavaScript (simple linear algebra)
- Optimize for mobile browsers with WebGL acceleration
- Graceful degradation to server-side if client fails

**Alternatives considered**:

- ONNX.js: Less ecosystem support, more complex model conversion
- MediaPipe: Limited browser support, heavier framework
- WebAssembly + OpenCV: Complex deployment, larger bundle size

### Server-Side Fallback: FastAPI

**Decision**: Maintain FastAPI service for compatibility and fallback
**Rationale**:

- **Device Compatibility**: Fallback for devices that can't run TensorFlow.js efficiently
- **Model Accuracy**: Server can run more complex models if needed
- **Development Flexibility**: Easier debugging and model iteration
- **Enterprise Readiness**: Scalable solution if thesis project grows

**Alternatives considered**:

- Remove server entirely: Risk of complete failure on incompatible devices
- Different server framework: FastAPI already proven and documented

## Camera Integration Research

### Web Camera API: MediaDevices.getUserMedia()

**Decision**: Native WebRTC getUserMedia API
**Rationale**:

- Direct browser access to camera
- Good performance on mobile devices
- No external dependencies
- Supports constraints for resolution/frame rate
- Wide browser compatibility

**Alternatives considered**:

- WebRTC libraries: Unnecessary complexity for simple camera access
- Progressive Web App APIs: Limited by browser support

### Frame Processing Strategy

**Decision**: Canvas-based frame extraction with throttling
**Rationale**:

- Direct pixel access for image processing
- Frame rate control to balance performance vs accuracy
- Efficient memory management
- Good mobile device compatibility

## Performance Optimization Research

### Bundle Optimization

**Decision**: Next.js dynamic imports + code splitting
**Rationale**:

- Lazy load ML-related components only when needed
- Reduce initial bundle size for faster page loads
- Tree shaking to eliminate unused code
- Image optimization built into Next.js

### API Communication

**Decision**: FormData for image upload with compression
**Rationale**:

- Efficient binary data transfer
- Built-in browser compression
- Progress tracking capabilities
- Standard multipart/form-data format

### Caching Strategy

**Decision**: Static facility data caching with SWR pattern
**Rationale**:

- Facility data changes infrequently
- Reduce API calls and improve perceived performance
- Offline resilience for map data
- Automatic revalidation when needed

## Deployment Architecture Research

### Frontend Hosting: Vercel

**Decision**: Deploy Next.js app to Vercel
**Rationale**:

- Optimized for Next.js applications
- Edge network for fast global delivery
- Free tier suitable for thesis project
- Automatic deployments from Git

### ML Service Hosting: Railway/Docker

**Decision**: Containerized FastAPI service
**Rationale**:

- Consistent deployment environment
- Easy scaling if needed
- Isolated ML dependencies
- Simple CI/CD integration

### Model Storage Strategy

**Decision**: Local file storage in ML service container
**Rationale**:

- Fastest model loading at startup
- No external dependencies for inference
- Simple deployment process
- Suitable for static pre-trained models

## Privacy & Security Research

### Image Processing Privacy

**Decision**: Temporary server-side processing with immediate deletion
**Rationale**:

- No persistent image storage
- Process in memory only
- Clear data retention policies
- GDPR-compliant approach

### API Security

**Decision**: HTTPS only with input validation
**Rationale**:

- Encrypted data transmission
- Server-side image validation
- Rate limiting to prevent abuse
- CORS configuration for web security

## Testing Strategy Research

### Manual Testing Approach

**Decision**: Comprehensive manual testing with real devices
**Rationale**:

- Small project scope doesn't justify test automation overhead
- Camera functionality requires real device testing
- Visual components need human verification
- Performance testing requires actual mobile devices

### Testing Checklist Development

**Decision**: Structured testing scenarios based on acceptance criteria
**Rationale**:

- Ensures all requirements coverage
- Reproducible testing process
- Clear success/failure criteria
- Documentation for project evaluation

## Conclusion

All technology choices prioritize:

1. **Performance**: Mobile-first optimization and efficient processing
2. **Simplicity**: Minimal dependencies and straightforward architecture
3. **Cost**: Free/low-cost solutions suitable for thesis project
4. **Reliability**: Proven technologies with good documentation
5. **Privacy**: Minimal data retention and transparent processing

The selected stack provides a solid foundation for building a real-time waste classification web application that meets all constitutional requirements while remaining feasible for a single developer thesis project.

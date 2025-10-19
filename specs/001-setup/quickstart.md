# Quickstart Guide: JakOlah Development

## Prerequisites

### Required Software

- **Node.js 18+** - Runtime for Next.js frontend
- **Python 3.11+** - Runtime for FastAPI ML service
- **Git** - Version control
- **VS Code** (recommended) - Development environment

### Required Accounts

- **Supabase** - Database and backend services (free tier)
- **Vercel** (optional) - Frontend deployment
- **Railway/Docker** (optional) - ML service deployment

## Quick Setup (15 minutes)

### 1. Clone and Initialize Project

```bash
# Clone repository
git clone <repository-url>
cd JakOlah

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ML Service Configuration
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_API_KEY=your_api_key

# Optional: Map Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token (if using Mapbox instead of OpenStreetMap)
```

### 3. Setup Database (Supabase)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_ref

# Run migrations
supabase db push

# Seed initial data
supabase db seed
```

### 4. Setup ML Service

```bash
# Navigate to ML service directory
cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download/copy model files
mkdir -p models
# Copy your pre-trained models to ml-service/models/

# Start ML service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start Development Server

```bash
# In project root directory
npm run dev
```

## Verification Checklist

### ✅ Frontend (http://localhost:3000)

- [ ] Home page loads correctly
- [ ] Navigation works between pages (/, /classify, /informasi)
- [ ] Camera permission request works
- [ ] Map displays on classify page
- [ ] Responsive design works on mobile

### ✅ Backend APIs

Test with curl or Postman:

```bash
# Test facilities endpoint
curl "http://localhost:3000/api/facilities?limit=5"

# Test classification endpoint (requires image file)
curl -X POST \
  -F "image=@test-image.jpg" \
  -F "sessionId=test-session-123" \
  http://localhost:3000/api/classify-frame
```

### ✅ ML Service (http://localhost:8000)

- [ ] FastAPI docs accessible at `/docs`
- [ ] Health check endpoint responds
- [ ] Model loading successful (check logs)
- [ ] Image classification endpoint works

### ✅ Database (Supabase)

- [ ] Tables created successfully
- [ ] Seed data populated
- [ ] Spatial queries work for facility lookup
- [ ] API access configured correctly

## Common Issues & Solutions

### Issue: Camera not working in browser

**Solution**:

- Ensure HTTPS in production (camera API requires secure context)
- Check browser permissions for camera access
- Test in different browsers (Chrome, Firefox, Safari)

### Issue: ML service connection failed

**Solution**:

- Verify ML service is running on correct port
- Check firewall/network settings
- Ensure model files are present in ml-service/models/
- Check Python dependencies are installed

### Issue: Database connection error

**Solution**:

- Verify Supabase credentials in .env.local
- Check network connectivity to Supabase
- Ensure database schema is up to date
- Verify API keys have correct permissions

### Issue: Map not displaying

**Solution**:

- Check console for JavaScript errors
- Verify map provider API keys (if using external service)
- Ensure React-Leaflet components are properly imported
- Test with simplified map component first

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. Testing Process

Since we're using manual testing:

#### Camera Functionality

1. Test on actual mobile devices
2. Verify different lighting conditions
3. Test with various waste items
4. Check bounding box accuracy

#### API Endpoints

1. Test with Postman/curl
2. Verify error handling
3. Check response times
4. Test edge cases

#### UI/UX Testing

1. Test responsive design on multiple screen sizes
2. Verify accessibility with keyboard navigation
3. Test in different browsers
4. Check performance on low-end devices

### 3. Deployment Process

#### Frontend (Vercel)

```bash
# Connect to Vercel
npx vercel --prod

# Environment variables will be set in Vercel dashboard
```

#### ML Service (Railway)

```bash
# Create Dockerfile in ml-service/
# Push to repository
# Deploy via Railway dashboard
```

## Performance Optimization

### Frontend Optimization

- Enable Next.js Image Optimization
- Use dynamic imports for heavy components
- Implement service worker for caching
- Optimize bundle size with webpack-bundle-analyzer

### ML Service Optimization

- Use async/await for concurrent processing
- Implement request queuing for high load
- Cache model in memory
- Use efficient image preprocessing

### Database Optimization

- Create proper indexes on frequently queried columns
- Use spatial indexes for geographic queries
- Implement connection pooling
- Cache facility data in frontend

## Monitoring & Debugging

### Development Tools

- **Next.js DevTools** - Component inspection
- **React DevTools** - State and props debugging
- **Browser DevTools** - Network and performance monitoring
- **Supabase Dashboard** - Database monitoring

### Logging Strategy

- Frontend: Console logging for development
- Backend: Structured logging with timestamps
- ML Service: Request/response logging with metrics
- Database: Query performance monitoring

### Performance Metrics

- Track classification response times
- Monitor camera frame rates
- Measure API response times
- Track database query performance

## Next Steps

### After Basic Setup

1. Implement user feedback collection
2. Add error tracking and monitoring
3. Optimize for production deployment
4. Conduct user acceptance testing
5. Prepare thesis documentation

### Potential Enhancements

- Progressive Web App (PWA) capabilities
- Offline classification support
- Batch processing for multiple images
- Analytics dashboard for usage metrics
- Integration with Jakarta waste management systems

## Support & Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)

### Community Support

- Next.js Discord
- FastAPI GitHub Discussions
- Supabase Discord
- Stack Overflow for specific issues

This quickstart guide should get you up and running with JakOlah development in under 30 minutes. Follow the verification checklist to ensure everything is working correctly before starting feature development.

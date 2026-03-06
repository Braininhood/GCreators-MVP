# Developer Checklist - G.Creators MVP

**Last Updated:** February 21, 2026  
**Current Status:** 40-50% Complete  
**Target:** Fully functional MVP in 10-11 weeks

---

## 🎯 Priority System

- 🔴 **CRITICAL** - Launch blockers, must be done first
- 🟡 **HIGH** - Core features, needed for MVP
- 🟢 **MEDIUM** - Enhancement features, can wait
- 🔵 **LOW** - Nice-to-have, post-launch

---

## ✅ Completed Items

### Infrastructure:
- [x] Project setup with Vite + React + TypeScript
- [x] Supabase integration configured
- [x] Tailwind CSS + Radix UI components
- [x] Responsive design implemented
- [x] HTTPS/SSL configured
- [x] Environment variables structure created
- [x] Git repository initialized
- [x] Development server working (localhost:8080)

### Authentication:
- [x] Supabase auth integrated
- [x] Login page functional
- [x] Registration forms created
- [x] Session management working
- [x] Protected routes implemented
- [ ] **Role-based registration (learner vs mentor)** ⚠️ MISSING
- [ ] **Separate dashboards by role** ⚠️ MISSING
- [ ] Role selection during signup
- [ ] Redirect to appropriate dashboard based on role

### UI/UX:
- [x] Homepage designed and implemented
- [x] Mentor listing page created
- [x] Mentor profile pages working
- [x] User dashboard implemented
- [x] Navigation menu functional
- [x] Mobile responsive design

### Database:
- [x] Basic Supabase schema exists
- [x] Profiles table created
- [x] User roles implemented

---

## 🔴 CRITICAL - Must Complete for Launch

### 0. Role-Based Authentication & Registration (Week 1) 🆕
**Status:** 30% - Database has roles, but UI doesn't support it  
**Blocker:** Users can't properly register as learner or mentor

#### Current Problem:
- Single `/auth` page for both learners and mentors
- No role selection during signup
- No mentor-specific fields (expertise, bio, rate)
- All users redirected to same `/dashboard`
- Database has `role` field but it's not being set properly

#### Database Schema (Already Exists):
```sql
profiles table:
- role TEXT NOT NULL (values: 'learner', 'mentor', 'admin')

user_roles table:
- user_id UUID
- role app_role ('admin', 'moderator', 'user')
```

#### Tasks:

**A. Update Registration Flow:**
- [ ] Add role selection to signup form (learner/mentor radio buttons)
- [ ] Create mentor-specific fields:
  - [ ] Expertise/skills (tags)
  - [ ] Bio (text area)
  - [ ] Years of experience
  - [ ] Hourly rate
  - [ ] Professional title
- [ ] Update `handleSignUp` to save role to profiles table
- [ ] Update `handleSignUp` to save mentor fields if role='mentor'
- [ ] Add form validation for mentor-required fields

**B. Separate Auth Pages (Optional but Recommended):**
- [ ] Create `/auth/learner` - Registration for learners
- [ ] Create `/auth/mentor` - Registration for mentors  
- [ ] Update homepage buttons to point to correct auth page
- [ ] Keep `/auth` as generic login page

**C. Role-Based Dashboard Routing:**
- [ ] Update login redirect logic in `Auth.tsx`:
  ```typescript
  // After successful login, check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // Redirect based on role
  if (profile.role === 'mentor') {
    navigate('/mentor-cabinet');
  } else {
    navigate('/dashboard'); // learner dashboard
  }
  ```
- [ ] Add role check to Dashboard.tsx
- [ ] Add role check to MentorCabinet.tsx
- [ ] Prevent learners from accessing `/mentor-cabinet`
- [ ] Prevent mentors from accessing learner-only pages

**D. Update Existing Dashboards:**
- [ ] **Learner Dashboard** (`/dashboard`):
  - Show AI recommendations
  - Show booked sessions
  - Show purchased products
  - Show messages from mentors
  - Show goals/progress
  
- [ ] **Mentor Dashboard** (`/mentor-cabinet`):
  - Show availability calendar
  - Show upcoming sessions
  - Show earnings/payouts
  - Show product uploads
  - Show messages from learners
  - Show analytics

**E. Database Updates:**
- [ ] Ensure all profiles have `role` set (migration if needed)
- [ ] Add mentor-specific fields to profiles table:
  ```sql
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise TEXT[];
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_title TEXT;
  ```
- [ ] Add RLS policies for role-based access

**Files to create/modify:**
- `src/pages/Auth.tsx` - Add role selection to signup
- `src/pages/AuthLearner.tsx` - NEW (optional)
- `src/pages/AuthMentor.tsx` - NEW (optional)
- `src/components/RoleSelector.tsx` - NEW
- `src/components/MentorSignupFields.tsx` - NEW
- `src/hooks/useUserRole.ts` - NEW (hook to get current user role)
- `src/utils/redirectByRole.ts` - NEW (redirect logic)
- `supabase/migrations/[timestamp]_add_mentor_fields.sql` - NEW

**Testing checklist:**
- [ ] Learner can sign up as learner
- [ ] Mentor can sign up as mentor with all fields
- [ ] Learner login redirects to `/dashboard`
- [ ] Mentor login redirects to `/mentor-cabinet`
- [ ] Role is saved correctly in database
- [ ] Learners can't access mentor pages
- [ ] Mentors can't access learner-only pages
- [ ] Homepage buttons work correctly

**Priority:** 🔴 CRITICAL - Must fix before any other features!

---

### 1. Stripe Payment Configuration (Week 1-2)
**Status:** 10% - Keys added, not configured  
**Blocker:** Cannot generate revenue without this

#### Tasks:
- [ ] Set up Stripe Connect account
- [ ] Configure Stripe Checkout sessions for consultations
- [ ] Configure Stripe Checkout sessions for products
- [ ] Implement webhook endpoint (`/api/webhooks/stripe`)
- [ ] Add webhook handlers:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
- [ ] Set up mentor payout system (Stripe Connect)
- [ ] Create transactions table in Supabase
- [ ] Create stripe_accounts table in Supabase
- [ ] Implement platform fee calculation (15%)
- [ ] Test payment flow end-to-end in test mode
- [ ] Add payment confirmation pages
- [ ] Add error handling for failed payments

**Files to create/modify:**
- `src/api/stripe/checkout.ts` - Checkout session creation
- `src/api/webhooks/stripe.ts` - Webhook handler
- `src/lib/stripe.ts` - Stripe client setup
- `supabase/migrations/[timestamp]_add_payments.sql` - DB schema

**Testing checklist:**
- [ ] Test consultation payment
- [ ] Test product payment  
- [ ] Test webhook delivery
- [ ] Test payout to mentor
- [ ] Test refund flow

---

### 2. Booking System Implementation (Week 2-3)
**Status:** 0% - Not started  
**Blocker:** Core monetization feature

#### Database Tables Needed:
- [ ] Create `bookings` table
- [ ] Create `availability_slots` table
- [ ] Create `mentor_services` table
- [ ] Create `calendars` table
- [ ] Add RLS policies for all tables

#### Backend Tasks:
- [ ] API: Get mentor availability
- [ ] API: Create booking
- [ ] API: Update booking status
- [ ] API: Cancel booking
- [ ] API: Get user bookings
- [ ] API: Get mentor bookings

#### Frontend Tasks:
- [ ] Build availability management UI (mentor side)
- [ ] Build calendar view component
- [ ] Build time slot picker component
- [ ] Build booking flow (user side)
- [ ] Add time zone conversion
- [ ] Add booking confirmation page
- [ ] Add booking cancellation flow
- [ ] Add "My Bookings" page

#### Integration Tasks:
- [ ] Connect booking to Stripe payment
- [ ] Send email notifications on booking
- [ ] Add to mentor's calendar (Google/Outlook)
- [ ] Add to user's calendar
- [ ] Set up reminder notifications (24h, 1h before)

**Files to create:**
- `src/components/BookingCalendar.tsx`
- `src/components/TimeSlotPicker.tsx`
- `src/components/AvailabilityManager.tsx`
- `src/pages/Booking.tsx`
- `src/pages/MyBookings.tsx`
- `src/api/bookings/*.ts`
- `supabase/migrations/[timestamp]_add_bookings.sql`

**Testing checklist:**
- [ ] Mentor can set availability
- [ ] User can see available slots
- [ ] User can book consultation
- [ ] Payment processes correctly
- [ ] Calendar events created
- [ ] Notifications sent
- [ ] Cancellation works
- [ ] Refunds process

---

### 3. Digital Products Marketplace (Week 3-4)
**Status:** 0% - Not started  
**Blocker:** Secondary revenue stream missing

#### Database Tables Needed:
- [ ] Create `digital_products` table
- [ ] Create `product_variants` table (for translations/formats)
- [ ] Create `product_purchases` table
- [ ] Add RLS policies

#### Backend Tasks:
- [ ] API: Upload product files to Supabase Storage
- [ ] API: Create product listing
- [ ] API: Update product
- [ ] API: Delete product
- [ ] API: Get products by mentor
- [ ] API: Purchase product
- [ ] API: Get user purchases
- [ ] API: Generate download links

#### Frontend Tasks:
- [ ] Build product upload form (mentor side)
- [ ] Build products management page (mentor)
- [ ] Build shop page (`/shop/:username`)
- [ ] Build product detail page
- [ ] Build purchase flow
- [ ] Build "My Purchases" page
- [ ] Add product download functionality
- [ ] Add product preview (for samples)

#### Integration Tasks:
- [ ] Connect purchase to Stripe payment
- [ ] Send purchase confirmation email
- [ ] Track download analytics
- [ ] Implement access control for purchased products

**Files to create:**
- `src/components/ProductUpload.tsx`
- `src/components/ProductCard.tsx`
- `src/pages/MentorShop.tsx`
- `src/pages/MyPurchases.tsx`
- `src/api/products/*.ts`
- `supabase/migrations/[timestamp]_add_products.sql`

**Testing checklist:**
- [ ] Mentor can upload products
- [ ] Products display in shop
- [ ] User can purchase
- [ ] Payment processes
- [ ] Download works
- [ ] Access control enforced

---

### 4. Environment Configuration
**Status:** 70% - Supabase configured, others missing  
**Blocker:** Services won't work without API keys

#### Required Now:
- [x] Supabase URL and keys
- [ ] Supabase Service Role Key (get from dashboard)
- [ ] Stripe Publishable Key
- [ ] Stripe Secret Key
- [ ] Stripe Webhook Secret
- [ ] JWT Secret (generate with `openssl rand -base64 32`)
- [ ] Session Secret (generate with `openssl rand -base64 32`)

#### Required Soon (Week 2-3):
- [ ] Google Calendar API credentials
- [ ] Microsoft Graph API credentials (optional)
- [ ] Email service API key (Resend recommended)
- [ ] Email domain verification

#### Required Later (Week 4+):
- [ ] AI provider API key (Gemini or OpenAI)
- [ ] Translation service API key (DeepL)
- [ ] OpenAI Whisper API key (for transcription)
- [ ] Text-to-Speech API key (optional)

**Action:** See `ENVIRONMENT_SETUP_GUIDE.md` for detailed instructions

---

## 🟡 HIGH PRIORITY - Core MVP Features

### 5. Calendar Integration (Week 3)
**Status:** 0% - Not started

#### Tasks:
- [ ] Set up Google Cloud project
- [ ] Enable Google Calendar API
- [ ] Create OAuth 2.0 credentials
- [ ] Implement Google OAuth flow
- [ ] Add calendar event creation
- [ ] Add calendar event updates
- [ ] Add calendar event deletion
- [ ] Set up Microsoft Graph API (optional)
- [ ] Implement Outlook calendar integration
- [ ] Test two-way sync

**Dependencies:** Booking system must be complete first

---

### 6. AI Mentor Matching Logic (Week 4)
**Status:** 20% - UI exists, no backend logic

#### Current Issues:
- Recommendations display but aren't actually AI-powered
- No goal/objective input
- No matching algorithm

#### Tasks:
- [ ] Create user goals/interests data model
- [ ] Build goal input interface
- [ ] Implement matching algorithm
- [ ] Store user preferences
- [ ] Calculate match percentages
- [ ] Improve recommendation display
- [ ] Add filtering by goals

**AI Integration:**
- [ ] Set up AI API (Gemini recommended to start)
- [ ] Create prompt for mentor matching
- [ ] Implement semantic search
- [ ] Track matching accuracy

---

### 7. Chat/Messaging System (Week 4-5)
**Status:** 0% - Not started

#### Database Tables Needed:
- [ ] Create `conversations` table
- [ ] Create `messages` table
- [ ] Add RLS policies

#### Tasks:
- [ ] Set up Supabase Realtime subscriptions
- [ ] Build chat UI component
- [ ] Implement message sending
- [ ] Implement message receiving (real-time)
- [ ] Add conversation list
- [ ] Add unread message indicators
- [ ] Add message notifications
- [ ] Add file attachment support (optional)

---

### 8. Video Response Feature (Week 5)
**Status:** 0% - Not started

#### Tasks:
- [ ] Research video upload library
- [ ] Implement video recorder component
- [ ] Add 10-minute time limit
- [ ] Upload videos to Supabase Storage
- [ ] Create video player component
- [ ] Add video response in mentor dashboard
- [ ] Add video viewing in user dashboard
- [ ] Add video notifications

---

### 9. AI Avatar Consultations (Week 5-6)
**Status:** 15% - Avatar creation mentioned, not functional

#### Database Tables Needed:
- [ ] Create `mentor_knowledge_base` table with vector embeddings
- [ ] Create `ai_conversations` table
- [ ] Add usage tracking

#### Tasks:
- [ ] Enable pgvector extension in Supabase
- [ ] Build knowledge base upload interface
- [ ] Implement content processing
- [ ] Store embeddings for RAG
- [ ] Set up AI provider (Gemini/OpenAI)
- [ ] Implement RAG query system
- [ ] Build AI chat interface
- [ ] Add conversation history
- [ ] Implement usage limits
- [ ] Add cost tracking per mentor

---

### 10. Email Notification System (Week 6)
**Status:** 0% - Not started

#### Email Templates Needed:
- [ ] Welcome email
- [ ] Booking confirmation (mentor)
- [ ] Booking confirmation (user)
- [ ] Booking reminder (24h before)
- [ ] Booking reminder (1h before)
- [ ] Booking cancellation
- [ ] Product purchase confirmation
- [ ] Password reset
- [ ] New message notification

#### Tasks:
- [ ] Set up Resend account
- [ ] Verify email domain
- [ ] Create email templates
- [ ] Implement email sending service
- [ ] Add email preferences
- [ ] Test all email flows

---

## 🟢 MEDIUM PRIORITY - Enhancement Features

### 11. Content Translation (Week 7)
**Status:** 0% - Not started

#### Tasks:
- [ ] Set up DeepL API
- [ ] Create translation service
- [ ] Add language selection UI
- [ ] Implement product translation
- [ ] Implement course translation
- [ ] Add technical terms dictionary
- [ ] Build quality review workflow

---

### 12. Format Conversion (Week 7)
**Status:** 0% - Not started

#### Tasks:
- [ ] Set up OpenAI Whisper for transcription
- [ ] Implement video → text conversion
- [ ] Implement video → slides extraction
- [ ] Implement PDF → text conversion
- [ ] Add format selection UI
- [ ] Store multiple formats per product

---

### 13. Reviews & Ratings System
**Status:** 0% - Not started

#### Tasks:
- [ ] Create `reviews` table
- [ ] Add review submission form
- [ ] Display reviews on mentor profiles
- [ ] Calculate average ratings
- [ ] Add review moderation

---

### 14. Analytics Dashboard
**Status:** 0% - Not started

#### For Mentors:
- [ ] Earnings over time
- [ ] Bookings count
- [ ] Products sold
- [ ] Profile views
- [ ] Conversion rates

#### For Admin:
- [ ] Platform revenue
- [ ] Active users
- [ ] Active mentors
- [ ] Transaction volume
- [ ] User growth

---

## 🔵 LOW PRIORITY - Post-Launch

### 15. SMS Notifications
- [ ] Set up Twilio
- [ ] Add SMS for booking reminders
- [ ] Add user SMS preferences

### 16. Advanced Search & Filters
- [ ] Filter by price range
- [ ] Filter by rating
- [ ] Filter by availability
- [ ] Advanced sorting options

### 17. Referral System
- [ ] Generate referral codes
- [ ] Track referrals
- [ ] Add referral rewards

### 18. Mobile App
- [ ] Research React Native
- [ ] Plan mobile app features
- [ ] Develop MVP mobile app

---

## 🐛 Known Bugs to Fix

### High Priority Bugs:
1. **"Join as Learner" button redirects to wrong page**
   - Current: Goes to `/mentors`
   - Expected: Go to `/auth?mode=signup&role=user`
   - File: Check homepage button routing

2. **Environment variable mismatch**
   - ✅ Fixed: Changed from `NEXT_PUBLIC_` to `VITE_` prefix
   - Verify all components use correct prefix

3. **Browserslist database outdated**
   - ✅ Fixed: Updated with `npm update caniuse-lite browserslist`

### Medium Priority Bugs:
4. **Missing Service Role Key**
   - Service role key not in `.env`
   - Need to add for server-side operations

5. **Registration flow incomplete** 🔴 CRITICAL
   - **Role selection missing** - No way to choose learner vs mentor during signup
   - Mentor-specific fields missing (expertise, bio, hourly rate)
   - All users get same generic registration
   - No redirect to role-appropriate dashboard
   - File: `src/pages/Auth.tsx` needs complete rewrite

6. **Single dashboard for all roles** 🔴 CRITICAL
   - Currently `/dashboard` is same for everyone
   - Need separate `/dashboard` (learner) and `/mentor-cabinet` (mentor)
   - Redirect after login should check role
   - File: `src/pages/Auth.tsx` and routing logic

---

## 📋 Code Quality Improvements

### Immediate:
- [ ] Add error boundaries
- [ ] Add loading states for all API calls
- [ ] Add form validation
- [ ] Add input sanitization
- [ ] Add rate limiting

### Soon:
- [ ] Add unit tests for utilities
- [ ] Add integration tests for API routes
- [ ] Add E2E tests for critical flows
- [ ] Add performance monitoring
- [ ] Add error tracking (Sentry)

### Later:
- [ ] Refactor large components
- [ ] Extract reusable hooks
- [ ] Optimize bundle size
- [ ] Add code splitting
- [ ] Improve accessibility (ARIA labels)

---

## 🚀 Deployment Checklist

### Before First Deploy:
- [ ] All critical features implemented
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Stripe in live mode (not test)
- [ ] Email domain verified
- [ ] SSL certificate configured
- [ ] Error monitoring set up
- [ ] Backup system configured

### Testing Before Launch:
- [ ] Payment flow tested end-to-end
- [ ] Booking flow tested
- [ ] All emails sending correctly
- [ ] Calendar sync working
- [ ] Mobile responsive verified
- [ ] Cross-browser tested
- [ ] Security audit completed
- [ ] Performance tested under load

---

## 📊 Progress Tracking

### Overall Completion:
```
Infrastructure:        90% ████████████████████░░
Authentication:        85% █████████████████░░░░
UI/UX:                75% ███████████████░░░░░░
Payments:             10% ██░░░░░░░░░░░░░░░░░░░
Booking:               0% ░░░░░░░░░░░░░░░░░░░░░
Products:              0% ░░░░░░░░░░░░░░░░░░░░░
Chat:                  0% ░░░░░░░░░░░░░░░░░░░░░
AI Features:          15% ███░░░░░░░░░░░░░░░░░░
Calendar:              0% ░░░░░░░░░░░░░░░░░░░░░
Email:                 0% ░░░░░░░░░░░░░░░░░░░░░

TOTAL:                40% ████████░░░░░░░░░░░░░
```

### Weekly Goals:
- **Week 1:** Stripe configuration + Start booking system
- **Week 2:** Complete booking system
- **Week 3:** Calendar integration + Start products
- **Week 4:** Complete products + Start AI features
- **Week 5:** Complete AI avatar + Chat
- **Week 6:** Email notifications + Testing
- **Week 7:** Translation + Format conversion
- **Week 8:** Integration testing
- **Week 9:** Bug fixes + Polish
- **Week 10:** Final testing + Launch prep

---

## 📞 Team Responsibilities

### Backend Developer:
- Stripe integration
- API routes for bookings/products
- Database schema updates
- Webhook handling

### Frontend Developer:
- Booking UI components
- Product marketplace UI
- Chat interface
- Calendar components

### AI Specialist (Part-time):
- Vector database setup
- RAG implementation
- AI matching algorithm
- Content processing

### QA Tester (Part-time):
- Test all payment flows
- Test booking scenarios
- Verify email notifications
- Cross-browser testing

---

## 🎯 Definition of Done

For each feature to be considered "done":
- [ ] Code implemented and reviewed
- [ ] Database migrations applied
- [ ] API endpoints tested
- [ ] UI components completed
- [ ] Error handling added
- [ ] Loading states added
- [ ] Validation implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Tested in staging environment
- [ ] Product owner approved

---

**Last Updated:** February 21, 2026  
**Next Review:** After Phase 1 completion (Stripe + Booking)  
**Questions?** See `DEVELOPMENT_ROADMAP.md` for detailed implementation plans

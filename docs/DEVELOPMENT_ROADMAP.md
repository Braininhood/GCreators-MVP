# G.Creators MVP - Development Roadmap

**Last Updated:** February 20, 2026  
**Status:** In Development - Core Features Implementation Phase

---

## 🎯 Current State vs Required Features

### ✅ What's Already Done:
- Homepage and navigation
- Mentor browsing and profiles
- User authentication (Supabase)
- Basic dashboard structure
- AI avatar creation capability for mentors
- Stripe payment system connected (needs configuration)
- Responsive design

### 🔴 What Needs Implementation:

#### 1. **Stripe Payment System Configuration**
**Status:** Connected but not properly configured  
**Priority:** 🔴 Critical

**Requirements:**
- Configure payment acceptance for consultation bookings
- Set up payment processing for digital product purchases
- Implement proper payment flow (checkout → confirmation → delivery)
- Configure webhooks for payment status updates
- Handle refunds and disputes
- Set up mentor payout system (Stripe Connect)

---

#### 2. **Consultation Booking with Calendar Integration**
**Status:** Not implemented  
**Priority:** 🔴 Critical

**Requirements:**
- User can select available time slots from mentor's calendar
- Booking automatically added to mentor's calendar
- Booking automatically added to user's calendar
- Email notifications sent to both parties
- Calendar sync with Google Calendar / Outlook
- Booking confirmation and reminders
- Cancellation and rescheduling functionality
- Time zone handling

---

#### 3. **AI Avatar for Consultations**
**Status:** Avatar creation done, consultation functionality missing  
**Priority:** 🟡 High

**Requirements:**
- AI avatar can answer questions about mentor's digital products
- AI avatar can provide consultations on mentor's services
- Avatar trained on mentor's knowledge base
- Avatar can handle text-based conversations
- Avatar can provide voice responses (optional)
- Integration with chat system
- Usage limits and token tracking

---

#### 4. **Digital Products Scaling (Multi-language & Format Conversion)**
**Status:** Not implemented  
**Priority:** 🟡 High

**Requirements:**
- Automatic translation of digital products to multiple languages
- Format conversion capabilities:
  - Video → Text transcript
  - Video → Presentation (slides)
  - PDF → Text
  - Audio → Text transcript
  - Text → Multiple formats
- Language support: English, Ukrainian, Spanish, French, German (minimum)
- Quality control for translations
- Preview before publishing scaled versions

---

## 📋 Step-by-Step Implementation Plan

### Phase 1: Critical Foundation (Weeks 1-2)
**Goal:** Get core monetization working

#### Week 1: Stripe Payment Configuration
- [ ] **Day 1-2: Payment Flow Design**
  - Design checkout flow for consultations
  - Design checkout flow for digital products
  - Create payment confirmation pages
  
- [ ] **Day 3-4: Stripe Integration**
  - Configure Stripe Checkout for consultations
  - Configure Stripe Checkout for digital products
  - Set up Stripe webhooks endpoint
  - Handle payment success/failure events
  
- [ ] **Day 5-7: Mentor Payouts**
  - Set up Stripe Connect for mentor accounts
  - Implement payout schedule (weekly/monthly)
  - Create payout dashboard for mentors
  - Handle platform fees (commission)

#### Week 2: Booking System
- [x] **Day 1-2: Database Schema**
  - Create `bookings` table in Supabase
  - Create availability slots (`mentor_time_slots` + `mentor_weekly_availability` for recurring rules)
  - Create calendar connections (`mentor_calendar_connections` for Google Calendar sync)
  - Set up relationships and constraints
  
- [x] **Day 3-4: Availability Management**
  - Build mentor availability setting interface (`WeeklyAvailabilityEditor` in Mentor Cabinet)
  - Create calendar view component (`TimeSlotSelector` — week view, date then time slots)
  - Allow recurring availability rules (`mentor_weekly_availability`, slots generated from weekly)
  - Handle time zone conversion (profiles/mentor_profiles `timezone`, `formatBookingInTimezone`, display per user TZ)
  
- [x] **Day 5-7: Booking Flow**
  - Build user booking interface (MentorProfile page, `BookingCalendar`, `TimeSlotSelector`)
  - Implement time slot selection (`TimeSlotSelector`, slots from weekly + bookings)
  - Connect to Stripe payment (`create-booking` edge function → Stripe Checkout)
  - Create booking confirmation (`BookingSuccess` page, `/learner/booking-success`)
  - Send email notifications (`send-booking-confirmation` edge function invoked from BookingSuccess)

---

### Phase 2: Calendar Integration (Week 3)
**Goal:** Automatic calendar sync

- [ ] **Day 1-2: Calendar API Integration**
  - Integrate Google Calendar API
  - Integrate Microsoft Outlook API - tmporary no, we use ics files
  - Handle OAuth authentication
  
- [ ] **Day 3-4: Two-Way Sync**
  - Add bookings to mentor's calendar
  - Add bookings to user's calendar
  - Handle calendar updates (cancellations)
  - Sync external calendar blocks to availability
  
- [ ] **Day 5-7: Notifications & Reminders**
  - Email notification system - resend
  - SMS reminders (optional - Twilio) - temporary not need 
  - In-app notifications
  - Reminder schedule (24h, 1h before) - clever and professional

---

### Phase 3: AI Avatar Consultations (Weeks 4-5)
**Goal:** AI avatar can answer questions and provide consultations

#### Week 4: AI Avatar Backend
- [x] **Day 1-2: Knowledge Base System**
  - Create `mentor_knowledge_base` table ✅
  - Build upload interface for mentor content (`KnowledgeBaseManager` component) ✅
  - File upload support: PDF, Word, Excel, PowerPoint, TXT, CSV, MP4, MP3 (50MB limit) ✅
  - Text extraction via `extract-file-content` Edge Function (OpenAI GPT-4o for PDF/Office, Whisper for audio/video) ✅
  - `knowledge-base-files` Supabase Storage bucket with RLS ✅
  - Implement content processing pipeline (train-avatar includes custom KB entries) ✅
  - Store embeddings for RAG — fixed dimension to 1536 (OpenAI text-embedding-3-small) ✅
  - Fixed train-avatar: resilient error handling, skips unavailable tables gracefully ✅
  
- [x] **Day 3-4: AI Integration**
  - AI provider: OpenAI gpt-4o-mini ✅
  - Vector database: Supabase pgvector (1536-dim IVFFlat index) ✅
  - RAG query system: `match_avatar_knowledge` RPC with cosine similarity ✅
  - AI response generation via OpenAI chat completions ✅
  
- [x] **Day 5-7: Chat Interface**
  - Chat UI: `AvatarChatInterface` component ✅
  - Real-time message streaming: `chat-with-avatar-stream` Edge Function + SSE ✅
  - Conversation context: last 10 messages included in every request ✅
  - Usage tracking: `avatar_usage_stats` table + analytics dashboard ✅

#### Week 5: AI Avatar Features
- [x] **Day 1-3: Product & Service Consultation**
  - Train avatar on digital product details (`mentor_products` included in training) ✅
  - Train avatar on service offerings (mentor profile + custom KB entries) ✅
  - Product recommendations via RAG knowledge base context ✅
  - Purchase assistance via quick-action "Book Session" button in chat ✅
  
- [ ] **Day 4-5: Voice Integration (Optional)**
  - Text-to-speech for avatar responses
  - Voice selection for mentor avatar
  
- [x] **Day 6-7: Limits & Monitoring**
  - Conversation limit per user: 20 messages per avatar (429 response + friendly UI message) ✅
  - Token tracking: stored in `avatar_messages.metadata` + aggregated via `get_avatar_stats` RPC ✅
  - Mentor analytics dashboard: real conversations, messages, unique users, tokens ✅
  - Admin monitoring dashboard: all avatars table with status, usage, tokens, last active ✅
  - Quality assurance: full conversation history stored and queryable ✅

---

### Phase 4: Content Scaling (Weeks 6-7)
**Goal:** Multi-language and format conversion

#### Week 6: Translation System
- [ ] **Day 1-2: Translation Infrastructure**
  - Choose translation service (see recommendations)
  - Set up API integration
  - Create translation queue system
  
- [ ] **Day 3-5: Content Translation**
  - Implement text translation
  - Translate product titles/descriptions
  - Translate course content
  - Handle technical terms dictionary
  
- [ ] **Day 6-7: Quality Control**
  - Manual review interface
  - Edit translated content
  - Approval workflow
  - Preview translations

#### Week 7: Format Conversion
- [ ] **Day 1-2: Video Processing**
  - Video transcription (Speech-to-Text)
  - Generate subtitles
  - Extract key frames
  
- [ ] **Day 3-4: Document Conversion**
  - Video → Text document
  - Video → Presentation (slide extraction)
  - PDF → Text
  - Audio → Text
  
- [ ] **Day 5-7: Format Generation**
  - Generate multiple formats per product
  - Create product bundles (all formats)
  - Pricing for different formats
  - Download management

---

### Phase 5: Integration & Testing (Week 8)
**Goal:** Everything works together

- [ ] **Day 1-3: Integration Testing**
  - Test complete booking flow with payment
  - Test AI avatar with real knowledge base
  - Test translation and conversion pipelines
  - Fix integration bugs
  
- [ ] **Day 4-5: User Testing**
  - Internal team testing
  - Beta user testing
  - Collect feedback
  - Prioritize fixes
  
- [ ] **Day 6-7: Performance Optimization**
  - Optimize database queries
  - Implement caching
  - Optimize API calls
  - Load testing

---

### Phase 6: Launch Preparation (Week 9-10)
**Goal:** Production-ready platform

#### Week 9: Polish & Documentation
- [ ] Create user onboarding flow
- [ ] Write help documentation
- [ ] Create video tutorials
- [ ] Set up customer support system
- [ ] Prepare marketing materials

#### Week 10: Final Testing & Launch
- [ ] Security audit
- [ ] Performance testing
- [ ] Payment testing (test mode → live mode)
- [ ] Backup systems in place
- [ ] Monitoring and alerts set up
- [ ] **🚀 LAUNCH**

---

## 🛠️ Technical Stack Recommendations

### Required Services:

#### 1. **Backend & Database**
- ✅ **Supabase** (Already in use)
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for files
  - Edge Functions for serverless logic

#### 2. **Payment Processing**
- ✅ **Stripe** (Already connected)
  - Stripe Checkout for payments
  - Stripe Connect for mentor payouts
  - Webhooks for event handling
  - Cost: 2.9% + $0.30 per transaction

#### 3. **AI Services** (Price/Quality Recommendations)

**Option A: OpenAI (Best Quality, Higher Cost)**
- **GPT-4o**: $2.50 per 1M input tokens, $10.00 per 1M output tokens
- **Best for:** Complex consultations, high-quality responses
- **Embeddings:** $0.13 per 1M tokens
- **Estimated monthly cost:** $200-500 for 50-100 active mentors

**Option B: Anthropic Claude (Balanced)**
- **Claude 3.5 Sonnet**: $3.00 per 1M input tokens, $15.00 per 1M output tokens
- **Best for:** Detailed explanations, safer responses
- **Estimated monthly cost:** $250-600 for 50-100 active mentors

**Option C: Google Gemini (Budget-Friendly)**
- **Gemini 1.5 Flash**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Best for:** Fast responses, cost optimization
- **Estimated monthly cost:** $50-150 for 50-100 active mentors

**Recommendation: Start with Gemini Flash (cheapest), upgrade to GPT-4o for premium mentors**

#### 4. **Vector Database for AI**

**Option A: Supabase pgvector (Recommended)**
- **Pros:** Already using Supabase, no extra cost, easy integration
- **Cons:** Limited to PostgreSQL performance
- **Cost:** Included in Supabase plan

**Option B: Pinecone**
- **Pros:** Purpose-built for vectors, very fast
- **Cons:** Additional service to manage
- **Cost:** $70/month for 5M vectors

**Recommendation: Use Supabase pgvector initially**

#### 5. **Translation Services**

**Option A: Google Cloud Translation API (Recommended)**
- **Cost:** $20 per 1M characters
- **Supports:** 100+ languages
- **Quality:** Very good
- **Estimated monthly:** $50-100

**Option B: DeepL API**
- **Cost:** $5.49 per 1M characters (Free plan: 500k/month)
- **Supports:** 30+ languages
- **Quality:** Excellent (better than Google for European languages)
- **Estimated monthly:** $30-60

**Recommendation: DeepL for European languages, Google for others**

#### 6. **Speech-to-Text (Video Transcription)**

**Option A: OpenAI Whisper API (Recommended)**
- **Cost:** $0.006 per minute of audio
- **Quality:** Excellent, very accurate
- **Supports:** 50+ languages
- **Estimated monthly:** $50-100 for 100-200 hours

**Option B: Google Cloud Speech-to-Text**
- **Cost:** $0.006 per 15 seconds ($0.024/minute)
- **Quality:** Very good
- **Estimated monthly:** $200-400 for 100-200 hours

**Recommendation: OpenAI Whisper (best price/quality)**

#### 7. **Text-to-Speech (AI Avatar Voice)**

**Option A: ElevenLabs (Best Quality)**
- **Cost:** $99/month for 100k characters
- **Quality:** Most natural, can clone voices
- **Best for:** Premium avatar experience

**Option B: Google Cloud Text-to-Speech**
- **Cost:** $16 per 1M characters
- **Quality:** Good
- **Estimated monthly:** $20-40

**Recommendation: ElevenLabs for premium, Google for standard**

#### 8. **Calendar Integration**

**Google Calendar API**
- **Cost:** Free
- **Setup:** OAuth 2.0 authentication

**Microsoft Graph API (Outlook)**
- **Cost:** Free
- **Setup:** OAuth 2.0 authentication

#### 9. **Email Notifications**

**Option A: Resend (Recommended)**
- **Cost:** Free for 3,000 emails/month, then $20/month for 50k
- **Pros:** Modern API, easy setup
- **Best for:** Transactional emails

**Option B: SendGrid**
- **Cost:** Free for 100 emails/day, then $19.95/month for 50k
- **Pros:** Established, reliable

**Recommendation: Resend**

#### 10. **File Storage & CDN**

**Supabase Storage (Recommended)**
- **Cost:** Included in Supabase plan
- **50 GB storage in free tier**
- **CDN included**

**Alternative: Cloudflare R2 + CDN**
- **Cost:** $0.015 per GB storage/month
- **No egress fees**
- **Better for large video files**

---

## 💰 Estimated Monthly Costs (50-100 Active Mentors)

| Service | Low Estimate | High Estimate |
|---------|--------------|---------------|
| Supabase (Pro) | $25 | $25 |
| Stripe fees | $300 | $800 |
| AI API (Gemini) | $50 | $150 |
| Translation (DeepL) | $0 | $60 |
| Whisper (Transcription) | $50 | $100 |
| Text-to-Speech | $20 | $99 |
| Email (Resend) | $0 | $20 |
| **Total** | **$445** | **$1,254** |

**Note:** Stripe fees depend on transaction volume (assumed $10-25k GMV)

---

## 📊 Estimated Development Effort

| Phase | Duration | Complexity |
|-------|----------|------------|
| Stripe Configuration | 1 week | Medium |
| Booking System | 2 weeks | High |
| Calendar Integration | 1 week | Medium |
| AI Avatar Consultations | 2 weeks | High |
| Content Scaling | 2 weeks | High |
| Integration & Testing | 1 week | Medium |
| Launch Preparation | 2 weeks | Low |
| **TOTAL** | **10-11 weeks** | - |

**Team recommendation:**
- 1 Full-stack developer
- 1 AI/ML specialist (part-time)
- 1 QA tester (part-time)

---

## 🎯 Success Metrics

After implementation, track these metrics:

### Revenue Metrics:
- [ ] Consultation booking rate
- [ ] Digital product purchase rate
- [ ] Average transaction value
- [ ] Monthly recurring revenue (MRR)
- [ ] Mentor payout accuracy

### User Engagement:
- [ ] AI avatar usage rate
- [ ] Average consultation duration
- [ ] Content download rate
- [ ] Multi-language content adoption
- [ ] Repeat purchase rate

### Technical Metrics:
- [ ] Payment success rate (target: >95%)
- [ ] Calendar sync reliability (target: >99%)
- [ ] AI response quality (user ratings)
- [ ] Translation accuracy (manual review)
- [ ] System uptime (target: 99.9%)

---

## 🚨 Risk Mitigation

### Payment Risks:
- Implement fraud detection
- Set up dispute handling process
- Test thoroughly in Stripe test mode
- Have backup payment provider ready

### AI Risks:
- Set usage limits to control costs
- Monitor for inappropriate responses
- Implement content filtering
- Have human fallback option

### Data Risks:
- Regular database backups
- Encryption for sensitive data
- GDPR/privacy compliance
- Data retention policies

---

## 📞 Next Steps

1. Review this roadmap with development team
2. Gather customer requirements (see CUSTOMER_REQUIREMENTS.md)
3. Set up development environment for new features
4. Begin Phase 1 implementation
5. Set up monitoring and analytics

---

**Document Status:** Draft for Review  
**Requires:** Customer requirements gathering + Team approval  
**Timeline:** 10-11 weeks to fully functional MVP

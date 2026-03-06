# Environment Setup Guide for G.Creators MVP

This document explains what information you need to collect from users/admins to properly configure the G.Creators platform.

---

## 🎯 Setup Priority Levels

### 🔴 **CRITICAL (Required for basic functionality):**
1. Supabase credentials
2. Stripe API keys
3. One AI provider (Gemini recommended)
4. Email service (Resend recommended)

### 🟡 **HIGH PRIORITY (Required for full MVP):**
5. Google Calendar API credentials
6. Translation service (DeepL recommended)
7. OpenAI Whisper for transcription

### 🟢 **OPTIONAL (Nice to have):**
8. Microsoft Outlook API credentials
9. Text-to-Speech service
10. SMS service (Twilio)
11. Monitoring tools (Sentry, Analytics)

---

## 📋 What to Ask From System Administrator

### 1. **Supabase Setup** 🔴 CRITICAL

**Questions to ask:**
- [ ] Do you have a Supabase account?
- [ ] Have you created a project for G.Creators?

**Information needed:**
```
1. Supabase Project URL
   Example: https://abcdefghijklmnop.supabase.co
   Where to find: Supabase Dashboard → Settings → API → Project URL

2. Supabase Anon Key (public)
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Where to find: Supabase Dashboard → Settings → API → Project API keys → anon/public

3. Supabase Service Role Key (secret)
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Where to find: Supabase Dashboard → Settings → API → Project API keys → service_role
   ⚠️ WARNING: Keep this secret! Server-side only!
```

**Steps for admin:**
1. Go to https://supabase.com/dashboard
2. Create new project (if not exists)
3. Go to Settings → API
4. Copy all three values above

---

### 2. **Stripe Setup** 🔴 CRITICAL

**Questions to ask:**
- [ ] Do you have a Stripe account?
- [ ] Have you completed business verification?
- [ ] Are you ready to enable Stripe Connect?

**Information needed:**
```
1. Stripe Publishable Key
   Example: pk_test_51Abc123...
   Where to find: Stripe Dashboard → Developers → API keys
   Note: Use pk_test_* for testing, pk_live_* for production

2. Stripe Secret Key
   Example: sk_test_51Abc123...
   Where to find: Stripe Dashboard → Developers → API keys
   ⚠️ WARNING: Keep this secret! Server-side only!

3. Stripe Webhook Secret (after webhook setup)
   Example: whsec_abc123...
   Where to find: Stripe Dashboard → Developers → Webhooks
```

**Steps for admin:**
1. Go to https://dashboard.stripe.com/register
2. Complete business profile
3. Go to Developers → API keys
4. Copy publishable and secret keys
5. Set up webhook endpoint (see webhook setup below)

**Webhook Setup (admin must do this):**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL(s): you can add **multiple endpoints** (e.g. one per environment):
   - **Production:** `https://yourdomain.com/api/webhooks/stripe`
   - **Staging (optional):** `https://staging.yourdomain.com/api/webhooks/stripe`
   - **Localhost:** Stripe cannot send directly to `http://localhost`. For local dev, use the **Stripe CLI** to forward events:  
     `stripe listen --forward-to localhost:8080/api/webhooks/stripe`  
     The CLI prints a **webhook signing secret** (e.g. `whsec_...`) — use that in `.env` for local testing. In the Dashboard you only add publicly reachable URLs.
4. For each endpoint, select events to listen:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook signing secret for the endpoint you use (production secret for prod, CLI secret for local)

**Platform Fee Question:**
- [ ] What percentage commission will the platform take?
- Recommended: 15-20%
- Enter as decimal in .env: `STRIPE_PLATFORM_FEE=0.15`

---

### 3. **AI Provider Setup** 🔴 CRITICAL (Choose ONE)

**Question to ask:**
- [ ] What's your monthly budget for AI?
  - Low budget (<$200/month): Choose Gemini
  - Medium budget ($200-500/month): Choose OpenAI
  - High budget (>$500/month): Choose Claude

#### Option A: Google Gemini (RECOMMENDED for starting)

**Information needed:**
```
Gemini API Key
Example: AIzaSyAbc123...
Where to find: https://aistudio.google.com/app/apikey
```

**Steps for admin:**
1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy the key
4. **Cost:** $0.075 input / $0.30 output per 1M tokens (very cheap!)

#### Option B: OpenAI (Best quality)

**Information needed:**
```
OpenAI API Key
Example: sk-proj-abc123...
Where to find: https://platform.openai.com/api-keys
```

**Steps for admin:**
1. Go to https://platform.openai.com/signup
2. Add payment method
3. Go to API keys section
4. Create new secret key
5. Copy the key
6. **Cost:** $2.50 input / $10 output per 1M tokens

#### Option C: Anthropic Claude (Balanced)

**Information needed:**
```
Anthropic API Key
Example: sk-ant-abc123...
Where to find: https://console.anthropic.com/settings/keys
```

**Steps for admin:**
1. Go to https://console.anthropic.com/
2. Create account and add payment
3. Generate API key
4. **Cost:** $3 input / $15 output per 1M tokens

---

### 4. **Email Service Setup** 🔴 CRITICAL (Choose ONE)

#### Option A: Resend (RECOMMENDED)

**Questions to ask:**
- [ ] Do you own the domain gcreators.me?
- [ ] Can you add DNS records to verify the domain?

**Information needed:**
```
1. Resend API Key
   Example: re_abc123...
   Where to find: https://resend.com/api-keys

2. Verified Domain
   Example: gcreators.me
   Must verify via DNS records
```

**Steps for admin:**
1. Go to https://resend.com/signup
2. Add and verify your domain (requires DNS access)
3. Generate API key
4. Copy the key
5. **Cost:** FREE for 3,000 emails/month, then $20/month

**DNS Verification Required:**
Admin must add these DNS records (Resend will provide exact values):
- TXT record for domain verification
- MX records for email delivery
- DKIM records for authentication

#### Option B: SendGrid

**Information needed:**
```
SendGrid API Key
Example: SG.abc123...
Where to find: https://app.sendgrid.com/settings/api_keys
```

**Steps for admin:**
1. Go to https://signup.sendgrid.com/
2. Complete sender authentication
3. Create API key
4. **Cost:** FREE for 100 emails/day, then $19.95/month

---

### 5. **Google Calendar API** 🟡 HIGH PRIORITY

**Questions to ask:**
- [ ] Do you have a Google Cloud Platform account?
- [ ] Can you create a new GCP project?

**Information needed:**
```
1. Google Client ID
   Example: 123456-abc.apps.googleusercontent.com
   
2. Google Client Secret
   Example: GOCSPX-abc123...
   
3. Redirect URI
   Example: https://gcreators.me/api/auth/google/callback
```

**Steps for admin:**
1. Go to https://console.cloud.google.com/
2. Create new project "G.Creators"
3. Enable Google Calendar API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Add authorized redirect URI
7. Copy Client ID and Client Secret

**Required APIs to enable:**
- Google Calendar API
- Google People API (for profile info)

**Cost:** FREE (no charges for Calendar API)

---

### 6. **Translation Service** 🟡 HIGH PRIORITY (Choose ONE)

#### Option A: DeepL (RECOMMENDED)

**Information needed:**
```
DeepL API Key
Example: abc123-456...:fx
Where to find: https://www.deepl.com/pro-api
```

**Steps for admin:**
1. Go to https://www.deepl.com/pro-api
2. Sign up for API plan
3. Generate API key
4. **Cost:** FREE for 500,000 chars/month, then $5.49 per 1M chars

#### Option B: Google Cloud Translation

**Information needed:**
```
Google Translate API Key
Example: AIzaSyAbc123...
Uses same GCP project as Calendar API
```

**Steps for admin:**
1. In same GCP project
2. Enable Cloud Translation API
3. Create API key
4. **Cost:** $20 per 1M characters

---

### 7. **Microsoft Outlook API** 🟢 OPTIONAL

**Questions to ask:**
- [ ] Do you have Microsoft Azure account?
- [ ] Do you want to support Outlook calendar sync?

**Information needed:**
```
1. Microsoft Client ID
   Example: 12345678-1234-1234-1234-123456789012
   
2. Microsoft Client Secret
   Example: abc~123...
   
3. Tenant ID
   Use "common" for multi-tenant
```

**Steps for admin:**
1. Go to https://portal.azure.com/
2. Register new application
3. Add Microsoft Graph API permissions:
   - Calendars.ReadWrite
   - Calendars.ReadWrite.Shared
4. Generate client secret
5. Copy all credentials

**Cost:** FREE

---

### 8. **Text-to-Speech** 🟢 OPTIONAL

Only needed if you want AI avatar to have voice responses.

#### Option A: ElevenLabs (Best quality)

**Information needed:**
```
ElevenLabs API Key
Where to find: https://elevenlabs.io/app/settings/api-keys
```

**Steps for admin:**
1. Go to https://elevenlabs.io/
2. Choose subscription plan
3. Get API key
4. **Cost:** $99/month for 100k characters (voice cloning included)

#### Option B: Google Cloud TTS

Uses same GCP project, no extra setup needed.
**Cost:** $16 per 1M characters

---

### 9. **SMS Notifications** 🟢 OPTIONAL

**Questions to ask:**
- [ ] Do you want SMS booking reminders?
- [ ] What's your budget for SMS?

**Information needed:**
```
1. Twilio Account SID
   Example: AC1234567890abc...
   
2. Twilio Auth Token
   Example: your-auth-token
   
3. Twilio Phone Number
   Example: +12345678900
```

**Steps for admin:**
1. Go to https://www.twilio.com/try-twilio
2. Sign up and verify phone
3. Get a Twilio phone number
4. Copy Account SID and Auth Token
5. **Cost:** ~$0.01-0.02 per SMS (pay-as-you-go)

---

### 10. **Monitoring Tools** 🟢 OPTIONAL

#### Sentry (Error Tracking)

**Information needed:**
```
Sentry DSN
Example: https://abc123@o0.ingest.sentry.io/123456
Where to find: https://sentry.io/settings/projects/
```

**Steps:**
1. Create Sentry account
2. Create new project
3. Copy DSN
4. **Cost:** FREE for 5k errors/month

#### Google Analytics

**Information needed:**
```
GA Measurement ID
Example: G-XXXXXXXXXX
Where to find: Google Analytics → Admin → Data Streams
```

**Cost:** FREE

---

## 🔧 Configuration File Setup

After collecting all information:

1. **Copy example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in collected values:**
   - Replace all placeholder values
   - Remove sections for services you're not using
   - Keep all secret keys safe!

3. **Verify security:**
   - Ensure `.env` is in `.gitignore`
   - Never commit secrets to git
   - Use different keys for dev/staging/production

---

## ✅ Setup Checklist for Admin

### Phase 1: Critical Setup (Required to start)
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase credentials added to .env
- [ ] Stripe account created
- [ ] Stripe business verification completed
- [ ] Stripe API keys added to .env
- [ ] AI provider chosen (Gemini/OpenAI/Claude)
- [ ] AI API key added to .env
- [ ] Email service setup (Resend/SendGrid)
- [ ] Email domain verified
- [ ] Email API key added to .env

### Phase 2: High Priority Setup (Needed for MVP)
- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] Google OAuth credentials created
- [ ] Google credentials added to .env
- [ ] Translation service setup (DeepL/Google)
- [ ] Translation API key added to .env
- [ ] Stripe webhook endpoint configured
- [ ] Stripe webhook secret added to .env

### Phase 3: Optional Setup (Enhance functionality)
- [ ] Microsoft Azure app registered (if using Outlook)
- [ ] Microsoft credentials added to .env
- [ ] Text-to-Speech service setup (if using voice)
- [ ] TTS API key added to .env
- [ ] SMS service setup (if using notifications)
- [ ] Twilio credentials added to .env
- [ ] Monitoring tools setup (Sentry, Analytics)
- [ ] Monitoring keys added to .env

---

## 🔒 Security Best Practices

### For Admin:
1. **Never share secret keys via:**
   - Email
   - Slack/Discord
   - Screenshots
   - Git commits

2. **Use secure methods:**
   - 1Password / LastPass shared vaults
   - Encrypted file sharing
   - Secure environment variable managers

3. **Rotate keys regularly:**
   - Every 90 days minimum
   - Immediately if compromised
   - When team members leave

4. **Different keys for environments:**
   - Development: Use test/sandbox keys
   - Staging: Use separate test keys
   - Production: Use live keys only

5. **Set up key monitoring:**
   - Stripe has email alerts for unusual activity
   - OpenAI has usage alerts
   - Set up billing alerts on all services

---

## 💰 Total Setup Costs Summary

### One-time Setup:
- **Free** - All setup is free (account creation only)

### Monthly Operating Costs:
- **Minimum (budget-friendly):** ~$450/month
  - Supabase Pro: $25
  - Stripe fees: ~$300 (depends on volume)
  - Gemini AI: ~$50
  - DeepL: Free (500k chars/month)
  - Resend: Free (3k emails/month)
  
- **Maximum (premium):** ~$1,600/month
  - Supabase Pro: $25
  - Stripe fees: ~$800 (higher volume)
  - OpenAI GPT-4o: ~$500
  - DeepL: ~$60
  - ElevenLabs: $99
  - Resend: $20
  - Other services: ~$100

---

## 📞 Support Contacts

If admin has issues getting any credentials:

### Supabase Issues:
- Support: https://supabase.com/support
- Discord: https://discord.supabase.com/

### Stripe Issues:
- Support: https://support.stripe.com/
- Chat: Available in dashboard

### OpenAI Issues:
- Help Center: https://help.openai.com/
- Community: https://community.openai.com/

### Google Cloud Issues:
- Support: https://cloud.google.com/support
- Documentation: https://cloud.google.com/docs

---

## 🎯 Quick Start (Minimum Viable Config)

**Can't get all credentials immediately? Start with these 4:**

1. **Supabase** (database & auth)
2. **Stripe** (payments)
3. **Gemini** (AI - cheapest option)
4. **Resend** (email - free tier)

This gets you:
✅ User authentication
✅ Payment processing
✅ AI avatar (basic)
✅ Email notifications

Add other services as needed later!

---

## 📝 Environment File Template (Minimal)

For quick testing, start with this minimal .env:

```bash
# Minimal .env for testing

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI
GOOGLE_GEMINI_API_KEY=your-key
AI_PROVIDER=gemini

# Email
RESEND_API_KEY=your-key
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@gcreators.me

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

**Document Status:** ✅ Ready for use  
**Use this guide to collect all necessary credentials from your system administrator!**

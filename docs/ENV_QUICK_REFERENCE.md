# 🔑 Quick Reference: Environment Variables

**What information to collect from admin for .env configuration**

---

## 🔴 CRITICAL (Must Have)

### 1. Supabase (Database)
```
Where: https://supabase.com/dashboard → Settings → API
What to copy:
✓ Project URL
✓ Anon Key (public)
✓ Service Role Key (secret)
Cost: $25/month (Pro plan)
```

### 2. Stripe (Payments)
```
Where: https://dashboard.stripe.com/apikeys
What to copy:
✓ Publishable Key (pk_test_...)
✓ Secret Key (sk_test_...)
✓ Webhook Secret (after webhook setup)
Cost: 2.9% + $0.30 per transaction
```

### 3. AI Provider (Choose ONE)
```
OPTION A: Google Gemini (RECOMMENDED - Cheapest)
Where: https://aistudio.google.com/app/apikey
Cost: $50-150/month

OPTION B: OpenAI (Best Quality)
Where: https://platform.openai.com/api-keys
Cost: $200-500/month

OPTION C: Anthropic Claude (Balanced)
Where: https://console.anthropic.com/settings/keys
Cost: $250-600/month
```

### 4. Email Service (Choose ONE)
```
OPTION A: Resend (RECOMMENDED)
Where: https://resend.com/api-keys
Cost: FREE (3k emails/month)
Note: Requires domain verification

OPTION B: SendGrid
Where: https://app.sendgrid.com/settings/api_keys
Cost: FREE (100 emails/day)
```

---

## 🟡 HIGH PRIORITY (Needed for Full MVP)

### 5. Google Calendar API
```
Where: https://console.cloud.google.com/
What to setup:
✓ Create GCP project
✓ Enable Calendar API
✓ Create OAuth 2.0 Client
✓ Copy Client ID & Secret
Cost: FREE
```

### 6. Translation (Choose ONE)
```
OPTION A: DeepL (RECOMMENDED)
Where: https://www.deepl.com/pro-api
Cost: FREE (500k chars/month)

OPTION B: Google Translate
Where: Google Cloud Console
Cost: $20 per 1M chars
```

### 7. Stripe Webhook Setup
```
Where: https://dashboard.stripe.com/webhooks
What to do:
✓ Add endpoint(s): you can add multiple URLs (e.g. prod, staging).
  Production: https://yourdomain.com/api/webhooks/stripe
  Localhost: use Stripe CLI instead — Stripe can't POST to localhost.
  Run: stripe listen --forward-to localhost:8080/api/webhooks/stripe
  Use the CLI-generated webhook secret (whsec_...) in .env for local dev.
✓ Select events: checkout.session.completed, payment_intent.*
✓ Copy webhook secret (per endpoint)
Cost: FREE
```

---

## 🟢 OPTIONAL (Nice to Have)

### 8. Microsoft Outlook API
```
Where: https://portal.azure.com/
For: Outlook calendar integration
Cost: FREE
```

### 9. Text-to-Speech (Voice for AI Avatar)
```
OPTION A: ElevenLabs (Best)
Where: https://elevenlabs.io/
Cost: $99/month

OPTION B: Google TTS
Where: Same GCP project
Cost: $16 per 1M chars
```

### 10. SMS Notifications
```
Twilio
Where: https://www.twilio.com/
Cost: ~$0.01 per SMS
```

### 11. Monitoring
```
Sentry (Error tracking)
Where: https://sentry.io/
Cost: FREE (5k errors/month)

Google Analytics
Where: https://analytics.google.com/
Cost: FREE
```

---

## 📋 What Admin Needs to Provide

### Minimum to Start (4 items):
1. Supabase: URL + 2 keys
2. Stripe: 2 keys + webhook secret
3. AI: 1 API key (Gemini recommended)
4. Email: 1 API key (Resend recommended)

### For Full MVP (7 items):
5. Google: Client ID + Secret
6. Translation: 1 API key (DeepL recommended)
7. Domain verification for email

### Optional Extras (4 items):
8. Microsoft: Client ID + Secret + Tenant ID
9. Text-to-Speech: 1 API key
10. Twilio: Account SID + Auth Token + Phone
11. Monitoring: DSN/ID for each service

---

## 💰 Monthly Cost Summary

| Configuration | Cost/Month | Services Included |
|--------------|------------|-------------------|
| **Minimum** | ~$450 | Supabase + Stripe fees + Gemini + Free email |
| **Recommended** | ~$600 | + Translation + Transcription |
| **Premium** | ~$1,200 | + OpenAI GPT-4o + Voice + SMS |
| **Enterprise** | ~$1,600+ | All services + monitoring |

*Note: Stripe fees scale with transaction volume*

---

## 🚀 Quick Setup Steps

### For Admin:

1. **Create accounts** (5-10 min each):
   - [ ] Supabase
   - [ ] Stripe
   - [ ] Google Cloud Platform
   - [ ] Gemini AI (or OpenAI)
   - [ ] Resend (or SendGrid)

2. **Get credentials** (2-5 min each):
   - [ ] Copy all API keys
   - [ ] Save to secure location (1Password, etc.)

3. **Configure services** (10-30 min):
   - [ ] Verify email domain in Resend
   - [ ] Set up Stripe webhook
   - [ ] Enable Google Calendar API
   - [ ] Create OAuth clients

4. **Create .env file**:
   - [ ] Copy `.env.example` to `.env`
   - [ ] Fill in all credentials
   - [ ] Verify `.env` is in `.gitignore`

**Total time: 1-2 hours for complete setup**

---

## 🔒 Security Checklist

- [ ] Keep `.env` file out of git
- [ ] Never share secret keys via email/chat
- [ ] Use different keys for dev/staging/production
- [ ] Set up billing alerts on all paid services
- [ ] Rotate keys every 90 days
- [ ] Use test/sandbox keys for development

---

## 📞 Quick Help

**Need help getting credentials?**

See detailed guide: `docs/ENVIRONMENT_SETUP_GUIDE.md`

**Issues during setup?**

Contact service support:
- Supabase: https://supabase.com/support
- Stripe: https://support.stripe.com/
- Google Cloud: https://cloud.google.com/support

---

## ✅ Verification After Setup

Test that everything works:

```bash
# 1. Test database connection
npm run db:test

# 2. Test Stripe connection
npm run stripe:test

# 3. Test AI provider
npm run ai:test

# 4. Test email sending
npm run email:test

# 5. Run all tests
npm test
```

---

**Files Created:**
- `.env.example` - Template with all variables
- `docs/ENVIRONMENT_SETUP_GUIDE.md` - Detailed setup instructions
- `docs/ENV_QUICK_REFERENCE.md` - This quick reference

**Next Step:** Give this to your admin to collect all credentials! 🚀

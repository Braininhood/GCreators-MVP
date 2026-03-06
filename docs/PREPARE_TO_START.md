# Prepare to Start Work on G.Creators MVP

Use this checklist to get the project ready for development. All items are based on the existing docs.

---

## 1. Environment and secrets

**Source:** [ENV_QUICK_REFERENCE.md](ENV_QUICK_REFERENCE.md), [ENVIRONMENT_SETUP_GUIDE.md](ENVIRONMENT_SETUP_GUIDE.md), `.env.example`

| Priority | What | Where to get | Add to `.env` |
|----------|------|--------------|----------------|
| Critical | **Supabase** | Dashboard → Settings → API | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; keep `SUPABASE_SERVICE_ROLE_KEY` server-side only |
| Critical | **Stripe** | Dashboard → API keys | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`; after webhook setup: `STRIPE_WEBHOOK_SECRET` |
| Critical | **One AI provider** | Gemini / OpenAI / Anthropic (see .env.example) | One of: `GOOGLE_GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`; set `AI_PROVIDER` and `AI_MODEL_NAME` |
| Critical | **Email** | Resend or SendGrid | `RESEND_API_KEY` or `SENDGRID_API_KEY`; set `EMAIL_PROVIDER`, `EMAIL_FROM` |
| High | **Stripe webhook** | Dashboard → Webhooks | Add endpoint URL; for local: `stripe listen --forward-to localhost:8080/api/webhooks/stripe` and use CLI secret |
| High | **Google Calendar** (if needed) | Google Cloud Console | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| High | **Translation** (if needed) | DeepL or Google | `DEEPL_API_KEY` or `GOOGLE_TRANSLATE_API_KEY`; set `TRANSLATION_PROVIDER` |

- Copy `.env.example` to `.env` and fill values. Never commit `.env`.
- Use test/sandbox keys for local dev; switch to live keys only for production.

---

## 2. Database and migrations

**Source:** [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) (Database Schema section)

- Migrations are under `supabase/migrations/`. Applied via `npx supabase db push` (remote) or local Supabase.
- **Admin role:** Create first admin with [CREATE_ADMIN_ACCOUNT.md](CREATE_ADMIN_ACCOUNT.md) (run the SQL script in Supabase SQL Editor).
- **Types:** After any new migration, run:
  ```bash
  npx supabase gen types typescript
  ```
  so `src/integrations/supabase/types.ts` stays in sync. If you add code that uses `mentor_services`, `product_variants`, `stripe_accounts`, or `transactions`, ensure this has been run against the DB that has migration `20260222100005`.

---

## 3. What to read by role

| If you are… | Read first | Then use for |
|-------------|------------|----------------|
| **Developer** | [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) | Schema (table/column names from migrations), RLS, code patterns |
| **Developer** | [DEVELOPER_CHECKLIST.md](DEVELOPER_CHECKLIST.md) | Prioritized tasks and what’s done vs missing |
| **PM / planning** | [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) | Phases, timeline, what’s next |
| **Setup / DevOps** | [ENVIRONMENT_SETUP_GUIDE.md](ENVIRONMENT_SETUP_GUIDE.md) | Full setup steps and questions for admin |
| **Setup / DevOps** | [ENV_QUICK_REFERENCE.md](ENV_QUICK_REFERENCE.md) | Quick list of env vars and where to get them |
| **Admin** | [ADMIN_MANAGEMENT.md](ADMIN_MANAGEMENT.md) | What the admin panel can do |
| **Admin** | [CREATE_ADMIN_ACCOUNT.md](CREATE_ADMIN_ACCOUNT.md) | How to create the first admin (SQL) |

---

## 4. Quick “ready to code” checklist

- [ ] `.env` created from `.env.example` with at least: Supabase URL + anon key, Stripe keys, one AI provider key, email provider key.
- [ ] Migrations applied (`npx supabase db push` or equivalent); no pending migrations.
- [ ] TypeScript types generated after last migration: `npx supabase gen types typescript`.
- [ ] First admin created via [CREATE_ADMIN_ACCOUNT.md](CREATE_ADMIN_ACCOUNT.md).
- [ ] App runs locally (e.g. `npm run dev`), login/signup and role redirect work.
- [ ] Optional: Stripe webhook configured for production URL; for local dev, Stripe CLI forwarding and webhook secret in `.env`.

When all of the above are done, you can start feature work using [DEVELOPER_CHECKLIST.md](DEVELOPER_CHECKLIST.md) and [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md).

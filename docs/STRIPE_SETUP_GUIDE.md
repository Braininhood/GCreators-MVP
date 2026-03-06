# Stripe Payment Integration Guide

**Last Updated:** February 26, 2026  
**Status:** Implementation Complete - Requires Configuration

---

## 🎯 Overview

This guide covers the complete Stripe payment integration for G.Creators MVP, including:
- Consultation booking payments
- Digital product purchases
- Webhook handling
- Mentor payouts (Stripe Connect)
- Transaction tracking

---

## 📋 Prerequisites

Before configuring Stripe, you need:

1. **Stripe Account** (https://stripe.com)
   - Sign up for a Stripe account
   - Complete business verification
   - Get your API keys

2. **Stripe Connect** (for mentor payouts)
   - Enable Stripe Connect in your dashboard
   - Choose "Platform" account type
   - Set up onboarding flow for mentors

---

## 🔑 Step 1: Get API Keys

### Development (Test Mode)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Production (Live Mode)

1. Go to https://dashboard.stripe.com/apikeys
2. Copy the following keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### Update .env file:

```env
# For local development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

---

## 🔔 Step 2: Configure Webhooks

Webhooks allow Stripe to notify your application about payment events.

### Local Development (using Stripe CLI)

1. **Install Stripe CLI:**
   ```bash
   # Windows (Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # macOS (Homebrew)
   brew install stripe/stripe-cli/stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local Supabase function:**
   ```bash
   stripe listen --forward-to https://zdairdvgiifsymgmoswf.supabase.co/functions/v1/stripe-webhook
   ```

4. **Copy the webhook signing secret:**
   - The CLI will display: `whsec_xxxxxxxxxxxxx`
   - Add to `.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
     ```

### Production Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://zdairdvgiifsymgmoswf.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.created`
   - `customer.updated`

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Supabase Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## 🚀 Step 3: Deploy Edge Functions

Deploy all required Supabase Edge Functions:

```bash
# Deploy Stripe webhook handler
supabase functions deploy stripe-webhook

# Deploy booking creation function
supabase functions deploy create-booking

# Deploy product checkout function
supabase functions deploy create-product-checkout

# Deploy purchase verification function
supabase functions deploy verify-product-purchase

# Deploy booking confirmation function
supabase functions deploy send-booking-confirmation
```

### Set environment variables for Edge Functions:

```bash
# Stripe keys
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
supabase secrets set STRIPE_PLATFORM_FEE=0.15

# Supabase (already set)
supabase secrets set SUPABASE_URL=https://zdairdvgiifsymgmoswf.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email service (for confirmations)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Stripe Connect redirect URL (required for live mode)

In **live mode**, Stripe requires onboarding redirect URLs to be **HTTPS**. Set your app’s public HTTPS URL in Supabase so the `stripe-connect-onboarding` function can build valid links:

**Option A – Supabase Dashboard**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Project Settings** (gear) → **Edge Functions**.
3. Under **Secrets**, add:
   - **Name:** `STRIPE_CONNECT_REDIRECT_BASE_URL`
   - **Value:** your app’s HTTPS URL, e.g. `https://app.yourdomain.com` or `https://yourdomain.com` (no trailing slash).

**Option B – CLI**

```bash
supabase secrets set STRIPE_CONNECT_REDIRECT_BASE_URL=https://app.yourdomain.com
```

Use the same URL users use to open your app in production. If you only use test mode, this is optional (localhost is not allowed in live mode).

---

## 💳 Step 4: Test Payment Flows

### Test Consultation Booking Payment

1. **Test Card Numbers:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`

2. **Test Flow:**
   ```
   1. Visit a mentor profile
   2. Select a time slot
   3. Fill in booking details
   4. Click "Confirm Booking"
   5. You'll be redirected to Stripe Checkout
   6. Use test card: 4242 4242 4242 4242
   7. Any future expiry date (e.g., 12/34)
   8. Any 3-digit CVC (e.g., 123)
   9. Complete payment
   10. Should redirect to /learner/booking-success
   11. Check Stripe Dashboard for payment
   12. Check database: bookings table status should be "confirmed"
   ```

### Test Product Purchase

1. **Test Flow:**
   ```
   1. Visit a mentor's shop page
   2. Select a digital product
   3. Click "Buy Now"
   4. You'll be redirected to Stripe Checkout
   5. Use test card: 4242 4242 4242 4242
   6. Complete payment
   7. Should redirect to /learner/purchase-success
   8. Product should be downloadable
   9. Check product_purchases table status: "completed"
   10. Check mentor_products: sales_count increased
   ```

---

## 🔍 Step 5: Verify Webhook Processing

### Check webhook delivery:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. View recent deliveries
4. Should see:
   - ✅ `checkout.session.completed` - 200 OK
   - ✅ `payment_intent.succeeded` - 200 OK

### Debug webhook issues:

1. **View Edge Function logs:**
   ```bash
   supabase functions logs stripe-webhook
   ```

2. **Common issues:**
   - ❌ 400 Bad Request: Check webhook signature
   - ❌ 401 Unauthorized: Check Supabase service role key
   - ❌ 500 Error: Check function logs for details

---

## 💰 Step 6: Configure Platform Fees

Platform takes a 15% commission on all transactions.

### Fee Breakdown:

```
Example: $100 consultation
- Gross amount: $100.00
- Platform fee (15%): $15.00
- Stripe fee (2.9% + $0.30): $3.20
- Net to mentor: $81.80
```

### Update platform fee percentage:

```env
STRIPE_PLATFORM_FEE=0.15  # 15%
```

---

## 🔄 Step 7: Set Up Stripe Connect (Mentor Payouts)

### Payout Edge Functions (Supabase)

These Edge Functions are in the repo and **must be deployed** for the Payouts tab to work:

| Function | Purpose |
|----------|---------|
| `stripe-connect-status` | Returns mentor’s Connect account status (used when opening Payouts tab) |
| `create-stripe-connect-account` | Creates a Stripe Express account for the mentor |
| `stripe-connect-onboarding` | Creates Stripe onboarding link (bank details, etc.) |

**Deploy all three:**

```bash
supabase functions deploy stripe-connect-status
supabase functions deploy create-stripe-connect-account
supabase functions deploy stripe-connect-onboarding
```

**Config:** In `supabase/config.toml` these functions use `verify_jwt = false` so the Supabase gateway forwards the request; the function then validates the `Authorization: Bearer <token>` header and `getUser()` itself. If you get **401** on the Payouts tab, ensure you’ve deployed after the config change and that you’re signed in.

### Platform must enable Stripe Connect first

Mentors can only set up payouts if the **platform** Stripe account (the one whose `STRIPE_SECRET_KEY` is in Supabase) has completed **all** Connect setup steps. If you see *"You can only create new accounts if you've signed up for Connect"*, complete the checklist below.

**Use Test mode if your app uses test keys:** In the Stripe Dashboard, switch to **Test mode** (toggle in the UI) and do every step below in Test mode. Connect in Live mode does not enable creating accounts when you use `sk_test_...`.

### Full Connect platform checklist (do every step)

Follow [Stripe’s no-code payout prerequisites](https://docs.stripe.com/no-code/payout) and [Connect docs](https://docs.stripe.com/connect/onboarding). Complete **all** of these in the same mode (Test or Live) as your `STRIPE_SECRET_KEY`:

1. **Register your platform**  
   [dashboard.stripe.com/connect](https://dashboard.stripe.com/connect) → open Connect, click **Get started**, choose **Platform**.

2. **Activate your Stripe account**  
   [Account onboarding](https://dashboard.stripe.com/account/onboarding) — add business details so your account is activated. Required before Connect can create connected accounts.

3. **Complete your platform profile**  
   [Connect → Settings → Profile](https://dashboard.stripe.com/connect/settings/profile) — fill in and save your **platform profile**. This step is separate from “Get started” and is often missed; without it, creating connected accounts can still fail.

4. **Branding (optional but recommended)**  
   [Connect branding](https://dashboard.stripe.com/settings/connect/stripe-dashboard/branding) — set business name, icon, and colour so the mentor onboarding form shows your brand.

After all steps are done, mentor “Set up payouts” and Connect account creation should work. To confirm in Test mode: in [Connected accounts](https://dashboard.stripe.com/connect/accounts) click **+ Create** → **Express** → **transfers** → **Continue**; if you get a link and can create a test connected account, the platform is ready.

### Configure payout schedule:

```typescript
// In stripe-webhook handler
const payoutSchedule = {
  interval: 'weekly',  // or 'daily', 'monthly'
  weekly_anchor: 'friday',
  delay_days: 7
};
```

### Mentor onboarding flow:

1. Mentor signs up on platform
2. Mentor clicks "Set up payouts" in dashboard
3. Redirect to Stripe Connect onboarding:
   ```typescript
   const accountLink = await stripe.accountLinks.create({
     account: stripeAccountId,
     refresh_url: 'https://gcreators.me/mentor/dashboard',
     return_url: 'https://gcreators.me/mentor/dashboard?payout_setup=complete',
     type: 'account_onboarding',
   });
   ```
4. Mentor completes Stripe onboarding (Stripe collects and **validates** bank details to avoid errors)
5. Payouts are automatic based on schedule

### Payout policy (freelance-style): bank details changeable only by support

Many freelance platforms restrict who can change payout bank details to reduce fraud and errors. This project does the same:

- **First-time setup:** Mentor enters bank details in Stripe’s hosted onboarding. Stripe validates the account (e.g. instant verification or micro-deposits) before allowing payouts.
- **After setup:** Mentors **cannot** change bank details from the dashboard. The UI states that changes are only possible with support. This avoids someone changing the payout destination to a different account.
- **How support can update a mentor’s bank account:**
  1. **Option A – Stripe Dashboard:** In [Stripe Connect → Accounts](https://dashboard.stripe.com/connect/accounts), find the mentor’s Connect account (search by email or by `stripe_account_id` from your `stripe_accounts` table). Open the account → “Update account” / “Create account link” to generate a one-time link with type `account_update`. Send that link to the mentor (e.g. email or secure message); they open it, update bank details in Stripe, and submit. Stripe validates as usual.
  2. **Option B – Admin tool (future):** Add an admin-only action “Generate bank update link for this mentor” that calls an Edge Function to create an Account Link with `type: "account_update"` and returns the URL for support to send to the mentor.

Stripe’s validation applies in both flows, so invalid or wrong account numbers are caught before payouts are sent.

---

## 📊 Step 8: Transaction Tracking

All transactions are logged in the `transactions` table:

```sql
SELECT 
  id,
  type,  -- 'booking' or 'product_sale'
  gross_amount,
  platform_fee,
  stripe_fee,
  net_amount,
  status,
  created_at
FROM transactions
WHERE mentor_id = 'mentor_uuid'
ORDER BY created_at DESC;
```

### Mentor earnings dashboard:

```typescript
// Get total earnings
const { data } = await supabase
  .from('transactions')
  .select('net_amount')
  .eq('mentor_id', mentorId)
  .eq('status', 'completed');

const totalEarnings = data.reduce((sum, t) => sum + t.net_amount, 0);
```

---

## 🔒 Security Best Practices

1. **Never expose secret keys in frontend code**
   - Only use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in frontend
   - Keep `STRIPE_SECRET_KEY` server-side only

2. **Always verify webhook signatures**
   - Already implemented in `stripe-webhook` function
   - Prevents unauthorized webhook calls

3. **Use Stripe Checkout (not Elements)**
   - PCI-compliant by default
   - Stripe handles all sensitive data
   - No credit card data touches your servers

4. **Enable SCA (Strong Customer Authentication)**
   - Already enabled by default
   - Required for European customers

5. **Test refunds and disputes**
   - Have a clear refund policy
   - Handle `charge.refunded` webhook event

---

## 🧪 Testing Checklist

Before going live:

- [ ] Test successful booking payment
- [ ] Test failed booking payment
- [ ] Test booking cancellation before payment
- [ ] Test successful product purchase
- [ ] Test failed product purchase
- [ ] Test product download after purchase
- [ ] Verify webhook delivery (all events)
- [ ] Verify transaction records created
- [ ] Verify mentor sales count updates
- [ ] Test with 3D Secure card
- [ ] Test with declined card
- [ ] Test refund flow
- [ ] Check email confirmations sent
- [ ] Verify calendar events created (for bookings)

---

## 🚨 Going Live

### Switch from Test Mode to Live Mode:

1. **Update API keys in .env:**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

2. **Update Supabase secrets:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx
   ```

3. **Create production webhook:**
   - Same steps as development
   - Use live mode dashboard
   - Update webhook endpoint URL if needed

4. **Verify business information:**
   - Complete Stripe business verification
   - Add support email
   - Add refund/dispute policies

5. **Enable live mode Stripe Connect:**
   - Complete platform verification
   - Set up production payout schedule

---

## 📞 Support

### Stripe Documentation:
- Checkout: https://stripe.com/docs/payments/checkout
- Webhooks: https://stripe.com/docs/webhooks
- Connect: https://stripe.com/docs/connect
- Testing: https://stripe.com/docs/testing

### Troubleshooting:

**Webhook not receiving events:**
1. Check webhook URL is correct
2. Verify signing secret matches
3. Check Edge Function logs
4. Test with Stripe CLI

**Payment succeeds but database not updated:**
1. Check webhook event delivery
2. Verify `checkout.session.completed` is handled
3. Check Edge Function logs for errors
4. Verify RLS policies allow updates

**Mentor not receiving payouts:**
1. Verify Stripe Connect account is active
2. Check `charges_enabled` and `payouts_enabled` are true
3. Verify transfer_data is set in payment intent
4. Check Stripe Connect account balance

---

## 🎯 Success Metrics

Track these after launch:

- Payment success rate (target: >95%)
- Webhook delivery rate (target: >99%)
- Average booking value
- Product sales conversion rate
- Failed payment recovery rate
- Time from payment to confirmation

---

**Status:** Ready for Testing  
**Next Steps:** Configure Stripe account → Test payment flows → Deploy to production

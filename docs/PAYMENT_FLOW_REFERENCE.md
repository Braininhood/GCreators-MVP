# Payment Flow Quick Reference

**Quick guide for developers implementing payment features**

---

## 🔄 Flow Diagrams

### Consultation Booking Payment Flow

```
User Action                     Backend                          Stripe
-----------                     -------                          ------
1. Select time slot
2. Fill booking form
3. Click "Confirm Booking"
                            → Create pending booking
                            → Generate Stripe session
                                                            → Create checkout
4. Redirected to Stripe
5. Enter card details
6. Complete payment
                                                            → Process payment
                                                            → Send webhook
                            ← Handle webhook
                            ← Update booking: "confirmed"
                            ← Create transaction record
                            ← Send confirmation email
7. Redirect to success page
8. Download calendar invite
```

### Product Purchase Flow

```
User Action                     Backend                          Stripe
-----------                     -------                          ------
1. Click "Buy Now"
                            → Create pending purchase
                            → Generate Stripe session
                                                            → Create checkout
2. Redirected to Stripe
3. Enter card details
4. Complete payment
                                                            → Process payment
                                                            → Send webhook
                            ← Handle webhook
                            ← Update purchase: "completed"
                            ← Update product sales count
                            ← Create transaction record
5. Redirect to success page
6. Download product
```

---

## 📁 Key Files

### Frontend Components

| File | Purpose |
|------|---------|
| `src/components/BookingCalendar.tsx` | Time slot selection + booking form |
| `src/components/ProductCheckout.tsx` | Product purchase button + checkout |
| `src/pages/BookingSuccess.tsx` | Booking payment success page |
| `src/pages/PurchaseSuccess.tsx` | Product purchase success page |
| `src/pages/BookingCancel.tsx` | Payment cancelled page |

### Backend Functions

| File | Purpose |
|------|---------|
| `supabase/functions/create-booking/index.ts` | Create booking + Stripe session |
| `supabase/functions/create-product-checkout/index.ts` | Create product checkout session |
| `supabase/functions/stripe-webhook/index.ts` | Handle all Stripe webhooks |
| `supabase/functions/verify-product-purchase/index.ts` | Verify purchase after payment |
| `supabase/functions/send-booking-confirmation/index.ts` | Send booking emails |

---

## 🗄️ Database Tables

### bookings
```sql
id, user_id, user_email, mentor_id, mentor_name,
booking_date, booking_time, price, status,
stripe_session_id, stripe_payment_intent_id
```

**Status values:** `pending`, `confirmed`, `failed`, `cancelled`, `refunded`

### product_purchases
```sql
id, product_id, buyer_id, buyer_email, amount,
stripe_session_id, stripe_payment_intent_id, status
```

**Status values:** `pending`, `completed`, `failed`, `refunded`

### transactions
```sql
id, mentor_id, user_id, type, related_id,
gross_amount, platform_fee, stripe_fee, net_amount,
stripe_payment_intent_id, status
```

**Type values:** `booking`, `product_sale`

---

## 🔧 Common Tasks

### Add a new payment type

1. **Create Edge Function:**
   ```typescript
   // supabase/functions/create-[type]-checkout/index.ts
   const session = await stripe.checkout.sessions.create({
     line_items: [{ price_data: {...}, quantity: 1 }],
     mode: 'payment',
     success_url: '...',
     cancel_url: '...',
     metadata: { type_id: id }
   });
   ```

2. **Handle webhook event:**
   ```typescript
   // In stripe-webhook/index.ts
   case "checkout.session.completed": {
     if (metadata?.type_id) {
       await handleTypePayment(supabaseAdmin, session, metadata);
     }
   }
   ```

3. **Create success page:**
   ```tsx
   // src/pages/[Type]Success.tsx
   const [Type]Success = () => {
     // Verify payment
     // Show success message
     // Provide download/access
   };
   ```

### Calculate fees

```typescript
const grossAmount = 100.00;
const platformFeePercent = 0.15; // 15%
const stripeFeePercent = 0.029;  // 2.9%
const stripeFeeFixed = 0.30;     // $0.30

const platformFee = grossAmount * platformFeePercent;
const stripeFee = (grossAmount * stripeFeePercent) + stripeFeeFixed;
const netAmount = grossAmount - platformFee - stripeFee;

// $100 → $15 platform + $3.20 Stripe = $81.80 to mentor
```

### Test payment

```typescript
// Test card numbers
const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  require3DS: '4000002760003184',
  insufficientFunds: '4000000000009995',
};

// Use any future expiry: 12/34
// Use any CVC: 123
```

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No checkout URL returned` | Stripe session creation failed | Check API keys, check logs |
| `Webhook signature verification failed` | Wrong webhook secret | Update `STRIPE_WEBHOOK_SECRET` |
| `User not authenticated` | No auth token | User must be logged in |
| `Product already purchased` | Duplicate purchase attempt | Show error, redirect to downloads |
| `Booking slot not available` | Slot already taken | Refresh slots, select another |

### Debug webhook issues

```bash
# View webhook logs
supabase functions logs stripe-webhook --tail

# Test webhook locally
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Retry failed webhook
# Go to Stripe Dashboard → Webhooks → Click event → Retry
```

---

## 📋 Checklist: Adding Payment to Feature

- [ ] Create database table for feature
- [ ] Add `stripe_session_id` and `stripe_payment_intent_id` columns
- [ ] Add `status` column with appropriate values
- [ ] Create Edge Function to generate Stripe session
- [ ] Add authentication check in Edge Function
- [ ] Set correct `success_url` and `cancel_url`
- [ ] Add `metadata` to track related records
- [ ] Handle webhook event in `stripe-webhook/index.ts`
- [ ] Update feature status on `checkout.session.completed`
- [ ] Create transaction record
- [ ] Send confirmation email
- [ ] Create success page
- [ ] Add download/access functionality
- [ ] Test with test card
- [ ] Test webhook delivery
- [ ] Verify database updates
- [ ] Check transaction record created

---

## 🔗 Useful Links

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Checkout Sessions](https://stripe.com/docs/api/checkout/sessions)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 💡 Tips

1. **Always redirect to Stripe Checkout** - Never handle card details directly
2. **Use webhooks for status updates** - Don't rely on redirect URLs
3. **Test with real webhook events** - Use Stripe CLI for local testing
4. **Store minimal payment data** - Only IDs, not card details
5. **Handle idempotency** - Webhooks can be sent multiple times
6. **Log everything** - Makes debugging much easier
7. **Test failure scenarios** - Not just success cases

---

**Last Updated:** February 26, 2026

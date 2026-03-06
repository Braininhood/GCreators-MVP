# Payment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         G.CREATORS PAYMENT FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   FRONTEND (React)   │
└──────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │                    User Interface                        │
    ├──────────────────────────────────────────────────────────┤
    │  BookingCalendar.tsx         ProductCheckout.tsx        │
    │  - Select time slot          - View product details      │
    │  - Fill form                 - Click "Buy Now"           │
    │  - Click "Confirm Booking"   - Redirect to Stripe        │
    └──────────────┬───────────────────────────┬───────────────┘
                   │                           │
                   ▼                           ▼
    ┌──────────────────────────────────────────────────────────┐
    │           Supabase Edge Functions (Backend)              │
    ├──────────────────────────────────────────────────────────┤
    │                                                          │
    │  create-booking/         create-product-checkout/       │
    │  ├─ Validate user        ├─ Check auth                  │
    │  ├─ Create booking       ├─ Prevent duplicates          │
    │  └─ Generate session     └─ Generate session            │
    │           │                           │                  │
    └───────────┼───────────────────────────┼──────────────────┘
                │                           │
                └───────────┬───────────────┘
                            ▼
    ┌──────────────────────────────────────────────────────────┐
    │                    Stripe API                            │
    ├──────────────────────────────────────────────────────────┤
    │  Checkout Session                                        │
    │  ├─ Secure payment page                                  │
    │  ├─ Card processing                                      │
    │  └─ 3D Secure auth                                       │
    │                                                          │
    │  Payment Processing                                      │
    │  ├─ Charge card                                          │
    │  ├─ Handle fraud check                                   │
    │  └─ Create payment intent                                │
    └──────────────┬──────────────────────┬────────────────────┘
                   │                      │
        Success    │                      │  Failure/Cancel
                   ▼                      ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │  Webhook Event       │   │   Redirect User      │
    │  (Async)             │   │   to Cancel Page     │
    └──────────────────────┘   └──────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────────────────┐
    │         stripe-webhook/ (Edge Function)                  │
    ├──────────────────────────────────────────────────────────┤
    │  checkout.session.completed                              │
    │  ├─ Verify signature                                     │
    │  ├─ Update booking/purchase status                       │
    │  ├─ Calculate fees                                       │
    │  ├─ Create transaction record                            │
    │  └─ Trigger notifications                                │
    │                                                          │
    │  payment_intent.payment_failed                           │
    │  └─ Update status to "failed"                            │
    │                                                          │
    │  charge.refunded                                         │
    │  └─ Update status to "refunded"                          │
    └──────────────┬───────────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────────────────┐
    │              Supabase PostgreSQL                         │
    ├──────────────────────────────────────────────────────────┤
    │  bookings                                                │
    │  ├─ status: "confirmed"                                  │
    │  ├─ stripe_payment_intent_id                             │
    │  └─ stripe_session_id                                    │
    │                                                          │
    │  product_purchases                                       │
    │  ├─ status: "completed"                                  │
    │  ├─ stripe_payment_intent_id                             │
    │  └─ stripe_session_id                                    │
    │                                                          │
    │  transactions                                            │
    │  ├─ gross_amount: $100.00                                │
    │  ├─ platform_fee: $15.00                                 │
    │  ├─ stripe_fee: $3.20                                    │
    │  └─ net_amount: $81.80                                   │
    │                                                          │
    │  mentor_products                                         │
    │  ├─ sales_count: +1                                      │
    │  └─ total_earnings: +amount                              │
    └──────────────┬───────────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────────────────┐
    │            Success Pages (React)                         │
    ├──────────────────────────────────────────────────────────┤
    │  BookingSuccess.tsx          PurchaseSuccess.tsx        │
    │  ├─ Show confirmation        ├─ Show product info       │
    │  ├─ Display details          ├─ Download button         │
    │  └─ Calendar download        └─ Receipt confirmation    │
    └──────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         FEE CALCULATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

    Gross Amount: $100.00
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
    Platform Fee      Stripe Fee
    (15%)             (2.9% + $0.30)
    = $15.00          = $3.20
         │                 │
         └────────┬────────┘
                  ▼
         Total Deducted: $18.20
                  │
                  ▼
    Net to Mentor: $81.80
    (Stored in transactions.net_amount)


┌─────────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK EVENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

    Stripe Event
         │
         ▼
    Verify Signature ─────[Invalid]────▶ Return 400 Error
         │
    [Valid]
         │
         ▼
    Parse Event Type
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
    checkout.session.completed          payment_intent.payment_failed
         │                                         │
         ├─[booking_id in metadata]                ├─ Update status: "failed"
         │  ├─ Update booking                      └─ Log error
         │  ├─ Create transaction
         │  └─ Send confirmation
         │
         └─[product_id in metadata]
            ├─ Update purchase
            ├─ Update sales count
            ├─ Create transaction
            └─ Grant access


┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY MEASURES                                  │
└─────────────────────────────────────────────────────────────────────────┘

    ✓ All payment data handled by Stripe (PCI compliant)
    ✓ Webhook signature verification (prevents spoofing)
    ✓ Server-side validation (no trust in frontend)
    ✓ User authentication required (supabase.auth.getUser())
    ✓ RLS policies on database (row-level security)
    ✓ Duplicate purchase prevention
    ✓ Secure file downloads (signed URLs with expiry)
    ✓ API keys stored as environment variables
    ✓ Service role key only on backend
    ✓ HTTPS everywhere (TLS 1.3)
```

---

## Payment Success Path

```
┌────────────┐     ┌──────────┐     ┌─────────────┐     ┌────────────┐
│   User     │────▶│  Stripe  │────▶│   Webhook   │────▶│  Database  │
│  Pays      │     │ Processes│     │   Handler   │     │   Update   │
└────────────┘     └──────────┘     └─────────────┘     └────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   Send Email    │
                                    │  Confirmation   │
                                    └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  Redirect User  │
                                    │  to Success     │
                                    └─────────────────┘
```

## Payment Failure Path

```
┌────────────┐     ┌──────────┐     ┌─────────────┐
│   User     │────▶│  Stripe  │────▶│  Redirect   │
│ Cancels/   │     │  Fails   │     │  to Cancel  │
│  Fails     │     │  Payment │     │    Page     │
└────────────┘     └──────────┘     └─────────────┘
                         │
                         ▼
                  ┌────────────┐
                  │   Webhook  │
                  │  (if sent) │
                  └────────────┘
                         │
                         ▼
                  ┌────────────┐
                  │   Update   │
                  │   Status:  │
                  │  "failed"  │
                  └────────────┘
```

---

**Created:** February 26, 2026  
**Purpose:** Visual reference for payment architecture

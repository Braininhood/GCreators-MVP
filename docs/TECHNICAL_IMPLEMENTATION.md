# Technical Implementation Guide

**Platform:** G.Creators MVP  
**Tech Stack:** React + Supabase + Stripe + AI APIs  
**Last Updated:** February 2026  

**Note:** After applying new migrations (e.g. `20260222100005_add_mentor_services_product_variants_stripe_transactions.sql`), run `npx supabase gen types typescript` to refresh `src/integrations/supabase/types.ts` so new tables are available in code.

---

## 🗄️ Database Schema (Supabase)

This section reflects the **actual schema from migration files**. Table and column names match `supabase/migrations/*.sql`. Use these names in code and queries.

### Core: `profiles`, `user_roles`

| Table | Key columns |
|-------|-------------|
| **profiles** | `id` (PK, FK auth.users), `full_name`, `interests`, `skill_level`, `goals`, `avatar_url`, `preferred_language`, `created_at`, `updated_at` |
| **user_roles** | `id`, `user_id` (FK auth.users), `role` (enum: admin, mentor, learner), `created_at` |

### Bookings: `bookings`

| Column | Type | Notes |
|--------|------|--------|
| id | UUID | PK |
| user_id | UUID | FK profiles(id), nullable |
| user_email | TEXT | NOT NULL |
| mentor_id | TEXT | mentor_profiles.id (stored as text) |
| mentor_name | TEXT | NOT NULL |
| booking_date | DATE | NOT NULL |
| booking_time | TEXT | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL |
| status | TEXT | pending, confirmed, cancelled |
| meeting_link | TEXT | |
| meeting_platform | TEXT | |
| notes | TEXT | |
| stripe_session_id | TEXT | |
| stripe_payment_intent_id | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

Indexes: `idx_bookings_email`, `idx_bookings_mentor_id`, `idx_bookings_date`, `idx_bookings_user_id`.

### Mentor: `mentor_profiles`, `mentor_reviews`, `mentor_courses`, `mentor_time_slots`, `mentor_weekly_availability`, `mentor_calendar_connections`

| Table | Key columns |
|-------|-------------|
| **mentor_profiles** | `id` (PK), `user_id` (FK auth.users), `name`, `title`, `category`, `image_url`, `rating`, `review_count`, `price`, `bio`, `full_bio`, `expertise[]`, `languages[]`, `availability`, `experience`, `education`, `certifications[]`, `is_active`, `username`, `created_at`, `updated_at` |
| **mentor_reviews** | `id`, `mentor_id` (FK mentor_profiles), `user_id`, `user_name`, `user_avatar`, `rating`, `comment`, `created_at`, `updated_at` |
| **mentor_courses** | `id`, `mentor_id` (FK mentor_profiles), `title`, `description`, `price`, `duration`, `lessons`, `level`, `thumbnail_url`, `is_active`, `created_at`, `updated_at` |
| **mentor_time_slots** | `id`, `mentor_id` (FK mentor_profiles), `date`, `time`, `is_available`, `booking_id` (FK bookings), `created_at`, `updated_at`. UNIQUE(mentor_id, date, time) |
| **mentor_weekly_availability** | `id`, `mentor_id` (FK mentor_profiles), `day_of_week` (0–6), `start_time`, `end_time`, `is_active`, `created_at`, `updated_at` |
| **mentor_calendar_connections** | `id`, `mentor_id` (FK mentor_profiles), `provider`, `access_token`, `refresh_token`, `token_expires_at`, `calendar_id`, `sync_enabled`, `last_synced_at`, `created_at`, `updated_at`. UNIQUE(mentor_id, provider) |

### Q&A: `mentor_questions`, `mentor_video_answers`

| Table | Key columns |
|-------|-------------|
| **mentor_questions** | `id`, `user_id` (FK auth.users), `mentor_id` (FK mentor_profiles), `question_text`, `status` (submitted, answered, archived), `created_at`, `updated_at` |
| **mentor_video_answers** | `id`, `question_id` (FK mentor_questions), `video_url`, `video_file_name`, `duration_seconds`, `created_at`. UNIQUE(question_id) |

### Products: `mentor_products`, `product_purchases`, `product_reviews`, `product_variants`

| Table | Key columns |
|-------|-------------|
| **mentor_products** | `id`, `mentor_id` (FK mentor_profiles), `title`, `description`, `price`, `file_url`, `file_name`, `file_type`, `preview_image_url`, `sales_count`, `total_earnings`, `is_active`, `average_rating`, `review_count`, `created_at`, `updated_at` |
| **product_purchases** | `id`, `product_id` (FK mentor_products), `buyer_id`, `buyer_email`, `amount`, `stripe_payment_intent_id`, `stripe_session_id`, `status`, `created_at` |
| **product_reviews** | `id`, `product_id` (FK mentor_products), `user_id`, `user_name`, `user_avatar`, `rating`, `comment`, `created_at`, `updated_at` |
| **product_variants** | `id`, `product_id` (FK mentor_products), `language`, `format`, `file_path`, `file_size_bytes`, `price`, `is_auto_generated`, `generation_status`, `reviewed`, `created_at`, `updated_at` |

### Messaging: `conversations`, `messages`, `message_*`, `scheduled_messages`

| Table | Key columns |
|-------|-------------|
| **conversations** | `id`, `user_id` (FK profiles), `mentor_id` (TEXT), `mentor_name`, `last_message_at`, `created_at`, `updated_at`, `archived`, `archived_at` |
| **messages** | `id`, `conversation_id` (FK conversations), `sender_id`, `sender_name`, `content`, `is_read`, `created_at` |
| **message_bookmarks**, **message_drafts**, **message_reactions**, **message_read_receipts**, **message_reminders**, **message_templates** | See migrations for structure. |
| **scheduled_messages** | `id`, `conversation_id`, `sender_id`, `sender_name`, `content`, `scheduled_for`, `sent_at`, `status`, file fields, `created_at` |

### Avatar / AI: `mentor_avatars`, `mentor_avatar_knowledge`, `avatar_conversations`, `avatar_messages`

| Table | Key columns |
|-------|-------------|
| **mentor_avatars** | `id`, `mentor_id` (FK mentor_profiles), `status`, `avatar_name`, `bio_summary`, `expertise_areas[]`, `personality_traits[]`, `photo_urls[]`, `voice_sample_url`, `training_completed_at`, `last_trained_at`, `created_at`, `updated_at` |
| **mentor_avatar_knowledge** | `id`, `avatar_id` (FK mentor_avatars), `content`, `content_type`, `metadata` (JSONB), `embedding` (vector(768)), `created_at` |
| **avatar_conversations** | `id`, `user_id` (FK profiles), `avatar_id` (FK mentor_avatars), `created_at`, `updated_at` |
| **avatar_messages** | `id`, `conversation_id` (FK avatar_conversations), `role`, `content`, `metadata`, `created_at` |

### Other: `push_subscriptions`, `mentor_services`, `stripe_accounts`, `transactions`

| Table | Key columns |
|-------|-------------|
| **push_subscriptions** | `id`, `user_id`, `subscription` (JSONB), `created_at`, `updated_at` |
| **mentor_services** | `id`, `mentor_id` (FK mentor_profiles), `name`, `description`, `duration_minutes`, `price`, `currency`, `delivery_method`, `requires_preparation`, `preparation_instructions`, `advance_booking_hours`, `max_participants`, `cancellation_deadline_hours`, `refund_policy` (JSONB), `is_active`, `created_at`, `updated_at` |
| **stripe_accounts** | `id`, `mentor_id` (FK mentor_profiles, UNIQUE), `stripe_account_id` (UNIQUE), `account_status`, `onboarding_completed`, `charges_enabled`, `payouts_enabled`, `payout_schedule`, `minimum_payout_amount`, `created_at`, `updated_at` |
| **transactions** | `id`, `mentor_id` (FK mentor_profiles), `user_id` (FK profiles), `type`, `related_id`, `gross_amount`, `platform_fee`, `stripe_fee`, `net_amount`, `currency`, `stripe_payment_intent_id`, `stripe_charge_id`, `stripe_transfer_id`, `status`, `payout_date`, `payout_status`, `created_at`, `updated_at` |

### RLS (Row Level Security)

All tables above have RLS enabled. Policies are defined in the migration files. Examples:

- **bookings**: Users can SELECT/UPDATE where `auth.uid() = user_id`; authenticated users can INSERT with `auth.uid() = user_id`. Mentors have separate policies (see `20260111153220`).
- **mentor_profiles**: Public SELECT where `is_active = true`; mentors UPDATE own; authenticated INSERT with own `user_id`.
- **mentor_questions**: Users SELECT/INSERT own; mentors SELECT questions for their profile.
- **mentor_products** / **product_purchases**: Public SELECT active products; mentors full CRUD on own products; buyers SELECT own purchases, INSERT own.
- **mentor_services**, **product_variants**, **stripe_accounts**: Mentors manage own rows; public/anyone can view where applicable (see `20260222100005`).
- **transactions**: Mentors and users SELECT own; admins can manage (INSERT/UPDATE/DELETE) via `has_role(auth.uid(), 'admin')`.

---

## 🎨 Frontend Implementation Examples

### 0. Role-Based Authentication (CRITICAL - Must implement first!)

```typescript
// src/pages/Auth.tsx (Updated with role selection)
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"learner" | "mentor">("learner");
  
  // Mentor-specific fields
  const [expertise, setExpertise] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get role from URL parameter if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'mentor' || roleParam === 'learner') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast({ title: "Error", description: "Email and password required" });
      return;
    }
    
    // Mentor-specific validation
    if (role === 'mentor') {
      if (!bio || !professionalTitle || !hourlyRate) {
        toast({ title: "Error", description: "Please fill all mentor fields" });
        return;
      }
      if (expertise.length === 0) {
        toast({ title: "Error", description: "Please add at least one expertise" });
        return;
      }
    }

    setLoading(true);

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role: role, // Save role in auth metadata
        }
      }
    });

    if (authError) {
      toast({ title: "Sign up failed", description: authError.message });
      setLoading(false);
      return;
    }

    // 2. Update profile with role and mentor-specific data
    if (authData.user) {
      const profileData: any = {
        id: authData.user.id,
        email: email,
        full_name: fullName || email.split('@')[0],
        role: role,
      };

      // Add mentor-specific fields
      if (role === 'mentor') {
        profileData.expertise = expertise;
        profileData.bio = bio;
        profileData.hourly_rate = parseFloat(hourlyRate);
        profileData.professional_title = professionalTitle;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    }

    setLoading(false);
    
    toast({
      title: "Success!",
      description: "Account created successfully. Please sign in.",
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ title: "Sign in failed", description: error.message });
      setLoading(false);
      return;
    }

    // Get user role and redirect accordingly
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Redirect based on role
      if (profile?.role === 'mentor') {
        navigate('/mentor-cabinet');
      } else if (profile?.role === 'admin') {
        navigate('/admin/mentors');
      } else {
        navigate('/dashboard'); // learner dashboard
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md mx-auto pt-32 px-4">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email and password fields */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sign Up Tab with Role Selection */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  {role === 'mentor' 
                    ? 'Sign up as a mentor to offer your expertise'
                    : 'Sign up as a learner to find mentors'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>I want to:</Label>
                    <RadioGroup value={role} onValueChange={(v) => setRole(v as "learner" | "mentor")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="learner" id="learner" />
                        <Label htmlFor="learner" className="font-normal cursor-pointer">
                          Learn from mentors (Learner)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mentor" id="mentor" />
                        <Label htmlFor="mentor" className="font-normal cursor-pointer">
                          Become a mentor (Mentor)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Common fields */}
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Mentor-specific fields */}
                  {role === 'mentor' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title*</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Senior Software Engineer"
                          value={professionalTitle}
                          onChange={(e) => setProfessionalTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio*</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell learners about your experience..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          required
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rate">Hourly Rate (USD)*</Label>
                        <Input
                          id="rate"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="50.00"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expertise / Skills*</Label>
                        <TagInput
                          tags={expertise}
                          onTagsChange={setExpertise}
                          placeholder="Add skills (e.g., React, Python, Marketing)"
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : `Sign Up as ${role === 'mentor' ? 'Mentor' : 'Learner'}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
```

### Role-Based Routing Hook

```typescript
// src/hooks/useUserRole.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'learner' | 'mentor' | 'admin' | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role || null);
      setLoading(false);
    }

    getUserRole();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading };
}
```

### Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!role) {
        // Not logged in
        navigate('/auth');
      } else if (!allowedRoles.includes(role)) {
        // Wrong role - redirect to appropriate dashboard
        if (role === 'mentor') {
          navigate('/mentor-cabinet');
        } else if (role === 'admin') {
          navigate('/admin/mentors');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [role, loading, allowedRoles, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
```

### Updated App Routing

```typescript
// src/App.tsx (Updated)
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Learner routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['learner', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-questions" 
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <MyQuestions />
              </ProtectedRoute>
            } 
          />
          
          {/* Mentor routes */}
          <Route 
            path="/mentor-cabinet" 
            element={
              <ProtectedRoute allowedRoles={['mentor', 'admin']}>
                <MentorCabinet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentor-questions" 
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorQuestions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shop/:username" 
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorShop />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/mentors" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMentors />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared authenticated routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['learner', 'mentor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages/:conversationId" 
            element={
              <ProtectedRoute allowedRoles={['learner', 'mentor']}>
                <Messages />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
```

---

### 1. Booking Flow Component

```typescript
// BookingFlow.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export function BookingFlow({ mentorId, serviceId }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch available slots
  const { data: slots } = useQuery({
    queryKey: ['availability', mentorId, selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_active', true);
      return data;
    }
  });

  // 2. Handle booking
  const handleBooking = async () => {
    setLoading(true);
    
    try {
      // Create booking in database
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          mentor_id: mentorId,
          user_id: user.id,
          service_type: serviceId,
          start_time: `${selectedDate} ${selectedTime}`,
          end_time: calculateEndTime(selectedDate, selectedTime, duration),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          mentorId,
          serviceId,
          amount: service.price
        })
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-flow">
      <CalendarPicker 
        availableSlots={slots}
        onDateSelect={setSelectedDate}
      />
      
      {selectedDate && (
        <TimeSlotPicker
          date={selectedDate}
          slots={slots}
          onTimeSelect={setSelectedTime}
        />
      )}

      {selectedTime && (
        <button onClick={handleBooking} disabled={loading}>
          {loading ? 'Processing...' : `Book for $${service.price}`}
        </button>
      )}
    </div>
  );
}
```

### 2. Stripe Checkout API Route

```typescript
// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { bookingId, mentorId, serviceId, amount } = await req.json();

  try {
    // Get mentor's Stripe account
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('mentor_id', mentorId)
      .single();

    // Calculate fees
    const platformFeePercent = 0.15; // 15% platform fee
    const platformFee = Math.round(amount * platformFeePercent * 100); // in cents

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Consultation Booking',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccount.stripe_account_id,
        },
        metadata: {
          bookingId,
          mentorId,
          serviceId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/cancelled`,
      metadata: {
        bookingId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

### 3. Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        // Update booking status
        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', bookingId);

        // Create transaction record
        await supabase.from('transactions').insert({
          booking_id: bookingId,
          type: 'booking',
          gross_amount: session.amount_total! / 100,
          platform_fee: (session.amount_total! * 0.15) / 100,
          stripe_fee: (session.amount_total! * 0.029 + 30) / 100,
          net_amount: (session.amount_total! * 0.821 - 30) / 100,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed',
        });

        // TODO: Send confirmation emails
        // TODO: Add to calendars
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ status: 'failed' })
          .eq('id', bookingId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### 4. Google Calendar Integration

```typescript
// lib/calendar.ts
import { google } from 'googleapis';
import { supabase } from './supabase';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function addToGoogleCalendar(booking: Booking) {
  // Get mentor's calendar tokens
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_tokens')
    .eq('id', booking.mentor_id)
    .single();

  oauth2Client.setCredentials(profile.google_calendar_tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Create event
  const event = {
    summary: `Consultation with ${booking.user_name}`,
    description: `Booking ID: ${booking.id}`,
    start: {
      dateTime: booking.start_time,
      timeZone: booking.timezone,
    },
    end: {
      dateTime: booking.end_time,
      timeZone: booking.timezone,
    },
    conferenceData: {
      createRequest: {
        requestId: booking.id,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    attendees: [
      { email: booking.mentor_email },
      { email: booking.user_email },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
  });

  // Save event ID to database
  await supabase
    .from('bookings')
    .update({
      mentor_calendar_event_id: response.data.id,
      meeting_link: response.data.hangoutLink,
    })
    .eq('id', booking.id);

  return response.data;
}
```

### 5. AI Avatar Chat Implementation

```typescript
// lib/ai-avatar.ts
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function chatWithAvatar({
  mentorId,
  userId,
  message,
  conversationId,
}: ChatParams) {
  
  // 1. Get or create conversation
  let conversation;
  if (conversationId) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    conversation = data;
  } else {
    const { data } = await supabase
      .from('ai_conversations')
      .insert({ mentor_id: mentorId, user_id: userId })
      .select()
      .single();
    conversation = data;
  }

  // 2. Create embedding for user message
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: message,
  });
  const embedding = embeddingResponse.data[0].embedding;

  // 3. Find relevant knowledge base content (RAG)
  const { data: relevantDocs } = await supabase.rpc('match_knowledge', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
    filter_mentor_id: mentorId,
  });

  // 4. Build context from knowledge base
  const context = relevantDocs
    .map((doc: any) => doc.content)
    .join('\n\n');

  // 5. Get conversation history
  const messages = conversation.messages || [];

  // 6. Create system prompt
  const systemPrompt = `You are an AI assistant representing a mentor. 
Answer questions based on the mentor's knowledge base below.
Be helpful, professional, and encourage users to book a consultation for detailed advice.

Knowledge Base:
${context}

If a question is outside your knowledge, politely say so and suggest booking a consultation.`;

  // 7. Call OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const response = completion.choices[0].message.content;
  const tokensUsed = completion.usage?.total_tokens || 0;
  const cost = (tokensUsed / 1000000) * 1.5; // Approximate cost

  // 8. Update conversation
  const updatedMessages = [
    ...messages,
    { role: 'user', content: message, timestamp: new Date().toISOString() },
    { role: 'assistant', content: response, timestamp: new Date().toISOString() },
  ];

  await supabase
    .from('ai_conversations')
    .update({
      messages: updatedMessages,
      total_tokens: conversation.total_tokens + tokensUsed,
      total_cost: conversation.total_cost + cost,
    })
    .eq('id', conversation.id);

  return {
    response,
    conversationId: conversation.id,
    tokensUsed,
  };
}

// Create similarity search function in Supabase
// Run this SQL in Supabase SQL Editor:
/*
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_mentor_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  FROM mentor_knowledge_base
  WHERE mentor_id = filter_mentor_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
*/
```

### 6. Content Translation Service

```typescript
// lib/translation.ts
import { translateText } from '@google-cloud/translate';

const translator = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

export async function translateProduct(
  productId: string,
  targetLanguages: string[]
) {
  // Get original product
  const { data: product } = await supabase
    .from('digital_products')
    .select('*')
    .eq('id', productId)
    .single();

  for (const lang of targetLanguages) {
    // Translate text fields
    const [translatedName] = await translator.translate(product.name, lang);
    const [translatedDesc] = await translator.translate(product.description, lang);

    // Create variant
    await supabase.from('product_variants').insert({
      product_id: productId,
      language: lang,
      format: product.file_type,
      file_path: product.original_file_path, // Same file for text-only translation
      price: product.price,
      is_auto_generated: true,
      generation_status: 'completed',
      reviewed: false,
      translated_name: translatedName,
      translated_description: translatedDesc,
    });
  }
}
```

---

## 🔧 Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Google APIs
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_TRANSLATE_API_KEY=your_translate_key

# Email
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## 📦 Required npm Packages

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.4.0",
    "@supabase/supabase-js": "^2.39.0",
    "stripe": "^14.10.0",
    "openai": "^4.20.0",
    "googleapis": "^130.0.0",
    "@google-cloud/translate": "^8.0.2",
    "date-fns": "^3.0.0",
    "date-fns-tz": "^2.0.0",
    "resend": "^3.0.0"
  }
}
```

---

## 🚀 Deployment Checklist

- [ ] Set up Supabase project (production)
- [ ] Run all migration scripts
- [ ] Enable RLS policies
- [ ] Set up Stripe Connect (production mode)
- [ ] Configure Stripe webhooks
- [ ] Set up Google OAuth consent screen
- [ ] Enable Google Calendar API
- [ ] Set up Google Translate API
- [ ] Configure OpenAI API with billing
- [ ] Set up Resend email domain
- [ ] Configure environment variables
- [ ] Test payment flow end-to-end
- [ ] Test calendar integration
- [ ] Test AI avatar responses
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure database backups
- [ ] Set up SSL certificate
- [ ] Configure CDN for file storage

---

**Document Status:** Ready for development  
**Next Step:** Create database migrations and start implementing booking system

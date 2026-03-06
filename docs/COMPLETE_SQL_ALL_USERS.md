# 🔧 COMPLETE SQL - All Missing Users

## ❌ The Problem

Your CSV files reference MORE user IDs than what's in the profiles export:

**Missing from profiles CSV:**
- `85152153-e38a-49cc-a2ad-776a946e6966` (Bb - from mentor_profiles)
- `89c6c286-710a-46b3-9945-ea8363270833` (from conversations)

**Plus the mentor_profiles have their own IDs that aren't in auth.users**

---

## ✅ COMPLETE SOLUTION - Run This SQL

This SQL creates ALL users needed for your CSV imports:

### Step 1: Create All Auth Users

Go to SQL Editor:
https://supabase.com/dashboard/project/zdairdvgiifsymgmoswf/sql/new

**Copy and run this complete SQL:**

```sql
-- ============================================================================
-- COMPLETE AUTH USERS CREATION
-- This creates ALL users needed for your CSV imports
-- ============================================================================

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  id::uuid,
  'authenticated',
  'authenticated',
  email,
  crypt('temporary_password_123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name),
  created_at::timestamptz,
  updated_at::timestamptz,
  '',
  '',
  '',
  ''
FROM (
  VALUES 
    -- Original 13 users from profiles CSV
    ('70e8bb35-1e4a-437e-8678-69f60488df72', 'John Snow', 'john.snow@example.com', '2025-11-24 13:06:12.884665+00', '2025-11-24 13:06:12.884665+00'),
    ('57a5f44c-261f-4b9e-9e88-3f69cfbb9ea0', 'Karim Gallimore', 'karim.gallimore@example.com', '2026-01-16 03:32:34.876163+00', '2026-01-16 03:35:49.691358+00'),
    ('c3c18a2f-c8f5-46a5-b435-e9e6c6991b35', 'Andriychik Kolodyuk', 'andriychik@example.com', '2025-12-14 04:32:28.027179+00', '2025-12-14 04:33:24.841852+00'),
    ('7ebceffa-31b4-4003-a01c-b1b8e59167e6', 'Paul Ryazanov', 'paul.ryazanov@example.com', '2025-12-31 10:57:45.767725+00', '2025-12-31 10:57:45.767725+00'),
    ('2165cf20-4ba4-420a-86fe-8ba146179408', 'Ted Jones', 'ted.jones@example.com', '2026-01-05 18:40:25.264956+00', '2026-01-05 18:40:25.264956+00'),
    ('1978c109-f172-4bb5-a3da-f488ce85f99e', 'Vadym Shafinskyi', 'vshafinskiy@gmail.com', '2026-01-05 22:59:42.029973+00', '2026-01-05 23:48:05.220552+00'),
    ('066fb66a-dced-437f-832c-d4ec24af1d28', 'Imran Lokhon', 'imran.lokhon@example.com', '2026-01-09 07:55:06.420992+00', '2026-01-09 07:55:06.420992+00'),
    ('6c6192f0-9f74-4e7d-97f6-053ce3dbbf3d', 'Halyna Dubliak', 'halyna@example.com', '2026-01-09 15:28:24.784247+00', '2026-01-09 15:28:24.784247+00'),
    ('006422a9-5230-4c76-a432-f0088e332639', 'Yana Kovalenko', 'yana.kovalenko@example.com', '2026-01-16 09:46:56.32064+00', '2026-01-16 09:51:19.960784+00'),
    ('45ba9a6f-f42f-4bfc-824f-524c1a8156f0', 'Maryna Stadnik', 'maryna.stadnik@example.com', '2026-01-11 21:13:24.457477+00', '2026-01-11 21:14:17.733102+00'),
    ('348d820f-5450-4c52-a634-7e8d45274454', 'Oleksandr Dmytriev', 'oleksandr@example.com', '2026-01-16 11:03:41.009738+00', '2026-01-16 11:16:08.869632+00'),
    ('6b91bb6b-709f-4e4d-bc88-52eadcda7ad7', 'Vita Shafinska', 'miamayka@gmail.com', '2025-11-23 18:20:10.476419+00', '2026-01-17 20:27:07.267046+00'),
    ('a831bc18-dc2a-4106-8a95-a4b5493a560b', 'Michael Wang', 'michael.wang@example.com', '2026-01-10 05:57:17.537146+00', '2026-01-10 06:01:04.266098+00'),
    
    -- Additional users from mentor_profiles and conversations
    ('85152153-e38a-49cc-a2ad-776a946e6966', 'Bb', 'bb@example.com', '2026-01-30 03:00:06.869531+00', '2026-01-30 03:00:06.869531+00'),
    ('89c6c286-710a-46b3-9945-ea8363270833', 'Unknown User', 'unknown.user@example.com', NOW(), NOW())
) AS data(id, full_name, email, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;
```

**Expected result:** `15 rows inserted` (or fewer if some already exist)

---

## 📋 Now Import Your CSVs in Order

After running the SQL above successfully, import in this **exact order**:

### ✅ 1. Import profiles first
- File: `profiles-export-2026-02-21_21-05-22.csv`
- Table: `profiles`
- Delimiter: `;`
- **Should work now!**

### ✅ 2. Import mentor_profiles
- File: `mentor_profiles-export-2026-02-21_21-01-20.csv`
- Table: `mentor_profiles`
- Delimiter: `;`
- **Should work now!**

### ✅ 3. Import conversations
- File: `conversations-export-2026-02-21_21-00-11.csv`
- Table: `conversations`
- Delimiter: `;`
- **Should work now!**

### ✅ 4. Import messages
- File: `messages-export-2026-02-21_21-03-42.csv`
- Table: `messages`
- Delimiter: `;`

### ✅ 5. Import bookings
- File: `bookings-export-2026-02-21_20-59-37.csv`
- Table: `bookings`
- Delimiter: `;`

### ✅ 6. Import mentor_products
- File: `mentor_products-export-2026-02-21_21-01-01.csv`
- Table: `digital_products` (or `mentor_products` depending on your table name)
- Delimiter: `;`
- **Should work now!**

### ✅ 7. Import mentor_avatars
- File: `mentor_avatars-export-2026-02-21_21-00-26.csv`
- Table: `mentor_avatars`
- Delimiter: `;`
- **Should work now!**

### ✅ 8. Import remaining files
- `mentor_time_slots-export-2026-02-21_21-01-54.csv`
- `mentor_weekly_availability-export-2026-02-21_21-03-24.csv`
- `mentor_questions-export-2026-02-21_21-01-38.csv`
- `mentor_video_answers-export-2026-02-21_21-02-18.csv`
- `product_purchases-export-2026-02-21_21-04-55.csv`

---

## ⚠️ Important Notes

### 1. Check Table Names

Your database might have different table names than the CSV file names. Check:

- CSV: `mentor_products` → Database table: `digital_products` or `mentor_products`?
- CSV: `mentor_time_slots` → Database table: `availability_slots` or `mentor_time_slots`?

**To check table names:**
Go to: https://supabase.com/dashboard/project/zdairdvgiifsymgmoswf/editor

Look at the left sidebar to see exact table names.

### 2. Temporary Password

All users now have password: `temporary_password_123`

To send password reset emails:

```sql
-- Run in SQL Editor to send password reset to all users:
SELECT auth.send_password_reset_email(email)
FROM auth.users;
```

Or users can use "Forgot Password" on your login page.

### 3. Unknown User

The user `89c6c286-710a-46b3-9945-ea8363270833` appeared in conversations but not in profiles. I created them as "Unknown User". You might want to:

- Leave it (it works)
- Or delete that conversation row after import
- Or update the name/email if you know who this is

---

## ✅ Verification

After all imports complete, verify:

```sql
-- Check users
SELECT COUNT(*) FROM auth.users;
-- Should show: 15

-- Check profiles
SELECT COUNT(*) FROM profiles;
-- Should show: 13 (or 15 if Unknown User got a profile)

-- Check mentor profiles
SELECT COUNT(*) FROM mentor_profiles;
-- Should show: 7

-- Check bookings
SELECT COUNT(*) FROM bookings;
-- Should show: 8

-- Check products
SELECT COUNT(*) FROM digital_products;  -- or mentor_products
-- Should show: 6

-- Check conversations
SELECT COUNT(*) FROM conversations;
-- Should show: 4

-- Check messages
SELECT COUNT(*) FROM messages;
-- Should show: 5
```

---

## 🎉 Success Checklist

After completing all imports:

- [ ] SQL ran successfully (15 rows inserted)
- [ ] profiles imported (13 rows)
- [ ] mentor_profiles imported (7 rows)
- [ ] conversations imported (4 rows)
- [ ] messages imported (5 rows)
- [ ] bookings imported (8 rows)
- [ ] mentor_products imported (6 rows)
- [ ] mentor_avatars imported (~17 rows)
- [ ] All other CSVs imported
- [ ] No more foreign key errors

---

## 🚀 Quick Command

**Copy this - Run in SQL Editor first, then import CSVs:**

```sql
-- Creates all 15 users needed
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
SELECT '00000000-0000-0000-0000-000000000000', id::uuid, 'authenticated', 'authenticated', email, crypt('temporary_password_123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', full_name), created_at::timestamptz, updated_at::timestamptz, '', '', '', ''
FROM (VALUES 
    ('70e8bb35-1e4a-437e-8678-69f60488df72', 'John Snow', 'john.snow@example.com', '2025-11-24 13:06:12.884665+00', '2025-11-24 13:06:12.884665+00'),
    ('57a5f44c-261f-4b9e-9e88-3f69cfbb9ea0', 'Karim Gallimore', 'karim.gallimore@example.com', '2026-01-16 03:32:34.876163+00', '2026-01-16 03:35:49.691358+00'),
    ('c3c18a2f-c8f5-46a5-b435-e9e6c6991b35', 'Andriychik Kolodyuk', 'andriychik@example.com', '2025-12-14 04:32:28.027179+00', '2025-12-14 04:33:24.841852+00'),
    ('7ebceffa-31b4-4003-a01c-b1b8e59167e6', 'Paul Ryazanov', 'paul.ryazanov@example.com', '2025-12-31 10:57:45.767725+00', '2025-12-31 10:57:45.767725+00'),
    ('2165cf20-4ba4-420a-86fe-8ba146179408', 'Ted Jones', 'ted.jones@example.com', '2026-01-05 18:40:25.264956+00', '2026-01-05 18:40:25.264956+00'),
    ('1978c109-f172-4bb5-a3da-f488ce85f99e', 'Vadym Shafinskyi', 'vshafinskiy@gmail.com', '2026-01-05 22:59:42.029973+00', '2026-01-05 23:48:05.220552+00'),
    ('066fb66a-dced-437f-832c-d4ec24af1d28', 'Imran Lokhon', 'imran.lokhon@example.com', '2026-01-09 07:55:06.420992+00', '2026-01-09 07:55:06.420992+00'),
    ('6c6192f0-9f74-4e7d-97f6-053ce3dbbf3d', 'Halyna Dubliak', 'halyna@example.com', '2026-01-09 15:28:24.784247+00', '2026-01-09 15:28:24.784247+00'),
    ('006422a9-5230-4c76-a432-f0088e332639', 'Yana Kovalenko', 'yana.kovalenko@example.com', '2026-01-16 09:46:56.32064+00', '2026-01-16 09:51:19.960784+00'),
    ('45ba9a6f-f42f-4bfc-824f-524c1a8156f0', 'Maryna Stadnik', 'maryna.stadnik@example.com', '2026-01-11 21:13:24.457477+00', '2026-01-11 21:14:17.733102+00'),
    ('348d820f-5450-4c52-a634-7e8d45274454', 'Oleksandr Dmytriev', 'oleksandr@example.com', '2026-01-16 11:03:41.009738+00', '2026-01-16 11:16:08.869632+00'),
    ('6b91bb6b-709f-4e4d-bc88-52eadcda7ad7', 'Vita Shafinska', 'miamayka@gmail.com', '2025-11-23 18:20:10.476419+00', '2026-01-17 20:27:07.267046+00'),
    ('a831bc18-dc2a-4106-8a95-a4b5493a560b', 'Michael Wang', 'michael.wang@example.com', '2026-01-10 05:57:17.537146+00', '2026-01-10 06:01:04.266098+00'),
    ('85152153-e38a-49cc-a2ad-776a946e6966', 'Bb', 'bb@example.com', '2026-01-30 03:00:06.869531+00', '2026-01-30 03:00:06.869531+00'),
    ('89c6c286-710a-46b3-9945-ea8363270833', 'Unknown User', 'unknown.user@example.com', NOW(), NOW())
) AS data(id, full_name, email, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;
```

---

**Run this SQL, then import your CSVs in order. All foreign key errors should be resolved!**

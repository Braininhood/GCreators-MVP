# Create an admin account

Admins can access the full `/admin` panel. There are only three roles: **admin**, **mentor**, and **learner**. You need a user account first, then assign the **admin** role via SQL.

## 1. Create the user (if they don’t exist)

**Option A – In your app**

- Go to **Sign up** (e.g. http://127.0.0.1:8080/auth/learner).
- Register with the **email and password** you want for the admin.
- Confirm email if your project has email confirmation on.

**Option B – In Supabase Dashboard**

1. Open **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter **Email** and **Password** (and optionally name).
4. Click **Create user**.

## 2. Grant the admin role

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Open the script **`scripts/create-admin-by-email.sql`** in your project.
3. Replace **`admin@example.com`** with the **email** of the user you created.
4. Run the script.

Example (run in SQL Editor):

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE u.email = 'your-admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = u.id AND ur.role = 'admin'
  );
```

## 3. Sign in as admin

- Go to **Sign in** (e.g. http://127.0.0.1:8080/auth).
- Sign in with that email and password.
- You should be redirected to **http://127.0.0.1:8080/admin/mentors**.

If the SQL insert fails with a “row-level security” error, say so and we can add a small DB function so the insert is allowed from the SQL Editor.

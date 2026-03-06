# AWS Free Tier Migration Guide – G.Creators MVP

**Goal:** Move the entire G.Creators platform to AWS Free Tier step-by-step.  
**Current stack:** React (Vite) + Supabase (DB, Auth, Storage, Edge Functions) + Stripe  
**Target:** AWS services within Free Tier limits

---

## Table of Contents

1. [AWS Free Tier Overview](#1-aws-free-tier-overview)
2. [Migration Strategy (Phased Approach)](#2-migration-strategy-phased-approach)
3. [Phase 1: Frontend Hosting (Easiest)](#phase-1-frontend-hosting-easiest)
4. [Phase 2: Database Migration](#phase-2-database-migration)
5. [Phase 3: Authentication (Cognito)](#phase-3-authentication-cognito)
6. [Phase 4: File Storage (S3)](#phase-4-file-storage-s3)
7. [Phase 5: Backend Logic (Lambda)](#phase-5-backend-logic-lambda)
8. [Phase 6: Realtime & Notifications](#phase-6-realtime--notifications)
9. [Environment Variables Checklist](#environment-variables-checklist)
10. [Cost Summary & Free Tier Limits](#cost-summary--free-tier-limits)

---

## 1. AWS Free Tier Overview

### What’s Included (12 Months)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **S3** | 5 GB storage, 20,000 GET, 2,000 PUT | Enough for static site + some files |
| **CloudFront** | 1 TB data transfer, 10M requests | Good for CDN |
| **Lambda** | 1M requests/month, 400,000 GB-seconds | Replaces Supabase Edge Functions |
| **RDS** | 750 hrs/month (db.t2.micro or db.t3.micro) | PostgreSQL |
| **Cognito** | 50,000 MAU | Replaces Supabase Auth |
| **API Gateway** | 1M calls/month (12 months) | For Lambda HTTP APIs |
| **Route 53** | 1 hosted zone | DNS |
| **ACM** | Unlimited certificates | SSL/TLS |

### Always Free (No 12‑Month Limit)

- **Lambda:** 1M requests/month
- **DynamoDB:** 25 GB storage, 25 read/write capacity units
- **SNS:** 1M publishes
- **SES:** 62,000 emails/month (from EC2)

---

## 2. Migration Strategy (Phased Approach)

**Recommended order:**

1. **Phase 1** – Frontend only (S3 + CloudFront) – ~1–2 hours  
2. **Phase 2** – Database (RDS PostgreSQL) – ~4–8 hours  
3. **Phase 3** – Auth (Cognito) – ~4–6 hours  
4. **Phase 4** – Storage (S3) – ~2–4 hours  
5. **Phase 5** – Edge Functions → Lambda – ~8–16 hours  
6. **Phase 6** – Realtime (optional) – ~4–8 hours  

**Important:** Phases 2–6 require code changes. Phase 1 can be done without changing backend (Supabase stays).

---

## Phase 1: Frontend Hosting (Easiest)

**Time:** 1–2 hours  
**Cost:** Free (within limits)  
**Supabase:** Still used for DB, Auth, Functions

### Step 1.1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click **Create an AWS Account**
3. Enter email, password, account name
4. Add payment method (required, but Free Tier stays free within limits)
5. Verify identity (phone/email)
6. Choose **Free** plan

### Step 1.2: Create IAM User (CLI Access)

1. **IAM Console:** https://console.aws.amazon.com/iam/
2. **Users** → **Create user**
3. User name: `gcreators-deploy`
4. **Attach policies:** `AdministratorAccess` (or `AmazonS3FullAccess`, `CloudFrontFullAccess`, `IAMFullAccess`)
5. **Create user**
6. **Security credentials** → **Create access key**
7. Choose **Command Line Interface (CLI)**
8. Save **Access Key ID** and **Secret Access Key**

### Step 1.3: Install and Configure AWS CLI

```bash
# Windows (PowerShell)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Or via npm
npm install -g aws-cli

# Configure
aws configure
# Access Key ID: [paste]
# Secret Access Key: [paste]
# Default region: us-east-1
# Output format: json
```

### Step 1.4: Build the Project

```bash
cd d:\GCreators_MVP
npm run build
```

Confirm `dist/` exists with built files.

### Step 1.5: Create S3 Bucket

1. **S3 Console:** https://s3.console.aws.amazon.com/
2. **Create bucket**
3. Bucket name: `gcreators-mvp-[your-unique-id]` (globally unique)
4. Region: `us-east-1`
5. **Uncheck** “Block all public access”
6. **Create bucket**

### Step 1.6: Enable Static Website Hosting

1. Select bucket → **Properties**
2. **Static website hosting** → **Edit**
3. Enable
4. Index document: `index.html`
5. Error document: `index.html`
6. **Save**

### Step 1.7: Bucket Policy (Public Read)

1. **Permissions** → **Bucket policy** → **Edit**
2. Paste (replace bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gcreators-mvp-YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. **Save**

### Step 1.8: Upload Build to S3

```bash
aws s3 sync dist/ s3://gcreators-mvp-YOUR-BUCKET-NAME/ --delete
```

### Step 1.9: Create CloudFront Distribution

1. **CloudFront Console:** https://console.aws.amazon.com/cloudfront/
2. **Create distribution**
3. **Origin domain:** Select your S3 bucket
4. **Origin path:** (empty)
5. **Viewer protocol policy:** Redirect HTTP to HTTPS
6. **Default root object:** `index.html`
7. **Error pages:**
   - 403 → `/index.html` (200)
   - 404 → `/index.html` (200)
8. **Create distribution**
9. Wait 5–15 minutes for deployment

### Step 1.10: Test

Use the CloudFront URL (e.g. `https://d1234abcd.cloudfront.net`).  
Supabase and Stripe still work; only the frontend is on AWS.

---

## Phase 2: Database Migration

**Time:** 4–8 hours  
**Supabase:** Replaced by RDS PostgreSQL

### Step 2.1: Export Supabase Data

1. **Supabase Dashboard** → **SQL Editor**
2. Export schema and data (or use `pg_dump` if you have DB URL)
3. Or: **Database** → **Backups** → Download backup

### Step 2.2: Create RDS PostgreSQL Instance

1. **RDS Console:** https://console.aws.amazon.com/rds/
2. **Create database**
3. **Engine:** PostgreSQL 15
4. **Templates:** Free tier
5. **DB instance identifier:** `gcreators-db`
6. **Master username:** `postgres`
7. **Master password:** (strong password, save it)
8. **Instance class:** db.t3.micro (Free tier)
9. **Storage:** 20 GB gp2
10. **VPC:** Default
11. **Public access:** Yes (for initial setup; restrict later)
12. **Create database**
13. Wait 5–10 minutes

### Step 2.3: Configure Security Group

1. **RDS** → **Databases** → Select instance → **Connectivity & security**
2. Click **VPC security group**
3. **Inbound rules** → **Edit**
4. **Add rule:**
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your IP (or 0.0.0.0/0 for testing only)
5. **Save**

### Step 2.4: Get Connection String

1. **RDS** → **Databases** → Select instance → **Connect**
2. Copy **Endpoint**
3. Connection string format:
   ```
   postgresql://postgres:PASSWORD@ENDPOINT:5432/postgres
   ```

### Step 2.5: Import Schema and Data

```bash
# If you have pg_dump file
psql "postgresql://postgres:PASSWORD@your-rds-endpoint:5432/postgres" < backup.sql
```

Or use a GUI (pgAdmin, DBeaver) to run your SQL.

### Step 2.6: Update Application

1. Replace Supabase client with a PostgreSQL client (e.g. `pg`, `@neondatabase/serverless`)
2. Or use **RDS Data API** (serverless, no connection pooling)
3. Update all `supabase.from(...)` calls to direct SQL or an ORM

**Note:** This phase needs substantial refactoring. Consider keeping Supabase for DB initially and migrating later.

---

## Phase 3: Authentication (Cognito)

**Time:** 4–6 hours  
**Supabase Auth:** Replaced by Amazon Cognito

### Step 3.1: Create Cognito User Pool

1. **Cognito Console:** https://console.aws.amazon.com/cognito/
2. **Create user pool**
3. **Sign-in options:** Email
4. **Password policy:** Cognito defaults
5. **MFA:** Optional
6. **User pool name:** `gcreators-users`
7. **App client:**
   - App type: Public client
   - App client name: `gcreators-web`
   - No client secret
8. **Create**

### Step 3.2: Configure App Client

1. **App integration** → **App clients** → Select client
2. **Hosted UI:** (optional) for hosted login
3. **Callback URLs:** `https://your-domain.com/auth/callback`
4. **Sign-out URLs:** `https://your-domain.com`
5. **Identity providers:** Cognito user pool
6. **Save**

### Step 3.3: Migrate Users (Manual or Script)

- Export users from Supabase Auth
- Use Cognito API or CLI to create users
- Users must set new passwords (Cognito does not import hashes)

### Step 3.4: Update Application

1. Install: `npm install amazon-cognito-identity-js` or `@aws-amplify/auth`
2. Replace `supabase.auth.signIn`, `signUp`, `signOut`, etc. with Cognito calls
3. Update JWT validation in backend to use Cognito JWKS
4. Update RLS/authorization logic to use Cognito `sub` (user ID)

---

## Phase 4: File Storage (S3)

**Time:** 2–4 hours  
**Supabase Storage:** Replaced by S3

### Step 4.1: Create S3 Bucket for Uploads

1. **S3** → **Create bucket**
2. Name: `gcreators-uploads-[unique-id]`
3. Region: Same as app
4. **Block public access:** Configure as needed (e.g. public read for avatars)
5. **Create**

### Step 4.2: CORS Configuration

1. Bucket → **Permissions** → **CORS**
2. Add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:5173"],
    "ExposeHeaders": []
  }
]
```

### Step 4.3: Bucket Policy (If Public Read)

Adjust policy so specific prefixes (e.g. avatars) are public if needed.

### Step 4.4: Update Application

1. Replace `supabase.storage.from('bucket').upload()` with AWS SDK S3 `PutObject`
2. Use **Pre-signed URLs** for uploads from the client
3. Store file keys/URLs in your DB instead of Supabase storage URLs

---

## Phase 5: Backend Logic (Lambda)

**Time:** 8–16 hours  
**Supabase Edge Functions:** Replaced by AWS Lambda

### Step 5.1: List Functions to Migrate

From your project:

- `admin-delete-user`
- `recommend-mentors`
- `create-booking`
- `create-product-checkout`
- `verify-product-purchase`
- `stripe-webhook`
- `send-booking-confirmation`
- `send-message-notification`
- `send-notification-email`
- `chat-with-avatar`
- `chat-with-avatar-stream`
- `train-avatar`
- `extract-file-content`
- `google-calendar-*`
- Others in `supabase/functions/`

### Step 5.2: Create Lambda Function (Example: admin-delete-user)

1. **Lambda Console:** https://console.aws.amazon.com/lambda/
2. **Create function**
3. Name: `gcreators-admin-delete-user`
4. Runtime: Node.js 20.x
5. **Create function**
6. Copy the code from `supabase/functions/admin-delete-user/index.ts`
7. Adapt for Node.js (replace Deno imports with Node equivalents)
8. **Configuration** → **Environment variables:** Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.
9. **Deploy**

### Step 5.3: Create API Gateway HTTP API

1. **API Gateway Console:** https://console.aws.amazon.com/apigateway/
2. **Create API** → **HTTP API**
3. **Integrations** → **Add integration** → **Lambda** → Select your function
4. **Routes:** `POST /admin-delete-user` → Lambda
5. **Stages:** `$default` or `prod`
6. Copy **Invoke URL**

### Step 5.4: Update Frontend

Replace:

```javascript
supabase.functions.invoke('admin-delete-user', { body: { userId } })
```

With:

```javascript
fetch('https://your-api-id.execute-api.us-east-1.amazonaws.com/admin-delete-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ userId })
})
```

### Step 5.5: Repeat for Other Functions

Create one Lambda per Supabase function, wire to API Gateway, and update the frontend.

---

## Phase 6: Realtime & Notifications

**Time:** 4–8 hours  
**Supabase Realtime:** Replaced by alternatives

### Options

1. **AWS AppSync** (GraphQL + subscriptions) – More setup
2. **API Gateway WebSocket API + Lambda** – Custom
3. **Polling** – Easiest: replace Realtime with periodic `fetch`
4. **AWS IoT Core** – MQTT, good for device-style updates

### Simple Approach: Polling

1. Identify components using `supabase.channel()` or Realtime
2. Replace with `setInterval` + REST API calls
3. Example: Messages every 5s, notifications every 10s

---

## Environment Variables Checklist

### After Phase 1 (Frontend on AWS)

```env
# Keep Supabase (unchanged)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_APP_URL=https://your-cloudfront-url.cloudfront.net
```

### After Full Migration

```env
# AWS
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxx
VITE_S3_UPLOADS_BUCKET=gcreators-uploads-xxx
VITE_APP_URL=https://your-domain.com

# Stripe (unchanged)
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## Cost Summary & Free Tier Limits

### Estimated Monthly Cost (Within Free Tier)

| Service | Free Tier | Expected Use | Overage Risk |
|---------|-----------|--------------|--------------|
| S3 | 5 GB | ~1 GB (static + some uploads) | Low |
| CloudFront | 1 TB | ~10–50 GB | Low |
| Lambda | 1M requests | ~50k | Low |
| RDS | 750 hrs | 24/7 = 720 hrs | Low |
| Cognito | 50k MAU | &lt; 1k | Low |
| API Gateway | 1M calls | ~50k | Low |

### After 12 Months

- Lambda: Still 1M requests/month free
- S3, CloudFront, RDS, Cognito: Paid at standard rates
- Estimate: ~$15–30/month for a small app

---

## Quick Start: Frontend Only (Recommended First Step)

If you only want to move the frontend to AWS now:

```bash
# 1. Build
npm run build

# 2. Create bucket (replace BUCKET_NAME)
aws s3 mb s3://gcreators-mvp-BUCKET_NAME --region us-east-1

# 3. Enable static hosting
aws s3 website s3://gcreators-mvp-BUCKET_NAME --index-document index.html --error-document index.html

# 4. Upload
aws s3 sync dist/ s3://gcreators-mvp-BUCKET_NAME/ --delete

# 5. Set public read policy (see Phase 1.7)
# 6. Create CloudFront distribution (see Phase 1.9)
```

Supabase and Stripe stay as-is; only the React app is served from AWS.

---

## Support Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Amplify Hosting](https://docs.amplify.aws/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)

---

**Recommendation:** Start with **Phase 1** (frontend hosting). Keep Supabase for DB, Auth, Storage, and Functions until you are ready for the larger migration in Phases 2–6.

---

## EC2 Free Tier Deployment (Alternative)

If you prefer to deploy on an **EC2 instance** (t2.micro free tier) instead of S3 + CloudFront, see:

**[docs/EC2_FREE_TIER_DEPLOYMENT.md](EC2_FREE_TIER_DEPLOYMENT.md)** – Step-by-step EC2 deployment with Nginx.

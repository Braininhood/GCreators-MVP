# AWS Deployment Guide - G.Creators MVP

**Project:** G.Creators Platform  
**Stack:** React (Vite) + Supabase  
**Target:** AWS Cloud Infrastructure  
**Domain:** gcreators.me (or your custom domain)

> **Full migration to AWS Free Tier?** See [docs/AWS_FREE_TIER_MIGRATION_GUIDE.md](docs/AWS_FREE_TIER_MIGRATION_GUIDE.md) for step-by-step instructions to move the entire stack (DB, Auth, Storage, Functions) to AWS.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Setup](#domain-setup)
3. [AWS Services Needed](#aws-services-needed)
4. [Step-by-Step Deployment](#deployment-steps)
5. [DNS Configuration](#dns-configuration)
6. [SSL Certificate Setup](#ssl-certificate)
7. [Environment Variables](#environment-variables)
8. [Cost Estimation](#cost-estimation)

---

## 1. Prerequisites ✅

### What You Need:

#### A. Domain Name
- **Purchase from:** 
  - AWS Route 53: https://console.aws.amazon.com/route53/
  - Namecheap: https://www.namecheap.com/
  - GoDaddy: https://www.godaddy.com/
  - Google Domains: https://domains.google/
  
- **Recommended:** `gcreators.me` or similar
- **Cost:** $10-15/year

#### B. AWS Account
- **Sign up:** https://aws.amazon.com/
- **Requirements:**
  - Credit card (for billing)
  - Email and phone verification
  - No initial cost (free tier available)

#### C. Domain Information You'll Need
```
Domain Registrar Login Credentials:
- Email: ___________________
- Password: ___________________
- 2FA backup codes (if enabled)

Domain Details:
- Domain name: gcreators.me
- Registrar: ___________________ (e.g., Namecheap)
- Registration date: ___________
- Expiry date: ___________

Nameservers (will update these):
- Current NS1: ___________________
- Current NS2: ___________________
- Will change to AWS Route 53 nameservers
```

---

## 2. Domain Setup 🌐

### Option A: Buy Domain on AWS Route 53 (Easiest)

**Steps:**
1. Go to AWS Console → Route 53
2. Click "Register Domain"
3. Search for `gcreators.me` (or your preferred name)
4. Complete purchase ($12-15/year)
5. ✅ **Done!** AWS automatically creates hosted zone

**Advantages:**
- ✅ Automatic DNS setup
- ✅ No nameserver configuration needed
- ✅ Integrated with other AWS services
- ✅ SSL certificate automation

### Option B: Transfer Existing Domain to AWS (Recommended if already owned)

**Steps:**
1. **Unlock domain at current registrar:**
   - Login to your current registrar (e.g., Namecheap, GoDaddy)
   - Find domain management settings
   - Disable "Domain Lock" or "Transfer Lock"
   
2. **Get authorization code:**
   - Request "EPP code" or "Auth code" from current registrar
   - Usually found in domain settings or sent via email
   - Save this code: `_______________________`

3. **Initiate transfer in AWS:**
   - Go to Route 53 → "Transfer Domain"
   - Enter domain name
   - Enter authorization code
   - Complete payment (~$12-15, includes 1 year renewal)
   - Wait 5-7 days for transfer

4. **Verify email:**
   - Check email for transfer approval
   - Click approval link
   - Wait for transfer to complete

### Option C: Keep Domain at Current Registrar (More Complex)

**Steps:**
1. **Create Hosted Zone in AWS Route 53:**
   - Go to Route 53 → "Create Hosted Zone"
   - Enter domain: `gcreators.me`
   - Type: Public Hosted Zone
   - Click "Create"

2. **Get AWS Nameservers:**
   - After creation, you'll see 4 nameservers:
     ```
     ns-1234.awsdns-12.org
     ns-5678.awsdns-34.com
     ns-9012.awsdns-56.net
     ns-3456.awsdns-78.co.uk
     ```
   - **Copy all 4** (you'll need them)

3. **Update nameservers at registrar:**
   - Login to your domain registrar
   - Find "DNS Management" or "Nameservers"
   - Change from current nameservers to AWS ones
   - Wait 24-48 hours for propagation

**Record your nameservers here:**
```
AWS NS1: _________________________________
AWS NS2: _________________________________
AWS NS3: _________________________________
AWS NS4: _________________________________
```

---

## 3. AWS Services Needed ☁️

### Core Services (Required):

#### 1. **AWS Route 53** - DNS Management
- **Purpose:** Manage domain and DNS records
- **Cost:** $0.50/month per hosted zone + $0.40 per million queries
- **Setup time:** 5 minutes

#### 2. **AWS S3** - Static File Hosting
- **Purpose:** Host your React build files
- **Cost:** $0.023 per GB stored + $0.09 per GB transferred
- **Setup time:** 10 minutes

#### 3. **AWS CloudFront** - CDN
- **Purpose:** Fast global content delivery + HTTPS
- **Cost:** $0.085 per GB transferred (first 10TB/month)
- **Setup time:** 15 minutes

#### 4. **AWS Certificate Manager (ACM)** - SSL Certificate
- **Purpose:** Free SSL certificate for HTTPS
- **Cost:** FREE
- **Setup time:** 5 minutes

### Optional Services:

#### 5. **AWS Amplify** (Alternative to S3+CloudFront)
- **Purpose:** All-in-one hosting solution
- **Cost:** $0.15 per build minute + hosting
- **Advantage:** Easier setup, automatic deployments from Git
- **Setup time:** 20 minutes

---

## 4. Step-by-Step Deployment 🚀

### Method A: Using AWS Amplify (Easiest, Recommended)

#### Step 1: Build Your Project
```bash
cd d:\GCreators_MVP
npm run build
```
This creates a `dist/` folder with your production build.

#### Step 2: Create Git Repository (if not already)
```bash
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/gcreators-mvp.git
git push -u origin main
```

#### Step 3: Deploy to AWS Amplify

1. **Go to AWS Amplify Console:**
   - https://console.aws.amazon.com/amplify/

2. **Connect Repository:**
   - Click "New App" → "Host web app"
   - Choose: GitHub / GitLab / Bitbucket
   - Authorize AWS to access your repo
   - Select: `gcreators-mvp` repository
   - Branch: `main`

3. **Configure Build Settings:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Add Environment Variables:**
   - In Amplify Console → App Settings → Environment variables
   - Add all your `VITE_*` variables:
     ```
     VITE_SUPABASE_URL=https://zdairdvgiifsymgmoswf.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
     ```
   - ⚠️ **IMPORTANT:** Only add `VITE_*` and `NEXT_PUBLIC_*` variables (client-side only)
   - ⚠️ **NEVER** add secret keys like `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

5. **Deploy:**
   - Click "Save and Deploy"
   - Wait 3-5 minutes
   - ✅ You'll get a URL like: `https://main.d1234abcd.amplifyapp.com`

#### Step 4: Add Custom Domain

1. **In Amplify Console:**
   - Go to "Domain Management"
   - Click "Add domain"
   - Enter: `gcreators.me`

2. **Configure subdomains:**
   - `gcreators.me` → main branch
   - `www.gcreators.me` → main branch
   - Click "Configure domain"

3. **SSL Certificate (Automatic):**
   - Amplify automatically creates SSL certificate
   - Wait 5-10 minutes for certificate validation

4. **Update DNS:**
   - If domain is on Route 53: Automatic ✅
   - If domain is external: 
     - Copy the CNAME records shown
     - Add them to your domain registrar's DNS settings

5. **Wait for Propagation:**
   - DNS changes take 5 minutes to 48 hours
   - Check status in Amplify console
   - ✅ When "Available", your site is live!

---

### Method B: Using S3 + CloudFront (More Control)

#### Step 1: Create S3 Bucket

1. **Go to S3 Console:**
   - https://s3.console.aws.amazon.com/

2. **Create Bucket:**
   - Name: `gcreators-me` (must be globally unique)
   - Region: `us-east-1` (or closest to your users)
   - **Uncheck** "Block all public access"
   - Enable versioning (recommended)
   - Click "Create bucket"

3. **Enable Static Website Hosting:**
   - Select bucket → Properties tab
   - Scroll to "Static website hosting"
   - Enable it
   - Index document: `index.html`
   - Error document: `index.html` (for React Router)
   - Save

4. **Set Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::gcreators-me/*"
       }
     ]
   }
   ```

#### Step 2: Upload Build Files

```bash
# Build project
npm run build

# Install AWS CLI (if not installed)
# Download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Upload files to S3
aws s3 sync dist/ s3://gcreators-me/ --delete

# Verify
aws s3 ls s3://gcreators-me/
```

#### Step 3: Create CloudFront Distribution

1. **Go to CloudFront Console:**
   - https://console.aws.amazon.com/cloudfront/

2. **Create Distribution:**
   - Origin domain: Select your S3 bucket
   - Origin path: (leave empty)
   - Origin access: Public
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: Caching Optimized
   - **Add custom domain:** `gcreators.me`, `www.gcreators.me`
   - **SSL certificate:** Request or import certificate

3. **Request SSL Certificate:**
   - Click "Request certificate"
   - Goes to AWS Certificate Manager (ACM)
   - Enter domains: `gcreators.me`, `www.gcreators.me`, `*.gcreators.me`
   - Validation method: DNS validation
   - Click "Request"
   - **Add CNAME records** to Route 53 (shown on certificate page)
   - Wait 5-30 minutes for validation

4. **Complete Distribution Setup:**
   - Select the SSL certificate you just created
   - Default root object: `index.html`
   - Error pages: Add custom error response
     - HTTP error code: 403
     - Response page path: `/index.html`
     - HTTP response code: 200
     - Repeat for 404
   - Click "Create distribution"
   - Wait 15-30 minutes for deployment

#### Step 4: Configure Route 53

1. **Go to Route 53 Console:**
   - https://console.aws.amazon.com/route53/

2. **Create A Records:**
   - Select your hosted zone: `gcreators.me`
   - Click "Create record"
   
   **Record 1 (Root domain):**
   - Record name: (leave empty) → `gcreators.me`
   - Record type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your distribution
   - Click "Create records"
   
   **Record 2 (WWW subdomain):**
   - Record name: `www`
   - Record type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your distribution
   - Click "Create records"

3. **Wait for DNS Propagation:**
   - Usually 5-30 minutes
   - Check with: `nslookup gcreators.me`

---

## 5. DNS Configuration 🔧

### Required DNS Records

Create these records in Route 53:

| Record Type | Name | Value | TTL | Purpose |
|-------------|------|-------|-----|---------|
| **A** | @ (root) | Alias to CloudFront | Auto | Main domain |
| **A** | www | Alias to CloudFront | Auto | WWW subdomain |
| **CNAME** | api | your-api-gateway-url | 300 | API endpoint (if separate) |
| **TXT** | @ | "v=spf1 include:_spf.google.com ~all" | 300 | Email verification |
| **MX** | @ | Points to email provider | 300 | Email receiving |

### Email DNS Records (if using custom email)

If you want `noreply@gcreators.me` to work:

**Option 1: Use Resend (Recommended)**
```
TXT @ resend._domainkey.gcreators.me → [value from Resend]
MX @ → feedback-smtp.resend.com (priority 10)
```

**Option 2: Use SendGrid**
```
CNAME em1234.gcreators.me → sendgrid.net
CNAME s1._domainkey → s1.domainkey.u1234.wl.sendgrid.net
CNAME s2._domainkey → s2.domainkey.u1234.wl.sendgrid.net
```

---

## 6. SSL Certificate Setup 🔒

### Option A: AWS Certificate Manager (Free!)

1. **Request Certificate:**
   - Go to ACM: https://console.aws.amazon.com/acm/
   - Click "Request certificate"
   - Choose "Request a public certificate"

2. **Add Domain Names:**
   ```
   gcreators.me
   www.gcreators.me
   *.gcreators.me (wildcard for subdomains)
   ```

3. **Validation Method:**
   - Choose: **DNS validation** (easier)
   - Click "Request"

4. **Add DNS Records:**
   - ACM shows CNAME records to add
   - If using Route 53: Click "Create records in Route 53" (automatic!)
   - If external DNS: Manually add CNAME records shown
   - Example:
     ```
     CNAME _abc123.gcreators.me → _xyz789.acm-validations.aws
     ```

5. **Wait for Validation:**
   - Usually 5-30 minutes
   - Status changes from "Pending" to "Issued" ✅
   - Certificate is valid for 1 year (auto-renews)

---

## 7. Environment Variables 🔐

### What to Update After Deployment:

Update your `.env` file:

```env
# Before (Development):
NEXT_PUBLIC_APP_URL=http://localhost:5173

# After (Production):
NEXT_PUBLIC_APP_URL=https://gcreators.me
```

### Update in AWS Amplify:

Go to Amplify Console → Environment Variables:

```env
VITE_SUPABASE_URL=https://zdairdvgiifsymgmoswf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://gcreators.me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NODE_ENV=production
```

### Update in Supabase:

1. **Go to Supabase Dashboard:**
   - Project Settings → API → URL Configuration

2. **Add Production URL:**
   - Site URL: `https://gcreators.me`
   - Redirect URLs:
     ```
     https://gcreators.me/auth
     https://gcreators.me/auth/callback
     https://www.gcreators.me/auth
     https://www.gcreators.me/auth/callback
     ```

3. **Update Edge Function Secrets:**
   ```bash
   # Set secrets for Edge Functions (server-side)
   supabase secrets set OPENAI_API_KEY=sk-proj-...
   supabase secrets set RESEND_API_KEY=re_...
   supabase secrets set APP_URL=https://gcreators.me
   ```

---

## 8. Domain Information Checklist 📝

### Before You Start, Gather:

```
✅ DOMAIN INFORMATION:
□ Domain name purchased: gcreators.me
□ Registrar login credentials saved
□ Domain unlocked (if transferring)
□ Auth/EPP code obtained (if transferring)

✅ AWS ACCOUNT:
□ AWS account created
□ Credit card added
□ IAM user created (for CLI access)
□ Access Key ID: _______________________
□ Secret Access Key: _______________________

✅ DNS RECORDS NEEDED:
□ Current nameservers documented
□ Email DNS records (if using custom email)
□ Any existing subdomain records

✅ SSL CERTIFICATE:
□ Certificate requested in ACM
□ DNS validation records added
□ Certificate status: Issued

✅ DEPLOYMENT:
□ Build successful (npm run build)
□ Files uploaded to S3 / Amplify deployed
□ CloudFront distribution created
□ Custom domain configured
□ SSL working (HTTPS)
```

---

## 9. Deployment Checklist 📋

### Pre-Deployment:

```
□ Code committed to Git
□ .env file NOT committed (in .gitignore)
□ npm run build works without errors
□ All tests passing
□ Environment variables documented
□ Backup database (Supabase automatic backups enabled)
```

### During Deployment:

```
□ Domain purchased/transferred to AWS
□ Hosted zone created in Route 53
□ SSL certificate requested and validated
□ S3 bucket created (or Amplify app created)
□ Build files uploaded
□ CloudFront distribution created (or Amplify domain configured)
□ DNS records configured
□ Environment variables set in Amplify/deployment
```

### Post-Deployment:

```
□ Test site: https://gcreators.me
□ Test WWW redirect: https://www.gcreators.me
□ Verify SSL (green padlock in browser)
□ Test all features:
  □ Sign up / Sign in
  □ Mentor profiles
  □ Booking system
  □ Chat/messaging
  □ Admin panel
□ Check browser console for errors
□ Test on mobile devices
□ Monitor CloudWatch logs
□ Set up error monitoring (Sentry)
```

---

## 10. Quick Start Commands 🎯

### If Using AWS Amplify (Recommended):

```bash
# 1. Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configure Amplify
amplify configure

# 3. Initialize Amplify in your project
cd d:\GCreators_MVP
amplify init

# 4. Add hosting
amplify add hosting
# Choose: Amazon CloudFront and S3

# 5. Deploy
amplify publish

# 6. Add custom domain (in AWS Console)
# Go to Amplify → Domain Management → Add domain
```

### If Using S3 + CloudFront Manually:

```bash
# 1. Build project
npm run build

# 2. Create S3 bucket
aws s3 mb s3://gcreators-me

# 3. Upload files
aws s3 sync dist/ s3://gcreators-me/ --delete

# 4. Create CloudFront distribution (via Console)
# 5. Configure Route 53 (via Console)
```

---

## 11. Cost Estimation 💰

### Monthly Costs (Estimated):

| Service | Cost | Usage Assumption |
|---------|------|------------------|
| **Route 53** | $0.50 | 1 hosted zone |
| **Domain** | $1.00 | $12/year ÷ 12 months |
| **S3 Storage** | $0.50 | 20GB stored |
| **CloudFront** | $5-10 | 100GB transfer/month |
| **SSL Certificate** | FREE | Via ACM |
| **Amplify** | $0-15 | If using Amplify hosting |
| **Total** | **$7-27/month** | For ~1000 users/month |

### Free Tier Benefits (First 12 Months):

- ✅ CloudFront: 1TB transfer free
- ✅ Route 53: First hosted zone free
- ✅ S3: 5GB storage + 20k GET requests free

---

## 12. Troubleshooting 🔧

### Common Issues:

#### "Domain not accessible"
- **Check:** DNS propagation (wait 24-48 hours)
- **Test:** Use `nslookup gcreators.me` or https://dnschecker.org/
- **Fix:** Verify nameservers are correctly updated

#### "SSL certificate not working"
- **Check:** ACM certificate status (must be "Issued")
- **Fix:** Add DNS validation records to Route 53
- **Wait:** 5-30 minutes for validation

#### "Site shows old content"
- **Cause:** CloudFront caching
- **Fix:** Invalidate cache
  ```bash
  aws cloudfront create-invalidation --distribution-id E1234ABCD --paths "/*"
  ```

#### "Environment variables not working"
- **Check:** Amplify environment variables are set
- **Check:** Variables have `VITE_` or `NEXT_PUBLIC_` prefix
- **Fix:** Redeploy after adding variables

---

## 13. Security Checklist 🔒

### Before Going Live:

```
□ SSL/HTTPS enabled (no mixed content warnings)
□ Environment variables properly configured
□ Supabase RLS policies active
□ Rate limiting enabled
□ CORS properly configured in Supabase
□ Supabase redirect URLs include production domain
□ Error pages configured (don't expose stack traces)
□ Security headers configured in CloudFront
□ Admin panel requires authentication
□ Database backups enabled
```

### Security Headers (CloudFront):

Add these headers in CloudFront → Behaviors → Response Headers Policy:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 14. Next Steps After Domain Setup 🚀

1. **Monitor:** Set up CloudWatch alarms
2. **Analytics:** Add Google Analytics / PostHog
3. **Error Tracking:** Set up Sentry
4. **Backups:** Verify automated backups
5. **CDN:** Consider CloudFlare for additional protection
6. **Email:** Configure custom email sending domain
7. **Performance:** Enable compression and caching

---

## 15. Support Resources 📚

- **AWS Documentation:** https://docs.aws.amazon.com/
- **AWS Amplify Docs:** https://docs.amplify.aws/
- **Route 53 Guide:** https://docs.aws.amazon.com/route53/
- **CloudFront Guide:** https://docs.aws.amazon.com/cloudfront/
- **Supabase Deployment:** https://supabase.com/docs/guides/hosting
- **AWS Free Tier:** https://aws.amazon.com/free/

---

## 🎯 Recommended Deployment Path

**For G.Creators MVP, I recommend:**

### ⭐ Best Choice: AWS Amplify

**Why:**
- ✅ Easiest setup (1-2 hours total)
- ✅ Automatic deployments from Git
- ✅ Free SSL certificate
- ✅ Automatic builds on push
- ✅ Built-in preview environments
- ✅ Good pricing for MVP ($5-15/month)

**Steps:**
1. Push code to GitHub (15 mins)
2. Connect Amplify to GitHub repo (10 mins)
3. Configure environment variables (10 mins)
4. Add custom domain (15 mins)
5. Wait for DNS propagation (30 mins)
6. ✅ **Total time: ~1.5 hours**

---

## 📞 Need Help?

If you get stuck, provide:
1. Your domain name
2. Where it's registered
3. Current deployment method (Amplify/S3)
4. Screenshot of error
5. AWS region you're using

I can help with specific configuration!

---

**Ready to deploy? Start with AWS Amplify - it's the fastest path to production!** 🚀

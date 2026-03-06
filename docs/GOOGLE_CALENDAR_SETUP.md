# Google Calendar API Setup Guide

**Complete step-by-step guide for G.Creators MVP**

---

## 📋 Prerequisites

- Google Account (Gmail)
- Access to Google Cloud Console
- Your application domain (for production: gcreators.me)

---

## 🚀 Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### 1.2 Create New Project
1. Click on the project dropdown (top left, next to "Google Cloud")
2. Click **"New Project"**
3. Enter project details:
   - **Project name:** `G.Creators Calendar`
   - **Organization:** Leave as "No organization" (unless you have one)
4. Click **"Create"**
5. Wait for project creation (takes ~30 seconds)
6. Select the new project from the dropdown

---

## 🔧 Step 2: Enable Google Calendar API

### 2.1 Enable the API
1. In the search bar at the top, type: **"Google Calendar API"**
2. Click on **"Google Calendar API"**
3. Click the **"Enable"** button
4. Wait for it to enable (~5-10 seconds)

### 2.2 Verify API is Enabled
1. Go to: **APIs & Services** → **Enabled APIs & Services**
2. You should see "Google Calendar API" in the list

---

## 🔐 Step 3: Configure OAuth Consent Screen

### 3.1 Go to OAuth Consent Screen
1. In left sidebar: **APIs & Services** → **OAuth consent screen**

### 3.2 Choose User Type
1. Select **"External"** (allows anyone with Google account)
2. Click **"Create"**

### 3.3 Fill App Information

**Page 1: App Information**
```
App name: G.Creators
User support email: [your-email@gmail.com]
App logo: (optional - upload if you have one)

Application home page: https://gcreators.me
Application privacy policy: https://gcreators.me/privacy
Application terms of service: https://gcreators.me/terms

Developer contact information:
Email address: [your-email@gmail.com]
```

Click **"Save and Continue"**

**Page 2: Scopes**
1. Click **"Add or Remove Scopes"**
2. Search for and select these scopes:
   ```
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/calendar.readonly
   ```
3. Click **"Update"**
4. Click **"Save and Continue"**

**Page 3: Test Users (for development)**
1. Click **"Add Users"**
2. Add your email address and any test users
3. Click **"Save and Continue"**

**Page 4: Summary**
1. Review information
2. Click **"Back to Dashboard"**

---

## 🔑 Step 4: Create OAuth 2.0 Credentials

### 4.1 Go to Credentials Page
1. In left sidebar: **APIs & Services** → **Credentials**

### 4.2 Create OAuth Client ID
1. Click **"+ Create Credentials"** (top)
2. Select **"OAuth client ID"**

### 4.3 Configure OAuth Client

**Application type:** Web application

**Name:** `G.Creators Web Client`

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:8080
https://gcreators.me
```

**Authorized redirect URIs:**
```
http://localhost:5173/api/auth/google/callback
http://localhost:5173/mentor/dashboard
https://gcreators.me/api/auth/google/callback
https://gcreators.me/mentor/dashboard
```

Click **"Create"**

### 4.4 Save Your Credentials

A popup will show:
- **Client ID** (starts with: `xxxxx.apps.googleusercontent.com`)
- **Client Secret** (random string)

**IMPORTANT:** Copy both and save them securely!

Click **"Download JSON"** to save the credentials file (optional backup)

---

## 📝 Step 5: Add Credentials to Your App

### 5.1 Update `.env` File

Add these to `d:\GCreators_MVP\.env`:

```env
# =============================================================================
# GOOGLE CALENDAR API
# =============================================================================

VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# Redirect URIs (for local dev and production)
GOOGLE_REDIRECT_URI_DEV=http://localhost:5173/mentor/dashboard
GOOGLE_REDIRECT_URI_PROD=https://gcreators.me/mentor/dashboard
```

### 5.2 Add to Supabase Edge Function Secrets

Go to: Supabase Dashboard → Project Settings → Edge Functions → Secrets

Add these secrets:

```
GOOGLE_CLIENT_ID = YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = YOUR_CLIENT_SECRET
```

---

## 🧪 Step 6: Test OAuth Flow

### 6.1 Test Authorization URL

Create this test URL (replace YOUR_CLIENT_ID):

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID.apps.googleusercontent.com&
  redirect_uri=http://localhost:5173/mentor/dashboard&
  response_type=code&
  scope=https://www.googleapis.com/auth/calendar.events&
  access_type=offline&
  prompt=consent
```

Open this URL in your browser:
1. You should see Google sign-in
2. Grant calendar permissions
3. Redirected to your app

### 6.2 Verify Redirect Works

If you see the URL change to:
```
http://localhost:5173/mentor/dashboard?code=XXXX
```

✅ OAuth is configured correctly!

---

## 🔄 Step 7: Request Production Access (When Ready)

Before launching to production:

### 7.1 Complete OAuth Verification
1. Go to: **OAuth consent screen**
2. Click **"Publish App"**
3. Click **"Confirm"**
4. Google will review your app (1-3 days)

### 7.2 Required for Verification
- Privacy policy URL (must be accessible)
- Terms of service URL (must be accessible)
- Application description
- Scopes justification
- YouTube demo video (showing OAuth flow)

**Note:** You can skip this for testing with up to 100 test users

---

## 📋 Quick Reference

### Scopes We Need

| Scope | Purpose |
|-------|---------|
| `calendar.events` | Create, read, update, delete events |
| `calendar.readonly` | Read calendar availability |

### OAuth URLs

| URL | Purpose |
|-----|---------|
| Authorization | `https://accounts.google.com/o/oauth2/v2/auth` |
| Token | `https://oauth2.googleapis.com/token` |
| Revoke | `https://oauth2.googleapis.com/revoke` |

### Important Settings

```javascript
// OAuth parameters
{
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  scope: 'https://www.googleapis.com/auth/calendar.events',
  response_type: 'code',
  access_type: 'offline', // Get refresh token
  prompt: 'consent' // Force consent screen
}
```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
→ Add the exact redirect URI to Google Console  
→ Make sure there are no trailing slashes  
→ Protocol must match (http vs https)

### Error: "invalid_client"
→ Check CLIENT_ID is correct  
→ Verify CLIENT_SECRET matches

### Error: "access_denied"
→ User didn't grant permissions  
→ Check scopes are correct

### Error: "unauthorized_client"
→ OAuth consent screen not configured  
→ App not published (add test users)

---

## 📚 Additional Resources

- **Google Calendar API Docs:** https://developers.google.com/calendar
- **OAuth 2.0 Docs:** https://developers.google.com/identity/protocols/oauth2
- **JavaScript Quickstart:** https://developers.google.com/calendar/api/quickstart/js
- **API Reference:** https://developers.google.com/calendar/api/v3/reference

---

## ✅ Checklist

Before proceeding with implementation:

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Client ID and Secret saved
- [ ] Credentials added to `.env`
- [ ] Credentials added to Supabase secrets
- [ ] Test users added (for development)
- [ ] Authorization URL tested
- [ ] Redirect working

---

**Next Steps:** Implement Google Calendar integration in the application (see CALENDAR_IMPLEMENTATION.md)

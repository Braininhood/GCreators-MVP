# Push Project to GitHub – Braininhood

**Goal:** Create a public repository and push G.Creators MVP to https://github.com/Braininhood

---

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `GCreators-MVP` (or `gcreators-mvp`)
3. **Description:** `G.Creators – Mentor–Learner platform (React + Supabase + Stripe)`
4. **Visibility:** Public
5. **Do NOT** check "Add a README" (project already has one)
6. Click **Create repository**

---

## Step 2: Push from Your Machine

Open PowerShell in the project folder and run:

```powershell
cd d:\GCreators_MVP

# Initialize git (if not done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: G.Creators MVP"

# Add remote (replace YOUR_USERNAME with Braininhood if different)
git remote add origin https://github.com/Braininhood/GCreators-MVP.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 3: If You Need to Sign In

- **HTTPS:** GitHub will prompt for username and password
- **Password:** Use a [Personal Access Token](https://github.com/settings/tokens) (not your GitHub password)
- **SSH:** Use `git@github.com:Braininhood/GCreators-MVP.git` as remote if you use SSH keys

---

## Step 4: Create Token (If Required)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. **Tokens (classic)** → **Generate new token**
3. Name: `GCreators-MVP`
4. Scopes: `repo`
5. **Generate** and copy the token
6. Use it as the password when `git push` asks

---

## Excluded from Repo (.gitignore)

- `.env` (secrets)
- `node_modules`
- `dist`
- `*.log`
- Other sensitive or generated files

**Never commit** `.env` or API keys.

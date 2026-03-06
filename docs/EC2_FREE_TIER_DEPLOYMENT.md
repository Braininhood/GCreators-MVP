# EC2 Free Tier Deployment – G.Creators MVP

**Goal:** Deploy the app on an AWS EC2 instance (Free Tier).  
**Stack:** React (Vite) + Supabase (unchanged) + Stripe (unchanged)  
**No migration** – only hosting the frontend on EC2.

---

> **No migration** – Supabase and Stripe stay as-is. Only the React app is hosted on EC2.

## Table of Contents

1. [EC2 Free Tier Overview](#1-ec2-free-tier-overview)
2. [Step 1: Launch EC2 Instance](#step-1-launch-ec2-instance)
3. [Step 2: Connect to EC2](#step-2-connect-to-ec2)
4. [Step 3: Install Nginx and Node.js](#step-3-install-nginx-and-nodejs)
5. [Step 4: Build and Deploy the App](#step-4-build-and-deploy-the-app)
6. [Step 5: Configure Nginx](#step-5-configure-nginx)
7. [Step 5b: Run as Node.js Systemd Service](#step-5b-alternative--run-as-nodejs-systemd-service)
8. [Step 6: Open HTTP/HTTPS Ports](#step-6-open-httpports)
9. [Step 7: (Optional) Domain and SSL](#step-7-optional-domain-and-ssl)
10. [Updating the App](#updating-the-app)
11. [Troubleshooting](#troubleshooting)

---

## 1. EC2 Free Tier Overview

| Item | Free Tier (12 months) |
|------|------------------------|
| **Instance** | 750 hours/month of t2.micro or t3.micro |
| **vCPUs** | 1 |
| **Memory** | 1 GB |
| **Storage** | 30 GB EBS (gp2) |
| **Region** | us-east-1 (or your preferred region) |

**Note:** 750 hours ≈ 24/7 for one instance. One t2.micro is enough for this app.

---

## Step 1: Launch EC2 Instance

### 1.1 Open EC2 Console

1. Go to https://console.aws.amazon.com/ec2/
2. Region: **us-east-1** (N. Virginia) or closest to your users

### 1.2 Launch Instance

1. **Launch instance**
2. **Name:** `gcreators-mvp`
3. **AMI:** Amazon Linux 2023
4. **Instance type:** **t2.micro** (Free tier eligible)
5. **Key pair:**
   - **Create new key pair**
   - Name: `gcreators-key`
   - Type: RSA
   - Format: `.pem` (for SSH)
   - **Download** and save the `.pem` file securely
6. **Network settings:**
   - Create security group: `gcreators-sg`
   - Allow SSH (22) from **My IP**
   - Allow HTTP (80) from **Anywhere** (0.0.0.0/0)
   - Allow HTTPS (443) from **Anywhere** (0.0.0.0/0)
7. **Storage:** 8 GB gp2 (default, within free tier)
8. **Launch instance**

### 1.3 Get Public IP

1. **Instances** → select `gcreators-mvp`
2. Copy **Public IPv4 address** (e.g. `54.123.45.67`)

---

## Step 2: Connect to EC2

### Windows (PowerShell)

```powershell
# Move key to a safe folder
cd $HOME
mkdir .ssh
# Copy your .pem file to C:\Users\YourName\.ssh\gcreators-key.pem

# Set permissions (PowerShell)
icacls $HOME\.ssh\gcreators-key.pem /inheritance:r
icacls $HOME\.ssh\gcreators-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect (replace with your instance Public IP)
ssh -i $HOME\.ssh\gcreators-key.pem ec2-user@YOUR_PUBLIC_IP
```

### macOS / Linux

```bash
chmod 400 ~/gcreators-key.pem
ssh -i ~/gcreators-key.pem ec2-user@YOUR_PUBLIC_IP
```

When prompted `Are you sure you want to continue connecting?`, type `yes`.

---

## Step 3: Install Nginx and Node.js

Run these on the EC2 instance (after SSH):

```bash
# Update system
sudo dnf update -y

# Install Node.js 20
sudo dnf install -y nodejs npm

# Install Nginx
sudo dnf install -y nginx

# Verify
node -v   # v20.x
nginx -v  # nginx/1.x
```

---

## Step 4: Build and Deploy the App

### Option A: Build Locally, Upload to EC2

**On your Windows machine:**

```powershell
cd d:\GCreators_MVP
npm run build
```

Then upload `dist/` to EC2:

```powershell
scp -i $HOME\.ssh\gcreators-key.pem -r dist/* ec2-user@YOUR_PUBLIC_IP:~/app/
```

**On EC2**, create the app directory first:

```bash
mkdir -p ~/app
```

Then from your machine:

```powershell
scp -i $HOME\.ssh\gcreators-key.pem -r dist/* ec2-user@YOUR_PUBLIC_IP:~/app/
```

### Option B: Build on EC2 (Clone Repo)

**On EC2:**

```bash
# Install Git
sudo dnf install -y git

# Clone (replace with your repo URL)
cd ~
git clone https://github.com/yourusername/GCreators_MVP.git app-src
cd app-src

# Create .env.production with your production vars
nano .env.production
```

Add:

```env
VITE_SUPABASE_URL=https://zdairdvgiifsymgmoswf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_PUBLIC_IP
```

```bash
# Build
npm install
npm run build

# Copy build to app folder
mkdir -p ~/app
cp -r dist/* ~/app/
```

---

## Step 5: Configure Nginx

**On EC2:**

```bash
sudo nano /etc/nginx/conf.d/gcreators.conf
```

Paste:

```nginx
server {
    listen 80;
    server_name _;
    root /home/ec2-user/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save (Ctrl+O, Enter, Ctrl+X).

```bash
# Remove default config if it conflicts
sudo rm -f /etc/nginx/conf.d/default.conf

# Test nginx config
sudo nginx -t

# Start and enable nginx (runs as systemd service - auto-start on boot)
sudo systemctl start nginx
sudo systemctl enable nginx
```

Nginx runs as a **systemd service**: it starts on boot, restarts on crash, and is managed with `systemctl`.

---

## Step 5b: Alternative – Run as Node.js Systemd Service

If you prefer to serve the app with Node.js instead of Nginx:

### Install serve

```bash
cd ~
sudo npm install -g serve
```

### Create systemd service file

```bash
sudo nano /etc/systemd/system/gcreators.service
```

Paste:

```ini
[Unit]
Description=G.Creators React App
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app
ExecStart=/usr/local/bin/serve -s . -l 3000
Restart=always
RestartSec=2
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Run Nginx as reverse proxy (optional)

To serve on port 80 and proxy to Node:

```bash
sudo nano /etc/nginx/conf.d/gcreators.conf
```

```nginx
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable and start the service

> **Note:** If `serve` is elsewhere, run `which serve` and use that path in `ExecStart`.

```bash
sudo systemctl daemon-reload
sudo systemctl enable gcreators
sudo systemctl start gcreators
sudo systemctl status gcreators
```

### Service commands

```bash
sudo systemctl start gcreators    # Start
sudo systemctl stop gcreators     # Stop
sudo systemctl restart gcreators  # Restart (after deploy)
sudo systemctl status gcreators   # Check status
journalctl -u gcreators -f        # View logs
```

### If using Node only (no Nginx proxy)

- Allow port 3000 in the security group
- Or change `ExecStart` to `serve -s . -l 80` (requires root or `cap_net_bind_service`)

---

## Step 6: Open HTTP/HTTPS Ports

If you didn’t allow HTTP/HTTPS when creating the instance:

1. **EC2** → **Security Groups** → select `gcreators-sg`
2. **Edit inbound rules**
3. Add:
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
4. **Save**

---

## Step 7: (Optional) Domain and SSL

### 7.1 Point Domain to EC2

1. **Route 53** (or your DNS provider)
2. Create **A record**: `@` or `www` → EC2 Public IP

### 7.2 SSL with Let’s Encrypt (Certbot)

**On EC2:**

```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get certificate (replace gcreators.me with your domain)
sudo certbot --nginx -d gcreators.me -d www.gcreators.me

# Auto-renewal
sudo systemctl enable certbot-renew.timer
```

### 7.3 Update Supabase Redirect URLs

In **Supabase Dashboard** → **Authentication** → **URL Configuration**:

- Site URL: `https://gcreators.me` (or `http://YOUR_EC2_IP`)
- Redirect URLs:
  ```
  https://gcreators.me/auth
  https://gcreators.me/auth/callback
  http://YOUR_EC2_IP/auth
  http://YOUR_EC2_IP/auth/callback
  ```

---

## Updating the App

### When You Make Changes

**Option A – Local build + upload:**

```powershell
cd d:\GCreators_MVP
npm run build
scp -i $HOME\.ssh\gcreators-key.pem -r dist/* ec2-user@YOUR_PUBLIC_IP:~/app/
```

**Option B – Build on EC2:**

```bash
ssh -i ~/gcreators-key.pem ec2-user@YOUR_PUBLIC_IP
cd ~/app-src
git pull
npm run build
cp -r dist/* ~/app/
```

---

## Troubleshooting

### "Connection refused" when opening the site

- Check security group allows HTTP (80) from 0.0.0.0/0
- Check nginx: `sudo systemctl status nginx`
- Restart nginx: `sudo systemctl restart nginx`

### Blank page or 404 on refresh

- Ensure `try_files $uri $uri/ /index.html;` is in the nginx config
- Check `root` points to `/home/ec2-user/app`

### Environment variables not working

- Vite embeds `VITE_*` at build time
- Rebuild after changing `.env.production`
- Ensure `.env.production` exists before `npm run build`

### Out of memory during build

- t2.micro has 1 GB RAM
- Add swap:  
  `sudo dd if=/dev/zero of=/swapfile bs=1M count=1024`  
  `sudo chmod 600 /swapfile`  
  `sudo mkswap /swapfile`  
  `sudo swapon /swapfile`

### SSH "Permission denied"

- Check key path and permissions
- Ensure you use `ec2-user` (Amazon Linux)
- Confirm security group allows SSH from your IP

---

## Quick Reference

| Item | Value |
|------|-------|
| **User** | ec2-user |
| **App path** | /home/ec2-user/app |
| **Nginx config** | /etc/nginx/conf.d/gcreators.conf |
| **Logs** | /var/log/nginx/ |

---

## Cost (Free Tier)

- **EC2 t2.micro:** 750 hours/month free (12 months)
- **EBS:** 30 GB free
- **Data transfer:** 15 GB out free

After 12 months: ~$8–10/month for one t2.micro + storage.

# Sojaru — Deployment Guide

## Architecture
- **Frontend**: React (static build) → host on Hostinger public_html
- **Backend**: FastAPI (Python) → host on Hostinger VPS or Railway.app
- **Database**: MongoDB Atlas (external)
- **Products**: WooCommerce API (external)

---

## Step 1 — Backend (.env file in /backend folder)

Create a file called `.env` inside the `backend/` folder:

```
MONGO_URL=mongodb+srv://picasogargari_db_user:NKHSKKf9zRiYYVTG@cluster0.92tkprs.mongodb.net/
DB_NAME=Sojaru
WC_STORE_URL=https://developer.sojaru.co.in
WC_CONSUMER_KEY=ck_419a6e09d46defa88017c949a5810a884a3e9573
WC_CONSUMER_SECRET=cs_832d936678f29ec8c1946d7dd1165a223174460c
JWT_SECRET=2c2e04d3b6d4644c6b860ea79415aeb891622e6c0fec86c37c6ec26f3fbc05fd
ADMIN_EMAIL=hello@sojaru.co.in
ADMIN_PASSWORD=admin123
CORS_ORIGINS=https://yourdomain.com
PORT=8001
```

> Change CORS_ORIGINS to your actual domain. Change ADMIN_PASSWORD before going live.

---

## Step 2 — Frontend (.env file in /frontend folder)

Create a file called `.env` inside the `frontend/` folder:

```
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

> This must point to where your FastAPI backend is running.

---

## Step 3 — Deploy Backend on Hostinger VPS

SSH into your VPS and run:

```bash
# Install Python 3.11
sudo apt update && sudo apt install python3.11 python3-pip -y

# Go to your project
cd /path/to/sojaru

# Install dependencies
pip install -r backend/requirements.txt

# Start the server (runs on port 8001 by default)
cd backend && python server.py
```

To keep it running 24/7 with PM2:
```bash
pip install gunicorn
npm install -g pm2
pm2 start "cd backend && gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001" --name sojaru-api
pm2 save
```

---

## Step 4 — Deploy Frontend on Hostinger

**Option A — Static Files (Shared Hosting):**
1. Build locally: `cd frontend && yarn build`
2. Upload everything inside `frontend/build/` to Hostinger's `public_html/`
3. The `.htaccess` file is already included for React Router to work

**Option B — VPS:**
```bash
cd frontend && yarn build
# Serve with nginx or copy to web root
cp -r build/* /var/www/html/
```

---

## MongoDB Atlas — Fix Connection (IMPORTANT)

If you get a connection error, add your Hostinger IP to Atlas:
1. Go to cloud.mongodb.com → Network Access
2. Click + ADD IP ADDRESS
3. Enter your Hostinger server IP (or 0.0.0.0/0 for all IPs)
4. Click Confirm → wait 60 seconds

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MongoDB connection refused | Add your server IP to Atlas Network Access |
| WooCommerce 404 errors | Go to WP Admin → Settings → Permalinks → Save |
| React routes show 404 | Make sure `.htaccess` is uploaded to public_html |
| Backend not starting | Check PORT is not blocked by Hostinger firewall |
| CORS errors | Set CORS_ORIGINS to your exact frontend domain |

# Render Deployment Guide

## Quick Setup Steps:

1. **Sign up/Login to Render**

   - Go to https://render.com
   - Sign up with GitHub (recommended)

2. **Create New Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `shamim0183/LoanLink-Server`
   - Click "Connect"

3. **Configure the Service**

   ```
   Name: loanlink-server (or any name you prefer)
   Environment: Node
   Region: Choose closest to you (e.g., Singapore for Asia)
   Branch: main
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**
   Click "Advanced" → Add the following environment variables:

   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://loanlink-bd.netlify.app
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=loanlink_super_secret_jwt_key_minimum32characters_2024
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

5. **Deploy**

   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Your server URL will be: `https://loanlink-server.onrender.com` (or similar)

6. **Update Netlify Environment Variable**
   - Go to Netlify → Your site → Site settings → Environment variables
   - Update `VITE_API_URL` to your new Render URL + `/api`
   - Example: `https://loanlink-server.onrender.com/api`
   - Trigger a redeploy on Netlify

## Why Render is Better:

- ✅ Traditional Node.js hosting (not serverless)
- ✅ CORS works exactly like localhost
- ✅ Auto-deploys from GitHub
- ✅ Free tier available
- ✅ Better for MongoDB persistent connections

## Note:

The free tier "spins down" after 15 minutes of inactivity, so the first request after idle time may take 30-60 seconds. This is normal for the free tier.

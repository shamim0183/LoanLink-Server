# Deployment Guide

## Server Deployment (Railway/Render)

1. Create account on [Railway](https://railway.app) or [Render](https://render.com)
2. Connect GitHub repository
3. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - STRIPE_SECRET_KEY
   - CLIENT_URL
4. Deploy!

## Client Deployment (Vercel/Netlify)

1. Create account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Import GitHub repository
3. Add environment variables from `.env.local`
4. Deploy!

## Post-Deployment

- Add deployment URL to Firebase authorized domains
- Update CLIENT_URL in server env
- Update VITE_API_URL in client env
- Test all features

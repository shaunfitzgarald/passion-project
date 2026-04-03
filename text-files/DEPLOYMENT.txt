# Deployment Guide

## Firebase Hosting Deployment

### Step 1: Login to Firebase (if not already logged in)
```bash
firebase login
```
This will open a browser window for you to authenticate.

### Step 2: Initialize Firebase Hosting (if needed)
```bash
firebase init hosting
```
- Select your Firebase project
- Set public directory to: `build`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No` (we'll deploy manually)

### Step 3: Deploy
```bash
firebase deploy --only hosting
```

Your app will be deployed to: `https://YOUR-PROJECT-ID.web.app` or `https://YOUR-PROJECT-ID.firebaseapp.com`

---

## Alternative: Deploy to Netlify (Easier, Free)

### Option 1: Drag & Drop
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag your `build` folder to the Netlify dashboard
3. Your site is live!

### Option 2: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

---

## Alternative: Deploy to Vercel (Also Easy, Free)

### Option 1: GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repo
3. Vercel will auto-detect React and deploy

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## Environment Variables

**IMPORTANT**: Make sure to set your environment variables in your hosting platform:

- `REACT_APP_GOOGLE_MAPS_API_KEY`
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

### For Firebase Hosting:
Set these in Firebase Console → Project Settings → Your Apps → Config

### For Netlify:
Site Settings → Environment Variables

### For Vercel:
Project Settings → Environment Variables


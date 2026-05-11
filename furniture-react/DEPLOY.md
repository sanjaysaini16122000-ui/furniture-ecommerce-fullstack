# Deployment Guide for The Urban Karigar Website

## Option 1: Firebase Hosting (Recommended - Free)

### Prerequisites
- Node.js installed
- Firebase CLI: `npm install -g firebase-tools`

### Steps

1. **Build the production bundle:**
   ```bash
   cd c:\Users\ajju7\.gemini\antigravity\scratch\furniture-react
   npm run build
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting:**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

Your site will be live at: `https://your-project-id.web.app`

---

## Option 2: Vercel (Easiest - Free)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd c:\Users\ajju7\.gemini\antigravity\scratch\furniture-react
   vercel
   ```
   - Follow the prompts
   - It auto-detects Vite and deploys

---

## Option 3: Netlify (Free)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Drag & Drop:**
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder

OR use CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Environment Variables

Make sure to set these in your hosting platform:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Quick Deploy Command

```bash
# Build and deploy to Firebase in one go
npm run build && firebase deploy --only hosting
```

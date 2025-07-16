# 🚀 Deployment Guide for StoryVid

## Environment Variables Setup

### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Add your Firebase configuration values

### For Vercel Deployment:
Add these environment variables in your Vercel project settings:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyA5wuKIdTUyUXuseAfp_3flJceKpgJQrk4
REACT_APP_FIREBASE_AUTH_DOMAIN=storyvid-d1792.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=storyvid-d1792
REACT_APP_FIREBASE_STORAGE_BUCKET=storyvid-d1792.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=549183398177
REACT_APP_FIREBASE_APP_ID=1:549183398177:web:b6bca429c71d61a0e7de60
REACT_APP_FIREBASE_MEASUREMENT_ID=G-6TC35CPQ5C
```

## 🔧 Fix Google SSO on Vercel

### Step 1: Add Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `storyvid-d1792`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel URLs:
   - Production: `https://your-app-name.vercel.app`
   - Preview: `https://your-app-name-git-main-username.vercel.app`
   - Or use wildcard: `*.vercel.app`

### Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all the Firebase environment variables listed above
4. Make sure to set them for all environments (Production, Preview, Development)

### Step 3: Redeploy

After adding the environment variables, redeploy your application:
```bash
vercel --prod
```

## 🔍 Troubleshooting

### Common Issues:

1. **`auth/unauthorized-domain` Error**
   - Solution: Add your Vercel domain to Firebase authorized domains

2. **Environment Variables Not Loading**
   - Solution: Ensure all `REACT_APP_` prefixed variables are set in Vercel
   - Redeploy after adding environment variables

3. **Google SSO Button Not Working**
   - Check browser console for errors
   - Verify Firebase project configuration
   - Ensure Google provider is enabled in Firebase Authentication

### Debug Steps:

1. Check if environment variables are loaded:
   ```javascript
   console.log('Firebase Config:', {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
   });
   ```

2. Verify Firebase initialization in browser dev tools

3. Check Network tab for failed requests

## 📱 Mobile Testing

Test Google SSO on mobile devices:
- iOS Safari
- Android Chrome
- Mobile responsive design

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys and secrets
- Monitor Firebase usage and security rules

## 🚀 Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Firebase authorized domains updated
- [ ] Google SSO tested on deployed app
- [ ] Mobile responsiveness verified
- [ ] All features working in production
- [ ] Performance monitoring enabled
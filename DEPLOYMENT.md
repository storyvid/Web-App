# 🚀 Deployment Guide for StoryVid

## Environment Variables Setup

### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Add your Firebase configuration values

### For Vercel Deployment:

#### Step 1: Add Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each of these variables **one by one**:

| Variable Name | Value |
|---------------|-------|
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyA5wuKIdTUyUXuseAfp_3flJceKpgJQrk4` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `storyvidportal.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | `storyvidportal` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `storyvidportal.firebasestorage.app` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `549183398177` |
| `REACT_APP_FIREBASE_APP_ID` | `1:549183398177:web:b6bca429c71d61a0e7de60` |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | `G-6TC35CPQ5C` |

### ⚠️ **Important: Vercel Security Warning**
When you add `REACT_APP_FIREBASE_API_KEY`, Vercel will show a warning about exposing sensitive information. **This is normal and safe for Firebase!**

**What to do:**
1. Click **"I understand the risks"** or **"Continue"** 
2. This warning appears because Vercel is being cautious about any variable with "KEY" in the name
3. Firebase API keys are **designed** to be public and client-accessible
4. Firebase security comes from Authentication and Firestore Rules, not from hiding the API key

**Reference:** [Firebase Documentation - API Key Security](https://firebase.google.com/docs/projects/api-keys)

#### Step 2: Set Environment for All Branches
- Make sure to set these variables for:
  - ✅ **Production**
  - ✅ **Preview**
  - ✅ **Development**

#### Step 3: Important Notes
- **DO NOT** include quotes around the values
- **DO NOT** add spaces before or after the values
- Make sure the variable names are **exactly** as shown (case-sensitive)
- All variables must start with `REACT_APP_` to be accessible in React

## 🔧 Fix Google SSO on Vercel

### Step 1: Add Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `storyvidportal`
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

1. **`auth/invalid-api-key` Error**
   - **Cause**: Environment variables not loaded or incorrect API key
   - **Solution**: 
     - Check Vercel environment variables are set correctly
     - Verify API key matches Firebase console
     - Check browser console for debugging info
     - Redeploy after adding environment variables

2. **`auth/unauthorized-domain` Error**
   - **Cause**: Vercel domain not authorized in Firebase
   - **Solution**: Add your Vercel domain to Firebase authorized domains

3. **Environment Variables Not Loading**
   - **Cause**: Missing `REACT_APP_` prefix or incorrect variable names
   - **Solution**: 
     - Ensure all variables start with `REACT_APP_`
     - Check variable names are exactly as specified (case-sensitive)
     - Set for all environments (Production, Preview, Development)
     - Redeploy after adding environment variables

4. **Google SSO Button Not Working**
   - Check browser console for errors
   - Verify Firebase project configuration
   - Ensure Google provider is enabled in Firebase Authentication
   - Check that all environment variables are loaded

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

### Firebase API Key Security
- **Firebase API keys are PUBLIC by design** - they're not secret credentials
- Security comes from Firebase Authentication and Firestore Security Rules
- It's safe to expose Firebase API keys in client-side code
- This is different from server-side API keys which must be kept secret

### General Security Best Practices
- Never commit `.env.local` to version control
- Use environment variables for all configuration
- Regularly review Firebase Security Rules
- Monitor Firebase usage and authentication logs
- Enable Firebase App Check for production apps

### Firebase Security Rules Examples
```javascript
// Firestore Security Rules (where real security happens)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects accessible by authenticated users
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Firebase authorized domains updated
- [ ] Google SSO tested on deployed app
- [ ] Mobile responsiveness verified
- [ ] All features working in production
- [ ] Performance monitoring enabled
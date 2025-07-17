# Firebase Project Migration Instructions

## Overview
This document provides step-by-step instructions to migrate from the old Firebase project (`storyvid-d1792`) to the new Firebase project (`storyvidportal`).

## ✅ Completed Steps
- [x] Updated Firebase configuration in codebase
- [x] Created firebase.json configuration file
- [x] Created Firestore indexes configuration
- [x] Updated environment variables

## 📋 Manual Steps Required

### 1. Prerequisites
```bash
# Install Firebase CLI (already done)
npm install -g firebase-tools

# Install firebase-admin for migration script
npm install firebase-admin
```

### 2. Authenticate with Firebase
```bash
# Login to Firebase CLI
firebase login

# Set up default project
firebase use --add
# Select the new project: storyvidportal
# Give it an alias: default
```

### 3. Deploy Firebase Configuration
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage
```

### 4. Authentication Setup
In the Firebase Console for the new project (`storyvidportal`):

1. **Enable Authentication Methods:**
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in
   - Configure OAuth consent screen if needed

2. **Configure Authorized Domains:**
   - Add your domain(s) to authorized domains
   - Include localhost for development

### 5. Data Migration

#### Option A: Using Firebase CLI (Recommended)
```bash
# Export data from old project
firebase use storyvid-d1792
firebase firestore:export gs://storyvid-d1792.firebasestorage.app/exports/$(date +%Y%m%d_%H%M%S)

# Import data to new project
firebase use storyvidportal
firebase firestore:import gs://storyvidportal.firebasestorage.app/exports/EXPORT_FOLDER_NAME
```

#### Option B: Using Migration Script
```bash
# Set up service account authentication
# Download service account keys for both projects
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Run migration script
node migrate-firebase-data.js
```

### 6. Storage Migration
```bash
# Using gsutil (Google Cloud SDK)
gsutil -m cp -r gs://storyvid-d1792.firebasestorage.app/* gs://storyvidportal.firebasestorage.app/

# Or using Firebase CLI
firebase storage:bucket:transfer gs://storyvid-d1792.firebasestorage.app gs://storyvidportal.firebasestorage.app
```

### 7. Authentication Users Migration
```bash
# Export users from old project
firebase use storyvid-d1792
firebase auth:export users.json

# Import users to new project
firebase use storyvidportal
firebase auth:import users.json --hash-algo=SCRYPT --hash-key=base64key --salt-separator=base64separator
```

### 8. Test Migration
1. **Run the application:**
   ```bash
   npm start
   ```

2. **Test key functionality:**
   - User authentication (login/logout)
   - Data loading (projects, users, etc.)
   - File uploads
   - Real-time updates

3. **Verify data integrity:**
   - Check user profiles
   - Verify project data
   - Test file access

### 9. Update Environment Variables for Deployment
Update your deployment environment variables (Vercel, Netlify, etc.) with the new Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyCyw1Uhr9JCTbc3aq2Pz_Fxx4JQQmq9p6s
REACT_APP_FIREBASE_AUTH_DOMAIN=storyvidportal.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=storyvidportal
REACT_APP_FIREBASE_STORAGE_BUCKET=storyvidportal.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=802482346328
REACT_APP_FIREBASE_APP_ID=1:802482346328:web:29b3494c816e2728c6ad2d
REACT_APP_FIREBASE_MEASUREMENT_ID=G-TMVFB4KPT3
```

## 🔍 Verification Checklist
- [ ] Firebase configuration updated
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Authentication methods enabled
- [ ] Users migrated
- [ ] Firestore data migrated
- [ ] Storage files migrated
- [ ] Application tests pass
- [ ] Production deployment updated

## 📊 Data to Migrate
The following collections will be migrated:
- `users` - User profiles and settings
- `companies` - Company information
- `projects` - Project data and metadata
- `milestones` - Project milestones
- `assets` - Asset metadata
- `notifications` - User notifications
- `activities` - Activity logs
- `communications` - Messages and communications
- `invitations` - Team invitations
- `fileMetadata` - File metadata

## 🚨 Important Notes
- Always create backups before migration
- Test thoroughly in development before production
- Monitor for any authentication or permission issues
- Update any external integrations with new Firebase URLs
- Consider running both projects in parallel during transition

## 🆘 Troubleshooting
- If authentication fails, check OAuth configuration
- If data access fails, verify Firestore rules
- If files don't load, check Storage rules and CORS settings
- Monitor Firebase Console for errors and usage

## 📞 Support
If you encounter issues, check:
1. Firebase Console logs
2. Browser developer console
3. Network tab for failed requests
4. Firebase documentation
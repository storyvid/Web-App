# Firebase Migration Guide

This guide will walk you through migrating the StoryVid app from mock data to Firebase backend services.

## Overview

The app is designed with a service layer abstraction that makes switching from mock data to Firebase seamless. All data operations go through `firebaseService.js`, which currently uses mock data but can be easily configured to use real Firebase.

## Prerequisites

1. **Firebase Account**: Create a Google account if you don't have one
2. **Node.js**: Ensure you have Node.js 16+ installed
3. **Firebase CLI**: Install globally with `npm install -g firebase-tools`

## Step 1: Set Up Firebase Project

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `storyvid-production` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Wait for project creation

### 1.2 Enable Firebase Services

1. **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Configure authorized domains if needed

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode" (we'll add security rules later)
   - Select your preferred location

3. **Storage**:
   - Go to Storage
   - Click "Get started"
   - Choose "Start in production mode"
   - Select same location as Firestore

4. **Hosting** (optional):
   - Go to Hosting
   - Click "Get started" if you want to host on Firebase

### 1.3 Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Web icon
4. Register app with name "StoryVid Web App"
5. Copy the `firebaseConfig` object

## Step 2: Configure the App

### 2.1 Update Firebase Configuration

1. Open `src/services/firebase/firebaseConfig.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-measurement-id"
};
```

### 2.2 Install Firebase SDK

```bash
npm install firebase
```

### 2.3 Update Firebase Service

1. Open `src/services/firebase/firebaseService.js`
2. Uncomment the Firebase imports at the top:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
```

3. Uncomment the Firebase initialization in the `initialize()` method:

```javascript
async initialize(config = null) {
  this.app = initializeApp(config);
  this.db = getFirestore(this.app);
  this.auth = getAuth(this.app);
  this.storage = getStorage(this.app);
  
  console.log('Firebase initialized');
}
```

4. Set `useMockData` to `false`:

```javascript
constructor() {
  this.useMockData = false; // Changed from true
  this.currentUser = null;
}
```

## Step 3: Uncomment Firebase Methods

Go through `firebaseService.js` and uncomment all the TODO sections. Here are the key methods to uncomment:

### 3.1 Authentication Methods

```javascript
// In signIn method:
try {
  const credential = await signInWithEmailAndPassword(this.auth, email, password);
  const userDoc = await this.getUser(credential.user.uid);
  this.currentUser = { ...credential.user, ...userDoc };
  return { success: true, user: this.currentUser };
} catch (error) {
  throw new Error(error.message);
}

// In signOut method:
await signOut(this.auth);
this.currentUser = null;
```

### 3.2 Database Methods

```javascript
// In getUser method:
const userDoc = await getDoc(doc(this.db, 'users', uid));
return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;

// In createUser method:
const docRef = await addDoc(collection(this.db, 'users'), 
  createDocumentWithTimestamps(userData)
);
return { id: docRef.id, ...userData };
```

### 3.3 Real-time Subscriptions

```javascript
// In subscribeToProject method:
return onSnapshot(doc(this.db, 'projects', projectId), callback);

// In subscribeToNotifications method:
const q = query(
  collection(this.db, 'notifications'),
  where('userId', '==', userId),
  where('read', '==', false)
);
return onSnapshot(q, callback);
```

## Step 4: Initialize Firebase in App

### 4.1 Update App.js

Add Firebase initialization to your App component:

```javascript
import { useEffect } from 'react';
import firebaseService from './services/firebase/firebaseService';
import getFirebaseConfig from './services/firebase/firebaseConfig';

function App() {
  useEffect(() => {
    // Initialize Firebase
    const config = getFirebaseConfig();
    firebaseService.initialize(config);
  }, []);

  // ... rest of your App component
}
```

### 4.2 Update AuthContext

Replace the mock authentication in `AuthContext.js`:

```javascript
import firebaseService from '../services/firebase/firebaseService';

// Replace the login method:
const login = async (email, password) => {
  setAuthLoading(true);
  setError(null);
  
  try {
    const result = await firebaseService.signIn(email, password);
    setUser(result.user);
    setAuthLoading(false);
    return { success: true };
  } catch (err) {
    setError(err.message);
    setAuthLoading(false);
    return { success: false, error: err.message };
  }
};

// Replace the logout method:
const logout = async () => {
  setAuthLoading(true);
  try {
    await firebaseService.signOut();
    setUser(null);
  } catch (err) {
    console.error('Logout error:', err);
  }
  setAuthLoading(false);
};
```

### 4.3 Update Dashboard Data Loading

In `Dashboard.js`, replace the mock data loading:

```javascript
useEffect(() => {
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const roleData = await firebaseService.getDashboardData(user?.role);
      setData(roleData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  loadDashboardData();
}, [user?.role]);
```

## Step 5: Set Up Firestore Security Rules

### 5.1 Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 5.2 Initialize Firebase in Project

```bash
firebase init firestore
```

Choose your Firebase project and accept defaults.

### 5.3 Update Security Rules

Replace the content of `firestore.rules` with the generated rules from `migrationUtils.js`:

```javascript
import { generateFirestoreSecurityRules } from './src/services/firebase/migrationUtils';
console.log(generateFirestoreSecurityRules());
```

Copy the output to `firestore.rules`.

### 5.4 Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

## Step 6: Migrate Mock Data (Optional)

### 6.1 Create Migration Script

Create `scripts/migrateData.js`:

```javascript
import firebaseService from '../src/services/firebase/firebaseService';
import { transformAllMockDataToFirebase } from '../src/services/firebase/migrationUtils';
import { getRoleBasedData } from '../src/data/mockData';

const migrateData = async () => {
  // Initialize Firebase
  await firebaseService.initialize();
  
  // Create test users
  const users = [
    { uid: 'client-1', email: 'client@test.com', name: 'Alex', role: 'client' },
    { uid: 'staff-1', email: 'staff@test.com', name: 'Jordan', role: 'staff' },
    { uid: 'admin-1', email: 'admin@test.com', name: 'Sam', role: 'admin' }
  ];
  
  for (const user of users) {
    const mockData = getRoleBasedData(user.role);
    const firebaseData = transformAllMockDataToFirebase(mockData, user);
    
    // Create user and related data
    await firebaseService.createUser(firebaseData.user);
    
    for (const project of firebaseData.projects) {
      await firebaseService.createProject(project);
    }
    
    // Create other entities...
  }
  
  console.log('Data migration completed');
};

migrateData().catch(console.error);
```

### 6.2 Run Migration

```bash
node scripts/migrateData.js
```

## Step 7: Testing

### 7.1 Test Authentication

1. Try logging in with the test accounts
2. Verify users are created in Firestore
3. Test logout functionality

### 7.2 Test Data Operations

1. Check that dashboard data loads from Firestore
2. Test creating new projects/milestones
3. Verify real-time updates work

### 7.3 Test File Uploads

1. Try uploading files to projects
2. Verify files are stored in Firebase Storage
3. Check file metadata in Firestore

## Step 8: Environment Variables

### 8.1 Create Environment Files

Create `.env.local` for sensitive configuration:

```bash
# .env.local
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 8.2 Update Config to Use Environment Variables

Update `firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Step 9: Production Deployment

### 9.1 Firebase Hosting (Optional)

```bash
firebase init hosting
firebase deploy --only hosting
```

### 9.2 Vercel Deployment

If using Vercel, add environment variables in Vercel dashboard.

### 9.3 Security Checklist

- [ ] Security rules are properly configured
- [ ] Environment variables are set
- [ ] Test all user roles work correctly
- [ ] File uploads work and are secure
- [ ] Real-time updates function properly

## Troubleshooting

### Common Issues

1. **Authentication errors**: Check that Email/Password is enabled in Firebase Console
2. **Permission denied**: Verify Firestore security rules
3. **CORS errors**: Ensure your domain is in authorized domains
4. **Storage errors**: Check Firebase Storage security rules

### Debug Mode

To switch back to mock data temporarily:

```javascript
// In firebaseService.js
firebaseService.setMockMode(true);
```

### Logs and Monitoring

Enable Firebase Analytics and Crashlytics for production monitoring:

```bash
firebase init analytics
firebase deploy --only functions,hosting
```

## Next Steps

After successful migration:

1. Set up automated backups
2. Configure monitoring and alerts
3. Implement error tracking
4. Set up CI/CD pipeline
5. Plan for scaling and optimization

## Support

If you encounter issues:

1. Check Firebase Console for error logs
2. Review browser network tab for failed requests
3. Check Firestore security rules
4. Verify environment variables are correct

The migration is designed to be gradual - you can test each component individually before fully switching over.
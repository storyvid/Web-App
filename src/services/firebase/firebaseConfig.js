// Firebase Configuration Template
// Copy this file and add your actual Firebase config values

// STEP 1: Get your Firebase config from Firebase Console
// Go to: https://console.firebase.google.com/
// Select your project > Project Settings > General > Your apps
// Copy the firebaseConfig object

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Environment-specific configurations
const configs = {
  development: {
    ...firebaseConfig,
    // Use real Firebase for now (disable emulators)
    useEmulators: false,
    emulators: {
      auth: { host: 'localhost', port: 9099 },
      firestore: { host: 'localhost', port: 8080 },
      storage: { host: 'localhost', port: 9199 }
    }
  },
  
  staging: {
    ...firebaseConfig,
    // Use a separate Firebase project for staging if desired
    projectId: "your-staging-project-id",
    useEmulators: false
  },
  
  production: {
    ...firebaseConfig,
    useEmulators: false
  }
};

// Get config based on environment
const getFirebaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // Debug environment variables
  console.log('Environment:', env);
  console.log('Available env vars:', {
    hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
    hasStorageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    hasMessagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    hasAppId: !!process.env.REACT_APP_FIREBASE_APP_ID,
    hasMeasurementId: !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  });
  
  const config = configs[env] || configs.development;
  
  // Validate required fields
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
  const missingFields = requiredFields.filter(field => !config[field] || config[field] === 'undefined' || config[field].includes('your-'));
  
  if (missingFields.length > 0) {
    console.error(`❌ Missing Firebase config fields: ${missingFields.join(', ')}`);
    console.error('Current config:', config);
    console.error('Environment variables:', {
      REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
    });
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
  
  console.log('✅ Firebase config loaded successfully');
  return config;
};

export default getFirebaseConfig;
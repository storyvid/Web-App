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
  const config = configs[env] || configs.development;
  
  // Validate required fields
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
  const missingFields = requiredFields.filter(field => !config[field] || config[field].includes('your-'));
  
  if (missingFields.length > 0) {
    console.warn(`Missing Firebase config fields: ${missingFields.join(', ')}`);
    console.warn('Please update src/services/firebase/firebaseConfig.js with your actual Firebase configuration');
  }
  
  return config;
};

export default getFirebaseConfig;
// Firebase Configuration Template
// Copy this file and add your actual Firebase config values

// STEP 1: Get your Firebase config from Firebase Console
// Go to: https://console.firebase.google.com/
// Select your project > Project Settings > General > Your apps
// Copy the firebaseConfig object

const firebaseConfig = {
  // TODO: Replace with your actual Firebase configuration
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // Optional: for Analytics
};

// Environment-specific configurations
const configs = {
  development: {
    ...firebaseConfig,
    // You can use Firebase Emulators for development
    useEmulators: true,
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
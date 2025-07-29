// Debug Firebase Configuration
// This utility helps diagnose Firebase configuration issues

export const debugFirebaseConfig = () => {
  console.group('🔍 Firebase Configuration Debug');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('Auth Domain:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Not set');
  console.log('Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Not set');
  console.log('Storage Bucket:', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'Not set');
  console.log('Messaging Sender ID:', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Not set');
  console.log('App ID:', process.env.REACT_APP_FIREBASE_APP_ID ? '✅ Set' : '❌ Not set');
  
  // Check actual Firebase app configuration
  try {
    const { getApp } = require('firebase/app');
    const app = getApp('storyvid-main');
    console.log('\nActual Firebase App Config:');
    console.log('Project ID:', app.options.projectId);
    console.log('Storage Bucket:', app.options.storageBucket);
    console.log('Auth Domain:', app.options.authDomain);
  } catch (error) {
    console.log('\nFirebase App not initialized yet');
  }
  
  // Check for any localStorage items that might override config
  console.log('\nLocalStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('firebase') || key.includes('storyvid')) {
      console.log(`${key}:`, localStorage.getItem(key));
    }
  }
  
  console.groupEnd();
};

// Call this function in your app to debug
window.debugFirebaseConfig = debugFirebaseConfig;
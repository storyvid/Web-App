// Debug Firebase Configuration
// Run this in the browser console to check current config

console.log('🔍 Debugging Firebase Configuration...');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('REACT_APP_FIREBASE_PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log('REACT_APP_FIREBASE_STORAGE_BUCKET:', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
console.log('REACT_APP_FIREBASE_AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);

// Check if Firebase is initialized
if (typeof window !== 'undefined' && window.firebaseService) {
  const service = window.firebaseService;
  console.log('\n🔥 Firebase Service Status:');
  console.log('Service exists:', !!service);
  console.log('App initialized:', !!service.app);
  console.log('Storage initialized:', !!service.storage);
  
  if (service.app) {
    console.log('\n📱 Firebase App Configuration:');
    console.log('Project ID:', service.app.options.projectId);
    console.log('Storage Bucket:', service.app.options.storageBucket);
    console.log('Auth Domain:', service.app.options.authDomain);
  }
  
  if (service.storage) {
    console.log('\n💾 Storage Configuration:');
    console.log('Storage app project:', service.storage.app.options.projectId);
    console.log('Storage bucket:', service.storage.app.options.storageBucket);
  }
} else {
  console.log('\n❌ Firebase service not found in window object');
  console.log('Make sure firebaseService is exposed globally for debugging');
}

console.log('\n💡 To fix wrong storage bucket:');
console.log('1. Stop the development server (Ctrl+C)');
console.log('2. Run: ./clear-cache.sh');
console.log('3. Restart server: npm start');
console.log('4. Clear browser storage and hard refresh');
// Direct Firestore test without the web app
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

async function testFirestoreData() {
  try {
    console.log('🔥 Testing Firestore data directly...');
    
    // You'll need to replace this with your actual Firebase config
    const firebaseConfig = {
      // Add your config here from firebaseConfig.js
    };
    
    console.log('Note: Add your Firebase config to this script to test directly');
    console.log('For now, please test in browser console with:');
    console.log('');
    console.log('1. Open: http://localhost:3000?forceMigration=true');
    console.log('2. Watch for migration logs in console');
    console.log('3. Run: window.checkFirestoreData()');
    console.log('4. Login as client@test.com / 123456789');
    console.log('5. Run: window.testDummyAccount("client@test.com")');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFirestoreData();
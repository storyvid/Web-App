// Node.js script to test Firebase integration
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5wuKIdTUyUXuseAfp_3flJceKpgJQrk4",
  authDomain: "storyvid-d1792.firebaseapp.com",
  projectId: "storyvid-d1792",
  storageBucket: "storyvid-d1792.firebasestorage.app",
  messagingSenderId: "549183398177",
  appId: "1:549183398177:web:b6bca429c71d61a0e7de60",
  measurementId: "G-6TC35CPQ5C"
};

async function testFirebase() {
  try {
    console.log('🔥 Testing Firebase Integration...\n');

    // Initialize Firebase
    console.log('1. Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully\n');

    // Test users to create
    const testUsers = [
      {
        email: 'client@test.com',
        password: 'password',
        userData: {
          name: 'Alex',
          role: 'client',
          company: 'Tech Innovators Inc',
          accountType: 'Premium Client',
          avatar: 'https://i.pravatar.cc/150?img=1',
          phone: '+1 (555) 123-4567',
          isActive: true
        }
      },
      {
        email: 'staff@test.com',
        password: 'password',
        userData: {
          name: 'Jordan',
          role: 'staff',
          company: 'StoryVid Team',
          accountType: 'Video Editor',
          avatar: 'https://i.pravatar.cc/150?img=2',
          phone: '+1 (555) 234-5678',
          isActive: true
        }
      },
      {
        email: 'admin@test.com',
        password: 'password',
        userData: {
          name: 'Sam',
          role: 'admin',
          company: 'StoryVid',
          accountType: 'Production Manager',
          avatar: 'https://i.pravatar.cc/150?img=3',
          phone: '+1 (555) 345-6789',
          isActive: true
        }
      }
    ];

    // Create test users
    console.log('2. Creating test users...');
    let createdUsers = 0;
    let existingUsers = 0;

    for (const testUser of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          testUser.email, 
          testUser.password
        );
        
        console.log(`✅ Created auth user: ${testUser.email}`);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: testUser.email,
          ...testUser.userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Created user document for: ${testUser.email}`);
        createdUsers++;

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  User ${testUser.email} already exists - skipping`);
          existingUsers++;
        } else {
          console.log(`❌ Error creating user ${testUser.email}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 User creation summary:`);
    console.log(`   Created: ${createdUsers} users`);
    console.log(`   Existing: ${existingUsers} users`);
    console.log(`   Total available: ${createdUsers + existingUsers} users\n`);

    // Test authentication
    console.log('3. Testing authentication...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'client@test.com', 'password');
      console.log(`✅ Successfully authenticated: ${userCredential.user.email}`);
      
      // Test reading user data
      console.log('4. Testing Firestore read...');
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`✅ Successfully read user data: ${userData.name} (${userData.role})`);
      } else {
        console.log('⚠️  User document not found in Firestore');
      }

    } catch (error) {
      console.log(`❌ Authentication failed: ${error.message}`);
      return;
    }

    // Test data write
    console.log('5. Testing Firestore write...');
    try {
      await setDoc(doc(db, 'test_data', 'connection_test'), {
        message: 'Firebase connection test successful',
        timestamp: serverTimestamp(),
        testComplete: true
      });
      console.log('✅ Successfully wrote test data to Firestore');
    } catch (error) {
      console.log(`❌ Firestore write failed: ${error.message}`);
      return;
    }

    console.log('\n🎉 ALL TESTS PASSED! Firebase integration is working correctly.\n');
    console.log('📝 Summary:');
    console.log('   ✅ Firebase initialization: SUCCESS');
    console.log('   ✅ User authentication: SUCCESS');
    console.log('   ✅ Firestore read operations: SUCCESS');
    console.log('   ✅ Firestore write operations: SUCCESS');
    console.log('\n🚀 Your app is ready to use Firebase!\n');
    console.log('🔐 Test login credentials:');
    console.log('   • client@test.com / password');
    console.log('   • staff@test.com / password');  
    console.log('   • admin@test.com / password');

  } catch (error) {
    console.log(`\n❌ Firebase test failed: ${error.message}`);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check that Email/Password auth is enabled in Firebase Console');
    console.log('   2. Verify Firestore database is created');
    console.log('   3. Ensure network connectivity');
    console.log('   4. Check Firebase project permissions');
  }
}

testFirebase();
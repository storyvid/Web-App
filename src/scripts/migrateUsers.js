// Migration script to create initial test users in Firebase
// Run this once after setting up Firebase to create demo accounts

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import getFirebaseConfig from '../services/firebase/firebaseConfig.js';

const migrateUsers = async () => {
  try {
    // Initialize Firebase
    const config = getFirebaseConfig();
    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);

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

    console.log('Starting user migration...');

    for (const testUser of testUsers) {
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          testUser.email, 
          testUser.password
        );
        
        const user = userCredential.user;
        console.log(`Created auth user: ${testUser.email}`);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: testUser.email,
          ...testUser.userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log(`Created user document for: ${testUser.email}`);

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User ${testUser.email} already exists - skipping`);
        } else {
          console.error(`Error creating user ${testUser.email}:`, error.message);
        }
      }
    }

    console.log('User migration completed!');
    console.log('\nYou can now log in with:');
    console.log('- client@test.com / password');
    console.log('- staff@test.com / password');
    console.log('- admin@test.com / password');

  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run migration if this file is executed directly
if (process.env.NODE_ENV !== 'production') {
  migrateUsers();
}

export default migrateUsers;
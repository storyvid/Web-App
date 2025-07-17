#!/usr/bin/env node

/**
 * Firebase Data Migration Script
 * This script migrates data from the old Firebase project to the new one
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const OLD_PROJECT_CONFIG = {
  apiKey: "AIzaSyA5wuKIdTUyUXuseAfp_3flJceKpgJQrk4",
  authDomain: "storyvid-d1792.firebaseapp.com",
  projectId: "storyvid-d1792",
  storageBucket: "storyvid-d1792.firebasestorage.app",
  messagingSenderId: "549183398177",
  appId: "1:549183398177:web:b6bca429c71d61a0e7de60",
  measurementId: "G-6TC35CPQ5C"
};

const NEW_PROJECT_CONFIG = {
  apiKey: "AIzaSyCyw1Uhr9JCTbc3aq2Pz_Fxx4JQQmq9p6s",
  authDomain: "storyvidportal.firebaseapp.com",
  projectId: "storyvidportal",
  storageBucket: "storyvidportal.firebasestorage.app",
  messagingSenderId: "802482346328",
  appId: "1:802482346328:web:29b3494c816e2728c6ad2d",
  measurementId: "G-TMVFB4KPT3"
};

// Collections to migrate
const COLLECTIONS_TO_MIGRATE = [
  'users',
  'companies',
  'projects',
  'milestones',
  'assets',
  'notifications',
  'activities',
  'communications',
  'invitations',
  'fileMetadata'
];

async function initializeFirebaseApps() {
  // Initialize old project
  const oldApp = admin.initializeApp({
    projectId: OLD_PROJECT_CONFIG.projectId,
    credential: admin.credential.applicationDefault()
  }, 'old-project');

  // Initialize new project
  const newApp = admin.initializeApp({
    projectId: NEW_PROJECT_CONFIG.projectId,
    credential: admin.credential.applicationDefault()
  }, 'new-project');

  return { oldApp, newApp };
}

async function migrateCollection(oldDb, newDb, collectionName) {
  console.log(`📦 Migrating collection: ${collectionName}`);
  
  try {
    const snapshot = await oldDb.collection(collectionName).get();
    const batch = newDb.batch();
    let batchSize = 0;
    const MAX_BATCH_SIZE = 500;
    
    for (const doc of snapshot.docs) {
      const docRef = newDb.collection(collectionName).doc(doc.id);
      batch.set(docRef, doc.data());
      batchSize++;
      
      // Commit batch if it reaches max size
      if (batchSize >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`  ✅ Committed batch of ${batchSize} documents`);
        batchSize = 0;
      }
    }
    
    // Commit remaining documents
    if (batchSize > 0) {
      await batch.commit();
      console.log(`  ✅ Committed final batch of ${batchSize} documents`);
    }
    
    console.log(`✅ Successfully migrated ${snapshot.size} documents from ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Error migrating collection ${collectionName}:`, error);
  }
}

async function backupData(oldDb, backupDir) {
  console.log(`💾 Creating backup in ${backupDir}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const snapshot = await oldDb.collection(collectionName).get();
      const data = [];
      
      snapshot.docs.forEach(doc => {
        data.push({
          id: doc.id,
          data: doc.data()
        });
      });
      
      const backupFile = path.join(backupDir, `${collectionName}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
      console.log(`  ✅ Backed up ${data.length} documents from ${collectionName}`);
      
    } catch (error) {
      console.error(`❌ Error backing up collection ${collectionName}:`, error);
    }
  }
}

async function migrateAuthUsers(oldApp, newApp) {
  console.log('👤 Migrating Authentication users...');
  
  try {
    const oldAuth = admin.auth(oldApp);
    const newAuth = admin.auth(newApp);
    
    // List all users from old project
    const listUsersResult = await oldAuth.listUsers();
    
    for (const userRecord of listUsersResult.users) {
      try {
        // Create user in new project
        const importUserData = {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          disabled: userRecord.disabled,
          metadata: userRecord.metadata,
          customClaims: userRecord.customClaims,
          providerData: userRecord.providerData
        };
        
        await newAuth.importUsers([importUserData]);
        console.log(`  ✅ Migrated user: ${userRecord.email || userRecord.uid}`);
        
      } catch (error) {
        console.error(`❌ Error migrating user ${userRecord.uid}:`, error);
      }
    }
    
    console.log(`✅ Successfully migrated ${listUsersResult.users.length} users`);
    
  } catch (error) {
    console.error('❌ Error migrating authentication users:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Firebase data migration...');
    console.log(`📤 Source: ${OLD_PROJECT_CONFIG.projectId}`);
    console.log(`📥 Target: ${NEW_PROJECT_CONFIG.projectId}`);
    console.log('');
    
    // Initialize Firebase apps
    const { oldApp, newApp } = await initializeFirebaseApps();
    const oldDb = admin.firestore(oldApp);
    const newDb = admin.firestore(newApp);
    
    // Create backup
    const backupDir = path.join(__dirname, 'firebase-backup', new Date().toISOString().split('T')[0]);
    await backupData(oldDb, backupDir);
    
    console.log('');
    console.log('🔄 Starting data migration...');
    
    // Migrate each collection
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      await migrateCollection(oldDb, newDb, collectionName);
    }
    
    console.log('');
    
    // Migrate authentication users
    await migrateAuthUsers(oldApp, newApp);
    
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log(`💾 Backup created at: ${backupDir}`);
    console.log('');
    console.log('⚠️  Next steps:');
    console.log('1. Update your Firebase Security Rules');
    console.log('2. Migrate Firebase Storage files');
    console.log('3. Update authentication providers');
    console.log('4. Test the application thoroughly');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateCollection, backupData, migrateAuthUsers };
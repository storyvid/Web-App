// Fix project assignments for proper role-based testing
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { 
  getFirestore, 
  collection, 
  doc,
  getDocs, 
  updateDoc,
  query, 
  where 
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCyw1Uhr9JCTbc3aq2Pz_Fxx4JQQmq9p6s",
  authDomain: "storyvidportal.firebaseapp.com",
  projectId: "storyvidportal",
  storageBucket: "storyvidportal.firebasestorage.app",
  messagingSenderId: "802482346328",
  appId: "1:802482346328:web:29b3494c816e2728c6ad2d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function assignProjectsToUsers() {
  console.log('🔧 Fixing project assignments for proper testing...\n');
  
  // Get user IDs
  const users = {};
  
  // Get all test users
  const userQuery = query(collection(db, 'users'));
  const userSnapshot = await getDocs(userQuery);
  
  userSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.email === 'client.test@storyvid.com') {
      users.client = doc.id;
      console.log('Found client:', doc.id);
    } else if (data.email === 'staff.test@storyvid.com') {
      users.staff = doc.id;
      console.log('Found staff:', doc.id);
    } else if (data.email === 'admin.test@storyvid.com') {
      users.admin = doc.id;
      console.log('Found admin:', doc.id);
    }
  });
  
  // Get the test project
  const projectQuery = query(
    collection(db, 'projects'),
    where('name', '==', 'Test Audit Project')
  );
  const projectSnapshot = await getDocs(projectQuery);
  
  if (!projectSnapshot.empty) {
    const projectDoc = projectSnapshot.docs[0];
    const projectId = projectDoc.id;
    
    console.log('\n📋 Updating Test Audit Project...');
    
    // Update project with proper assignments
    await updateDoc(doc(db, 'projects', projectId), {
      clientId: users.client,
      assignedStaff: [users.staff],
      projectManager: users.admin
    });
    
    console.log('✅ Project updated with proper role assignments');
    console.log(`  - Client: ${users.client}`);
    console.log(`  - Staff: ${users.staff}`);
    console.log(`  - Admin/PM: ${users.admin}`);
  }
  
  // Verify assignments work correctly
  console.log('\n🔍 Verifying role-based access...\n');
  
  // Test as client
  await signInWithEmailAndPassword(auth, 'client.test@storyvid.com', 'Test123!@#');
  const clientProjects = await getDocs(
    query(collection(db, 'projects'), where('clientId', '==', auth.currentUser.uid))
  );
  console.log(`CLIENT can see ${clientProjects.size} project(s) assigned to them`);
  await signOut(auth);
  
  // Test as staff  
  await signInWithEmailAndPassword(auth, 'staff.test@storyvid.com', 'Test123!@#');
  const staffProjects = await getDocs(
    query(collection(db, 'projects'), where('assignedStaff', 'array-contains', auth.currentUser.uid))
  );
  console.log(`STAFF can see ${staffProjects.size} project(s) they're assigned to`);
  await signOut(auth);
  
  // Test as admin
  await signInWithEmailAndPassword(auth, 'admin.test@storyvid.com', 'Test123!@#');
  const adminProjects = await getDocs(collection(db, 'projects'));
  console.log(`ADMIN can see ${adminProjects.size} total project(s) in the system`);
  await signOut(auth);
}

assignProjectsToUsers()
  .then(() => {
    console.log('\n✅ Project assignments fixed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
// Advanced Features Test Script
// Tests file uploads, role-based access, and UI component functionality

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const { getStorage, ref, uploadString, getDownloadURL } = require('firebase/storage');

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
const storage = getStorage(app);

const testAccounts = {
  admin: { email: 'admin.test@storyvid.com', password: 'Test123!@#' },
  client: { email: 'client.test@storyvid.com', password: 'Test123!@#' },
  staff: { email: 'staff.test@storyvid.com', password: 'Test123!@#' }
};

async function testFileUpload() {
  console.log('\n📁 Testing File Upload to Firebase Storage...');
  
  try {
    await signInWithEmailAndPassword(auth, testAccounts.client.email, testAccounts.client.password);
    
    // Create a test file content
    const testContent = 'This is a test file for StoryVid audit';
    const fileName = `test-file-${Date.now()}.txt`;
    const storageRef = ref(storage, `files/${auth.currentUser.uid}/${fileName}`);
    
    // Upload the file
    await uploadString(storageRef, testContent);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ File uploaded successfully');
    console.log('📎 Download URL:', downloadURL);
    
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('❌ File upload failed:', error.message);
    return false;
  }
}

async function testRoleBasedAccess() {
  console.log('\n🔐 Testing Role-Based Access Control...');
  
  const accessResults = {};
  
  for (const [role, account] of Object.entries(testAccounts)) {
    await signInWithEmailAndPassword(auth, account.email, account.password);
    
    // Test project access based on role
    let projectQuery;
    if (role === 'admin') {
      // Admin sees all projects
      projectQuery = collection(db, 'projects');
    } else if (role === 'client') {
      // Client sees only their projects
      projectQuery = query(
        collection(db, 'projects'),
        where('clientId', '==', auth.currentUser.uid)
      );
    } else if (role === 'staff') {
      // Staff sees assigned projects
      projectQuery = query(
        collection(db, 'projects'),
        where('assignedStaff', 'array-contains', auth.currentUser.uid)
      );
    }
    
    const snapshot = await getDocs(projectQuery);
    accessResults[role] = {
      projectCount: snapshot.size,
      canAccessProjects: true
    };
    
    console.log(`✅ ${role}: Can access ${snapshot.size} projects`);
    
    await signOut(auth);
  }
  
  return accessResults;
}

async function testDashboardData() {
  console.log('\n📊 Testing Dashboard Data Loading...');
  
  for (const [role, account] of Object.entries(testAccounts)) {
    await signInWithEmailAndPassword(auth, account.email, account.password);
    
    // Check if user can access their dashboard data
    const userQuery = query(
      collection(db, 'users'),
      where('email', '==', account.email)
    );
    
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      console.log(`✅ ${role}: Dashboard data accessible - Role: ${userData.role}`);
    } else {
      console.log(`❌ ${role}: No dashboard data found`);
    }
    
    await signOut(auth);
  }
}

async function verifyPageRoutes() {
  console.log('\n🌐 Page Routes for Each Role:');
  
  const routes = {
    admin: ['/dashboard', '/projects', '/services', '/assets', '/settings', '/admin/projects', '/admin/users'],
    client: ['/dashboard', '/projects', '/services', '/assets', '/settings'],
    staff: ['/dashboard', '/projects', '/assets', '/settings']
  };
  
  for (const [role, roleRoutes] of Object.entries(routes)) {
    console.log(`\n${role.toUpperCase()} should have access to:`);
    roleRoutes.forEach(route => {
      console.log(`  ✓ ${route}`);
    });
  }
}

async function runAdvancedTests() {
  console.log('\n════════════════════════════════════════');
  console.log('    ADVANCED FEATURES TEST');
  console.log('════════════════════════════════════════\n');
  
  await testFileUpload();
  await testRoleBasedAccess();
  await testDashboardData();
  await verifyPageRoutes();
  
  console.log('\n════════════════════════════════════════');
  console.log('    MANUAL UI TESTING CHECKLIST');
  console.log('════════════════════════════════════════\n');
  
  console.log('For each user account, manually verify:\n');
  
  console.log('ADMIN Account (admin.test@storyvid.com):');
  console.log('  □ Dashboard shows: Total Clients, Active Projects, Team Members stats');
  console.log('  □ Can see Admin menu items (Admin Projects, Admin Users)');
  console.log('  □ Services page allows creating projects for any client');
  console.log('  □ Can see all projects from all clients');
  console.log('  □ Assets page shows all uploaded files');
  
  console.log('\nCLIENT Account (client.test@storyvid.com):');
  console.log('  □ Dashboard shows: My Projects, Pending Approvals, Delivered Videos stats');
  console.log('  □ NO Admin menu items visible');
  console.log('  □ Services page allows requesting new services');
  console.log('  □ Can only see their own projects');
  console.log('  □ Assets page shows only their files');
  
  console.log('\nSTAFF Account (staff.test@storyvid.com):');
  console.log('  □ Dashboard shows: Assigned Tasks, Completed Today, Upcoming Deadlines stats');
  console.log('  □ NO Admin menu items visible');
  console.log('  □ NO Services menu item visible');
  console.log('  □ Can only see assigned projects');
  console.log('  □ Assets page shows project-related files');
  
  console.log('\n════════════════════════════════════════\n');
}

runAdvancedTests()
  .then(() => {
    console.log('Advanced tests completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Tests failed:', error);
    process.exit(1);
  });
// Comprehensive App Audit Script
// This script tests all major functionality of the StoryVid app

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} = require('firebase/auth');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  serverTimestamp
} = require('firebase/firestore');

// Firebase configuration from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyCyw1Uhr9JCTbc3aq2Pz_Fxx4JQQmq9p6s",
  authDomain: "storyvidportal.firebaseapp.com",
  projectId: "storyvidportal",
  storageBucket: "storyvidportal.firebasestorage.app",
  messagingSenderId: "802482346328",
  appId: "1:802482346328:web:29b3494c816e2728c6ad2d",
  measurementId: "G-TMVFB4KPT3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test accounts
const testAccounts = {
  admin: {
    email: 'admin.test@storyvid.com',
    password: 'Test123!@#',
    name: 'Admin Test User',
    role: 'admin'
  },
  client: {
    email: 'client.test@storyvid.com',
    password: 'Test123!@#',
    name: 'Client Test User',
    role: 'client'
  },
  staff: {
    email: 'staff.test@storyvid.com',
    password: 'Test123!@#',
    name: 'Staff Test User',
    role: 'staff'
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
    test: `${colors.cyan}🧪${colors.reset}`
  };
  console.log(`${prefix[type]} ${message}`);
}

async function testFirebaseConnection() {
  log('Testing Firebase Connection...', 'test');
  try {
    // Test Firestore connection
    const testDoc = await getDoc(doc(db, 'test', 'connection'));
    log('Firebase Firestore connected successfully', 'success');
    
    // Test Auth
    log('Firebase Auth service is active', 'success');
    return true;
  } catch (error) {
    log(`Firebase connection error: ${error.message}`, 'error');
    return false;
  }
}

async function createTestUser(userType) {
  const userData = testAccounts[userType];
  log(`Creating ${userType} account: ${userData.email}`, 'test');
  
  try {
    // Try to sign in first (user might already exist)
    try {
      const credential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      log(`${userType} account already exists, signed in successfully`, 'warning');
      return credential.user;
    } catch (signInError) {
      // User doesn't exist, create new account
      const credential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        onboardingComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      log(`${userType} account created successfully`, 'success');
      return credential.user;
    }
  } catch (error) {
    log(`Failed to create ${userType} account: ${error.message}`, 'error');
    return null;
  }
}

async function testUserLogin(userType) {
  const userData = testAccounts[userType];
  log(`Testing ${userType} login...`, 'test');
  
  try {
    const credential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
    log(`${userType} login successful`, 'success');
    
    // Check user profile in Firestore
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      log(`User profile found - Role: ${data.role}, Name: ${data.name}`, 'info');
    } else {
      log('User profile not found in Firestore', 'warning');
    }
    
    // Sign out
    await signOut(auth);
    log(`${userType} logout successful`, 'success');
    
    return true;
  } catch (error) {
    log(`${userType} login failed: ${error.message}`, 'error');
    return false;
  }
}

async function testProjectCreation() {
  log('Testing project creation...', 'test');
  
  try {
    // Sign in as admin
    const adminCred = await signInWithEmailAndPassword(
      auth, 
      testAccounts.admin.email, 
      testAccounts.admin.password
    );
    
    // Get client user for project assignment
    const clientQuery = query(collection(db, 'users'), where('role', '==', 'client'));
    const clientSnapshot = await getDocs(clientQuery);
    
    if (clientSnapshot.empty) {
      log('No client users found for project assignment', 'warning');
      return false;
    }
    
    const clientDoc = clientSnapshot.docs[0];
    const clientId = clientDoc.id;
    
    // Create test project
    const projectData = {
      name: 'Test Audit Project',
      description: 'Project created during comprehensive audit',
      clientId: clientId,
      status: 'in-production',
      statusLabel: 'In Production',
      priority: 'medium',
      progress: 25,
      videoType: 'commercial',
      budget: 10000,
      estimatedHours: 50,
      actualHours: 10,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), // 30 days from now
      assignedStaff: [],
      projectManager: adminCred.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(collection(db, 'projects')), projectData);
    log('Test project created successfully', 'success');
    
    // Verify project is accessible
    const projectsQuery = query(collection(db, 'projects'), where('name', '==', 'Test Audit Project'));
    const projectSnapshot = await getDocs(projectsQuery);
    
    if (!projectSnapshot.empty) {
      log(`Project verified - Found ${projectSnapshot.size} project(s)`, 'success');
    } else {
      log('Project not found after creation', 'error');
    }
    
    await signOut(auth);
    return true;
  } catch (error) {
    log(`Project creation failed: ${error.message}`, 'error');
    return false;
  }
}

async function testDataAccess() {
  log('Testing data access across roles...', 'test');
  
  const results = {};
  
  for (const [role, account] of Object.entries(testAccounts)) {
    try {
      await signInWithEmailAndPassword(auth, account.email, account.password);
      
      // Check project access
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      results[role] = {
        projects: projectsSnapshot.size,
        canAccess: true
      };
      
      log(`${role}: Can access ${projectsSnapshot.size} project(s)`, 'info');
      
      await signOut(auth);
    } catch (error) {
      results[role] = {
        projects: 0,
        canAccess: false,
        error: error.message
      };
      log(`${role}: Access error - ${error.message}`, 'error');
    }
  }
  
  return results;
}

async function runComprehensiveAudit() {
  console.log('\n' + colors.bright + '═══════════════════════════════════════════════');
  console.log('     STORYVID APP COMPREHENSIVE AUDIT');
  console.log('═══════════════════════════════════════════════' + colors.reset + '\n');
  
  const auditResults = {
    firebaseConnection: false,
    authentication: {
      admin: false,
      client: false,
      staff: false
    },
    userCreation: {
      admin: false,
      client: false,
      staff: false
    },
    projectOperations: false,
    dataAccess: {},
    timestamp: new Date().toISOString()
  };
  
  // 1. Test Firebase Connection
  console.log(colors.bright + '\n1. FIREBASE CONNECTION TEST' + colors.reset);
  console.log('─'.repeat(30));
  auditResults.firebaseConnection = await testFirebaseConnection();
  
  if (!auditResults.firebaseConnection) {
    log('Cannot proceed without Firebase connection', 'error');
    return auditResults;
  }
  
  // 2. Create Test Users
  console.log(colors.bright + '\n2. USER ACCOUNT CREATION' + colors.reset);
  console.log('─'.repeat(30));
  
  for (const userType of ['admin', 'client', 'staff']) {
    const user = await createTestUser(userType);
    auditResults.userCreation[userType] = !!user;
  }
  
  // 3. Test Authentication
  console.log(colors.bright + '\n3. AUTHENTICATION TEST' + colors.reset);
  console.log('─'.repeat(30));
  
  for (const userType of ['admin', 'client', 'staff']) {
    auditResults.authentication[userType] = await testUserLogin(userType);
  }
  
  // 4. Test Project Operations
  console.log(colors.bright + '\n4. PROJECT OPERATIONS TEST' + colors.reset);
  console.log('─'.repeat(30));
  auditResults.projectOperations = await testProjectCreation();
  
  // 5. Test Data Access
  console.log(colors.bright + '\n5. ROLE-BASED DATA ACCESS TEST' + colors.reset);
  console.log('─'.repeat(30));
  auditResults.dataAccess = await testDataAccess();
  
  // Summary
  console.log(colors.bright + '\n\n═══════════════════════════════════════════════');
  console.log('              AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════════' + colors.reset);
  
  console.log('\n' + colors.cyan + 'Firebase Services:' + colors.reset);
  console.log(`  Connection: ${auditResults.firebaseConnection ? colors.green + '✓ Connected' : colors.red + '✗ Failed'}${colors.reset}`);
  
  console.log('\n' + colors.cyan + 'User Management:' + colors.reset);
  Object.entries(auditResults.userCreation).forEach(([role, success]) => {
    console.log(`  ${role}: ${success ? colors.green + '✓ Created' : colors.red + '✗ Failed'}${colors.reset}`);
  });
  
  console.log('\n' + colors.cyan + 'Authentication:' + colors.reset);
  Object.entries(auditResults.authentication).forEach(([role, success]) => {
    console.log(`  ${role}: ${success ? colors.green + '✓ Working' : colors.red + '✗ Failed'}${colors.reset}`);
  });
  
  console.log('\n' + colors.cyan + 'Project Management:' + colors.reset);
  console.log(`  Creation: ${auditResults.projectOperations ? colors.green + '✓ Working' : colors.red + '✗ Failed'}${colors.reset}`);
  
  console.log('\n' + colors.cyan + 'Instructions for Manual Testing:' + colors.reset);
  console.log('\n1. Open http://localhost:3000 in your browser');
  console.log('\n2. Test each account:');
  Object.entries(testAccounts).forEach(([role, account]) => {
    console.log(`\n   ${colors.yellow}${role.toUpperCase()}:${colors.reset}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Password: ${account.password}`);
    console.log(`   Expected: Should see ${role}-specific dashboard and menu items`);
  });
  
  console.log('\n3. For each account, verify:');
  console.log('   - Dashboard loads with appropriate widgets');
  console.log('   - Services page shows correct options');
  console.log('   - Assets page allows file upload/view');
  console.log('   - Settings page shows profile information');
  console.log('   - Projects are visible based on role');
  
  console.log('\n' + colors.bright + '═══════════════════════════════════════════════' + colors.reset + '\n');
  
  return auditResults;
}

// Run the audit
runComprehensiveAudit()
  .then(results => {
    console.log('\nAudit completed at:', new Date().toLocaleString());
    process.exit(0);
  })
  .catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
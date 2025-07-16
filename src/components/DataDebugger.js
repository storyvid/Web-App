import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import dataMigrationService from '../services/firebase/dataMigration';
import firebaseService from '../services/firebase/firebaseService';

const DataDebugger = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => setLogs([]);

  const testMigration = async () => {
    setLoading(true);
    clearLogs();
    addLog('🔄 Starting force migration...', 'info');
    
    try {
      await dataMigrationService.forceMigration();
      addLog('✅ Migration completed successfully!', 'success');
    } catch (error) {
      addLog(`❌ Migration failed: ${error.message}`, 'error');
      console.error('Migration error:', error);
    }
    setLoading(false);
  };

  const checkFirestoreData = async () => {
    addLog('🔍 Checking Firestore data...', 'info');
    
    try {
      const collections = ['projects', 'notifications', 'activities'];
      for (const collectionName of collections) {
        const { getDocs, collection } = await import('firebase/firestore');
        const snapshot = await getDocs(collection(firebaseService.db, collectionName));
        addLog(`📊 ${collectionName}: ${snapshot.size} documents`, 'info');
        
        if (!snapshot.empty) {
          const sampleDoc = snapshot.docs[0];
          addLog(`📝 Sample ${collectionName}: userId=${sampleDoc.data().userId}`, 'info');
        }
      }
    } catch (error) {
      addLog(`❌ Error checking Firestore: ${error.message}`, 'error');
    }
  };

  const testClientData = async () => {
    addLog('🧪 Testing client dummy account...', 'info');
    
    try {
      const result = await dataMigrationService.testDummyAccountLogin('client@test.com');
      if (result) {
        addLog(`📊 Client data: ${result.projects.length} projects, ${result.notifications.length} notifications, ${result.activities.length} activities`, 'success');
      } else {
        addLog('❌ No data found for client account', 'error');
      }
    } catch (error) {
      addLog(`❌ Error testing client: ${error.message}`, 'error');
    }
  };

  const testDashboardData = async () => {
    addLog('📈 Testing dashboard data retrieval...', 'info');
    
    try {
      // Get client UID first
      const userId = await dataMigrationService.getAuthUidForEmail('client@test.com');
      if (!userId) {
        addLog('❌ Could not get client UID', 'error');
        return;
      }
      
      addLog(`👤 Client UID: ${userId}`, 'info');
      
      // Test dashboard data
      const dashboardData = await firebaseService.getDashboardData('client', userId);
      addLog(`📊 Dashboard data: ${dashboardData.projects.length} projects, ${dashboardData.notifications.length} notifications`, 'success');
      
    } catch (error) {
      addLog(`❌ Error testing dashboard: ${error.message}`, 'error');
    }
  };

  const testFirebaseWrite = async () => {
    addLog('🔥 Testing basic Firestore write...', 'info');
    
    try {
      const { doc, setDoc, collection } = await import('firebase/firestore');
      
      // Try to write a simple test document
      const testDoc = {
        message: 'Test write',
        timestamp: new Date().toISOString(),
        test: true
      };
      
      const docRef = doc(collection(firebaseService.db, 'test'));
      await setDoc(docRef, testDoc);
      
      addLog(`✅ Successfully wrote test document with ID: ${docRef.id}`, 'success');
      
    } catch (error) {
      addLog(`❌ Failed to write to Firestore: ${error.message}`, 'error');
      addLog(`❌ Error code: ${error.code}`, 'error');
      addLog(`❌ This is definitely a Firestore rules issue!`, 'error');
      addLog(`🔧 Solution: Update Firestore rules in Firebase Console`, 'info');
    }
  };

  const testClientLogin = async () => {
    addLog('🔑 Testing client login process...', 'info');
    
    try {
      // Try to login as client
      const result = await firebaseService.signIn('client@test.com', '123456789');
      
      if (result.success) {
        addLog(`✅ Login successful for client@test.com`, 'success');
        addLog(`👤 User data: ${JSON.stringify(result.user, null, 2)}`, 'info');
        
        // Now test dashboard data with the logged in user
        const dashboardData = await firebaseService.getDashboardData(result.user.role, result.user.uid);
        addLog(`📊 Dashboard after login: ${dashboardData.projects.length} projects, ${dashboardData.notifications.length} notifications`, 'success');
      } else {
        addLog(`❌ Login failed for client@test.com`, 'error');
      }
      
    } catch (error) {
      addLog(`❌ Error during login: ${error.message}`, 'error');
    }
  };

  const checkSpecificClientData = async () => {
    addLog('🔍 Detailed client data analysis...', 'info');
    
    try {
      const clientUID = 'qzYDjIQzZWebdTyIeuQJQUZ2EIZ2'; // The actual client UID from logs
      
      // Check all collections for this specific UID
      const { query, where, getDocs, collection } = await import('firebase/firestore');
      
      // Projects
      const projectsQuery = query(
        collection(firebaseService.db, 'projects'),
        where('userId', '==', clientUID)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      addLog(`📋 Client projects (userId): ${projectsSnapshot.size}`, 'info');
      
      const projectsQuery2 = query(
        collection(firebaseService.db, 'projects'),
        where('createdBy', '==', clientUID)
      );
      const projectsSnapshot2 = await getDocs(projectsQuery2);
      addLog(`📋 Client projects (createdBy): ${projectsSnapshot2.size}`, 'info');
      
      // Notifications
      const notificationsQuery = query(
        collection(firebaseService.db, 'notifications'),
        where('userId', '==', clientUID)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      addLog(`🔔 Client notifications: ${notificationsSnapshot.size}`, 'info');
      
      // Activities
      const activitiesQuery = query(
        collection(firebaseService.db, 'activities'),
        where('userId', '==', clientUID)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      addLog(`📊 Client activities: ${activitiesSnapshot.size}`, 'info');
      
      // Check what user IDs actually exist in notifications
      const allNotificationsSnapshot = await getDocs(collection(firebaseService.db, 'notifications'));
      const userIds = new Set();
      allNotificationsSnapshot.docs.forEach(doc => {
        userIds.add(doc.data().userId);
      });
      addLog(`🔔 All notification user IDs: ${Array.from(userIds).join(', ')}`, 'info');
      
    } catch (error) {
      addLog(`❌ Error checking client data: ${error.message}`, 'error');
    }
  };

  const fixClientNotifications = async () => {
    addLog('🔧 Fixing client notifications and activities...', 'info');
    
    try {
      const correctClientUID = 'qzYDjIQzZWebdTyIeuQJQUZ2EIZ2';
      const { getDocs, collection, doc, updateDoc, query, where } = await import('firebase/firestore');
      
      // Find notifications that should belong to client but have wrong UID
      const allNotificationsSnapshot = await getDocs(collection(firebaseService.db, 'notifications'));
      let fixedNotifications = 0;
      
      for (const notDoc of allNotificationsSnapshot.docs) {
        const data = notDoc.data();
        // If notification contains client-specific content, fix the userId
        if (data.title?.includes('Video ready for review') || 
            data.title?.includes('Project milestone') ||
            data.title?.includes('New project proposal')) {
          await updateDoc(doc(firebaseService.db, 'notifications', notDoc.id), {
            userId: correctClientUID
          });
          fixedNotifications++;
        }
      }
      
      // Fix activities
      const allActivitiesSnapshot = await getDocs(collection(firebaseService.db, 'activities'));
      let fixedActivities = 0;
      
      for (const actDoc of allActivitiesSnapshot.docs) {
        const data = actDoc.data();
        // If activity mentions client actions, fix the userId
        if (data.action?.includes('requested revisions') || 
            data.user?.name === 'Sam Client' ||
            data.target?.includes('Company Intro Video')) {
          await updateDoc(doc(firebaseService.db, 'activities', actDoc.id), {
            userId: correctClientUID
          });
          fixedActivities++;
        }
      }
      
      addLog(`✅ Fixed ${fixedNotifications} notifications and ${fixedActivities} activities`, 'success');
      
      // Verify the fix immediately
      const verifyQuery = query(
        collection(firebaseService.db, 'notifications'),
        where('userId', '==', correctClientUID)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      addLog(`🔍 Verification: ${verifySnapshot.size} notifications now belong to client`, 'info');
      
      // Also check if any notifications still have wrong UIDs
      const allNotificationsCheck = await getDocs(collection(firebaseService.db, 'notifications'));
      const remainingWrongUIDs = new Set();
      allNotificationsCheck.docs.forEach(doc => {
        const uid = doc.data().userId;
        if (uid !== correctClientUID && uid !== 'HEKX2m5bcAQD73iW053A0f8e28i1' && uid !== 'iIjp7md0AjVyDh9LF7hPNkgTLy13') {
          // Only track UIDs that aren't the correct client UID or the known wrong UIDs
          remainingWrongUIDs.add(uid);
        }
      });
      
      if (remainingWrongUIDs.size > 0) {
        addLog(`⚠️ Found other UIDs in notifications: ${Array.from(remainingWrongUIDs).join(', ')}`, 'info');
      }
      
    } catch (error) {
      addLog(`❌ Error fixing client data: ${error.message}`, 'error');
    }
  };

  const testNotificationsDirectly = async () => {
    addLog('🔔 Testing notifications directly with Firebase service...', 'info');
    
    try {
      const clientUID = 'qzYDjIQzZWebdTyIeuQJQUZ2EIZ2';
      
      // First, check if Firebase service is initialized
      addLog(`🔧 Firebase service initialized: ${firebaseService.db ? 'Yes' : 'No'}`, 'info');
      addLog(`👤 Current user in service: ${firebaseService.currentUser?.uid || 'None'}`, 'info');
      
      // Test the actual method the dashboard uses
      const notifications = await firebaseService.getUserNotifications(clientUID);
      addLog(`📬 Direct Firebase service call returned: ${notifications.length} notifications`, 'success');
      
      if (notifications.length > 0) {
        notifications.forEach((notif, index) => {
          addLog(`📄 Notification ${index + 1}: ${notif.title}`, 'info');
        });
      } else {
        addLog(`🔍 No notifications returned - checking console for Firebase service logs`, 'info');
      }
      
      // Also test the exact query manually
      addLog(`🔍 Testing manual query for comparison...`, 'info');
      const { query, where, getDocs, collection } = await import('firebase/firestore');
      const manualQuery = query(
        collection(firebaseService.db, 'notifications'),
        where('userId', '==', clientUID)
      );
      const manualSnapshot = await getDocs(manualQuery);
      addLog(`📬 Manual query returned: ${manualSnapshot.size} notifications`, 'info');
      
    } catch (error) {
      addLog(`❌ Error testing notifications directly: ${error.message}`, 'error');
    }
  };

  const testExactDashboardData = async () => {
    addLog('📊 Testing exact dashboard data call...', 'info');
    
    try {
      const clientUID = 'qzYDjIQzZWebdTyIeuQJQUZ2EIZ2';
      
      // Test the exact method the dashboard uses
      const dashboardData = await firebaseService.getDashboardData('client', clientUID);
      
      addLog(`📈 Dashboard data returned:`, 'info');
      addLog(`  - Projects: ${dashboardData.projects.length}`, 'info');
      addLog(`  - Notifications: ${dashboardData.notifications.length}`, 'info');
      addLog(`  - Activities: ${dashboardData.activities.length}`, 'info');
      addLog(`  - Stats: ${JSON.stringify(dashboardData.stats)}`, 'info');
      
      // Check individual project details
      if (dashboardData.projects.length > 0) {
        dashboardData.projects.forEach((project, index) => {
          addLog(`📋 Project ${index + 1}: ${project.name} (${project.status}, ${project.progress}% progress)`, 'info');
        });
      }
      
    } catch (error) {
      addLog(`❌ Error testing dashboard data: ${error.message}`, 'error');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Data Migration Debugger
      </Typography>
      
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testMigration}
          disabled={loading}
          color="primary"
        >
          Run Force Migration
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={checkFirestoreData}
          disabled={loading}
        >
          Check Firestore Data
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testClientData}
          disabled={loading}
        >
          Test Client Dummy Account
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testDashboardData}
          disabled={loading}
        >
          Test Dashboard Data Retrieval
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testFirebaseWrite}
          disabled={loading}
          color="warning"
        >
          Test Firestore Write Permission
        </Button>
        
        <Button 
          variant="contained" 
          onClick={testClientLogin}
          disabled={loading}
          color="secondary"
        >
          Test Client Login + Dashboard
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={checkSpecificClientData}
          disabled={loading}
          color="info"
        >
          Analyze Client Data UIDs
        </Button>
        
        <Button 
          variant="contained" 
          onClick={fixClientNotifications}
          disabled={loading}
          color="success"
        >
          Fix Client Data UIDs
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testNotificationsDirectly}
          disabled={loading}
          color="warning"
        >
          Test Notifications Service Call
        </Button>
        
        <Button 
          variant="contained" 
          onClick={testExactDashboardData}
          disabled={loading}
          color="primary"
        >
          Test Exact Dashboard Data Call
        </Button>
        
        <Button 
          variant="text" 
          onClick={clearLogs}
          color="secondary"
        >
          Clear Logs
        </Button>
      </Stack>

      <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.900', color: 'white' }}>
        <Typography variant="h6" gutterBottom color="white">
          Debug Logs:
        </Typography>
        {logs.length === 0 ? (
          <Typography color="grey.400">No logs yet. Run a test above.</Typography>
        ) : (
          logs.map((log, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                color: log.type === 'error' ? 'error.main' : 
                       log.type === 'success' ? 'success.main' : 'white',
                mb: 0.5
              }}
            >
              [{log.timestamp}] {log.message}
            </Typography>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default DataDebugger;
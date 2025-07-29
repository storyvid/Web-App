// Test script to verify file upload functionality
// Run this in the browser console to test

console.log('🧪 Testing file upload functionality...');

// Test file creation
const createTestFile = () => {
  const content = 'This is a test file content';
  const blob = new Blob([content], { type: 'text/plain' });
  const file = new File([blob], 'test-document.txt', { type: 'text/plain' });
  return file;
};

// Test the upload
const testUpload = async () => {
  try {
    console.log('🔍 Checking if firebaseService is available...');
    
    // Get the service (this assumes it's globally available or imported)
    if (typeof window !== 'undefined' && window.firebaseService) {
      const service = window.firebaseService;
      console.log('✅ FirebaseService found');
      
      const testFile = createTestFile();
      console.log('📄 Created test file:', testFile.name, testFile.size, 'bytes');
      
      const options = {
        projectId: 'test-project-123',
        category: 'documents',
        uploadedBy: 'test-user',
        uploadedByName: 'Test User'
      };
      
      console.log('🚀 Uploading test file...');
      const result = await service.uploadFile(testFile, options);
      
      console.log('✅ Upload successful!', result);
      
      // Test file retrieval
      console.log('🔍 Testing file retrieval...');
      const files = await service.getProjectFiles('test-project-123', { category: 'documents' });
      console.log('📁 Retrieved files:', files);
      
    } else {
      console.error('❌ FirebaseService not found. Make sure it\'s imported and available.');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Make test function available globally
if (typeof window !== 'undefined') {
  window.testFileUpload = testUpload;
  console.log('💡 Run window.testFileUpload() to test the upload functionality');
}

export { testUpload };
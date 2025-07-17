/**
 * File Service - Handles file operations with mock backend
 * Ready for Firebase Storage integration
 */

import { validateFile, validateFiles } from '../utils/fileValidation';
import { createFileMetadata, generateFileId } from '../utils/fileCategorization';

class FileService {
  constructor() {
    this.mockStorage = this.initializeMockStorage();
    this.uploadProgress = new Map(); // Track upload progress
    this.eventListeners = new Map(); // Event listeners for progress updates
  }

  /**
   * Initialize mock storage with sample data
   */
  initializeMockStorage() {
    const stored = localStorage.getItem('storyvid_files');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse stored files, initializing fresh storage');
      }
    }

    // Sample file data for testing
    const mockData = {
      'project-123': {
        videos: [
          {
            id: 'file_video_001',
            name: 'project-draft-v1.mp4',
            originalName: 'project-draft-v1.mp4',
            size: 47185920, // ~45MB
            type: 'video/mp4',
            category: 'videos',
            projectId: 'project-123',
            uploadedAt: '2024-01-15T10:30:00Z',
            uploadedBy: 'staff-user-id',
            lastModified: '2024-01-15T10:30:00Z',
            status: 'completed',
            progress: 100,
            downloadUrl: 'mock://video1.mp4',
            thumbnailUrl: 'mock://video1-thumb.jpg',
            description: 'First draft of the project video',
            tags: ['draft', 'review']
          }
        ],
        invoices: [
          {
            id: 'file_invoice_001',
            name: 'invoice-2024-001.pdf',
            originalName: 'invoice-2024-001.pdf',
            size: 2097152, // 2MB
            type: 'application/pdf',
            category: 'invoices',
            projectId: 'project-123',
            uploadedAt: '2024-01-14T14:20:00Z',
            uploadedBy: 'admin-user-id',
            lastModified: '2024-01-14T14:20:00Z',
            status: 'completed',
            progress: 100,
            downloadUrl: 'mock://invoice1.pdf',
            description: 'Project invoice for January 2024',
            tags: ['billing', 'january']
          }
        ],
        licenses: [
          {
            id: 'file_license_001',
            name: 'music-license-agreement.pdf',
            originalName: 'music-license-agreement.pdf',
            size: 1048576, // 1MB
            type: 'application/pdf',
            category: 'licenses',
            projectId: 'project-123',
            uploadedAt: '2024-01-13T09:15:00Z',
            uploadedBy: 'client-user-id',
            lastModified: '2024-01-13T09:15:00Z',
            status: 'completed',
            progress: 100,
            downloadUrl: 'mock://license1.pdf',
            description: 'Music licensing agreement for background track',
            tags: ['music', 'legal']
          }
        ],
        documents: [],
        images: []
      }
    };

    this.persistMockStorage(mockData);
    return mockData;
  }

  /**
   * Persist mock storage to localStorage
   */
  persistMockStorage(data = null) {
    try {
      localStorage.setItem('storyvid_files', JSON.stringify(data || this.mockStorage));
    } catch (error) {
      console.warn('Failed to persist file storage:', error);
    }
  }

  /**
   * Upload a single file (mock implementation)
   * @param {string} projectId - Project ID
   * @param {File} file - File to upload
   * @param {string} category - File category
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result
   */
  async uploadFile(projectId, file, category, options = {}) {
    // Validate file
    const validation = validateFile(file, category);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create file metadata
    const metadata = createFileMetadata(file, category, projectId);
    metadata.uploadedBy = options.uploadedBy || 'current-user-id';

    // Initialize project storage if needed
    if (!this.mockStorage[projectId]) {
      this.mockStorage[projectId] = {
        videos: [],
        invoices: [],
        licenses: [],
        documents: [],
        images: []
      };
    }

    // Simulate upload progress
    return new Promise((resolve, reject) => {
      this.simulateUpload(metadata, (progress) => {
        // Emit progress events
        this.emitProgress(metadata.id, progress);
      }).then((result) => {
        // Add to mock storage
        this.mockStorage[projectId][category].push(result);
        this.persistMockStorage();
        resolve(result);
      }).catch(reject);
    });
  }

  /**
   * Upload multiple files
   * @param {string} projectId - Project ID
   * @param {FileList|Array} files - Files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload results
   */
  async uploadFiles(projectId, files, options = {}) {
    // Validate all files first
    const validation = validateFiles(files);
    
    if (validation.invalid.length > 0) {
      console.warn('Some files failed validation:', validation.errors);
    }

    // Upload valid files
    const uploads = validation.valid.map(({ file, category }) => {
      return this.uploadFile(projectId, file, category, options)
        .catch(error => ({
          error: error.message,
          file: file.name
        }));
    });

    const results = await Promise.all(uploads);
    
    return {
      successful: results.filter(r => !r.error),
      failed: results.filter(r => r.error),
      total: files.length,
      validCount: validation.valid.length,
      invalidCount: validation.invalid.length,
      validationErrors: validation.errors
    };
  }

  /**
   * Get files for a project
   * @param {string} projectId - Project ID
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} - Project files
   */
  async getProjectFiles(projectId, category = null) {
    await this.delay(100); // Simulate API delay

    const projectFiles = this.mockStorage[projectId];
    if (!projectFiles) {
      return [];
    }

    if (category) {
      return projectFiles[category] || [];
    }

    // Return all files from all categories
    return Object.values(projectFiles).flat();
  }

  /**
   * Get files by category for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} - Files grouped by category
   */
  async getProjectFilesByCategory(projectId) {
    await this.delay(100);

    return this.mockStorage[projectId] || {
      videos: [],
      invoices: [],
      licenses: [],
      documents: [],
      images: []
    };
  }

  /**
   * Delete a file
   * @param {string} fileId - File ID to delete
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(fileId, projectId) {
    await this.delay(200);

    const projectFiles = this.mockStorage[projectId];
    if (!projectFiles) {
      throw new Error('Project not found');
    }

    // Find and remove file from appropriate category
    let found = false;
    Object.keys(projectFiles).forEach(category => {
      const index = projectFiles[category].findIndex(file => file.id === fileId);
      if (index !== -1) {
        projectFiles[category].splice(index, 1);
        found = true;
      }
    });

    if (!found) {
      throw new Error('File not found');
    }

    this.persistMockStorage();
    return true;
  }

  /**
   * Get download URL for a file
   * @param {string} fileId - File ID
   * @param {string} projectId - Project ID
   * @returns {Promise<string>} - Download URL
   */
  async getFileDownloadUrl(fileId, projectId) {
    await this.delay(100);

    const projectFiles = this.mockStorage[projectId];
    if (!projectFiles) {
      throw new Error('Project not found');
    }

    // Find file in all categories
    for (const category of Object.keys(projectFiles)) {
      const file = projectFiles[category].find(f => f.id === fileId);
      if (file) {
        // In real implementation, this would generate a signed URL
        return file.downloadUrl || `mock://download/${fileId}`;
      }
    }

    throw new Error('File not found');
  }

  /**
   * Update file metadata
   * @param {string} fileId - File ID
   * @param {string} projectId - Project ID
   * @param {Object} updates - Metadata updates
   * @returns {Promise<Object>} - Updated file metadata
   */
  async updateFileMetadata(fileId, projectId, updates) {
    await this.delay(100);

    const projectFiles = this.mockStorage[projectId];
    if (!projectFiles) {
      throw new Error('Project not found');
    }

    // Find and update file
    for (const category of Object.keys(projectFiles)) {
      const fileIndex = projectFiles[category].findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        projectFiles[category][fileIndex] = {
          ...projectFiles[category][fileIndex],
          ...updates,
          lastModified: new Date().toISOString()
        };
        
        this.persistMockStorage();
        return projectFiles[category][fileIndex];
      }
    }

    throw new Error('File not found');
  }

  /**
   * Get file statistics for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} - File statistics
   */
  async getProjectFileStats(projectId) {
    await this.delay(100);

    const projectFiles = this.mockStorage[projectId];
    if (!projectFiles) {
      return {
        totalFiles: 0,
        totalSize: 0,
        categories: {}
      };
    }

    const stats = {
      totalFiles: 0,
      totalSize: 0,
      categories: {}
    };

    Object.entries(projectFiles).forEach(([category, files]) => {
      const categorySize = files.reduce((sum, file) => sum + file.size, 0);
      
      stats.categories[category] = {
        count: files.length,
        size: categorySize
      };
      
      stats.totalFiles += files.length;
      stats.totalSize += categorySize;
    });

    return stats;
  }

  /**
   * Simulate file upload with progress
   * @param {Object} metadata - File metadata
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Upload result
   */
  async simulateUpload(metadata, onProgress) {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress increment
        progress = Math.min(progress, 100);
        
        onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulate successful upload
          const result = {
            ...metadata,
            status: 'completed',
            progress: 100,
            downloadUrl: `mock://files/${metadata.id}`,
            uploadedAt: new Date().toISOString()
          };
          
          resolve(result);
        }
      }, 200); // Update every 200ms
      
      // Simulate potential upload failure (5% chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Upload failed: Network error'));
        }, Math.random() * 2000 + 1000);
      }
    });
  }

  /**
   * Add progress event listener
   * @param {string} fileId - File ID
   * @param {Function} callback - Progress callback
   */
  onProgress(fileId, callback) {
    if (!this.eventListeners.has(fileId)) {
      this.eventListeners.set(fileId, []);
    }
    this.eventListeners.get(fileId).push(callback);
  }

  /**
   * Remove progress event listener
   * @param {string} fileId - File ID
   * @param {Function} callback - Progress callback
   */
  offProgress(fileId, callback) {
    if (this.eventListeners.has(fileId)) {
      const listeners = this.eventListeners.get(fileId);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit progress event
   * @param {string} fileId - File ID
   * @param {number} progress - Progress percentage
   */
  emitProgress(fileId, progress) {
    if (this.eventListeners.has(fileId)) {
      this.eventListeners.get(fileId).forEach(callback => {
        try {
          callback(progress);
        } catch (error) {
          console.warn('Progress callback error:', error);
        }
      });
    }
  }

  /**
   * Utility method to simulate API delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise} - Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all mock data (for testing)
   */
  clearMockData() {
    this.mockStorage = {};
    this.persistMockStorage();
  }

  /**
   * Reset to initial mock data (for testing)
   */
  resetMockData() {
    localStorage.removeItem('storyvid_files');
    this.mockStorage = this.initializeMockStorage();
  }

  // Methods ready for Firebase Storage integration:
  
  /**
   * [FIREBASE READY] Upload file to Firebase Storage
   * Replace mock implementation with Firebase Storage upload
   */
  async uploadToFirebase(projectId, file, category, metadata) {
    // TODO: Implement Firebase Storage upload
    // const storageRef = ref(storage, `projects/${projectId}/${category}/${metadata.id}`);
    // const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    // return uploadTask;
    throw new Error('Firebase Storage not configured yet');
  }

  /**
   * [FIREBASE READY] Get Firebase download URL
   * Replace mock implementation with Firebase Storage getDownloadURL
   */
  async getFirebaseDownloadUrl(storagePath) {
    // TODO: Implement Firebase Storage download URL
    // const storageRef = ref(storage, storagePath);
    // return await getDownloadURL(storageRef);
    throw new Error('Firebase Storage not configured yet');
  }

  /**
   * [FIREBASE READY] Delete file from Firebase Storage
   * Replace mock implementation with Firebase Storage delete
   */
  async deleteFromFirebase(storagePath) {
    // TODO: Implement Firebase Storage deletion
    // const storageRef = ref(storage, storagePath);
    // return await deleteObject(storageRef);
    throw new Error('Firebase Storage not configured yet');
  }
}

// Export singleton instance
const fileService = new FileService();
export default fileService;
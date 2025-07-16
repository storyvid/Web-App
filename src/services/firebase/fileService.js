// File Service - Handles file upload/download and asset management
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata
} from 'firebase/storage';
import firebaseService from './firebaseService';

class FileService {
  constructor() {
    this.collectionName = 'files';
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
    this.allowedTypes = {
      video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
      document: ['pdf', 'doc', 'docx', 'txt'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      audio: ['mp3', 'wav', 'aac', 'm4a']
    };
  }

  // Validate file before upload
  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const extension = file.name.split('.').pop().toLowerCase();
    const isAllowed = Object.values(this.allowedTypes).some(types => 
      types.includes(extension)
    );

    if (!isAllowed) {
      errors.push(`File type .${extension} is not supported`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get file type category
  getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    for (const [type, extensions] of Object.entries(this.allowedTypes)) {
      if (extensions.includes(extension)) {
        return type;
      }
    }
    
    return 'other';
  }

  // Upload file to Firebase Storage
  async uploadFile(file, options = {}) {
    try {
      const {
        projectId = null,
        milestoneId = null,
        category = 'general',
        onProgress = null
      } = options;

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      const currentUser = firebaseService.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to upload files');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `files/${currentUser.uid}/${timestamp}-${sanitizedFileName}`;
      
      // Create storage reference
      const storageRef = ref(firebaseService.storage, storagePath);

      // Upload file with progress tracking
      let uploadTask;
      if (onProgress) {
        uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            throw error;
          }
        );
        
        await uploadTask;
      } else {
        await uploadBytes(storageRef, file);
      }

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Create file document in Firestore
      const fileData = {
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: this.getFileType(file.name),
        mimeType: file.type,
        downloadURL,
        storagePath,
        projectId,
        milestoneId,
        category,
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.name || currentUser.email,
        isPublic: false,
        downloadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = doc(collection(firebaseService.db, this.collectionName));
      await setDoc(docRef, fileData);

      return {
        id: docRef.id,
        ...fileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, options = {}) {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadFile(file, options)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({
            file: files[index].name,
            error: result.reason.message
          });
        }
      });

      return {
        successful,
        failed,
        totalCount: files.length,
        successCount: successful.length,
        failCount: failed.length
      };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  // Get file by ID
  async getFile(fileId) {
    try {
      const fileDoc = await getDoc(doc(firebaseService.db, this.collectionName, fileId));
      
      if (!fileDoc.exists()) {
        return null;
      }

      const data = fileDoc.data();
      return {
        id: fileDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    } catch (error) {
      console.error('Error getting file:', error);
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  // Get files for a project
  async getProjectFiles(projectId, options = {}) {
    try {
      const {
        category = null,
        type = null,
        limitCount = 100
      } = options;

      let filesQuery = query(
        collection(firebaseService.db, this.collectionName),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      if (category) {
        filesQuery = query(filesQuery, where('category', '==', category));
      }

      if (type) {
        filesQuery = query(filesQuery, where('type', '==', type));
      }

      if (limitCount) {
        filesQuery = query(filesQuery, limit(limitCount));
      }

      const snapshot = await getDocs(filesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      console.error('Error getting project files:', error);
      throw new Error(`Failed to get project files: ${error.message}`);
    }
  }

  // Get files for a milestone
  async getMilestoneFiles(milestoneId, options = {}) {
    try {
      const { type = null, limitCount = 50 } = options;

      let filesQuery = query(
        collection(firebaseService.db, this.collectionName),
        where('milestoneId', '==', milestoneId),
        orderBy('createdAt', 'desc')
      );

      if (type) {
        filesQuery = query(filesQuery, where('type', '==', type));
      }

      if (limitCount) {
        filesQuery = query(filesQuery, limit(limitCount));
      }

      const snapshot = await getDocs(filesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      console.error('Error getting milestone files:', error);
      throw new Error(`Failed to get milestone files: ${error.message}`);
    }
  }

  // Get files uploaded by user
  async getUserFiles(userId, options = {}) {
    try {
      const { limitCount = 100 } = options;

      const filesQuery = query(
        collection(firebaseService.db, this.collectionName),
        where('uploadedBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(filesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));
    } catch (error) {
      console.error('Error getting user files:', error);
      throw new Error(`Failed to get user files: ${error.message}`);
    }
  }

  // Update file metadata
  async updateFile(fileId, updates) {
    try {
      const fileRef = doc(firebaseService.db, this.collectionName, fileId);
      
      await updateDoc(fileRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return await this.getFile(fileId);
    } catch (error) {
      console.error('Error updating file:', error);
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  // Track file download
  async trackDownload(fileId) {
    try {
      const fileRef = doc(firebaseService.db, this.collectionName, fileId);
      const fileDoc = await getDoc(fileRef);
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const currentCount = fileDoc.data().downloadCount || 0;
      await updateDoc(fileRef, {
        downloadCount: currentCount + 1,
        lastDownloadAt: serverTimestamp(),
        lastDownloadBy: firebaseService.currentUser?.uid
      });

      return { success: true };
    } catch (error) {
      console.error('Error tracking download:', error);
      // Don't throw error for download tracking failures
      return { success: false };
    }
  }

  // Download file (with tracking)
  async downloadFile(fileId) {
    try {
      const file = await this.getFile(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Track the download
      await this.trackDownload(fileId);

      // Return the download URL
      return {
        downloadURL: file.downloadURL,
        fileName: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      const file = await this.getFile(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Check permissions - only uploader or admin can delete
      const currentUser = firebaseService.currentUser;
      if (!currentUser || (file.uploadedBy !== currentUser.uid && currentUser.role !== 'admin')) {
        throw new Error('Permission denied: You can only delete your own files');
      }

      // Delete from Firebase Storage
      const storageRef = ref(firebaseService.storage, file.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(firebaseService.db, this.collectionName, fileId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Get file statistics
  async getFileStats(projectId = null, userId = null) {
    try {
      let filesQuery = collection(firebaseService.db, this.collectionName);

      if (projectId) {
        filesQuery = query(filesQuery, where('projectId', '==', projectId));
      }

      if (userId) {
        filesQuery = query(filesQuery, where('uploadedBy', '==', userId));
      }

      const snapshot = await getDocs(filesQuery);
      const files = snapshot.docs.map(doc => doc.data());

      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
        typeBreakdown: {},
        categoryBreakdown: {},
        recentUploads: files
          .filter(file => file.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      };

      // Calculate type breakdown
      files.forEach(file => {
        const type = file.type || 'other';
        stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;
      });

      // Calculate category breakdown
      files.forEach(file => {
        const category = file.category || 'general';
        stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on type
  getFileIcon(fileName) {
    const type = this.getFileType(fileName);
    const iconMap = {
      video: '🎥',
      document: '📄',
      image: '🖼️',
      audio: '🎵',
      other: '📁'
    };
    
    return iconMap[type] || iconMap.other;
  }
}

// Export singleton instance
const fileService = new FileService();
export default fileService;
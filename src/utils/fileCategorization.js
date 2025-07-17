/**
 * File categorization utilities
 */

import { categorizeSingleFile } from './fileValidation';

/**
 * File categories configuration
 */
export const FILE_CATEGORIES = {
  videos: {
    label: 'Videos',
    description: 'Video files (MP4, MOV, AVI, etc.)',
    icon: 'VideoLibrary',
    color: 'primary',
    acceptTypes: 'video/*'
  },
  invoices: {
    label: 'Invoices',
    description: 'Invoices and billing documents',
    icon: 'Receipt',
    color: 'warning',
    acceptTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  },
  licenses: {
    label: 'Licenses',
    description: 'Licenses and legal documents',
    icon: 'Gavel',
    color: 'info',
    acceptTypes: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png'
  },
  documents: {
    label: 'Documents',
    description: 'General documents and files',
    icon: 'Description',
    color: 'secondary',
    acceptTypes: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'
  },
  images: {
    label: 'Images',
    description: 'Image files and graphics',
    icon: 'Image',
    color: 'success',
    acceptTypes: 'image/*'
  }
};

/**
 * Categorize multiple files into categories
 * @param {FileList|Array} files - Files to categorize
 * @returns {Object} - Object with categorized files
 */
export const categorizeFiles = (files) => {
  const categorized = {
    videos: [],
    invoices: [],
    licenses: [],
    documents: [],
    images: [],
    uncategorized: []
  };

  Array.from(files).forEach((file, index) => {
    const category = categorizeSingleFile(file);
    
    if (categorized[category]) {
      categorized[category].push({
        file,
        index,
        category,
        id: generateFileId(file, index)
      });
    } else {
      categorized.uncategorized.push({
        file,
        index,
        category: 'uncategorized',
        id: generateFileId(file, index)
      });
    }
  });

  return categorized;
};

/**
 * Get category statistics
 * @param {Object} categorizedFiles - Categorized files object
 * @returns {Object} - Statistics for each category
 */
export const getCategoryStats = (categorizedFiles) => {
  const stats = {};
  
  Object.entries(categorizedFiles).forEach(([category, files]) => {
    const totalSize = files.reduce((sum, fileObj) => sum + fileObj.file.size, 0);
    
    stats[category] = {
      count: files.length,
      totalSize,
      avgSize: files.length > 0 ? totalSize / files.length : 0,
      files: files.map(fileObj => ({
        name: fileObj.file.name,
        size: fileObj.file.size,
        type: fileObj.file.type,
        lastModified: fileObj.file.lastModified
      }))
    };
  });
  
  return stats;
};

/**
 * Filter files by category
 * @param {Object} categorizedFiles - Categorized files object
 * @param {string} category - Category to filter
 * @returns {Array} - Files in the specified category
 */
export const getFilesByCategory = (categorizedFiles, category) => {
  return categorizedFiles[category] || [];
};

/**
 * Get all categories that have files
 * @param {Object} categorizedFiles - Categorized files object
 * @returns {Array} - Array of category names that contain files
 */
export const getActiveCategories = (categorizedFiles) => {
  return Object.entries(categorizedFiles)
    .filter(([category, files]) => files.length > 0)
    .map(([category]) => category);
};

/**
 * Generate a unique file ID
 * @param {File} file - File object
 * @param {number} index - File index
 * @returns {string} - Unique file ID
 */
export const generateFileId = (file, index) => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `file_${timestamp}_${index}_${randomSuffix}`;
};

/**
 * Create file metadata object
 * @param {File} file - File object
 * @param {string} category - File category
 * @param {string} projectId - Project ID
 * @returns {Object} - File metadata object
 */
export const createFileMetadata = (file, category, projectId) => {
  return {
    id: generateFileId(file),
    name: file.name,
    originalName: file.name,
    size: file.size,
    type: file.type,
    category,
    projectId,
    uploadedAt: new Date().toISOString(),
    uploadedBy: null, // Will be set by the service
    lastModified: new Date(file.lastModified).toISOString(),
    status: 'pending', // pending, uploading, completed, error
    progress: 0,
    downloadUrl: null, // Will be set after upload
    thumbnailUrl: null, // For images/videos
    description: '',
    tags: []
  };
};

/**
 * Group files by upload date
 * @param {Array} files - Array of file metadata objects
 * @returns {Object} - Files grouped by date
 */
export const groupFilesByDate = (files) => {
  const grouped = {};
  
  files.forEach(file => {
    const date = new Date(file.uploadedAt).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(file);
  });
  
  return grouped;
};

/**
 * Sort files by various criteria
 * @param {Array} files - Array of file objects
 * @param {string} sortBy - Sort criteria (name, size, date, type)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Array} - Sorted files array
 */
export const sortFiles = (files, sortBy = 'name', order = 'asc') => {
  const sorted = [...files].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.name || a.file?.name || '';
        bVal = b.name || b.file?.name || '';
        return order === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
          
      case 'size':
        aVal = a.size || a.file?.size || 0;
        bVal = b.size || b.file?.size || 0;
        return order === 'asc' ? aVal - bVal : bVal - aVal;
        
      case 'date':
        aVal = new Date(a.uploadedAt || a.file?.lastModified || 0);
        bVal = new Date(b.uploadedAt || b.file?.lastModified || 0);
        return order === 'asc' ? aVal - bVal : bVal - aVal;
        
      case 'type':
        aVal = a.type || a.file?.type || '';
        bVal = b.type || b.file?.type || '';
        return order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
          
      default:
        return 0;
    }
  });
  
  return sorted;
};

/**
 * Search files by name or description
 * @param {Array} files - Array of file objects
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered files array
 */
export const searchFiles = (files, searchTerm) => {
  if (!searchTerm.trim()) return files;
  
  const term = searchTerm.toLowerCase().trim();
  
  return files.filter(file => {
    const name = (file.name || file.file?.name || '').toLowerCase();
    const description = (file.description || '').toLowerCase();
    const category = (file.category || '').toLowerCase();
    
    return name.includes(term) || 
           description.includes(term) || 
           category.includes(term);
  });
};

/**
 * Get file icon based on type/category
 * @param {string} fileType - MIME type or category
 * @returns {string} - Icon name
 */
export const getFileIcon = (fileType) => {
  if (fileType.startsWith('video/')) return 'VideoFile';
  if (fileType.startsWith('image/')) return 'Image';
  if (fileType.startsWith('audio/')) return 'AudioFile';
  if (fileType === 'application/pdf') return 'PictureAsPdf';
  if (fileType.includes('word')) return 'Description';
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'TableChart';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'Slideshow';
  if (fileType === 'text/plain') return 'TextSnippet';
  if (fileType.includes('zip') || fileType.includes('archive')) return 'Archive';
  
  return 'InsertDriveFile'; // Default file icon
};

/**
 * Check if file can be previewed
 * @param {string} fileType - MIME type
 * @returns {boolean} - Whether file can be previewed
 */
export const canPreviewFile = (fileType) => {
  const previewableTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'video/mp4',
    'video/webm'
  ];
  
  return previewableTypes.includes(fileType);
};
/**
 * File validation utilities for upload system
 */

// Allowed file types by category
export const ALLOWED_FILE_TYPES = {
  videos: [
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/wmv',
    'video/mkv',
    'video/webm',
    'video/m4v'
  ],
  invoices: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ],
  licenses: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv'
  ],
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml'
  ]
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  videos: 500 * 1024 * 1024, // 500MB
  invoices: 10 * 1024 * 1024, // 10MB
  licenses: 10 * 1024 * 1024, // 10MB
  documents: 10 * 1024 * 1024, // 10MB
  images: 5 * 1024 * 1024, // 5MB
  default: 50 * 1024 * 1024 // 50MB
};

/**
 * Validate a single file
 * @param {File} file - The file to validate
 * @param {string} category - The category to validate against
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateFile = (file, category = null) => {
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  // Auto-detect category if not provided
  if (!category) {
    category = categorizeSingleFile(file);
  }

  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[category] || ALLOWED_FILE_TYPES.documents;
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed for ${category}. Allowed types: ${getAllowedExtensions(category).join(', ')}`
    };
  }

  // Check file size
  const sizeLimit = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default;
  if (file.size > sizeLimit) {
    return {
      isValid: false,
      error: `File size ${formatFileSize(file.size)} exceeds the limit of ${formatFileSize(sizeLimit)} for ${category}`
    };
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate multiple files
 * @param {FileList|Array} files - Files to validate
 * @param {string} category - Category to validate against
 * @returns {Object} - Validation results
 */
export const validateFiles = (files, category = null) => {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  };

  Array.from(files).forEach((file, index) => {
    const validation = validateFile(file, category);
    
    if (validation.isValid) {
      results.valid.push({
        file,
        index,
        category: category || categorizeSingleFile(file)
      });
    } else {
      results.invalid.push({
        file,
        index,
        error: validation.error
      });
      results.errors.push(`${file.name}: ${validation.error}`);
    }
  });

  return results;
};

/**
 * Categorize a single file based on its type
 * @param {File} file - File to categorize
 * @returns {string} - Category name
 */
export const categorizeSingleFile = (file) => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  // Check by MIME type first
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(type)) {
      // Special handling for documents that might be invoices/licenses
      if (category === 'documents' || category === 'images') {
        if (name.includes('invoice') || name.includes('bill') || name.includes('receipt')) {
          return 'invoices';
        }
        if (name.includes('license') || name.includes('agreement') || name.includes('contract')) {
          return 'licenses';
        }
      }
      return category;
    }
  }

  // Fallback to extension-based detection
  const extension = getFileExtension(name);
  
  // Video extensions
  if (['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm', 'm4v'].includes(extension)) {
    return 'videos';
  }
  
  // Image extensions
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    if (name.includes('invoice') || name.includes('bill') || name.includes('receipt')) {
      return 'invoices';
    }
    if (name.includes('license') || name.includes('agreement') || name.includes('contract')) {
      return 'licenses';
    }
    return 'images';
  }
  
  // Document extensions
  if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv'].includes(extension)) {
    if (name.includes('invoice') || name.includes('bill') || name.includes('receipt')) {
      return 'invoices';
    }
    if (name.includes('license') || name.includes('agreement') || name.includes('contract')) {
      return 'licenses';
    }
    return 'documents';
  }

  return 'documents'; // Default category
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} - File extension without dot
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Get allowed extensions for a category
 * @param {string} category - File category
 * @returns {Array} - Array of allowed extensions
 */
export const getAllowedExtensions = (category) => {
  const mimeToExt = {
    'video/mp4': 'mp4',
    'video/mov': 'mov',
    'video/avi': 'avi',
    'video/wmv': 'wmv',
    'video/mkv': 'mkv',
    'video/webm': 'webm',
    'video/m4v': 'm4v',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  };

  const allowedTypes = ALLOWED_FILE_TYPES[category] || ALLOWED_FILE_TYPES.documents;
  return allowedTypes.map(type => mimeToExt[type] || type.split('/')[1]).filter(Boolean);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate accept attribute for file input
 * @param {string} category - File category
 * @returns {string} - Accept attribute value
 */
export const getAcceptAttribute = (category) => {
  const allowedTypes = ALLOWED_FILE_TYPES[category];
  if (!allowedTypes) return '*/*';
  
  return allowedTypes.join(',');
};

/**
 * Check if file type is supported
 * @param {string} fileType - MIME type of the file
 * @param {string} category - Category to check against
 * @returns {boolean} - Whether the file type is supported
 */
export const isFileTypeSupported = (fileType, category = null) => {
  if (category) {
    const allowedTypes = ALLOWED_FILE_TYPES[category];
    return allowedTypes ? allowedTypes.includes(fileType) : false;
  }

  // Check all categories if no specific category provided
  return Object.values(ALLOWED_FILE_TYPES).some(types => types.includes(fileType));
};
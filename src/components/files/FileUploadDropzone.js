import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse
} from '@mui/material';
import {
  Upload as UploadIcon,
  Trash2 as DeleteIcon,
  CheckCircle as CheckIcon,
  AlertTriangle as ErrorIcon,
  Folder as FolderIcon,
  Video as VideoIcon,
  FileText as InvoiceIcon,
  Scale as LicenseIcon,
  FileText as DocumentIcon,
  Image as ImageIcon,
  ChevronDown as ExpandIcon,
  ChevronUp as CollapseIcon
} from 'lucide-react';

import { validateFiles } from '../../utils/fileValidation';
import { categorizeFiles, FILE_CATEGORIES } from '../../utils/fileCategorization';
import { formatFileSize } from '../../utils/fileValidation';

const FileUploadDropzone = ({ 
  onFilesSelected, 
  onUpload, 
  allowedCategories = ['videos', 'invoices', 'licenses', 'documents', 'images'],
  maxFiles = 10,
  disabled = false,
  showCategoryPreview = true 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [categorizedFiles, setCategorizedFiles] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Category icons mapping
  const categoryIcons = {
    videos: VideoIcon,
    invoices: InvoiceIcon,
    licenses: LicenseIcon,
    documents: DocumentIcon,
    images: ImageIcon
  };

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [disabled]);

  // Handle file input change
  const handleFileInput = useCallback((e) => {
    if (disabled) return;
    
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled]);

  // Process and validate files
  const processFiles = useCallback((files) => {
    if (files.length === 0) return;

    // Check max files limit
    if (selectedFiles.length + files.length > maxFiles) {
      setValidationErrors([`Maximum ${maxFiles} files allowed. You're trying to add ${files.length} files but already have ${selectedFiles.length} selected.`]);
      return;
    }

    // Validate files
    const validation = validateFiles(files);
    
    if (validation.invalid.length > 0) {
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }

    // Add valid files to selection
    if (validation.valid.length > 0) {
      const newFiles = validation.valid.map(({ file, category }) => ({
        file,
        category,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'selected',
        progress: 0
      }));

      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);

      // Categorize all files for preview
      const allFiles = updatedFiles.map(f => f.file);
      const categorized = categorizeFiles(allFiles);
      setCategorizedFiles(categorized);

      // Notify parent component
      if (onFilesSelected) {
        onFilesSelected(updatedFiles);
      }
    }
  }, [selectedFiles, maxFiles, onFilesSelected]);

  // Remove file from selection
  const removeFile = useCallback((fileId) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== fileId);
    setSelectedFiles(updatedFiles);

    // Update categorized files
    const allFiles = updatedFiles.map(f => f.file);
    const categorized = categorizeFiles(allFiles);
    setCategorizedFiles(categorized);

    // Clear validation errors if no files left
    if (updatedFiles.length === 0) {
      setValidationErrors([]);
    }

    // Notify parent component
    if (onFilesSelected) {
      onFilesSelected(updatedFiles);
    }
  }, [selectedFiles, onFilesSelected]);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setCategorizedFiles({});
    setValidationErrors([]);
    
    if (onFilesSelected) {
      onFilesSelected([]);
    }
  }, [onFilesSelected]);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || uploading || disabled) return;

    setUploading(true);
    
    try {
      if (onUpload) {
        await onUpload(selectedFiles);
      }
      
      // Clear files after successful upload
      clearAllFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      setValidationErrors([error.message || 'Upload failed. Please try again.']);
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, uploading, disabled, onUpload, clearAllFiles]);

  // Toggle category expansion
  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  // Get accept attribute for file input
  const getAcceptAttribute = useCallback(() => {
    const allTypes = allowedCategories.reduce((acc, category) => {
      const categoryConfig = FILE_CATEGORIES[category];
      if (categoryConfig && categoryConfig.acceptTypes) {
        acc.push(categoryConfig.acceptTypes);
      }
      return acc;
    }, []);
    
    return allTypes.join(',');
  }, [allowedCategories]);

  return (
    <Box>
      {/* Main Dropzone */}
      <Card
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragActive ? '#FFC535' : 'rgba(255, 197, 53, 0.3)',
          bgcolor: dragActive ? 'rgba(255, 197, 53, 0.1)' : 'rgba(255, 197, 53, 0.02)',
          background: dragActive 
            ? 'linear-gradient(135deg, rgba(255, 197, 53, 0.1) 0%, rgba(255, 140, 66, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255, 197, 53, 0.02) 0%, rgba(255, 140, 66, 0.01) 100%)',
          transition: 'all 0.3s ease-in-out',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          '&:hover': disabled ? {} : {
            borderColor: '#FFC535',
            background: 'linear-gradient(135deg, rgba(255, 197, 53, 0.08) 0%, rgba(255, 140, 66, 0.04) 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(255, 197, 53, 0.15)',
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <UploadIcon 
            sx={{ 
              fontSize: 48, 
              color: dragActive ? '#FF8C42' : '#FFC535',
              mb: 2,
              transition: 'all 0.3s ease-in-out',
              filter: dragActive ? 'drop-shadow(0 2px 8px rgba(255, 140, 66, 0.3))' : 'none',
            }} 
          />
          
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: dragActive ? '#FF8C42' : 'text.primary',
              fontWeight: 600,
              transition: 'color 0.3s ease-in-out'
            }}
          >
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              fontSize: '0.95rem'
            }}
          >
            or click anywhere to browse files
          </Typography>
          
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Max {maxFiles} files • Supported: {allowedCategories.map(cat => 
              FILE_CATEGORIES[cat]?.label || cat
            ).join(', ')}
          </Typography>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptAttribute()}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            File validation errors:
          </Typography>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Selected Files Summary */}
      {selectedFiles.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Selected Files ({selectedFiles.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={clearAllFiles}
                  disabled={uploading}
                  color="error"
                  title="Clear all files"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>

            {uploading && (
              <LinearProgress sx={{ mb: 2 }} />
            )}

            {/* Category Preview */}
            {showCategoryPreview && Object.keys(categorizedFiles).length > 0 && (
              <Box>
                {Object.entries(categorizedFiles).map(([category, files]) => {
                  if (files.length === 0) return null;
                  
                  const CategoryIcon = categoryIcons[category] || FolderIcon;
                  const isExpanded = expandedCategories[category];
                  
                  return (
                    <Box key={category} sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                        onClick={() => toggleCategory(category)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon />
                          <Box>
                            <Typography variant="body2">
                              {FILE_CATEGORIES[category]?.label || category} ({files.length})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </Box>
                      </Box>
                      
                      <Collapse in={isExpanded}>
                        <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                          {files.map((fileObj, index) => {
                            const selectedFile = selectedFiles.find(sf => sf.file === fileObj.file);
                            
                            return (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  {selectedFile?.status === 'uploaded' ? (
                                    <CheckIcon color="success" />
                                  ) : selectedFile?.status === 'error' ? (
                                    <ErrorIcon color="error" />
                                  ) : (
                                    <CategoryIcon />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={fileObj.file.name}
                                  secondary={formatFileSize(fileObj.file.size)}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => removeFile(selectedFile?.id)}
                                    disabled={uploading}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FileUploadDropzone;
import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
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
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Folder as FolderIcon,
  VideoLibrary as VideoIcon,
  Receipt as InvoiceIcon,
  Gavel as LicenseIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';

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
          borderColor: dragActive ? 'primary.main' : 'divider',
          bgcolor: dragActive ? 'primary.50' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          '&:hover': disabled ? {} : {
            borderColor: 'primary.main',
            bgcolor: 'primary.50'
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
              color: dragActive ? 'primary.main' : 'text.secondary',
              mb: 2 
            }} 
          />
          
          <Typography variant="h6" gutterBottom>
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to browse files
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Files
          </Button>
          
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
                <Button
                  size="small"
                  onClick={clearAllFiles}
                  disabled={uploading}
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  startIcon={uploading ? null : <UploadIcon />}
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
                </Button>
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
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CategoryIcon />}
                        endIcon={isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        onClick={() => toggleCategory(category)}
                        sx={{ justifyContent: 'space-between', mb: 1 }}
                      >
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body2">
                            {FILE_CATEGORIES[category]?.label || category} ({files.length})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                          </Typography>
                        </Box>
                      </Button>
                      
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
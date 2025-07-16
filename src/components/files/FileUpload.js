import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  AttachFile as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  InsertDriveFile as DocumentIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import firebaseService from '../../services/firebase/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

const FileUpload = ({ 
  projectId = null, 
  milestoneId = null, 
  onUploadComplete,
  allowedTypes = ['video', 'document', 'image', 'audio'],
  maxFiles = 10,
  category = 'general'
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadSettings, setUploadSettings] = useState({
    category: category,
    description: ''
  });

  // File type configurations
  const fileTypeConfig = {
    video: {
      extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      icon: VideoIcon,
      color: '#1976d2',
      maxSize: 100 * 1024 * 1024 // 100MB
    },
    document: {
      extensions: ['.pdf', '.doc', '.docx', '.txt'],
      icon: DocumentIcon,
      color: '#d32f2f',
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    image: {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      icon: ImageIcon,
      color: '#388e3c',
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    audio: {
      extensions: ['.mp3', '.wav', '.aac', '.m4a'],
      icon: AudioIcon,
      color: '#f57c00',
      maxSize: 25 * 1024 * 1024 // 25MB
    }
  };

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'script', label: 'Script' },
    { value: 'draft', label: 'Draft' },
    { value: 'final', label: 'Final' },
    { value: 'assets', label: 'Assets' },
    { value: 'reference', label: 'Reference' },
    { value: 'feedback', label: 'Feedback' }
  ];

  // Validate file
  const validateFile = (file) => {
    const errors = [];

    // Check file size based on type
    const extension = file.name.split('.').pop().toLowerCase();
    let fileType = 'other';
    let maxSize = 1024 * 1024; // 1MB default

    for (const [type, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.some(ext => ext.slice(1) === extension)) {
        fileType = type;
        maxSize = config.maxSize;
        break;
      }
    }

    if (!allowedTypes.includes(fileType) && fileType !== 'other') {
      errors.push(`File type ${extension} is not allowed`);
    }

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
    }

    return { isValid: errors.length === 0, errors, fileType };
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    for (const [type, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.some(ext => ext.slice(1) === extension)) {
        return config.icon;
      }
    }
    
    return FileIcon;
  };

  // Get file type color
  const getFileTypeColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    for (const [type, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.some(ext => ext.slice(1) === extension)) {
        return config.color;
      }
    }
    
    return '#666';
  };

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        file: file.name,
        errors: errors.map(e => e.message)
      }));
      setErrors(prev => [...prev, ...newErrors]);
    }

    // Validate accepted files
    const validFiles = [];
    const invalidFiles = [];

    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push({
          file,
          fileType: validation.fileType,
          id: Math.random().toString(36).substr(2, 9)
        });
      } else {
        invalidFiles.push({
          file: file.name,
          errors: validation.errors
        });
      }
    });

    if (invalidFiles.length > 0) {
      setErrors(prev => [...prev, ...invalidFiles]);
    }

    if (validFiles.length > 0) {
      if (validFiles.length === 1) {
        // Single file - upload immediately
        uploadFiles(validFiles);
      } else {
        // Multiple files - show settings dialog
        setPendingFiles(validFiles);
        setDialogOpen(true);
      }
    }
  }, [allowedTypes, maxFiles]);

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    disabled: uploading
  });

  // Upload files
  const uploadFiles = async (filesToUpload) => {
    setUploading(true);
    setUploadProgress({});
    const successful = [];
    const failed = [];

    for (const fileData of filesToUpload) {
      try {
        const { file, id } = fileData;
        
        const result = await firebaseService.uploadFile(file, {
          projectId,
          milestoneId,
          category: uploadSettings.category,
          onProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [id]: progress
            }));
          }
        });

        successful.push({
          ...result,
          originalFile: file,
          id
        });

        // Update progress to 100%
        setUploadProgress(prev => ({
          ...prev,
          [id]: 100
        }));

      } catch (error) {
        console.error('Upload error:', error);
        failed.push({
          file: fileData.file.name,
          error: error.message
        });
      }
    }

    // Update state
    setUploadedFiles(prev => [...prev, ...successful]);
    
    if (failed.length > 0) {
      setErrors(prev => [...prev, ...failed.map(f => ({ file: f.file, errors: [f.error] }))]);
    }

    setUploading(false);
    setUploadProgress({});
    
    // Notify parent component
    if (onUploadComplete && successful.length > 0) {
      onUploadComplete(successful);
    }

    // Close dialog if open
    setDialogOpen(false);
    setPendingFiles([]);
  };

  // Handle dialog submit
  const handleDialogSubmit = () => {
    uploadFiles(pendingFiles);
  };

  // Remove uploaded file from display
  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Clear errors
  const clearError = (index) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all errors
  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : uploading ? 'grey.50' : 'background.paper',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          opacity: uploading ? 0.7 : 1,
          '&:hover': {
            borderColor: uploading ? 'grey.300' : 'primary.main',
            backgroundColor: uploading ? 'grey.50' : 'primary.50'
          }
        }}
      >
        <input {...getInputProps()} />
        
        <UploadIcon 
          sx={{ 
            fontSize: 48, 
            color: isDragActive ? 'primary.main' : 'grey.400',
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive 
            ? 'Drop files here...' 
            : uploading 
              ? 'Uploading...' 
              : 'Drag & drop files here, or click to select'
          }
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Supported types: {allowedTypes.map(type => 
            fileTypeConfig[type]?.extensions.join(', ') || type
          ).join(' • ')}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Maximum {maxFiles} files, up to {formatFileSize(fileTypeConfig.video?.maxSize || 100 * 1024 * 1024)} each
        </Typography>

        {!uploading && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            sx={{ mt: 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            Choose Files
          </Button>
        )}
      </Paper>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([fileId, progress]) => {
            const fileData = pendingFiles.find(f => f.id === fileId);
            return (
              <Box key={fileId} sx={{ mb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2">
                    {fileData?.file.name || 'Uploading...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Upload Errors */}
      {errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {errors.map((error, index) => (
            <Alert
              key={index}
              severity="error"
              action={
                <IconButton
                  size="small"
                  onClick={() => clearError(index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
              sx={{ mb: 1 }}
            >
              <strong>{error.file}:</strong> {error.errors.join(', ')}
            </Alert>
          ))}
          
          {errors.length > 1 && (
            <Button
              size="small"
              onClick={clearAllErrors}
              sx={{ mt: 1 }}
            >
              Clear All Errors
            </Button>
          )}
        </Box>
      )}

      {/* Successfully Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          
          <List>
            {uploadedFiles.map((file) => {
              const FileIconComponent = getFileIcon(file.name);
              return (
                <ListItem key={file.id} divider>
                  <FileIconComponent 
                    sx={{ 
                      mr: 2, 
                      color: getFileTypeColor(file.name) 
                    }} 
                  />
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(file.size)} • {file.category}
                        </Typography>
                        <Chip 
                          label="Uploaded" 
                          color="success" 
                          size="small" 
                          icon={<SuccessIcon />}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeUploadedFile(file.id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}

      {/* Upload Settings Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You're uploading {pendingFiles.length} files. Configure the upload settings below.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={uploadSettings.category}
              onChange={(e) => setUploadSettings(prev => ({ ...prev, category: e.target.value }))}
              label="Category"
            >
              {categoryOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Description (optional)"
            value={uploadSettings.description}
            onChange={(e) => setUploadSettings(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={2}
            placeholder="Add a description for these files..."
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Files to upload:
            </Typography>
            {pendingFiles.map((fileData) => (
              <Chip
                key={fileData.id}
                label={`${fileData.file.name} (${formatFileSize(fileData.file.size)})`}
                sx={{ mr: 1, mb: 1 }}
                size="small"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDialogSubmit} 
            variant="contained"
            disabled={uploading}
          >
            Upload Files
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
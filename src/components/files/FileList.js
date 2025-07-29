import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  InsertDriveFile as DocumentIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import firebaseService from '../../services/firebase/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

const FileList = ({ 
  projectId = null, 
  milestoneId = null, 
  category = null,
  onFileUpdate,
  showUploadedBy = true,
  allowDelete = true,
  onUpload = null,
  onRefresh = null,
  refreshLoading = false,
  refreshTrigger = 0
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  });
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);

  // File type configurations
  const fileTypeConfig = {
    video: {
      icon: VideoIcon,
      color: '#1976d2',
      label: 'Video'
    },
    document: {
      icon: DocumentIcon,
      color: '#d32f2f',
      label: 'Document'
    },
    image: {
      icon: ImageIcon,
      color: '#388e3c',
      label: 'Image'
    },
    audio: {
      icon: AudioIcon,
      color: '#f57c00',
      label: 'Audio'
    },
    other: {
      icon: FileIcon,
      color: '#666',
      label: 'Other'
    }
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'script', label: 'Script' },
    { value: 'draft', label: 'Draft' },
    { value: 'final', label: 'Final' },
    { value: 'assets', label: 'Assets' },
    { value: 'reference', label: 'Reference' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'video', label: 'Videos' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'audio', label: 'Audio' },
    { value: 'other', label: 'Other' }
  ];

  // Load files
  useEffect(() => {
    loadFiles();
  }, [projectId, milestoneId, category, refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (milestoneId) {
        data = await firebaseService.getMilestoneFiles(milestoneId);
      } else if (projectId) {
        // Pass category as an option to getProjectFiles
        const options = category ? { category } : {};
        data = await firebaseService.getProjectFiles(projectId, options);
      } else {
        data = [];
      }
      
      console.log('FileList loaded files:', data.length, 'for category:', category);
      console.log('First few files:', data.slice(0, 3));
      setFiles(data);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    // Type filter
    if (filters.type && file.type !== filters.type) {
      return false;
    }
    
    // Category filter
    if (filters.category && file.category !== filters.category) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return file.name.toLowerCase().includes(searchLower) ||
             file.uploadedByName?.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Handle file download
  const handleDownload = async (file) => {
    try {
      // Add file to downloading set
      setDownloadingFiles(prev => new Set([...prev, file.id]));
      
      console.log('🔥 Starting download for file:', file.name);
      const downloadData = await firebaseService.downloadFile(file.id);
      
      // Show appropriate message for metadata-only files
      if (downloadData.isMetadataOnly) {
        console.log('📄 Downloading file information for metadata-only file');
        
        // For metadata files, use direct download
        const link = document.createElement('a');
        link.href = downloadData.downloadURL;
        link.download = downloadData.fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        setTimeout(() => URL.revokeObjectURL(downloadData.downloadURL), 1000);
        
      } else if (downloadData.downloadURL && downloadData.downloadURL.includes('firebasestorage.googleapis.com')) {
        console.log('📁 Handling Firebase Storage file download');
        
        // Use Firebase Storage URL with response-content-disposition parameter
        let downloadUrl = downloadData.downloadURL;
        const separator = downloadUrl.includes('?') ? '&' : '?';
        const encodedFilename = encodeURIComponent(downloadData.fileName);
        downloadUrl += `${separator}response-content-disposition=attachment%3B%20filename%3D"${encodedFilename}"`;
        
        console.log('🔄 Opening download URL:', downloadUrl);
        
        // Open the download URL directly in a new window
        // This bypasses CORS issues and respects content-disposition headers
        const downloadWindow = window.open(downloadUrl, '_blank');
        
        // For browsers that block popups, provide fallback
        if (!downloadWindow) {
          console.log('🔄 Popup blocked, using direct navigation');
          window.location.href = downloadUrl;
        }
        
      } else {
        console.log('📁 Downloading file with direct URL');
        
        // For other files (base64, etc.), use direct download
        const link = document.createElement('a');
        link.href = downloadData.downloadURL;
        link.download = downloadData.fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Update download count in UI
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, downloadCount: (f.downloadCount || 0) + 1 } : f
      ));

      if (onFileUpdate) {
        onFileUpdate();
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file: ' + err.message);
    } finally {
      // Remove file from downloading set
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Handle file delete
  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await firebaseService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      if (onFileUpdate) {
        onFileUpdate();
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file: ' + err.message);
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  // Handle preview
  const handlePreview = (file) => {
    setPreviewDialog({ open: true, file });
    handleMenuClose();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ type: '', category: '', search: '' });
  };

  // Check if user can delete file
  const canDeleteFile = (file) => {
    return allowDelete && (
      user?.role === 'admin' || 
      file.uploadedBy === user?.uid
    );
  };

  // Handle drag events for direct upload
  const handleDrag = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle file drop for direct upload
  const handleDrop = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (onUpload && e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        // Create file objects that match the expected format
        const fileObjects = droppedFiles.map((file, index) => ({
          file,
          id: `${Date.now()}_${index}`,
          category: 'documents', // Default category
          status: 'selected',
          progress: 0
        }));
        onUpload(fileObjects);
      }
    }
  }, [onUpload]);

  // Handle file input change for direct upload
  const handleFileInput = React.useCallback((e) => {
    if (onUpload && e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 0) {
        // Create file objects that match the expected format
        const fileObjects = selectedFiles.map((file, index) => ({
          file,
          id: `${Date.now()}_${index}`,
          category: 'documents', // Default category
          status: 'selected',
          progress: 0
        }));
        onUpload(fileObjects);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onUpload]);

  // Handle click to open file browser
  const handleUploadClick = React.useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Get file icon
  const getFileIcon = (file) => {
    const config = fileTypeConfig[file.type] || fileTypeConfig.other;
    return config.icon;
  };

  // Get file color
  const getFileColor = (file) => {
    const config = fileTypeConfig[file.type] || fileTypeConfig.other;
    return config.color;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Files
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadFiles} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" component="h2">
          Files ({files.length})
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search files"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <FormControl size="small" sx={{ width: '150px' }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                {typeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <FormControl size="small" sx={{ width: '150px' }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                {categoryOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {(filters.type || filters.category || filters.search) && (
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="small"
              >
                Clear
              </Button>
            </Grid>
          )}
          
          {onRefresh && (
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={refreshLoading}
                size="small"
                sx={{ height: '40px', minWidth: '100px' }} // Match dropdown height and width
              >
                Refresh
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Upload Area - Always available when onUpload exists */}
      {onUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
            accept="*/*"
          />
          <Box 
            textAlign="center" 
            py={2}
            mb={3}
            sx={{ 
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              backgroundColor: dragActive ? 'primary.50' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50'
              }
            }}
            onClick={handleUploadClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Tooltip title="Click to select files or drag & drop here">
              <IconButton 
                onClick={handleUploadClick}
                sx={{ 
                  p: 2,
                  borderRadius: 4,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', transition: 'color 0.2s ease-in-out' }} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {files.length === 0 ? 'Click to upload your first files' : 'Click to add more files'}
            </Typography>
          </Box>
        </>
      )}

      {/* Empty State Message */}
      {filteredFiles.length === 0 ? (
        <Box textAlign="center" py={4}>
          <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {files.length === 0 ? 'No files uploaded yet' : 'No files match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {files.length === 0 
              ? onUpload ? 'Use the upload area above to add your first files' : 'Files will appear here once uploaded'
              : 'Try adjusting your search criteria or use the upload area above to add more files'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredFiles.map((file) => {
            const FileIconComponent = getFileIcon(file);
            return (
              <Grid item xs={12} sm={6} md={4} key={file.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    {/* File Icon and Type */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          backgroundColor: getFileColor(file),
                          width: 40,
                          height: 40,
                          mr: 1
                        }}
                      >
                        <FileIconComponent />
                      </Avatar>
                      <Box flex={1}>
                        <Chip
                          label={fileTypeConfig[file.type]?.label || 'File'}
                          size="small"
                          sx={{
                            backgroundColor: getFileColor(file),
                            color: 'white'
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, file)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* File Name */}
                    <Tooltip title={file.name}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>

                    {/* File Details */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                      
                      {file.category && (
                        <Chip
                          label={file.category}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>

                    {/* Upload Info */}
                    {showUploadedBy && (
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {file.uploadedByName || 'Unknown'}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={1}>
                      <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(file.createdAt)}
                      </Typography>
                    </Box>

                    {/* Download Count */}
                    {file.downloadCount > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {file.downloadCount} download{file.downloadCount !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={downloadingFiles.has(file.id) ? <CircularProgress size={16} /> : <DownloadIcon />}
                      onClick={() => handleDownload(file)}
                      disabled={downloadingFiles.has(file.id)}
                      sx={{ flex: 1 }}
                    >
                      {downloadingFiles.has(file.id) ? 'Downloading...' : 'Download'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem 
          onClick={() => handleDownload(selectedFile)}
          disabled={downloadingFiles.has(selectedFile?.id)}
        >
          {downloadingFiles.has(selectedFile?.id) ? 
            <CircularProgress size={20} sx={{ mr: 1 }} /> : 
            <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          }
          {downloadingFiles.has(selectedFile?.id) ? 'Downloading...' : 'Download'}
        </MenuItem>
        
        {selectedFile?.type === 'image' && (
          <MenuItem onClick={() => handlePreview(selectedFile)}>
            <PreviewIcon sx={{ mr: 1, fontSize: 20 }} />
            Preview
          </MenuItem>
        )}

        {selectedFile && canDeleteFile(selectedFile) && (
          <MenuItem 
            onClick={() => handleDelete(selectedFile.id)} 
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.file?.name}
        </DialogTitle>
        <DialogContent>
          {previewDialog.file?.type === 'image' && (
            <Box textAlign="center">
              <img
                src={previewDialog.file.downloadURL}
                alt={previewDialog.file.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, file: null })}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={downloadingFiles.has(previewDialog.file?.id) ? <CircularProgress size={16} /> : <DownloadIcon />}
            disabled={downloadingFiles.has(previewDialog.file?.id)}
            onClick={() => {
              handleDownload(previewDialog.file);
              setPreviewDialog({ open: false, file: null });
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileList;
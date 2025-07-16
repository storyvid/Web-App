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
  Tooltip
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
  AccessTime as TimeIcon
} from '@mui/icons-material';
import firebaseService from '../../services/firebase/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

const FileList = ({ 
  projectId = null, 
  milestoneId = null, 
  onFileUpdate,
  showUploadedBy = true,
  allowDelete = true 
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  });
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });

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
  }, [projectId, milestoneId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (milestoneId) {
        data = await firebaseService.getMilestoneFiles(milestoneId);
      } else if (projectId) {
        data = await firebaseService.getProjectFiles(projectId);
      } else {
        data = [];
      }
      
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
      const downloadData = await firebaseService.downloadFile(file.id);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadData.downloadURL;
      link.download = downloadData.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
            <FormControl fullWidth size="small">
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
            <FormControl fullWidth size="small">
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
        </Grid>
      </Box>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Box 
          textAlign="center" 
          py={4}
          sx={{ 
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50'
          }}
        >
          <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {files.length === 0 ? 'No files uploaded yet' : 'No files match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {files.length === 0 
              ? 'Files will appear here once uploaded' 
              : 'Try adjusting your search criteria'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredFiles.map((file) => {
            const FileIconComponent = getFileIcon(file);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
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
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(file)}
                      sx={{ flex: 1 }}
                    >
                      Download
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
        <MenuItem onClick={() => handleDownload(selectedFile)}>
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Download
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
            startIcon={<DownloadIcon />}
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
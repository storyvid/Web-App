import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Skeleton,
  Alert,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  InsertDriveFile as DocumentIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebase/firebaseService';

const RecentFilesWidget = ({ 
  projectId = null,
  title = "Recent Files",
  maxItems = 5,
  showProjectName = true,
  onFileClick = null,
  onViewAll = null
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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
      label: 'File'
    }
  };

  // Load recent files
  useEffect(() => {
    loadRecentFiles();
  }, [projectId, user?.uid]);

  const loadRecentFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (projectId) {
        // Get files for specific project
        data = await firebaseService.getProjectFiles(projectId, { limitCount: maxItems });
      } else {
        // Get user's recent files across all projects
        const userProjects = await firebaseService.getUserProjects(user?.uid);
        const allFiles = [];
        
        for (const project of userProjects) {
          const projectFiles = await firebaseService.getProjectFiles(project.id, { limitCount: 10 });
          // Add project name to each file
          projectFiles.forEach(file => {
            file.projectName = project.name;
          });
          allFiles.push(...projectFiles);
        }
        
        // Sort by creation date and take most recent
        data = allFiles
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, maxItems);
      }
      
      setFiles(data);
    } catch (err) {
      console.error('Error loading recent files:', err);
      setError('Failed to load recent files');
    } finally {
      setLoading(false);
    }
  };

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
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get file icon component
  const getFileIcon = (file) => {
    const config = fileTypeConfig[file.type] || fileTypeConfig.other;
    return config.icon;
  };

  // Get file color
  const getFileColor = (file) => {
    const config = fileTypeConfig[file.type] || fileTypeConfig.other;
    return config.color;
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

      // Update download count locally
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, downloadCount: (f.downloadCount || 0) + 1 } : f
      ));

    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, file) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  // Handle file click
  const handleFileClick = (file) => {
    if (onFileClick) {
      onFileClick(file);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          {[1, 2, 3].map((i) => (
            <Box key={i} display="flex" alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box flex={1}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
              <Skeleton variant="rectangular" width={60} height={24} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader 
          title={title}
          avatar={<FolderIcon color="action" />}
        />
        <CardContent>
          <Box textAlign="center" py={3}>
            <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No files yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Files will appear here once uploaded
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title={title}
        avatar={<FolderIcon color="primary" />}
        action={
          <Tooltip title="View all files">
            <IconButton size="small" onClick={onViewAll}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        }
      />
      
      <CardContent sx={{ pt: 0 }}>
        <List disablePadding>
          {files.map((file, index) => {
            const FileIconComponent = getFileIcon(file);
            
            return (
              <ListItem
                key={file.id}
                disablePadding
                sx={{
                  mb: index < files.length - 1 ? 1 : 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: onFileClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: onFileClick ? 'action.hover' : 'inherit'
                  }
                }}
                onClick={() => handleFileClick(file)}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar
                    sx={{
                      backgroundColor: getFileColor(file),
                      width: 40,
                      height: 40
                    }}
                  >
                    <FileIconComponent />
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600} 
                        noWrap
                        sx={{ maxWidth: 200 }}
                      >
                        {file.name}
                      </Typography>
                      {showProjectName && file.projectName && (
                        <Typography variant="caption" color="text.secondary">
                          {file.projectName}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box mt={0.5}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Chip
                          label={fileTypeConfig[file.type]?.label || 'File'}
                          size="small"
                          sx={{
                            backgroundColor: getFileColor(file),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                        {file.category && (
                          <Chip
                            label={file.category}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(file.createdAt)}
                        </Typography>
                        {file.downloadCount > 0 && (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.downloadCount} downloads
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center">
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, file)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </CardContent>

      {files.length >= maxItems && (
        <CardActions>
          <Button size="small" fullWidth onClick={onViewAll}>
            View All Files
          </Button>
        </CardActions>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          handleDownload(selectedFile);
          handleMenuClose();
        }}>
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Download
        </MenuItem>
        
        {selectedFile?.type === 'image' && (
          <MenuItem onClick={() => {
            // Handle preview
            handleMenuClose();
          }}>
            <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
            Preview
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default RecentFilesWidget;
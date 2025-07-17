import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Fullscreen as FullscreenIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

import { formatFileSize, getFileIcon } from '../../utils/fileValidation';
import { canPreviewFile } from '../../utils/fileCategorization';
import fileService from '../../services/fileService';

const FilePreview = ({ 
  file, 
  open, 
  onClose, 
  onEdit = null,
  onDownload = null,
  onShare = null,
  allowEdit = true,
  allowDownload = true,
  allowShare = true 
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Load preview when file changes
  useEffect(() => {
    if (!file || !open) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    if (canPreviewFile(file.type)) {
      loadPreview();
    }
  }, [file, open]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For mock implementation, use the download URL
      const url = await fileService.getFileDownloadUrl(file.id, file.projectId);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Failed to load preview:', err);
      setError('Failed to load file preview');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        if (onEdit) onEdit(file);
        break;
      case 'download':
        if (onDownload) {
          onDownload(file);
        } else {
          // Default download behavior
          window.open(previewUrl || file.downloadUrl, '_blank');
        }
        break;
      case 'share':
        if (onShare) onShare(file);
        break;
      case 'fullscreen':
        setFullscreen(true);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType.startsWith('video/')) return <VideoIcon sx={{ fontSize: 64 }} />;
    if (fileType.startsWith('image/')) return <ImageIcon sx={{ fontSize: 64 }} />;
    if (fileType.startsWith('audio/')) return <AudioIcon sx={{ fontSize: 64 }} />;
    if (fileType === 'application/pdf') return <PdfIcon sx={{ fontSize: 64 }} />;
    if (fileType.includes('word') || fileType.includes('document')) return <DocumentIcon sx={{ fontSize: 64 }} />;
    return <FileIcon sx={{ fontSize: 64 }} />;
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight={300}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading preview...
            </Typography>
          </Stack>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!canPreviewFile(file.type)) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight={300}
          textAlign="center"
        >
          {getFileTypeIcon(file.type)}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {file.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Preview not available for this file type
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleAction('download')}
          >
            Download to view
          </Button>
        </Box>
      );
    }

    // Render based on file type
    if (file.type.startsWith('image/')) {
      return (
        <Box textAlign="center">
          <Card>
            <CardMedia
              component="img"
              image={previewUrl}
              alt={file.name}
              sx={{ 
                maxHeight: 400,
                objectFit: 'contain',
                backgroundColor: 'grey.100'
              }}
            />
          </Card>
          {allowDownload && (
            <Button
              startIcon={<FullscreenIcon />}
              onClick={() => handleAction('fullscreen')}
              sx={{ mt: 1 }}
            >
              View Fullscreen
            </Button>
          )}
        </Box>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <Box textAlign="center">
          <video
            controls
            style={{ 
              maxWidth: '100%', 
              maxHeight: 400,
              backgroundColor: '#000'
            }}
          >
            <source src={previewUrl} type={file.type} />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <Box textAlign="center">
          <iframe
            src={previewUrl}
            width="100%"
            height="400px"
            style={{ border: 'none' }}
            title={file.name}
          />
        </Box>
      );
    }

    if (file.type === 'text/plain') {
      return (
        <Box>
          <Typography variant="body2" component="pre" sx={{ 
            whiteSpace: 'pre-wrap',
            maxHeight: 400,
            overflow: 'auto',
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
            {/* In real implementation, you'd fetch and display text content */}
            Loading text content...
          </Typography>
        </Box>
      );
    }

    return (
      <Box textAlign="center" py={4}>
        {getFileTypeIcon(file.type)}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Preview not supported for this file type
        </Typography>
      </Box>
    );
  };

  const renderFullscreenDialog = () => (
    <Dialog
      open={fullscreen}
      onClose={() => setFullscreen(false)}
      maxWidth={false}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'black',
          margin: 0,
          maxHeight: '100vh',
          maxWidth: '100vw'
        }
      }}
    >
      <DialogActions sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <IconButton 
          onClick={() => setFullscreen(false)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogActions>
      <DialogContent sx={{ p: 0, textAlign: 'center' }}>
        {file.type.startsWith('image/') && (
          <img
            src={previewUrl}
            alt={file.name}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100vh',
              objectFit: 'contain'
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  if (!file) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" component="div">
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.size)} • {file.type}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {/* File Preview */}
          {renderPreview()}

          <Divider sx={{ my: 2 }} />

          {/* File Details */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                File Details
              </Typography>
              
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Category:
                  </Typography>
                  <Chip 
                    label={file.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Uploaded:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(file.uploadedAt).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    File Size:
                  </Typography>
                  <Typography variant="body2">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
                
                {file.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Description:
                    </Typography>
                    <Typography variant="body2">
                      {file.description}
                    </Typography>
                  </Box>
                )}
                
                {file.tags && file.tags.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tags:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {file.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions>
          <Stack direction="row" spacing={1}>
            {allowShare && (
              <Button
                startIcon={<ShareIcon />}
                onClick={() => handleAction('share')}
              >
                Share
              </Button>
            )}
            
            {allowEdit && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => handleAction('edit')}
              >
                Edit
              </Button>
            )}
            
            {allowDownload && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleAction('download')}
              >
                Download
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Dialog */}
      {renderFullscreenDialog()}
    </>
  );
};

export default FilePreview;
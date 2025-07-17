import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Badge,
  Stack,
  Button,
  Typography,
  Alert,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Receipt as InvoiceIcon,
  Gavel as LicenseIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { FILE_CATEGORIES } from '../../utils/fileCategorization';
import fileService from '../../services/fileService';
import FileList from './FileList';
import FileUploadDropzone from './FileUploadDropzone';
import FilePreview from './FilePreview';

const FileCategoryTabs = ({ 
  projectId, 
  allowUpload = true, 
  allowDelete = true, 
  allowEdit = true,
  defaultCategory = 'videos',
  onFileAction = null 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultCategory);
  const [fileStats, setFileStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Category icons mapping
  const categoryIcons = {
    videos: VideoIcon,
    invoices: InvoiceIcon,
    licenses: LicenseIcon,
    documents: DocumentIcon,
    images: ImageIcon
  };

  // Available categories based on user role and configuration
  const availableCategories = Object.keys(FILE_CATEGORIES);

  // Load file statistics
  const loadFileStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await fileService.getProjectFileStats(projectId);
      setFileStats(stats.categories);
    } catch (err) {
      console.error('Failed to load file stats:', err);
      setError('Failed to load file statistics');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load stats on mount and when refresh trigger changes
  useEffect(() => {
    loadFileStats();
  }, [loadFileStats, refreshTrigger]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setShowUpload(false); // Close upload on tab change
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files) => {
    try {
      const results = await fileService.uploadFiles(projectId, files.map(f => f.file), {
        uploadedBy: user?.uid
      });

      if (results.failed.length > 0) {
        console.warn('Some files failed to upload:', results.failed);
      }

      // Refresh stats and file list
      setRefreshTrigger(prev => prev + 1);
      setShowUpload(false);

      // Notify parent component
      if (onFileAction) {
        onFileAction('upload', results);
      }

      return results;
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  }, [projectId, user, onFileAction]);

  // Handle file selection
  const handleFileSelect = useCallback((file, action) => {
    setSelectedFile(file);
    
    if (action === 'view') {
      setPreviewOpen(true);
    } else if (onFileAction) {
      onFileAction(action, file);
    }
  }, [onFileAction]);

  // Handle file actions from preview
  const handlePreviewAction = useCallback((action, file) => {
    if (action === 'edit') {
      setPreviewOpen(false);
      if (onFileAction) {
        onFileAction('edit', file);
      }
    } else if (action === 'download') {
      if (onFileAction) {
        onFileAction('download', file);
      }
    } else if (action === 'share') {
      if (onFileAction) {
        onFileAction('share', file);
      }
    }
  }, [onFileAction]);

  // Check if user can upload to category
  const canUploadToCategory = useCallback((category) => {
    if (!allowUpload) return false;
    
    // Admin can upload to any category
    if (user?.role === 'admin') return true;
    
    // Staff can upload videos, documents, and images
    if (user?.role === 'staff') {
      return ['videos', 'documents', 'images'].includes(category);
    }
    
    // Clients can upload licenses and documents
    if (user?.role === 'client') {
      return ['licenses', 'documents'].includes(category);
    }
    
    return false;
  }, [allowUpload, user]);

  // Render tab content
  const renderTabContent = () => {
    if (showUpload) {
      return (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Upload {FILE_CATEGORIES[activeTab]?.label}
            </Typography>
            <Button onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
          </Stack>
          
          <FileUploadDropzone
            onFilesSelected={() => {}} // Files are handled on upload
            onUpload={handleFileUpload}
            allowedCategories={[activeTab]}
            maxFiles={10}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <FileList
          projectId={projectId}
          category={activeTab}
          allowUpload={allowUpload}
          allowDelete={allowDelete}
          allowEdit={allowEdit}
          onFileSelect={handleFileSelect}
          refreshTrigger={refreshTrigger}
        />
      </Box>
    );
  };

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
        >
          {availableCategories.map((category) => {
            const IconComponent = categoryIcons[category];
            const categoryConfig = FILE_CATEGORIES[category];
            const count = fileStats[category]?.count || 0;

            return (
              <Tab
                key={category}
                value={category}
                icon={
                  <Badge badgeContent={count} color="primary" showZero>
                    <IconComponent />
                  </Badge>
                }
                label={categoryConfig?.label || category}
                iconPosition="start"
                sx={{ 
                  minHeight: 48,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              />
            );
          })}
        </Tabs>

        {/* Loading indicator */}
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}

        {/* Refresh button */}
        {!loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }}
          >
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => setRefreshTrigger(prev => prev + 1)}
            >
              Refresh
            </Button>
          </Box>
        )}
      </Box>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Upload FAB */}
      {!showUpload && canUploadToCategory(activeTab) && (
        <Fab
          color="primary"
          aria-label="upload files"
          onClick={() => setShowUpload(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* File Preview Dialog */}
      <FilePreview
        file={selectedFile}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedFile(null);
        }}
        onEdit={(file) => handlePreviewAction('edit', file)}
        onDownload={(file) => handlePreviewAction('download', file)}
        onShare={(file) => handlePreviewAction('share', file)}
        allowEdit={allowEdit}
        allowDownload={true}
        allowShare={true}
      />
    </Box>
  );
};

export default FileCategoryTabs;
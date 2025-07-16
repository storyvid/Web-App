import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Fab,
  Badge,
  Paper,
  Collapse,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  List as ListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { useAuth } from '../../contexts/AuthContext';

const FileManager = ({ 
  projectId = null, 
  milestoneId = null,
  title = 'File Manager',
  showTabs = true,
  defaultTab = 0,
  allowUpload = true,
  allowDelete = true,
  compact = false
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [uploadExpanded, setUploadExpanded] = useState(!showTabs);
  const [newFilesCount, setNewFilesCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileListRef = useRef();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Reset new files count when switching to files tab
    if (newValue === 1) {
      setNewFilesCount(0);
    }
  };

  // Handle file upload completion
  const handleUploadComplete = (uploadedFiles) => {
    setNewFilesCount(prev => prev + uploadedFiles.length);
    
    // Show success message
    const fileText = uploadedFiles.length === 1 ? 'file' : 'files';
    showSnackbar(`${uploadedFiles.length} ${fileText} uploaded successfully`, 'success');
    
    // Refresh file list if it's visible
    if (fileListRef.current && (!showTabs || activeTab === 1)) {
      fileListRef.current.loadFiles?.();
    }
    
    // Auto-switch to files tab after upload (if using tabs)
    if (showTabs && activeTab === 0) {
      setTimeout(() => {
        setActiveTab(1);
        setNewFilesCount(0);
      }, 1000);
    }
    
    // Collapse upload section in compact mode
    if (compact) {
      setUploadExpanded(false);
    }
  };

  // Handle file update (download, delete, etc.)
  const handleFileUpdate = () => {
    // Refresh file list
    if (fileListRef.current) {
      fileListRef.current.loadFiles?.();
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if user can upload files
  const canUpload = allowUpload && (
    user?.role === 'admin' || 
    user?.role === 'staff' || 
    user?.role === 'client'
  );

  // Render compact version
  if (compact) {
    return (
      <Box>
        {/* Upload Section */}
        {canUpload && (
          <Paper sx={{ mb: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              sx={{ cursor: 'pointer' }}
              onClick={() => setUploadExpanded(!uploadExpanded)}
            >
              <Box display="flex" alignItems="center">
                <UploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Upload Files
                </Typography>
              </Box>
              <IconButton size="small">
                {uploadExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={uploadExpanded}>
              <Box sx={{ p: 2, pt: 0 }}>
                <FileUpload
                  projectId={projectId}
                  milestoneId={milestoneId}
                  onUploadComplete={handleUploadComplete}
                />
              </Box>
            </Collapse>
          </Paper>
        )}

        {/* File List */}
        <FileList
          ref={fileListRef}
          projectId={projectId}
          milestoneId={milestoneId}
          onFileUpdate={handleFileUpdate}
          allowDelete={allowDelete}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Render full version with tabs
  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {showTabs ? (
        <>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            {canUpload && (
              <Tab
                label="Upload Files"
                icon={<UploadIcon />}
                iconPosition="start"
              />
            )}
            <Tab
              label={
                <Badge badgeContent={newFilesCount} color="primary">
                  Files
                </Badge>
              }
              icon={<ListIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Tab Panels */}
          <Box>
            {/* Upload Tab */}
            {canUpload && activeTab === 0 && (
              <FileUpload
                projectId={projectId}
                milestoneId={milestoneId}
                onUploadComplete={handleUploadComplete}
              />
            )}

            {/* Files Tab */}
            {activeTab === (canUpload ? 1 : 0) && (
              <FileList
                ref={fileListRef}
                projectId={projectId}
                milestoneId={milestoneId}
                onFileUpdate={handleFileUpdate}
                allowDelete={allowDelete}
              />
            )}
          </Box>
        </>
      ) : (
        /* No Tabs - Show Both Sections */
        <Box>
          {/* Upload Section */}
          {canUpload && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Upload Files
              </Typography>
              <FileUpload
                projectId={projectId}
                milestoneId={milestoneId}
                onUploadComplete={handleUploadComplete}
              />
            </Box>
          )}

          {/* Files Section */}
          <FileList
            ref={fileListRef}
            projectId={projectId}
            milestoneId={milestoneId}
            onFileUpdate={handleFileUpdate}
            allowDelete={allowDelete}
          />
        </Box>
      )}

      {/* Floating Upload Button (Mobile) */}
      {canUpload && showTabs && activeTab !== 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={() => setActiveTab(0)}
        >
          <UploadIcon />
        </Fab>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileManager;
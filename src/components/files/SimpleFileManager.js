import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Fab,
  CircularProgress,
  Backdrop,
  Fade,
  Card,
  CardContent
} from '@mui/material';
import {
  Plus as AddIcon
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebase/firebaseService';
import FileList from './FileList';
import FileUploadDropzone from './FileUploadDropzone';
import FilePreview from './FilePreview';

const SimpleFileManager = ({ 
  projectId, 
  allowUpload = true, 
  allowDelete = true, 
  allowEdit = true,
  onFileAction = null 
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load all files for the project (no category filtering)
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📂 Loading all files for project:', projectId);
      const projectFiles = await firebaseService.getProjectFiles(projectId, {
        // No category filter - get all files
        limitCount: 100
      });
      
      console.log('📂 Loaded files:', projectFiles.length);
      setFiles(projectFiles);
    } catch (err) {
      console.error('Failed to load files:', err);
      setError('Failed to load files: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load files on mount and when refresh trigger changes
  useEffect(() => {
    if (projectId) {
      loadFiles();
    }
  }, [loadFiles, refreshTrigger]);

  // Handle file upload
  const handleFileUpload = useCallback(async (uploadedFiles) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      console.log('📤 Starting file upload:', uploadedFiles.length, 'files');
      console.log('📤 First file object:', uploadedFiles[0]);
      console.log('📤 File name:', uploadedFiles[0]?.name);
      console.log('📤 File type:', uploadedFiles[0]?.type);
      
      // Extract the actual File object if it's wrapped
      let fileToUpload = uploadedFiles[0];
      if (fileToUpload && typeof fileToUpload === 'object' && fileToUpload.file && fileToUpload.file instanceof File) {
        console.log('📤 File is wrapped, extracting actual file object');
        fileToUpload = fileToUpload.file;
      } else if (!(fileToUpload instanceof File)) {
        console.error('📤 Invalid file object received:', fileToUpload);
        throw new Error('Invalid file object - expected File instance');
      }
      
      const uploadResults = await firebaseService.uploadFile(fileToUpload, {
        projectId,
        category: 'files', // Single category for all files
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        }
      });

      if (uploadResults) {
        console.log('✅ Upload completed:', uploadResults);
        
        // Small delay to show 100% progress
        setUploadProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger refresh to show new files
        setRefreshTrigger(prev => prev + 1);
        setShowUpload(false);
        
        // Call parent callback if provided
        if (onFileAction) {
          onFileAction('upload', uploadResults);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [projectId, onFileAction]);

  // Handle file preview
  const handleFilePreview = useCallback((file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  }, []);

  // Handle file update (after download, edit, etc.)
  const handleFileUpdate = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Section with smooth transitions */}
      <Box 
        sx={{ 
          mb: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          maxHeight: showUpload ? '500px' : '0px',
          opacity: showUpload ? 1 : 0
        }}
      >
        {allowUpload && (
          <FileUploadDropzone
            onFilesSelected={handleFileUpload}
            acceptTypes="*/*" // Accept all file types
            maxFiles={10}
            allowedCategories={['files']} // Single category
            showCategoryPreview={false} // Don't show category breakdown
          />
        )}
      </Box>

      {/* Files List Container - Fixed height to prevent jumps */}
      <Box sx={{ minHeight: '400px' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : (
          <FileList
            files={files}
            projectId={projectId}
            allowDelete={allowDelete}
            allowEdit={allowEdit}
            onFilePreview={handleFilePreview}
            onFileUpdate={handleFileUpdate}
            onUpload={handleFileUpload}
            onRefresh={handleRefresh}
            refreshLoading={loading}
            showCategory={true} // Show file type/category in the list
          />
        )}
      </Box>

      {/* File Preview Modal */}
      <FilePreview
        file={selectedFile}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Floating Action Button for Upload - Primary upload method */}
      {allowUpload && (
        <Fab
          color="primary"
          aria-label="upload files"
          disabled={uploading}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => setShowUpload(!showUpload)}
        >
          {uploading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
        </Fab>
      )}

      {/* Upload Loading Overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.modal + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={uploading}
      >
        <Fade in={uploading}>
          <Card sx={{ minWidth: 300, textAlign: 'center' }}>
            <CardContent>
              <CircularProgress 
                variant="determinate" 
                value={uploadProgress} 
                size={60}
                sx={{ mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Uploading File...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}% complete
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Backdrop>
    </Box>
  );
};

export default SimpleFileManager;
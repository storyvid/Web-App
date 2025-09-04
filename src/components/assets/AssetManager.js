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
import { styled } from '@mui/material/styles';
import {
  Plus as AddIcon
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebase/firebaseService';
import FileList from '../files/FileList';
import FileUploadDropzone from '../files/FileUploadDropzone';
import FilePreview from '../files/FilePreview';

// Styled components with brand colors
const BrandFab = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFC535 0%, #FF8C42 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFB020 0%, #FF7A30 100%)',
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(255, 197, 53, 0.4)',
  },
  '&:disabled': {
    background: '#ccc',
    color: '#666',
  },
  transition: 'all 0.3s ease-in-out',
}));

const BrandCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 197, 53, 0.05) 0%, rgba(255, 140, 66, 0.05) 100%)',
  border: '1px solid rgba(255, 197, 53, 0.2)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
}));

const AssetManager = ({ 
  userId, 
  userRole = 'client',
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

  // Load all files for the user (no project filtering)
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📂 Loading all assets for user:', userId);
      const userFiles = await firebaseService.getUserFiles(userId, {
        // Get all files, no filtering
        limitCount: 1000 // Increased limit for assets page
      });
      
      console.log('📂 Loaded user assets:', userFiles.length);
      setFiles(userFiles);
    } catch (err) {
      console.error('Failed to load user assets:', err);
      setError('Failed to load assets: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load files on mount and when refresh trigger changes
  useEffect(() => {
    if (userId) {
      loadFiles();
    }
  }, [loadFiles, refreshTrigger, userId]);

  // Handle file upload
  const handleFileUpload = useCallback(async (uploadedFiles) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      console.log('📤 Starting asset upload:', uploadedFiles.length, 'files');
      console.log('📤 First file object:', uploadedFiles[0]);
      
      // Extract the actual File object if it's wrapped
      let fileToUpload = uploadedFiles[0];
      if (fileToUpload && typeof fileToUpload === 'object' && fileToUpload.file && fileToUpload.file instanceof File) {
        console.log('📤 File is wrapped, extracting actual file object');
        fileToUpload = fileToUpload.file;
      } else if (!(fileToUpload instanceof File)) {
        console.error('📤 Invalid file object received:', fileToUpload);
        throw new Error('Invalid file object - expected File instance');
      }
      
      // Upload as user asset (no projectId)
      const uploadResults = await firebaseService.uploadFile(fileToUpload, {
        projectId: null, // No project association for user assets
        category: 'assets', // Category for user assets
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        }
      });

      if (uploadResults) {
        console.log('✅ Asset upload completed:', uploadResults);
        
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
      console.error('Asset upload failed:', err);
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFileAction]);

  // Handle file preview
  const handleFilePreview = useCallback((file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  }, []);

  // Handle file update (after download, edit, etc.)
  const handleFileUpdate = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    if (onFileAction) {
      onFileAction('update', null);
    }
  }, [onFileAction]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Permission checks
  const allowUpload = true; // All users can upload to their assets
  const allowDelete = userRole === 'admin' || userId === user?.uid; // Admin or own files
  const allowEdit = userRole === 'admin' || userId === user?.uid; // Admin or own files

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
            acceptTypes="*/*" // Accept all file types for assets
            maxFiles={10}
            allowedCategories={['assets']} // Single category for assets
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
            projectId={null} // No project context for assets
            allowDelete={allowDelete}
            allowEdit={allowEdit}
            onFilePreview={handleFilePreview}
            onFileUpdate={handleFileUpdate}
            onUpload={allowUpload ? handleFileUpload : null}
            onRefresh={handleRefresh}
            refreshLoading={loading}
            showCategory={true} // Show file type/category in the list
            showUploadedBy={userRole === 'admin'} // Only show uploader for admin
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
        <BrandFab
          aria-label="upload assets"
          disabled={uploading}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => setShowUpload(!showUpload)}
        >
          {uploading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
        </BrandFab>
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
          <BrandCard sx={{ minWidth: 300, textAlign: 'center' }}>
            <CardContent>
              <CircularProgress 
                variant="determinate" 
                value={uploadProgress} 
                size={60}
                sx={{ 
                  mb: 2,
                  color: '#FFC535',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Typography variant="h6" gutterBottom sx={{ color: '#FF8C42', fontWeight: 700 }}>
                Uploading Asset...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}% complete
              </Typography>
            </CardContent>
          </BrandCard>
        </Fade>
      </Backdrop>
    </Box>
  );
};

export default AssetManager;
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { 
  updateUserProfile, 
  updateUserSettings,
  selectUser,
  selectAuthLoading,
  selectAuthError 
} from '../store/slices/authSlice';
import { setTheme } from '../store/slices/uiSlice';
import firebaseService from '../services/firebase/firebaseService';
import { Sidebar, Header } from '../components/DashboardComponents';
import { theme, styles } from './dashboardStyles';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const currentTheme = useSelector(state => state.ui.theme);
  
  // Layout state
  const [activeMenuItem, setActiveMenuItem] = useState('settings');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Mock data for header (consistent with other pages)
  const [data, setData] = useState({
    user: user || {},
    notifications: [
      {
        id: 1,
        title: 'Profile updated',
        message: 'Your profile information has been updated successfully',
        time: '2 hours ago',
        unread: false
      },
      {
        id: 2,
        title: 'Settings saved',
        message: 'Your notification preferences have been saved',
        time: '1 day ago',
        unread: false
      }
    ]
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
    accountType: user?.accountType || ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    pushNotifications: user?.settings?.pushNotifications ?? true,
    soundNotifications: user?.settings?.soundNotifications ?? false,
    darkTheme: currentTheme === 'dark',
    timezone: user?.settings?.timezone || 'America/New_York',
    language: user?.settings?.language || 'en'
  });

  const [success, setSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Profile picture upload state
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // Handle theme change immediately
    if (field === 'darkTheme') {
      dispatch(setTheme(value ? 'dark' : 'light'));
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.uid) return;
    
    setProfileLoading(true);
    setSuccess('');
    
    try {
      await dispatch(updateUserProfile({ 
        uid: user.uid, 
        updates: profileData 
      })).unwrap();
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!user?.uid) return;
    
    setSettingsLoading(true);
    setSuccess('');
    
    try {
      await dispatch(updateUserSettings({ 
        uid: user.uid, 
        settings: settings 
      })).unwrap();
      
      setSuccess('Settings updated successfully!');
    } catch (err) {
      console.error('Settings update failed:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Profile picture upload handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setSuccess('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setSuccess('File size must be less than 5MB.');
      return;
    }

    setAvatarLoading(true);
    setSuccess('');

    try {
      const result = await firebaseService.uploadProfilePicture(user.uid, file);
      
      // Update local profile data
      await dispatch(updateUserProfile({ 
        uid: user.uid, 
        updates: { avatar: result.downloadURL }
      })).unwrap();
      
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setSuccess('Failed to upload profile picture. Please try again.');
    } finally {
      setAvatarLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Password change handlers
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setSuccess('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSuccess('New password and confirmation do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSuccess('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    setSuccess('');

    try {
      await firebaseService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setSuccess('Password changed successfully!');
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password change failed:', err);
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak.';
      }
      
      setSuccess(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Navigation handlers (consistent with other pages)
  const handleMenuItemClick = (menuId) => {
    setActiveMenuItem(menuId);
    
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'settings':
        // Stay on settings page
        break;
      case 'assets':
        console.log('Assets page not implemented yet');
        break;
      case 'services':
        console.log('Services page not implemented yet');
        break;
      default:
        break;
    }
  };

  const handleMobileMenuClick = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'warning';
      case 'client': return 'primary';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Please log in to view your settings</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={styles.dashboardContainer}>
        <Sidebar 
          activeItem={activeMenuItem} 
          onMenuItemClick={handleMenuItemClick}
          userRole={user?.role || 'client'}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
          user={user}
        />
        
        <Box sx={styles.mainContent}>
          <Header 
            user={data.user} 
            notifications={data.notifications}
            onMobileMenuClick={handleMobileMenuClick}
          />
          
          <Box sx={styles.contentWrapper}>
            <Box sx={styles.leftContent}>
              {/* Page Header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Settings & Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your account settings and preferences
                </Typography>
              </Box>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {/* Profile Overview */}
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                        <Avatar 
                          src={user.avatar} 
                          sx={{ width: 100, height: 100, mx: 'auto' }}
                        >
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: -8,
                            right: -8,
                            bgcolor: 'primary.main',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              bgcolor: 'primary.dark'
                            }
                          }}
                          onClick={handleAvatarClick}
                          disabled={avatarLoading}
                        >
                          {avatarLoading ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <PhotoCameraIcon fontSize="small" />
                          )}
                        </IconButton>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarUpload}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </Box>
                      
                      <Typography variant="h6" gutterBottom>
                        {user.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {user.email}
                      </Typography>
                      
                      <Chip 
                        label={user.role?.toUpperCase()} 
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {user.company}
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setPasswordDialogOpen(true)}
                        sx={{ mt: 1 }}
                      >
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Profile Information */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Profile Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={profileData.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={profileData.company}
                          onChange={(e) => handleProfileChange('company', e.target.value)}
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Account Type"
                          value={profileData.accountType}
                          onChange={(e) => handleProfileChange('accountType', e.target.value)}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleUpdateProfile}
                        disabled={profileLoading || loading}
                        startIcon={profileLoading && <CircularProgress size={20} />}
                      >
                        {profileLoading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </Box>
                  </Paper>

                  {/* User Settings */}
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Preferences & Settings
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Notifications
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                          />
                        }
                        label="Email Notifications"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushNotifications}
                            onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
                          />
                        }
                        label="Push Notifications"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.soundNotifications}
                            onChange={(e) => handleSettingsChange('soundNotifications', e.target.checked)}
                          />
                        }
                        label="Sound Notifications"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Appearance
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.darkTheme}
                            onChange={(e) => handleSettingsChange('darkTheme', e.target.checked)}
                          />
                        }
                        label="Dark Theme"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Localization
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Timezone"
                            value={settings.timezone}
                            onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Language"
                            value={settings.language}
                            onChange={(e) => handleSettingsChange('language', e.target.value)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleUpdateSettings}
                        disabled={settingsLoading || loading}
                        startIcon={settingsLoading && <CircularProgress size={20} />}
                      >
                        {settingsLoading ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Password Change Dialog */}
              <Dialog 
                open={passwordDialogOpen} 
                onClose={() => setPasswordDialogOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                  <Box sx={{ pt: 1 }}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              edge="end"
                            >
                              {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      margin="normal"
                      helperText="Password must be at least 6 characters long"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              edge="end"
                            >
                              {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              edge="end"
                            >
                              {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button 
                    onClick={() => setPasswordDialogOpen(false)}
                    disabled={passwordLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePasswordSubmit}
                    disabled={passwordLoading}
                    startIcon={passwordLoading && <CircularProgress size={20} />}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Settings;
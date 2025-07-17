import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
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
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
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
  
  // Mock data for header
  const [data] = useState({
    user: user || {},
    notifications: [
      {
        id: 1,
        title: 'Profile updated',
        message: 'Your profile information has been updated successfully',
        time: '2 hours ago',
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

  // Handlers
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith('image/')) {
      setSuccess('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSuccess('File size must be less than 5MB.');
      return;
    }

    setAvatarLoading(true);
    setSuccess('');

    try {
      const result = await firebaseService.uploadProfilePicture(user.uid, file);
      
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

              {/* Main Content Grid */}
              <Grid container spacing={3}>
                {/* Profile Information Card */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Profile Information
                      </Typography>
                      
                      <Grid container spacing={4} alignItems="stretch">
                        {/* Left Column: Profile Overview */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            textAlign: 'center',
                            height: '100%',
                            py: 2
                          }}>
                            {/* Avatar Section */}
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                <Avatar 
                                  src={user.avatar} 
                                  sx={{ 
                                    width: 120, 
                                    height: 120,
                                    border: '4px solid',
                                    borderColor: 'primary.main',
                                    boxShadow: 3
                                  }}
                                >
                                  <PersonIcon sx={{ fontSize: 50 }} />
                                </Avatar>
                                
                                <IconButton
                                  sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 36,
                                    height: 36,
                                    '&:hover': { bgcolor: 'primary.dark' }
                                  }}
                                  onClick={handleAvatarClick}
                                  disabled={avatarLoading}
                                >
                                  {avatarLoading ? (
                                    <CircularProgress size={18} color="inherit" />
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
                              
                              <Typography variant="h5" fontWeight={700} gutterBottom>
                                {user.name}
                              </Typography>
                              
                              <Typography variant="body1" color="text.secondary" gutterBottom>
                                {user.email}
                              </Typography>
                              
                              {user.company && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {user.company}
                                </Typography>
                              )}
                              
                              <Chip 
                                label={user.role?.toUpperCase()} 
                                color={getRoleColor(user.role)}
                                size="medium"
                                sx={{ mb: 2, fontWeight: 600 }}
                              />
                            </Box>
                            
                            {/* Change Password Button - Moved to bottom */}
                            <Box sx={{ mt: 'auto', width: '100%', maxWidth: 250 }}>
                              <Button
                                variant="outlined"
                                startIcon={<SecurityIcon />}
                                size="large"
                                fullWidth
                                onClick={() => setPasswordDialogOpen(true)}
                                sx={{ py: 1.5 }}
                              >
                                Change Password
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Right Column: Profile Form */}
                        <Grid item xs={12} md={8}>
                          <Box sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            py: 2
                          }}>
                            <Grid container spacing={3}>
                              {/* Full Name */}
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Full Name"
                                  value={profileData.name}
                                  onChange={(e) => handleProfileChange('name', e.target.value)}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PersonIcon />
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              </Grid>
                              
                              {/* Company and Account Type Row */}
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Company"
                                  value={profileData.company}
                                  onChange={(e) => handleProfileChange('company', e.target.value)}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <BusinessIcon />
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Account Type"
                                  value={profileData.accountType}
                                  onChange={(e) => handleProfileChange('accountType', e.target.value)}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <BadgeIcon />
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              </Grid>
                              
                              {/* Phone */}
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Phone"
                                  value={profileData.phone}
                                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                                  placeholder="+1 (555) 123-4567"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PhoneIcon />
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              </Grid>
                            </Grid>
                            
                            {/* Update Profile Button - Aligned to right */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                              <Button
                                variant="contained"
                                onClick={handleUpdateProfile}
                                disabled={profileLoading || loading}
                                startIcon={profileLoading ? <CircularProgress size={20} /> : <PersonIcon />}
                                size="large"
                                sx={{ minWidth: 200, py: 1.5 }}
                              >
                                {profileLoading ? 'Updating...' : 'Update Profile'}
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Preferences & Settings Card */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Preferences & Settings
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Email Notifications */}
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Email Notifications
                                </Typography>
                              </Box>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={settings.emailNotifications}
                                    onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label="Receive email notifications"
                                sx={{ ml: 0 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Appearance */}
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Appearance
                                </Typography>
                              </Box>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={settings.darkTheme}
                                    onChange={(e) => handleSettingsChange('darkTheme', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label="Dark theme"
                                sx={{ ml: 0 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Localization */}
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Localization
                                </Typography>
                              </Box>
                              <TextField
                                fullWidth
                                label="Timezone"
                                value={settings.timezone}
                                onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                                size="small"
                                sx={{ mb: 2 }}
                              />
                              <TextField
                                fullWidth
                                label="Language"
                                value={settings.language}
                                onChange={(e) => handleSettingsChange('language', e.target.value)}
                                size="small"
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      {/* Save Settings Button - Aligned to left */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                          variant="contained"
                          onClick={handleUpdateSettings}
                          disabled={settingsLoading || loading}
                          startIcon={settingsLoading ? <CircularProgress size={20} /> : <NotificationsIcon />}
                          size="large"
                          sx={{ minWidth: 200, py: 1.5 }}
                        >
                          {settingsLoading ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
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
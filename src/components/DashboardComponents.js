import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  InputAdornment,
  IconButton,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Stack,
  Menu,
  MenuItem,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Home as HomeIcon,
  Folder as FolderIcon,
  CalendarMonth as CalendarIcon,
  Description as ReportsIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Menu as MenuIcon,
  BusinessCenter as ServicesIcon,
  PermMedia as AssetsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  AttachFile as FileIcon,
  CloudUpload as UploadIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styles } from '../pages/dashboardStyles';

// Sidebar Content Component (reusable for both desktop and mobile)
const SidebarContent = ({ activeItem, onMenuItemClick, userRole, onItemClick, user }) => {
  const [teamMenuAnchor, setTeamMenuAnchor] = useState(null);
  
  const getRoleMenuItems = (role) => {
    const baseMenuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
      { id: 'projects', label: 'Projects', icon: FolderIcon },
      { id: 'assets', label: 'Assets', icon: AssetsIcon },
      { id: 'services', label: 'Services', icon: ServicesIcon },
      { id: 'settings', label: 'Settings', icon: SettingsIcon }
    ];

    // Add admin-specific menu items
    if (role === 'admin') {
      const adminItems = [
        { id: 'admin-projects', label: 'Manage Projects', icon: FolderIcon },
        { id: 'admin-users', label: 'Manage Users', icon: PersonIcon }
      ];
      
      // Insert admin items after projects but before assets
      const projectsIndex = baseMenuItems.findIndex(item => item.id === 'projects');
      baseMenuItems.splice(projectsIndex + 1, 0, ...adminItems);
    }
    
    return baseMenuItems;
  };

  const menuItems = getRoleMenuItems(userRole);

  const handleMenuClick = (itemId) => {
    onMenuItemClick(itemId);
    if (onItemClick) onItemClick(); // Close mobile drawer
  };

  return (
    <Box sx={{ pt: 0, mt: 0 }}>
      {/* Logo - container height matches header, logo vertically centered */}
      <Box sx={{ 
        px: 3, 
        py: 0, 
        mt: 0,
        mb: '10px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        height: 100, // Increase container height to accommodate larger logo
        overflow: 'hidden'
      }}>
        <img 
          src="/storyvid_logo_optimized.svg" 
          alt="StoryVid" 
          style={{ 
            width: '162.12px',
            height: '162.12px'
          }} 
        />
      </Box>
      
      
      <Stack spacing={0.5} sx={{ px: 2, flex: 1 }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;
          return (
            <Button
              key={item.id}
              startIcon={<Icon />}
              sx={styles.menuItem(isActive)}
              fullWidth
              onClick={() => handleMenuClick(item.id)}
            >
              <Typography variant="body1" fontWeight={500}>
                {item.label}
              </Typography>
            </Button>
          );
        })}
      </Stack>
      
      {/* Mobile app promotion removed */}
      
      {/* Workspace selector - Hidden as requested */}
      {/* <Box sx={{ mt: 'auto', p: 2 }}>
        <Paper 
          sx={{
            ...styles.teamSelector,
            width: '100%',
            justifyContent: 'center'
          }} 
          onClick={(e) => setTeamMenuAnchor(e.currentTarget)}
        >
          <Typography variant="body2" fontWeight={500}>
            {user?.company || 'My Workspace'}
          </Typography>
          <ArrowDownIcon fontSize="small" />
        </Paper>

        <Menu
          anchorEl={teamMenuAnchor}
          open={Boolean(teamMenuAnchor)}
          onClose={() => setTeamMenuAnchor(null)}
        >
          <MenuItem onClick={() => setTeamMenuAnchor(null)}>Switch Workspace</MenuItem>
          <MenuItem onClick={() => setTeamMenuAnchor(null)}>Production Settings</MenuItem>
          <MenuItem onClick={() => setTeamMenuAnchor(null)}>Invite Collaborators</MenuItem>
        </Menu>
      </Box> */}
    </Box>
  );
};

// Sidebar Component with Mobile Drawer
export const Sidebar = ({ activeItem, onMenuItemClick, userRole, mobileOpen, onMobileClose, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            ...styles.mobileSidebar,
          },
        }}
      >
        <SidebarContent 
          activeItem={activeItem} 
          onMenuItemClick={onMenuItemClick} 
          userRole={userRole}
          onItemClick={onMobileClose}
          user={user}
        />
      </Drawer>
    );
  }

  return (
    <Box sx={styles.sidebar}>
      <SidebarContent 
        activeItem={activeItem} 
        onMenuItemClick={onMenuItemClick} 
        userRole={userRole}
        user={user}
      />
    </Box>
  );
};

// Header Component
export const Header = ({ user, notifications, onMobileMenuClick }) => {
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const unreadNotifications = notifications?.filter(n => n.unread).length || 0;


  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setUserMenuAnchor(null);
    setNotificationAnchor(null);
  };

  const handleSearch = (event) => {
    setSearchValue(event.target.value);
    console.log('Searching for:', event.target.value);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  return (
    <Box sx={styles.header}>
      <IconButton 
        size="small" 
        onClick={onMobileMenuClick}
        sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      
      {/* Search field hidden as requested */}
      {/* <TextField
        placeholder="Search"
        size="small"
        value={searchValue}
        onChange={handleSearch}
        fullWidth
        sx={{
          ...styles.searchField,
          display: { xs: 'none', sm: 'block' },
          maxWidth: { sm: 400, md: 600, lg: 800 },
          mx: 2
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      
      <IconButton onClick={handleSearch} sx={{ display: { xs: 'block', sm: 'none' }, mr: 2 }}>
        <SearchIcon />
      </IconButton> */}
      
      <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2} sx={{ ml: 'auto' }}>
        
        <IconButton onClick={handleNotificationClick}>
          <Badge badgeContent={unreadNotifications} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(notificationAnchor)}
          anchorEl={notificationAnchor}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ width: 320, maxHeight: 400 }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Notifications
            </Typography>
            <List>
              {notifications?.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.unread ? 'action.hover' : 'transparent',
                    borderLeft: notification.unread ? 3 : 0,
                    borderColor: 'primary.main'
                  }}
                >
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Popover>
        
        <Button sx={styles.userButton} onClick={handleUserMenuClick}>
          <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
          <Box sx={{ textAlign: 'left', ml: 1, lineHeight: 1.2 }}>
            <Typography variant="caption" display="block" fontWeight={500} sx={{ lineHeight: 1.3 }}>
              {user.company}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
              {user.name}
            </Typography>
          </Box>
          <ArrowDownIcon fontSize="small" />
        </Button>

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => { handleClose(); window.location.href = '/settings'; }}>Account Settings</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};

// Stats Card Component
export const StatsCard = ({ icon: Icon, title, value, subtitle, seeAll, onSeeAllClick, statKey }) => {
  // Enhanced styling for urgent stats
  const getStatStyle = (statKey, value) => {
    const styles = {
      pendingApprovals: {
        iconColor: value > 0 ? 'warning.main' : 'text.secondary',
        valueColor: value > 0 ? 'warning.main' : 'text.primary',
        showBadge: value > 0,
        badgeColor: 'warning'
      },
      upcomingDeadlines: {
        iconColor: value > 5 ? 'error.main' : value > 0 ? 'warning.main' : 'text.secondary',
        valueColor: value > 5 ? 'error.main' : value > 0 ? 'warning.main' : 'text.primary',
        showBadge: value > 5,
        badgeColor: value > 5 ? 'error' : 'warning'
      },
      default: {
        iconColor: 'text.secondary',
        valueColor: 'text.primary',
        showBadge: false,
        badgeColor: 'default'
      }
    };
    
    return styles[statKey] || styles.default;
  };

  const statStyle = getStatStyle(statKey, value);

  return (
    <Card sx={styles.statsCard}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              ...styles.statsIcon,
              color: statStyle.iconColor,
              backgroundColor: statStyle.showBadge ? `${statStyle.badgeColor}.50` : 'grey.50'
            }}>
              <Icon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
          </Stack>
          {seeAll && (
            <IconButton size="small" onClick={onSeeAllClick} sx={{ color: 'text.secondary' }}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
          <Typography 
            variant="h3" 
            fontWeight={600}
            sx={{ color: statStyle.valueColor }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              /{subtitle}
            </Typography>
          )}
          {statStyle.showBadge && (
            <Box sx={{ ml: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: statStyle.badgeColor === 'error' ? 'error.main' : 'warning.main',
                  fontWeight: 600
                }}
              >
                {statKey === 'upcomingDeadlines' && value > 5 ? 'Urgent!' : 
                 statKey === 'pendingApprovals' && value > 0 ? 'Action needed' : ''}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Project Card Component
export const ProjectCard = ({ project, onClick }) => {
  const statusColors = {
    'in-review': {
      bg: 'warning.50',
      color: 'warning.dark',
      label: 'Client Review'
    },
    'in-production': {
      bg: 'info.50',
      color: 'info.dark',
      label: 'In Production'
    }
  };
  
  const status = statusColors[project.status] || statusColors['in-production'];
  
  
  return (
    <Card 
      sx={{
        ...styles.projectCard,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          ...(onClick && {
            transform: 'translateY(-1px)',
            boxShadow: 2
          })
        }
      }}
      onClick={() => onClick && onClick(project)}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              for {project.client}
            </Typography>
          </Box>
          <Chip 
            label={status.label} 
            size="small"
            sx={{
              bgcolor: status.bg,
              color: status.color,
              fontWeight: 500
            }}
          />
        </Stack>
        
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" fontWeight={500}>
              {project.progress}%
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
              {project.nextMilestone}
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={project.progress} 
            sx={{
              ...styles.progressBar,
              '& .MuiLinearProgress-bar': {
                backgroundColor: project.progress >= 90 ? '#4caf50' : // Green for 90%+
                               project.progress >= 70 ? '#8bc34a' : // Light green for 70-89%
                               project.progress >= 50 ? '#ffc107' : // Amber for 50-69%
                               project.progress >= 30 ? '#ff9800' : // Orange for 30-49%
                               '#f44336' // Red for <30%
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Milestone Card Component
export const MilestoneCard = ({ milestone }) => {
  const typeColors = {
    draft: 'grey.100',
    review: 'warning.100',
    final: 'success.100'
  };
  
  return (
    <Paper sx={styles.milestoneCard(typeColors[milestone.type])}>
      <Typography variant="body2" fontWeight={500} gutterBottom>
        {milestone.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        on {milestone.project} project
      </Typography>
      <Typography variant="caption" fontWeight={500}>
        {milestone.time}
      </Typography>
    </Paper>
  );
};

// Team Section Component
export const TeamSection = ({ title, items, type }) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const handleFilter = () => {
    setFilterOpen(!filterOpen);
    console.log('Filter clicked for:', type);
  };

  const handleItemClick = (item) => {
    console.log('Item clicked:', item);
  };

  return (
    <Box mb={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {type === 'projects' && (
          <Button 
            size="small" 
            startIcon={<FilterIcon fontSize="small" />}
            sx={styles.filterButton}
            onClick={handleFilter}
          >
            Filter
          </Button>
        )}
      </Stack>
      
      <Stack spacing={1}>
        {type === 'projects' ? (
          items.map(project => (
            <Box 
              key={project.id} 
              sx={styles.teamItem}
              onClick={() => handleItemClick(project)}
            >
              <Typography fontSize={24}>{project.logo}</Typography>
              <Box flex={1}>
                <Typography variant="body2" fontWeight={500}>
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.members} team members
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          items.map(crewMember => (
            <Box 
              key={crewMember.id} 
              sx={styles.teamItem}
              onClick={() => handleItemClick(crewMember)}
            >
              <Avatar src={crewMember.avatar} sx={{ width: 40, height: 40 }} />
              <Box flex={1}>
                <Typography variant="body2" fontWeight={500}>
                  {crewMember.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {crewMember.role}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
};

// Activity Item Component
export const ActivityItem = ({ activity }) => {
  return (
    <Box sx={styles.activityItem}>
      <Avatar src={activity.user.avatar} sx={{ width: 32, height: 32 }} />
      <Box flex={1}>
        <Typography variant="body2">
          {activity.action}{' '}
          <Box component="span" fontWeight={600}>
            {activity.target}
          </Box>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {activity.time}
        </Typography>
      </Box>
    </Box>
  );
};
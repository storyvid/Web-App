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
  PermMedia as AssetsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styles } from '../pages/dashboardStyles';

// Sidebar Content Component (reusable for both desktop and mobile)
const SidebarContent = ({ activeItem, onMenuItemClick, userRole, onItemClick, user }) => {
  const [teamMenuAnchor, setTeamMenuAnchor] = useState(null);
  
  const getRoleMenuItems = (role) => {
    // MVP pages only - same for all roles
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
      { id: 'projects', label: 'Projects', icon: FolderIcon },
      { id: 'assets', label: 'Assets', icon: AssetsIcon },
      { id: 'services', label: 'Services', icon: ServicesIcon },
      { id: 'settings', label: 'Settings', icon: SettingsIcon }
    ];
    
    return menuItems;
  };

  const menuItems = getRoleMenuItems(userRole);

  const handleMenuClick = (itemId) => {
    onMenuItemClick(itemId);
    if (onItemClick) onItemClick(); // Close mobile drawer
  };

  return (
    <>
      <Box sx={styles.logo}>
        <img src="/storyvid_logo.svg" alt="StoryVid" style={{ width: 144, height: 144 }} />
      </Box>
      
      <Typography variant="caption" sx={styles.menuLabel}>
        Main Menu
      </Typography>
      
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
              {item.label}
            </Button>
          );
        })}
      </Stack>
      
      {/* Mobile app promotion removed */}
      
      {/* Workspace selector */}
      <Box sx={{ mt: 'auto', p: 2 }}>
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
      </Box>
    </>
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
      
      <TextField
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
      </IconButton>
      
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
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Account Settings</MenuItem>
          <MenuItem onClick={handleClose}>Billing</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
};

// Stats Card Component
export const StatsCard = ({ icon: Icon, title, value, subtitle, seeAll, onSeeAllClick }) => {
  return (
    <Card sx={styles.statsCard}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={styles.statsIcon}>
              <Icon fontSize="small" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Stack>
          {seeAll && (
            <Button size="small" sx={styles.seeAllButton} onClick={onSeeAllClick}>
              See all
            </Button>
          )}
        </Stack>
        
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              /{subtitle}
            </Typography>
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
        '&:hover': {
          ...(onClick && {
            transform: 'translateY(-2px)',
            boxShadow: 3
          })
        }
      }}
      onClick={() => onClick && onClick(project)}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
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
        
        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" fontWeight={500}>
              {project.progress}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              done
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={project.progress} 
            sx={styles.progressBar}
          />
        </Box>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Due:
            </Typography>
            <Typography variant="caption" fontWeight={500}>
              {project.nextMilestone}
            </Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <AvatarGroup max={3} sx={styles.avatarGroup}>
              {project.team.map(member => (
                <Avatar
                  key={member.id}
                  src={member.avatar}
                  sx={{ width: 24, height: 24 }}
                />
              ))}
            </AvatarGroup>
            <Button size="small" variant="text" sx={styles.actionButton}>
              {project.action}
            </Button>
          </Stack>
        </Stack>
        
        {project.notStarted && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            textAlign="center" 
            mt={2}
          >
            Not started yet
          </Typography>
        )}
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
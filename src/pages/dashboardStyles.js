import { createTheme } from '@mui/material/styles';

// Material Design 3 Theme Configuration
export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Professional blue for main UI
      light: '#DBEAFE',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#6B7280', // Neutral gray
      light: '#F3F4F6',
      dark: '#374151',
    },
    warning: {
      main: '#FFC535', // Using warning for StoryVid yellow accent
      light: '#FFF4D6',
      dark: '#E6B030',
    },
    error: {
      main: '#EF4444',
      50: '#FEF2F2',
    },
    success: {
      main: '#10B981',
      100: '#D1FAE5',
    },
    info: {
      main: '#3B82F6',
      dark: '#1E40AF',
      50: '#EFF6FF',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
      fontWeight: 700,
      lineHeight: { xs: 1.3, md: 1.2 },
    },
    h6: {
      fontSize: { xs: '1.125rem', md: '1.25rem' },
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: { xs: '0.9rem', md: '1rem' },
      lineHeight: 1.5,
    },
    body1: {
      fontSize: { xs: '0.9rem', md: '1rem' },
      lineHeight: 1.5,
    },
    body2: {
      fontSize: { xs: '0.8rem', md: '0.875rem' },
      lineHeight: 1.43,
    },
    caption: {
      fontSize: { xs: '0.7rem', md: '0.75rem' },
      lineHeight: 1.66,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Component Styles
export const styles = {
  // Dashboard Container
  dashboardContainer: {
    display: 'flex',
    height: '100vh',
    width:"100%",
    bgcolor: 'background.default',
    flexDirection: { xs: 'column', md: 'row' },
  },

  // Sidebar Styles
  sidebar: {
    width: { xs: '100%', md: 256 },
    bgcolor: 'background.paper',
    height: { xs: 'auto', md: '100vh' },
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    borderRight: 1,
    borderColor: 'divider',
    position: { xs: 'static', md: 'static' },
  },

  // Mobile Sidebar (when needed)
  mobileSidebar: {
    width: 256,
    bgcolor: 'background.paper',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: 1,
    borderColor: 'divider',
  },

  logo: {
    p: 3,
  },

  logoIcon: {
    width: 40,
    height: 40,
    bgcolor: 'warning.main', // StoryVid yellow for brand logo
    color: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    fontSize: 20,
    fontWeight: 'bold',
  },

  menuLabel: {
    px: 3,
    mb: 2,
    color: 'text.secondary',
  },

  menuItem: (isActive) => ({
    justifyContent: 'flex-start',
    px: 1.5,
    py: 1.25,
    color: isActive ? 'primary.main' : 'text.secondary',
    bgcolor: isActive ? 'primary.light' : 'transparent',
    '&:hover': {
      bgcolor: isActive ? 'primary.light' : 'secondary.light',
    },
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: 1.5,
    },
  }),

  desktopAppCard: {
    mx: 2,
    mb: 2,
    mt: 'auto',
    p: 2,
    bgcolor: 'secondary.light',
    elevation: 0,
  },

  downloadButton: {
    bgcolor: 'warning.main', // StoryVid yellow for CTA
    color: 'black',
    '&:hover': {
      bgcolor: 'warning.dark',
    },
  },

  // Header Styles
  header: {
    bgcolor: 'background.paper',
    borderBottom: 1,
    borderColor: 'divider',
    px: { xs: 2, sm: 3, md: 4 },
    py: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    gap: { xs: 1, sm: 2 },
  },

  teamSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 2,
    py: 1,
    bgcolor: 'warning.light', // Subtle yellow background
    elevation: 0,
    cursor: 'pointer',
    '&:hover': {
      bgcolor: 'warning.main',
    },
  },

  teamAvatar: {
    width: 32,
    height: 32,
    bgcolor: 'warning.main', // StoryVid yellow for brand element
    color: 'black',
    fontSize: 16,
    fontWeight: 600,
  },

  searchField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'grey.50',
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused fieldset': {
        border: '1px solid',
        borderColor: 'primary.main',
      },
    },
  },

  userButton: {
    textTransform: 'none',
    color: 'text.primary',
    '&:hover': {
      bgcolor: 'grey.50',
    },
  },

  // Main Content Styles
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },

  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: { xs: 'column', lg: 'row' },
    overflow: { xs: 'auto', lg: 'hidden' },
  },

  leftContent: {
    flex: 1,
    p: { xs: 2, sm: 3, md: 4 },
    overflow: 'auto',
    minHeight: 0,
  },

  rightPanel: {
    width: { xs: '100%', lg: 320 },
    bgcolor: 'background.paper',
    borderLeft: 1,
    borderColor: 'divider',
    p: { xs: 2, sm: 3 },
    overflow: 'auto',
    maxHeight: { xs: '50vh', lg: 'none' },
  },

  // Stats Card Styles
  statsCard: {
    height: '100%',
    '& .MuiCardContent-root': {
      p: 3,
    },
  },

  statsIcon: {
    width: 40,
    height: 40,
    bgcolor: 'secondary.light', // Neutral gray background
    color: 'primary.main', // Blue icons for hierarchy
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },

  seeAllButton: {
    color: 'text.secondary',
    fontSize: '0.875rem',
    '&:hover': {
      color: 'text.primary',
      bgcolor: 'transparent',
    },
  },

  // Grid Layouts
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { 
      xs: '1fr', 
      sm: 'repeat(2, 1fr)', 
      md: 'repeat(3, 1fr)' 
    },
    gap: { xs: 2, sm: 2.5, md: 3 },
    mb: 4,
  },

  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: { 
      xs: '1fr', 
      md: 'repeat(2, 1fr)' 
    },
    gap: { xs: 2, sm: 2.5, md: 3 },
  },

  milestonesGrid: {
    display: 'grid',
    gridTemplateColumns: { 
      xs: '1fr', 
      sm: 'repeat(2, 1fr)', 
      lg: 'repeat(3, 1fr)' 
    },
    gap: { xs: 1.5, sm: 2 },
  },

  // Project Card Styles
  projectCard: {
    height: '100%',
    '& .MuiCardContent-root': {
      p: 3,
    },
  },

  progressBar: {
    height: 8,
    borderRadius: 4,
    bgcolor: 'grey.200',
    '& .MuiLinearProgress-bar': {
      bgcolor: 'success.main',
      borderRadius: 4,
    },
  },

  avatarGroup: {
    '& .MuiAvatar-root': {
      border: '2px solid white',
      width: 24,
      height: 24,
    },
  },

  actionButton: {
    bgcolor: 'grey.50',
    color: 'text.primary',
    '&:hover': {
      bgcolor: 'grey.100',
    },
  },

  // Milestone Card Styles
  milestoneCard: (bgColor) => ({
    p: 2,
    bgcolor: bgColor || 'grey.100',
    elevation: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 2,
    },
  }),

  // Team Section Styles
  teamItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    p: 1.5,
    borderRadius: 1,
    cursor: 'pointer',
    '&:hover': {
      bgcolor: 'grey.50',
    },
  },

  filterButton: {
    color: 'text.secondary',
    fontSize: '0.875rem',
    '&:hover': {
      color: 'text.primary',
    },
  },

  // Activity Styles
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.5,
    p: 1.5,
  },
};
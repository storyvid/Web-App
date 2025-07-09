import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Professional blue for main UI
      light: '#DBEAFE',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280', // Neutral gray
      light: '#F3F4F6',
      dark: '#374151',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFC535', // StoryVid Yellow - accent only
      light: '#FFF4D6',
      dark: '#E6B030',
      contrastText: '#000000',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    info: {
      main: '#3B82F6',
      dark: '#1E40AF',
      50: '#EFF6FF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1D4ED8',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
          transition: 'box-shadow 0.3s ease',
        },
      },
    },
  },
});

export default theme;
import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    ocean: Palette['primary'];
  }
  interface PaletteOptions {
    ocean?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003D7A',
      light: '#1565C0',
      dark: '#002756',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C0392B',
      light: '#E74C3C',
      dark: '#96281B',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F4F8',
      paper: '#ffffff',
    },
    success: {
      main: '#1A7F4B',
      light: '#27AE60',
    },
    warning: {
      main: '#D68910',
      light: '#F39C12',
    },
    error: {
      main: '#C0392B',
    },
    ocean: {
      main: '#0066CC',
      light: '#4D9EE0',
      dark: '#004A99',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&.Mui-disabled': {
            color: '#ffffff',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #003D7A 0%, #1565C0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #002756 0%, #003D7A 100%)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(135deg, #003D7A 0%, #1565C0 100%)',
            opacity: 0.6,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,61,122,0.08)',
          border: '1px solid rgba(0,61,122,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,61,122,0.16)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0,61,122,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: alpha('#003D7A', 0.05),
            fontWeight: 600,
            color: '#003D7A',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha('#003D7A', 0.03),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #002756 0%, #003D7A 60%, #0055A5 100%)',
          boxShadow: '0 2px 16px rgba(0,39,86,0.3)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          background: 'linear-gradient(135deg, #003D7A 0%, #1565C0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #002756 0%, #003D7A 100%)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;

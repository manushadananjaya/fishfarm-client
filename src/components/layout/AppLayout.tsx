import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WaterIcon from '@mui/icons-material/Water';
import HomeIcon from '@mui/icons-material/Home';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import CloseIcon from '@mui/icons-material/Close';
import WavesIcon from '@mui/icons-material/Waves';
import MapIcon from '@mui/icons-material/Map';

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Fish Farms', path: '/', icon: <HomeIcon /> },
  { label: 'Map', path: '/map', icon: <MapIcon /> },
  { label: 'Register Farm', path: '/farms/new', icon: <AddBusinessIcon /> },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            <WaterIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography
                variant="h6"
                sx={{ lineHeight: 1, fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                AquaManager
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.75, letterSpacing: '0.08em', fontSize: '0.65rem' }}
              >
                NORWAY FISH FARMS
              </Typography>
            </Box>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 4, flexGrow: 1 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    opacity: isActive(item.path) ? 1 : 0.75,
                    borderBottom: isActive(item.path)
                      ? '2px solid rgba(255,255,255,0.9)'
                      : '2px solid transparent',
                    borderRadius: 0,
                    pb: 0.5,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Tooltip title="Register new fish farm">
            <Button
              variant="contained"
              onClick={() => navigate('/farms/new')}
              startIcon={<AddBusinessIcon />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              New Farm
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WavesIcon color="primary" />
            <Typography variant="h6" color="primary" fontWeight={700}>
              AquaManager
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ px: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
              onClick={() => setDrawerOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content — full-bleed on /map, contained everywhere else */}
      {location.pathname === '/map' ? (
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {children}
        </Box>
      ) : (
        <>
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
              {children}
            </Container>
          </Box>
          <Box
            component="footer"
            sx={{
              py: 2,
              px: 3,
              bgcolor: 'primary.dark',
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption">
              © {new Date().getFullYear()} AquaManager — Norwegian Fish Farm Registry
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, alpha } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WavesIcon from '@mui/icons-material/Waves';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <WavesIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.5 }} />
      </Box>

      <Typography
        variant="h1"
        sx={{ fontSize: '6rem', fontWeight: 900, color: 'primary.main', lineHeight: 1 }}
      >
        404
      </Typography>

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
        The fish farm you're looking for seems to have drifted away. Head back
        to the registry.
      </Typography>

      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        size="large"
      >
        Back to Fish Farms
      </Button>
    </Box>
  );
}

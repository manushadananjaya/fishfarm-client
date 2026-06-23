import { useNavigate } from 'react-router-dom';
import { Box, Typography, alpha, Divider } from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { FishFarmSummary } from '../../types';
import { formatGps, formatDate } from '../../utils/formatters';

interface FarmListItemProps {
  farm: FishFarmSummary;
}

const FARM_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='96' viewBox='0 0 120 96'%3E%3Crect width='120' height='96' fill='%23003D7A' opacity='0.08'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23003D7A' opacity='0.25' font-size='36'%3E🐟%3C/text%3E%3C/svg%3E`;

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.4,
        borderRadius: '20px',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
      }}
    >
      <Box sx={{ display: 'flex', color: 'primary.main', '& svg': { fontSize: 13 } }}>
        {icon}
      </Box>
      <Typography variant="caption" fontWeight={600} color="primary.main" sx={{ lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function FarmListItem({ farm }: FarmListItemProps) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/farms/${farm.id}`)}
      sx={{
        display: 'flex',
        height: { xs: 120, sm: 132 },
        width: '100%',
        borderRadius: 2.5,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
        position: 'relative',
        '&:hover': {
          boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
          transform: 'translateY(-1px)',
          '& .farm-arrow': { opacity: 1, transform: 'translateX(0)' },
          '& .farm-accent': { width: 4 },
          '& .farm-img': { transform: 'scale(1.04)' },
        },
      }}
    >
      {/* Left accent bar */}
      <Box
        className="farm-accent"
        sx={{
          width: 0,
          flexShrink: 0,
          bgcolor: 'primary.main',
          transition: 'width 0.18s ease',
          borderRadius: '2px 0 0 2px',
        }}
      />

      {/* Image */}
      <Box
        sx={{
          width: { xs: 96, sm: 120 },
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          className="farm-img"
          component="img"
          src={farm.pictureUrl ?? FARM_PLACEHOLDER}
          alt={farm.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s ease',
          }}
        />
        {/* Barge badge over image */}
        {farm.hasBarge && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
              px: 0.75,
              py: 0.3,
              borderRadius: '10px',
              bgcolor: 'rgba(0,39,86,0.82)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <DirectionsBoatIcon sx={{ fontSize: 11, color: 'white' }} />
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
              BARGE
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: { xs: 1.5, sm: 2.5 }, py: 2, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Name */}
        <Typography
          variant="h6"
          fontWeight={700}
          noWrap
          sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, mb: 0.75, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {farm.name}
          {farm.farmCode && (
            <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'primary.50', color: 'primary.main', px: 0.8, py: 0.2, borderRadius: 1, fontWeight: 600 }}>
              {farm.farmCode}
            </Typography>
          )}
        </Typography>

        {/* GPS coordinate */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
          <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}
          >
            {formatGps(farm.gpsLatitude, farm.gpsLongitude)}
          </Typography>
        </Box>

        {/* Stat pills */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <StatPill icon={<GridViewIcon />} label={`${farm.numberOfCages} cage${farm.numberOfCages !== 1 ? 's' : ''}`} />
          <StatPill icon={<GroupIcon />} label={`${farm.workerCount} worker${farm.workerCount !== 1 ? 's' : ''}`} />
        </Box>
      </Box>

      {/* Right meta column */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 1,
          pr: 2,
          pl: 1,
          minWidth: 160,
          borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Box>
            <Typography variant="caption" display="block" color="text.disabled" sx={{ lineHeight: 1.2, fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Added
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {formatDate(farm.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ width: '100%' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Box>
            <Typography variant="caption" display="block" color="text.disabled" sx={{ lineHeight: 1.2, fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Updated
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {formatDate(farm.updatedAt)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Arrow */}
      <Box
        className="farm-arrow"
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          opacity: 0,
          transform: 'translateX(-4px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          color: 'primary.main',
        }}
      >
        <ArrowForwardIcon sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  );
}

import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Skeleton,
  alpha,
} from '@mui/material';
import WaterIcon from '@mui/icons-material/Water';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GridViewIcon from '@mui/icons-material/GridView';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { FishFarmSummary } from '../../types';
import { formatGps, formatDate } from '../../utils/formatters';

interface FarmCardProps {
  farm: FishFarmSummary;
}

const FARM_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect width='400' height='220' fill='%23003D7A' opacity='0.12'/%3E%3Ctext x='50%25' y='48%25' dominant-baseline='middle' text-anchor='middle' fill='%23003D7A' opacity='0.3' font-size='64'%3E🐟%3C/text%3E%3Ctext x='50%25' y='72%25' dominant-baseline='middle' text-anchor='middle' fill='%23003D7A' opacity='0.2' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`;

export default function FarmCard({ farm }: FarmCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/farms/${farm.id}`)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* Hero Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={farm.pictureUrl ?? FARM_PLACEHOLDER}
            alt={farm.name}
            sx={{ objectFit: 'cover' }}
          />
          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,39,86,0.85) 0%, transparent 60%)',
            }}
          />
          {/* Farm name over image */}
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 12,
              right: 12,
              color: 'white',
              fontWeight: 700,
              lineHeight: 1.2,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {farm.name}
          </Typography>

          {/* Barge badge */}
          {farm.hasBarge && (
            <Chip
              icon={<DirectionsBoatIcon sx={{ fontSize: '14px !important' }} />}
              label="Barge"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,61,122,0.85)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
          )}

          {/* Farm Code badge */}
          {farm.farmCode && (
            <Chip
              label={farm.farmCode}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'rgba(255,255,255,0.85)',
                color: 'primary.main',
                fontWeight: 800,
                fontFamily: 'monospace',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: '12px !important' }}>
          {/* GPS */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1.5 }}>
            <LocationOnIcon
              sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2, flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {formatGps(farm.gpsLatitude, farm.gpsLongitude)}
            </Typography>
          </Box>

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip
              icon={<GridViewIcon sx={{ fontSize: '14px !important' }} />}
              label={`${farm.numberOfCages} cages`}
              size="small"
              variant="outlined"
              sx={{
                color: 'primary.main',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <Avatar
                sx={{ width: 22, height: 22, bgcolor: 'primary.main', fontSize: '0.7rem' }}
              >
                <GroupIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {farm.workerCount} worker{farm.workerCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Date row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              Added {formatDate(farm.createdAt)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function FarmCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={16} sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
      </CardContent>
    </Card>
  );
}

// Mini map info chip used on detail pages
export function FarmLocationBadge({ lat, lng }: { lat: number; lng: number }) {
  return (
    <Chip
      icon={<WaterIcon />}
      label={formatGps(lat, lng)}
      size="small"
      sx={{
        fontFamily: 'monospace',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        color: 'primary.main',
        fontWeight: 600,
      }}
    />
  );
}

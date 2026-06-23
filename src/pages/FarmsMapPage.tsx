import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  alpha,
  Paper,
  ButtonBase,
  Skeleton,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Tooltip,
  Drawer,
  Fab,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import WaterIcon from '@mui/icons-material/Water';
import CropFreeIcon from '@mui/icons-material/CropFree';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import GroupIcon from '@mui/icons-material/Group';
import { useFishFarmsMap } from '../hooks/useFishFarms';
import FarmsOverviewMap, { type FarmsOverviewMapHandle } from '../components/farms/FarmsOverviewMap';
import FarmQuickViewModal from '../components/farms/FarmQuickViewModal';
import type { FishFarmMapDto } from '../types';

const FARM_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23003D7A' opacity='0.1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23003D7A' opacity='0.28' font-size='28'%3E🐟%3C/text%3E%3C/svg%3E`;

// ── Glass style helpers ────────────────────────────────────────────────────

const glassBase = {
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.55)',
  boxShadow: '0 8px 32px rgba(0,39,86,0.18), 0 2px 8px rgba(0,0,0,0.1)',
};

export default function FarmsMapPage() {
  const { data: mapFarms = [], isLoading, isError } = useFishFarmsMap();

  // UI state
  const mapRef = useRef<FarmsOverviewMapHandle>(null);
  const [selectedFarm, setSelectedFarm]       = useState<FishFarmMapDto | null>(null);
  const [highlightedId, setHighlightedId]     = useState<string | null>(null);
  const [visibleIds, setVisibleIds]           = useState<Set<string>>(new Set());
  const [fitTrigger, setFitTrigger]           = useState(0);
  const [search, setSearch]                   = useState('');
  const [mobileOpen, setMobileOpen]           = useState(false);

  const handleVisibleChange = useCallback((ids: Set<string>) => setVisibleIds(ids), []);

  const farmById = useMemo(
    () => new Map(mapFarms.map((f) => [f.id, f])),
    [mapFarms],
  );

  const handleMarkerClick = useCallback(
    (id: string) => {
      const farm = farmById.get(id) ?? null;
      setSelectedFarm(farm);
      setHighlightedId(id);
    },
    [farmById],
  );

  const handleSidebarSelect = useCallback(
    (id: string) => {
      const farm = farmById.get(id);
      if (farm) {
        mapRef.current?.flyTo(farm.gpsLatitude, farm.gpsLongitude, 10);
        setSelectedFarm(farm);
        setHighlightedId(id);
        setMobileOpen(false);
      }
    },
    [farmById],
  );

  const filteredSidebar = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mapFarms;
    return mapFarms.filter(
      (f) => f.name.toLowerCase().includes(q) || f.farmCode.toLowerCase().includes(q),
    );
  }, [mapFarms, search]);

  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
        overflow: 'hidden',
      }}
    >
      {/* ── Full-screen Leaflet map ─────────────────────────────────────── */}
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <FarmsOverviewMap
          ref={mapRef}
          farms={mapFarms}
          fitTrigger={fitTrigger}
          highlightedId={highlightedId}
          onMarkerClick={handleMarkerClick}
          onVisibleChange={handleVisibleChange}
        />
      </Box>

      {/* ── Top-left glass info card ────────────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 10, md: 16 },
          left: { xs: 10, md: 16 },
          zIndex: 1000,
          maxWidth: { xs: '60vw', md: 320 },
          ...glassBase,
          bgcolor: 'rgba(255,255,255,0.52)',
          borderRadius: 3,
          px: 2,
          py: 1.5,
          transition: 'background 0.25s',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.90)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography
            variant="overline"
            color="primary"
            sx={{ fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 700, lineHeight: 1 }}
          >
            Norwegian Fish Farm Registry
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ lineHeight: 1.2, mb: 1 }}>
          Farm Locations
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: '20px' }} />
            <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: '20px' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              icon={<WaterIcon sx={{ fontSize: '13px !important' }} />}
              label={`${mapFarms.length} farms`}
              size="small"
              sx={{
                height: 22, fontSize: '0.7rem', fontWeight: 700,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                color: 'primary.main',
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
              }}
            />
            <Chip
              icon={<MyLocationIcon sx={{ fontSize: '13px !important' }} />}
              label={`${visibleIds.size} in view`}
              size="small"
              sx={{
                height: 22, fontSize: '0.7rem', fontWeight: 700,
                bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                color: 'success.dark',
                border: (t) => `1px solid ${alpha(t.palette.success.main, 0.25)}`,
              }}
            />
          </Box>
        )}
      </Box>

      {/* ── Fit-all button ───────────────────────────────────────────────── */}
      <Tooltip title="Fit all farms in view" placement="right">
        <Box
          onClick={() => setFitTrigger((n) => n + 1)}
          sx={{
            position: 'absolute',
            top: { xs: 108, md: 138 },
            left: { xs: 10, md: 16 },
            zIndex: 1000,
            ...glassBase,
            bgcolor: 'rgba(255,255,255,0.52)',
            borderRadius: 2,
            px: 1.5,
            py: 0.9,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            transition: 'background 0.2s, transform 0.15s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', transform: 'scale(1.03)' },
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          <CropFreeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ lineHeight: 1 }}>
            Fit all
          </Typography>
        </Box>
      </Tooltip>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {isError && (
        <Alert
          severity="error"
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            maxWidth: 400,
          }}
        >
          Failed to load farm locations.
        </Alert>
      )}

      {/* ── DESKTOP glass sidebar ────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          position: 'absolute',
          top: 16,
          right: 16,
          bottom: 16,
          width: 320,
          zIndex: 1000,
          borderRadius: 3,
          overflow: 'hidden',
          ...glassBase,
          bgcolor: 'rgba(255,255,255,0.45)',
          transition: 'background 0.3s',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.93)' },
        }}
      >
        <SidebarContent
          farms={filteredSidebar}
          allCount={mapFarms.length}
          loading={isLoading}
          search={search}
          onSearchChange={setSearch}
          highlightedId={highlightedId}
          onHover={setHighlightedId}
          onSelect={handleSidebarSelect}
        />
      </Paper>

      {/* ── MOBILE: FAB ──────────────────────────────────────────────────── */}
      <Fab
        variant="extended"
        size="medium"
        onClick={() => setMobileOpen(true)}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          ...glassBase,
          bgcolor: 'rgba(255,255,255,0.72)',
          color: 'primary.dark',
          fontWeight: 700,
          fontSize: '0.82rem',
          gap: 0.75,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
        }}
      >
        <FormatListBulletedIcon sx={{ fontSize: 18 }} />
        {mapFarms.length} Farms
      </Fab>

      {/* ── MOBILE: bottom sheet drawer ──────────────────────────────────── */}
      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px 20px 0 0',
            maxHeight: '72vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Drag handle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>

        <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            All Farms
          </Typography>
          <IconButton size="small" onClick={() => setMobileOpen(false)}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            placeholder="Search name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <SidebarFarmList
            farms={filteredSidebar}
            loading={isLoading}
            highlightedId={highlightedId}
            onHover={setHighlightedId}
            onSelect={handleSidebarSelect}
          />
        </Box>

        <Box sx={{ px: 2, py: 1, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          <Typography variant="caption" color="text.disabled">
            {filteredSidebar.length} of {mapFarms.length} farm{mapFarms.length !== 1 ? 's' : ''}
            {search && ' matched'}
          </Typography>
        </Box>
      </Drawer>

      {/* ── Farm quick-view modal — data from map array, no extra fetch ───── */}
      <FarmQuickViewModal
        farm={selectedFarm}
        onClose={() => { setSelectedFarm(null); setHighlightedId(null); }}
      />
    </Box>
  );
}


function SidebarContent({
  farms,
  allCount,
  loading,
  search,
  onSearchChange,
  highlightedId,
  onHover,
  onSelect,
}: {
  farms: FishFarmMapDto[];
  allCount: number;
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  highlightedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <WaterIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700} color="primary.dark">
            All Farms
          </Typography>
          <Box
            sx={{
              ml: 'auto',
              px: 0.9,
              py: 0.2,
              borderRadius: '5px',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              color: 'primary.main',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {allCount}
          </Box>
        </Box>
        <TextField
          placeholder="Search name or code…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')}>
                  <ClearIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { fontSize: '0.82rem', bgcolor: 'rgba(255,255,255,0.6)' },
          }}
        />
      </Box>

      {/* Farm list */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <SidebarFarmList
          farms={farms}
          loading={loading}
          highlightedId={highlightedId}
          onHover={onHover}
          onSelect={onSelect}
        />
      </Box>

      {/* Footer count */}
      <Box
        sx={{
          px: 2,
          py: 0.75,
          flexShrink: 0,
          borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
          bgcolor: 'rgba(255,255,255,0.3)',
        }}
      >
        <Typography variant="caption" color="text.disabled">
          {farms.length} of {allCount} farm{allCount !== 1 ? 's' : ''}
          {search && ' matched'}
        </Typography>
      </Box>
    </>
  );
}

// ── Farm list items ────────────────────────────────────────────────────────

function SidebarFarmList({
  farms,
  loading,
  highlightedId,
  onHover,
  onSelect,
}: {
  farms: FishFarmMapDto[];
  loading: boolean;
  highlightedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {[...Array(7)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, p: 1, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height={14} />
              <Skeleton variant="text" width="80%" height={12} sx={{ mt: 0.4 }} />
              <Skeleton variant="rounded" width={60} height={16} sx={{ borderRadius: '4px', mt: 0.4 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (farms.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <SearchIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
        <Typography variant="body2" color="text.secondary">
          No farms found
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {farms.map((farm) => (
        <FarmSidebarCard
          key={farm.id}
          farm={farm}
          isHighlighted={farm.id === highlightedId}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

// ── Individual sidebar farm card with image ────────────────────────────────

function FarmSidebarCard({
  farm,
  isHighlighted,
  onHover,
  onSelect,
}: {
  farm: FishFarmMapDto;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <ButtonBase
      onClick={() => onSelect(farm.id)}
      onMouseEnter={() => onHover(farm.id)}
      onMouseLeave={() => onHover(null)}
      sx={{
        display: 'flex',
        width: '100%',
        textAlign: 'left',
        alignItems: 'stretch',
        px: 1.5,
        py: 1,
        gap: 1.5,
        borderLeft: '3px solid',
        borderLeftColor: isHighlighted ? 'primary.main' : 'transparent',
        borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
        bgcolor: isHighlighted ? (t) => alpha(t.palette.primary.main, 0.07) : 'transparent',
        transition: 'background 0.15s, border-color 0.15s',
        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) },
      }}
    >
      {/* Thumbnail */}
      <Avatar
        variant="rounded"
        src={farm.pictureUrl ?? FARM_PLACEHOLDER}
        alt={farm.name}
        sx={{
          width: 52,
          height: 52,
          borderRadius: 1.5,
          flexShrink: 0,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.35 }}>
          <Typography
            variant="body2"
            fontWeight={isHighlighted ? 700 : 600}
            noWrap
            color={isHighlighted ? 'primary.main' : 'text.primary'}
            sx={{ fontSize: '0.82rem', flex: 1 }}
          >
            {farm.name}
          </Typography>
          <Box
            sx={{
              px: 0.7,
              py: 0.15,
              bgcolor: isHighlighted ? 'primary.main' : (t) => alpha(t.palette.primary.main, 0.1),
              color: isHighlighted ? 'white' : 'primary.main',
              borderRadius: '4px',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              flexShrink: 0,
              lineHeight: 1.6,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {farm.farmCode}
          </Box>
        </Box>

        {/* Stats row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            <GridViewIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {farm.numberOfCages} cage{farm.numberOfCages !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            <GroupIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {farm.workerCount} worker{farm.workerCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          {farm.hasBarge && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
              <DirectionsBoatIcon sx={{ fontSize: 11, color: 'primary.main' }} />
              <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                Barge
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ButtonBase>
  );
}

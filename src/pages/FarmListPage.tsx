import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SearchIcon from '@mui/icons-material/Search';
import WaterIcon from '@mui/icons-material/Water';
import FishingIcon from '@mui/icons-material/Phishing';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useFishFarms } from '../hooks/useFishFarms';
import FarmCard, { FarmCardSkeleton } from '../components/farms/FarmCard';
import PaginationBar from '../components/common/PaginationBar';
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 9;

type BargeFilter = 'all' | 'true' | 'false';

export default function FarmListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [bargeFilter, setBargeFilter] = useState<BargeFilter>('all');
  const [minCages, setMinCages] = useState('');
  const [maxCages, setMaxCages] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search + cage inputs so we don't fire on every keystroke
  const debouncedSearch = useDebounce(searchInput, 350);
  const debouncedMinCages = useDebounce(minCages, 500);
  const debouncedMaxCages = useDebounce(maxCages, 500);

  const queryParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(bargeFilter !== 'all' ? { hasBarge: bargeFilter === 'true' } : {}),
    ...(debouncedMinCages && Number(debouncedMinCages) > 0
      ? { minCages: Number(debouncedMinCages) }
      : {}),
    ...(debouncedMaxCages && Number(debouncedMaxCages) > 0
      ? { maxCages: Number(debouncedMaxCages) }
      : {}),
  };

  const { data, isLoading, isError, error } = useFishFarms(queryParams);

  const activeFilterCount =
    (debouncedSearch ? 1 : 0) +
    (bargeFilter !== 'all' ? 1 : 0) +
    (debouncedMinCages ? 1 : 0) +
    (debouncedMaxCages ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setBargeFilter('all');
    setMinCages('');
    setMaxCages('');
    setPage(1);
  }, []);

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    setPage(1);
  };

  const handleBargeChange = (_: unknown, val: BargeFilter | null) => {
    setBargeFilter(val ?? 'all');
    setPage(1);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', right: 20, bottom: -60, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <WaterIcon />
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: '0.15em' }}>
                Norwegian Fish Farm Registry
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Fish Farms
            </Typography>
            {data && (
              <Chip
                label={`${data.totalCount} registered farm${data.totalCount !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, backdropFilter: 'blur(4px)' }}
              />
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddBusinessIcon />}
            onClick={() => navigate('/farms/new')}
            size="large"
            sx={{ bgcolor: 'white', color: 'primary.dark', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
          >
            Register New Farm
          </Button>
        </Box>
      </Box>

      {/* Search & Filter Bar */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 6px rgba(0,61,122,0.06)',
        }}
      >
        {/* Top row: search + filter toggle */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search farms by name…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleSearchChange('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <Tooltip title={showFilters ? 'Hide filters' : 'Show filters'}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters((v) => !v)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filters
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="error"
                  sx={{ ml: 0.75, height: 18, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
                />
              )}
            </Button>
          </Tooltip>

          {activeFilterCount > 0 && (
            <Tooltip title="Clear all filters">
              <IconButton size="small" onClick={handleClearFilters} color="error">
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {data && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
              {data.totalCount} result{data.totalCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Expanded filters */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Barge filter */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                SERVICE BARGE
              </Typography>
              <ToggleButtonGroup
                value={bargeFilter}
                exclusive
                onChange={handleBargeChange}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="true">
                  <DirectionsBoatIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Has Barge
                </ToggleButton>
                <ToggleButton value="false">No Barge</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Cage range */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                NUMBER OF CAGES
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Min"
                  type="number"
                  value={minCages}
                  onChange={(e) => { setMinCages(e.target.value); setPage(1); }}
                  size="small"
                  inputProps={{ min: 1 }}
                  sx={{ width: 90 }}
                />
                <Typography variant="body2" color="text.secondary">–</Typography>
                <TextField
                  label="Max"
                  type="number"
                  value={maxCages}
                  onChange={(e) => { setMaxCages(e.target.value); setPage(1); }}
                  size="small"
                  inputProps={{ min: 1 }}
                  sx={{ width: 90 }}
                />
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Error state */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load fish farms.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Empty state — no farms at all */}
      {!isLoading && data?.totalCount === 0 && activeFilterCount === 0 && (
        <Box sx={{ py: 10, textAlign: 'center', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03), borderRadius: 3, border: (theme) => `2px dashed ${alpha(theme.palette.primary.main, 0.15)}` }}>
          <FishingIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No fish farms registered yet</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>Register your first Norwegian fish farm to get started</Typography>
          <Button variant="contained" startIcon={<AddBusinessIcon />} onClick={() => navigate('/farms/new')}>
            Register First Farm
          </Button>
        </Box>
      )}

      {/* Empty state — filters returned nothing */}
      {!isLoading && data?.totalCount === 0 && activeFilterCount > 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" gutterBottom>No farms match the current filters</Typography>
          <Button size="small" onClick={handleClearFilters} startIcon={<ClearIcon />}>Clear filters</Button>
        </Box>
      )}

      {/* Farm Grid */}
      <Grid container spacing={3}>
        {isLoading
          ? [...Array(PAGE_SIZE)].map((_, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <FarmCardSkeleton />
              </Grid>
            ))
          : (data?.items ?? []).map((farm) => (
              <Grid item xs={12} sm={6} lg={4} key={farm.id}>
                <FarmCard farm={farm} />
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <PaginationBar
          pageNumber={data.pageNumber}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
}

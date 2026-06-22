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
  MenuItem,
  Stack,
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SearchIcon from '@mui/icons-material/Search';
import WaterIcon from '@mui/icons-material/Water';
import FishingIcon from '@mui/icons-material/Phishing';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useFishFarms } from '../hooks/useFishFarms';
import FarmCard, { FarmCardSkeleton } from '../components/farms/FarmCard';
import FarmListItem from '../components/farms/FarmListItem';
import PaginationBar from '../components/common/PaginationBar';
import { useDebounce } from '../hooks/useDebounce';
import type { FarmSortField, SortDir } from '../api/fishFarms';

const PAGE_SIZE = 9;

type BargeFilter = 'all' | 'true' | 'false';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: FarmSortField; label: string }[] = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'name', label: 'Name' },
  { value: 'numberOfCages', label: 'Number of Cages' },
  { value: 'workerCount', label: 'Workers' },
];

export default function FarmListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [bargeFilter, setBargeFilter] = useState<BargeFilter>('all');
  const [minCages, setMinCages] = useState('');
  const [maxCages, setMaxCages] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<FarmSortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const debouncedSearch = useDebounce(searchInput, 350);
  const debouncedMinCages = useDebounce(minCages, 500);
  const debouncedMaxCages = useDebounce(maxCages, 500);

  const queryParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    sortBy: sortField,
    sortDir,
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
  const items = data?.items ?? [];

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

  const handleSortFieldChange = (field: FarmSortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
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
        {/* Top row: search + sort + view toggle + filter toggle */}
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

          {/* Sort dropdown + direction toggle */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <SortIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <TextField
              select
              size="small"
              value={sortField}
              onChange={(e) => handleSortFieldChange(e.target.value as FarmSortField)}
              sx={{ minWidth: 150 }}
              InputProps={{ sx: { fontSize: '0.85rem' } }}
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title={sortDir === 'asc' ? 'Ascending — click to reverse' : 'Descending — click to reverse'}>
              <IconButton
                size="small"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                color="primary"
              >
                {sortDir === 'asc' ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* View mode toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
          >
            <ToggleButton value="grid" aria-label="Grid view">
              <Tooltip title="Grid view">
                <GridViewIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label="List view">
              <Tooltip title="List view">
                <ViewListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

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

      {/* Grid view */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          {isLoading
            ? [...Array(PAGE_SIZE)].map((_, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <FarmCardSkeleton />
                </Grid>
              ))
            : items.map((farm) => (
                <Grid item xs={12} sm={6} lg={4} key={farm.id}>
                  <FarmCard farm={farm} />
                </Grid>
              ))}
        </Grid>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <Stack spacing={1}>
          {isLoading
            ? [...Array(PAGE_SIZE)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    height: 100,
                    borderRadius: 2.5,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ width: 120, height: '100%', bgcolor: 'action.hover', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ height: 18, width: '45%', bgcolor: 'action.hover', borderRadius: 1 }} />
                    <Box sx={{ height: 13, width: '60%', bgcolor: 'action.hover', borderRadius: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ height: 22, width: 80, bgcolor: 'action.hover', borderRadius: '20px' }} />
                      <Box sx={{ height: 22, width: 80, bgcolor: 'action.hover', borderRadius: '20px' }} />
                    </Box>
                  </Box>
                  <Box sx={{ width: 160, borderLeft: (theme) => `1px solid ${theme.palette.divider}`, p: 2, display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
                    <Box sx={{ height: 12, width: '60%', bgcolor: 'action.hover', borderRadius: 1 }} />
                    <Box sx={{ height: 12, width: '80%', bgcolor: 'action.hover', borderRadius: 1 }} />
                  </Box>
                </Box>
              ))
            : items.map((farm) => (
                <FarmListItem key={farm.id} farm={farm} />
              ))}
        </Stack>
      )}

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

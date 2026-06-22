import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Skeleton,
  Alert,
  Fab,
  Tooltip,
  Divider,
  Avatar,
  alpha,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import { useFishFarm, useDeleteFishFarm } from '../hooks/useFishFarms';
import { useWorkers, useDeleteWorker } from '../hooks/useWorkers';
import { useDebounce } from '../hooks/useDebounce';
import type { WorkerPosition } from '../types';
import WorkerTable from '../components/workers/WorkerTable';
import WorkerFormDialog from '../components/workers/WorkerFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import GpsMapPicker from '../components/farms/GpsMapPicker';
import type { Worker } from '../types';
import { formatDateTime, formatGps } from '../utils/formatters';
import { useSnackbar } from 'notistack';

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: farm, isLoading, isError } = useFishFarm(id!);

  const deleteFarm = useDeleteFishFarm();
  const deleteWorker = useDeleteWorker(id!);

  // Worker filter state
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerPosition, setWorkerPosition] = useState<WorkerPosition | 'all'>('all');
  const [certFilter, setCertFilter] = useState<'all' | 'valid' | 'expired'>('all');
  const [workerPage, setWorkerPage] = useState(1);
  const debouncedWorkerSearch = useDebounce(workerSearch, 350);

  const workerQueryParams = {
    pageNumber: workerPage,
    pageSize: 20,
    ...(debouncedWorkerSearch ? { search: debouncedWorkerSearch } : {}),
    ...(workerPosition !== 'all' ? { position: workerPosition } : {}),
    ...(certFilter === 'expired' ? { certExpired: true } : {}),
    ...(certFilter === 'valid' ? { certExpired: false } : {}),
  };

  const {
    data: workersData,
    isLoading: workersLoading,
  } = useWorkers(id!, workerQueryParams);

  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [deleteFarmDialog, setDeleteFarmDialog] = useState(false);
  const [deleteWorkerDialog, setDeleteWorkerDialog] = useState<Worker | null>(null);

  const hasCeo = farm?.workers.some((w) => w.position === 'CEO') ?? false;

  const handleDeleteFarm = async () => {
    if (!farm) return;
    await deleteFarm.mutateAsync(farm.id);
    enqueueSnackbar(`"${farm.name}" deleted`, { variant: 'info' });
    navigate('/');
  };

  const handleDeleteWorker = async () => {
    if (!deleteWorkerDialog || !farm) return;
    await deleteWorker.mutateAsync(deleteWorkerDialog.id);
    enqueueSnackbar(`${deleteWorkerDialog.name} removed`, { variant: 'info' });
    setDeleteWorkerDialog(null);
  };

  const openEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setWorkerDialogOpen(true);
  };

  const openAddWorker = () => {
    setSelectedWorker(null);
    setWorkerDialogOpen(true);
  };

  if (isError) {
    return (
      <Box>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Farms
        </Button>
        <Alert severity="error">
          Farm not found or could not be loaded.
        </Alert>
      </Box>
    );
  }

  const barentsWatchUrl = farm
    ? `https://www.barentswatch.no/fiskehelse/?lat=${farm.gpsLatitude}&lon=${farm.gpsLongitude}`
    : '#';

  return (
    <Box>
      {/* Back navigation */}
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
        color="inherit"
      >
        All Farms
      </Button>

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          mb: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Hero Image */}
        <Box sx={{ position: 'relative', height: { xs: 200, md: 300 } }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height="100%" />
          ) : (
            <>
              <Box
                component="img"
                src={
                  farm?.pictureUrl ??
                  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='300' viewBox='0 0 1200 300'%3E%3Crect width='1200' height='300' fill='%23003D7A' opacity='0.12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23003D7A' opacity='0.2' font-size='80'%3E🐟%3C/text%3E%3C/svg%3E`
                }
                alt={farm?.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(0,39,86,0.9) 0%, rgba(0,39,86,0.3) 50%, transparent 100%)',
                }}
              />

              {/* Farm name overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="white"
                    sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                  >
                    {farm?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.75)"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {farm
                      ? formatGps(farm.gpsLatitude, farm.gpsLongitude)
                      : '…'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View on BarentsWatch">
                    <IconButton
                      component="a"
                      href={barentsWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                      }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    component={Link}
                    to={`/farms/${id}/edit`}
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                    }}
                  >
                    Edit Farm
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteFarmDialog(true)}
                    sx={{ bgcolor: 'rgba(192,57,43,0.8)', backdropFilter: 'blur(4px)' }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Farm Stats Bar */}
        <Box
          sx={{
            px: 3,
            py: 0,
            display: 'flex',
            alignItems: 'stretch',
            flexWrap: 'wrap',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            minHeight: 52,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 1.5 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rounded" width={110} height={22} />
              ))}
            </Box>
          ) : (
            <>
              {[
                {
                  icon: <GridViewIcon sx={{ fontSize: 16 }} />,
                  label: `${farm?.numberOfCages} cage${farm?.numberOfCages !== 1 ? 's' : ''}`,
                },
                {
                  icon: <DirectionsBoatIcon sx={{ fontSize: 16 }} />,
                  label: farm?.hasBarge ? 'Has Barge' : 'No Barge',
                  muted: !farm?.hasBarge,
                },
                {
                  icon: <GroupIcon sx={{ fontSize: 16 }} />,
                  label: `${farm?.workers.length ?? 0} worker${(farm?.workers.length ?? 0) !== 1 ? 's' : ''}`,
                },
                ...(farm?.createdAt
                  ? [
                      {
                        icon: <CalendarTodayIcon sx={{ fontSize: 16 }} />,
                        label: `Added ${formatDateTime(farm.createdAt)}`,
                      },
                    ]
                  : []),
              ].map((stat, i, arr) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2,
                    py: 1.5,
                    color: stat.muted ? 'text.disabled' : 'text.secondary',
                    borderRight: i < arr.length - 1
                      ? (theme) => `1px solid ${theme.palette.divider}`
                      : 'none',
                    '&:first-of-type': { pl: 0 },
                  }}
                >
                  <Box sx={{ display: 'flex', color: stat.muted ? 'text.disabled' : 'primary.main' }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ whiteSpace: 'nowrap', color: 'inherit' }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Workers Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Workers</Typography>
                {workersData && (
                  <Typography variant="caption" color="text.secondary">
                    {workersData.totalCount} team member{workersData.totalCount !== 1 ? 's' : ''}
                  </Typography>
                )}
              </Box>
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openAddWorker} size="small">
                Add Worker
              </Button>
            </Box>

            {/* Worker Filters */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search name or email…"
                value={workerSearch}
                onChange={(e) => { setWorkerSearch(e.target.value); setWorkerPage(1); }}
                size="small"
                sx={{ flexGrow: 1, minWidth: 160 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                  endAdornment: workerSearch ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setWorkerSearch(''); setWorkerPage(1); }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />

              <TextField
                select
                size="small"
                value={workerPosition}
                onChange={(e) => { setWorkerPosition(e.target.value as WorkerPosition | 'all'); setWorkerPage(1); }}
                sx={{ minWidth: 110 }}
                label="Position"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="CEO">CEO</MenuItem>
                <MenuItem value="Captain">Captain</MenuItem>
                <MenuItem value="Worker">Worker</MenuItem>
              </TextField>

              <ToggleButtonGroup
                value={certFilter}
                exclusive
                onChange={(_, v) => { if (v) { setCertFilter(v); setWorkerPage(1); } }}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="valid" sx={{ color: 'success.main' }}>Valid</ToggleButton>
                <ToggleButton value="expired" sx={{ color: 'error.main' }}>Expired</ToggleButton>
              </ToggleButtonGroup>

              {(workerSearch || workerPosition !== 'all' || certFilter !== 'all') && (
                <Tooltip title="Clear worker filters">
                  <IconButton size="small" color="error" onClick={() => { setWorkerSearch(''); setWorkerPosition('all'); setCertFilter('all'); setWorkerPage(1); }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <WorkerTable
              workers={workersData?.items ?? []}
              loading={workersLoading}
              onEdit={openEditWorker}
              onDelete={(w) => setDeleteWorkerDialog(w)}
              farmId={id}
            />

            {/* Worker pagination */}
            {workersData && workersData.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={0.5}>
                    Page {workersData.pageNumber} of {workersData.totalPages}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" disabled={!workersData.hasPreviousPage} onClick={() => setWorkerPage((p) => p - 1)} variant="outlined">Prev</Button>
                    <Button size="small" disabled={!workersData.hasNextPage} onClick={() => setWorkerPage((p) => p + 1)} variant="outlined">Next</Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Map & Info Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, mb: 3 }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Location
            </Typography>
            {isLoading ? (
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            ) : farm ? (
              <GpsMapPicker
                latitude={farm.gpsLatitude}
                longitude={farm.gpsLongitude}
                onCoordinateChange={() => {}}
                readOnly
              />
            ) : null}
            {farm && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', display: 'block' }}
                >
                  Lat: {farm.gpsLatitude.toFixed(4)}° N
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', display: 'block' }}
                >
                  Lng: {farm.gpsLongitude.toFixed(4)}° E
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Worker breakdown — uses unfiltered farm.workers so totals are always correct */}
          {farm && farm.workers.length > 0 && (
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: 3, borderRadius: 3 }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Team Breakdown
              </Typography>
              {(['CEO', 'Captain', 'Worker'] as const).map((pos) => {
                const count = farm.workers.filter((w) => w.position === pos).length;
                if (count === 0) return null;
                return (
                  <Box
                    key={pos}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem',
                          bgcolor:
                            pos === 'CEO'
                              ? 'warning.main'
                              : pos === 'Captain'
                              ? 'primary.main'
                              : 'success.main',
                        }}
                      >
                        {pos.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {pos}
                      </Typography>
                    </Box>
                    <Chip
                      label={count}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                );
              })}

              {/* Expired warning */}
              {farm.workers.some((w) => w.isExpired) && (
                <Alert severity="warning" sx={{ mt: 2 }} variant="outlined">
                  {farm.workers.filter((w) => w.isExpired).length} worker
                  {farm.workers.filter((w) => w.isExpired).length > 1 ? 's have' : ' has'}{' '}
                  expired certification
                </Alert>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Floating Add Worker Button (mobile) */}
      <Fab
        color="primary"
        aria-label="Add worker"
        onClick={openAddWorker}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <PersonAddIcon />
      </Fab>

      {/* Worker Form Dialog */}
      <WorkerFormDialog
        open={workerDialogOpen}
        onClose={() => {
          setWorkerDialogOpen(false);
          setSelectedWorker(null);
        }}
        farmId={id!}
        worker={selectedWorker}
        hasCeo={hasCeo}
      />

      {/* Delete Farm Confirm */}
      <ConfirmDialog
        open={deleteFarmDialog}
        title="Delete Fish Farm"
        message={`Are you sure you want to delete "${farm?.name}"? This will also permanently remove all ${farm?.workers.length ?? 0} worker records. This cannot be undone.`}
        confirmLabel="Delete Farm"
        danger
        loading={deleteFarm.isPending}
        onConfirm={handleDeleteFarm}
        onCancel={() => setDeleteFarmDialog(false)}
      />

      {/* Delete Worker Confirm */}
      <ConfirmDialog
        open={Boolean(deleteWorkerDialog)}
        title="Remove Worker"
        message={`Remove "${deleteWorkerDialog?.name}" from this farm?`}
        confirmLabel="Remove"
        danger
        loading={deleteWorker.isPending}
        onConfirm={handleDeleteWorker}
        onCancel={() => setDeleteWorkerDialog(null)}
      />
    </Box>
  );
}

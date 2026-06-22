import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  Grid,
  Skeleton,
  Alert,
  Divider,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WaterIcon from '@mui/icons-material/Water';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useWorker, useDeleteWorker } from '../hooks/useWorkers';
import { useFishFarm } from '../hooks/useFishFarms';
import WorkerFormDialog from '../components/workers/WorkerFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PositionChip, CertificationChip } from '../components/common/StatusChip';
import { formatDate, formatDateTime } from '../utils/formatters';
import { useSnackbar } from 'notistack';
import { differenceInDays, parseISO } from 'date-fns';

export default function WorkerProfilePage() {
  const { farmId, workerId } = useParams<{ farmId: string; workerId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: worker, isLoading, isError } = useWorker(farmId!, workerId!);
  const { data: farm } = useFishFarm(farmId!);
  const deleteWorker = useDeleteWorker(farmId!);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const hasCeo =
    farm?.workers.some((w) => w.position === 'CEO' && w.id !== workerId) ??
    false;

  const handleDelete = async () => {
    if (!worker) return;
    await deleteWorker.mutateAsync(workerId!);
    enqueueSnackbar(`${worker.name} removed from farm`, { variant: 'info' });
    navigate(`/farms/${farmId}`);
  };

  // Certification days remaining
  const certDaysLeft = worker
    ? differenceInDays(parseISO(worker.certifiedUntil), new Date())
    : null;

  const certPercent =
    certDaysLeft !== null
      ? Math.max(0, Math.min(100, (certDaysLeft / 365) * 100))
      : 0;

  if (isError) {
    return (
      <Box>
        <Button
          component={Link}
          to={`/farms/${farmId}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Farm
        </Button>
        <Alert severity="error">Worker not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back navigation */}
      <Button
        component={Link}
        to={`/farms/${farmId}`}
        startIcon={<ArrowBackIcon />}
        color="inherit"
        sx={{ mb: 3 }}
      >
        {farm ? farm.name : 'Farm'}
      </Button>

      <Grid container spacing={3}>
        {/* ── LEFT: Profile Card ── */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: { md: 88 },
            }}
          >
            {/* Coloured top band */}
            <Box
              sx={{
                height: 100,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                position: 'relative',
              }}
            />

            {/* Avatar — centred, overlapping band */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: -6,
                pb: 3,
                px: 2,
              }}
            >
              {isLoading ? (
                <Skeleton variant="circular" width={96} height={96} />
              ) : (
                <Avatar
                  src={worker?.pictureUrl ?? undefined}
                  alt={worker?.name}
                  sx={{
                    width: 96,
                    height: 96,
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    border: '4px solid white',
                    boxShadow: '0 4px 20px rgba(0,61,122,0.2)',
                    bgcolor: 'primary.main',
                  }}
                >
                  {worker?.name.charAt(0).toUpperCase()}
                </Avatar>
              )}

              {/* Name */}
              <Typography
                variant="h5"
                fontWeight={700}
                textAlign="center"
                mt={1.5}
                mb={0.5}
              >
                {isLoading ? <Skeleton width={140} /> : worker?.name}
              </Typography>

              {/* Position badge */}
              {isLoading ? (
                <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: '20px' }} />
              ) : worker ? (
                <PositionChip position={worker.position} size="lg" />
              ) : null}

              {/* Cert status badge */}
              {isLoading ? (
                <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: '20px', mt: 0.5 }} />
              ) : worker ? (
                <Box sx={{ mt: 0.75 }}>
                  <CertificationChip
                    isExpired={worker.isExpired}
                    certifiedUntil={worker.certifiedUntil}
                    size="md"
                  />
                </Box>
              ) : null}

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Farm link */}
              {farm && (
                <Chip
                  icon={<WaterIcon />}
                  label={farm.name}
                  component={Link}
                  to={`/farms/${farmId}`}
                  clickable
                  variant="outlined"
                  color="primary"
                  size="small"
                  deleteIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                  onDelete={() => navigate(`/farms/${farmId}`)}
                  sx={{ fontWeight: 600, maxWidth: '100%' }}
                />
              )}

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditOpen(true)}
                  fullWidth
                  disabled={isLoading}
                >
                  Edit
                </Button>
                <Tooltip title="Remove worker">
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog(true)}
                    disabled={isLoading}
                    sx={{
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ── RIGHT: Details ── */}
        <Grid item xs={12} md={8} lg={9}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Contact & Personal */}
            <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2.5}>
                <InfoField
                  icon={<EmailIcon color="primary" />}
                  label="Email Address"
                  value={
                    isLoading ? null : (
                      <Typography
                        variant="body1"
                        component="a"
                        href={`mailto:${worker?.email}`}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          fontWeight: 500,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {worker?.email}
                      </Typography>
                    )
                  }
                />
                <InfoField
                  icon={<CakeIcon color="primary" />}
                  label="Age"
                  value={isLoading ? null : `${worker?.age} years old`}
                />
              </Grid>
            </Paper>

            {/* Certification */}
            <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Certification
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2.5}>
                <InfoField
                  icon={<VerifiedUserIcon color={worker?.isExpired ? 'error' : 'success'} />}
                  label="Certified Until"
                  value={
                    isLoading ? null : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          color={worker?.isExpired ? 'error.main' : 'text.primary'}
                        >
                          {formatDate(worker?.certifiedUntil)}
                        </Typography>
                        {worker && (
                          <CertificationChip
                            isExpired={worker.isExpired}
                            certifiedUntil={worker.certifiedUntil}
                            size="sm"
                          />
                        )}
                      </Box>
                    )
                  }
                />
              </Grid>

              {/* Certification progress bar */}
              {!isLoading && worker && !worker.isExpired && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Certification validity
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color={certDaysLeft! <= 30 ? 'warning.main' : 'success.main'}>
                      {certDaysLeft} days remaining
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={certPercent}
                    color={certDaysLeft! <= 30 ? 'warning' : 'success'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              {!isLoading && worker?.isExpired && (
                <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
                  This worker's certification expired on{' '}
                  <strong>{formatDate(worker.certifiedUntil)}</strong>. Edit the
                  worker to renew it.
                </Alert>
              )}
            </Paper>

            {/* Record timestamps */}
            <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Record
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <InfoField
                  icon={<CalendarTodayIcon color="action" />}
                  label="Added"
                  value={isLoading ? null : formatDateTime(worker?.createdAt)}
                />
                <InfoField
                  icon={<UpdateIcon color="action" />}
                  label="Last Updated"
                  value={isLoading ? null : formatDateTime(worker?.updatedAt)}
                />
              </Grid>
            </Paper>

          </Box>
        </Grid>
      </Grid>

      {/* Edit dialog */}
      {worker && (
        <WorkerFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          farmId={farmId!}
          worker={worker}
          hasCeo={hasCeo}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteDialog}
        title="Remove Worker"
        message={`Are you sure you want to remove "${worker?.name}" from this farm? This cannot be undone.`}
        confirmLabel="Remove Worker"
        danger
        loading={deleteWorker.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
      />
    </Box>
  );
}

// ── Reusable info field ──────────────────────────────────────────────────────

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            mt: 0.25,
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={600}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}
          >
            {label}
          </Typography>
          {value === null ? (
            <Skeleton width={140} height={22} />
          ) : typeof value === 'string' ? (
            <Typography variant="body1" fontWeight={500}>
              {value}
            </Typography>
          ) : (
            value
          )}
        </Box>
      </Box>
    </Grid>
  );
}

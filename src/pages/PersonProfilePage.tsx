import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Grid,
  Skeleton,
  Alert,
  Divider,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WaterIcon from '@mui/icons-material/Water';

import { usePerson, useDeletePerson } from '../hooks/usePeople';
import PersonFormDialog from '../components/people/PersonFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PositionChip, CertificationChip } from '../components/common/StatusChip';
import { formatDate, formatDateTime, formatAge } from '../utils/formatters';
import { useSnackbar } from 'notistack';
import { differenceInDays, parseISO } from 'date-fns';
import type { PersonFarmAssignmentDto } from '../types';

export default function PersonProfilePage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: person, isLoading, isError } = usePerson(personId!);
  const deletePerson = useDeletePerson();

  const [editOpen, setEditOpen]     = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const certDaysLeft = person
    ? differenceInDays(parseISO(person.certifiedUntil), new Date())
    : null;

  const certPercent =
    certDaysLeft !== null
      ? Math.max(0, Math.min(100, (certDaysLeft / 365) * 100))
      : 0;

  const handleDelete = async () => {
    if (!person) return;
    await deletePerson.mutateAsync(person.id);
    enqueueSnackbar(`${person.name} removed from registry`, { variant: 'info' });
    navigate('/people');
  };

  
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rounded" height={520} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3, mb: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    );
  }

  if (isError || !person) {
    return (
      <Box>
        <Button component={Link} to="/people" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to People
        </Button>
        <Alert severity="error">Person not found or could not be loaded.</Alert>
      </Box>
    );
  }

  return (
    <>
      <Button component={Link} to="/people" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to People
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 80 }}
          >
            {/* Gradient header */}
            <Box
              sx={{
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
                px: 3,
                pt: 4,
                pb: 6,
                position: 'relative',
              }}
            >
              {/* Action buttons */}
              <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit profile">
                  <IconButton
                    size="small"
                    onClick={() => setEditOpen(true)}
                    sx={{ bgcolor: alpha('#fff', 0.15), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete person">
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog(true)}
                    sx={{ bgcolor: alpha('#fff', 0.15), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Avatar
                src={person.pictureUrl ?? undefined}
                sx={{
                  width: 96,
                  height: 96,
                  border: '4px solid white',
                  fontSize: 36,
                  fontWeight: 700,
                  mx: 'auto',
                  display: 'block',
                  mb: 2,
                }}
              >
                {person.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            {/* Name + code */}
            <Box sx={{ px: 3, py: 2.5, mt: -1 }}>
              <Typography variant="h5" fontWeight={800} textAlign="center" gutterBottom>
                {person.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip
                  label={person.personCode}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    color: 'primary.dark',
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.25)}`,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                <CertificationChip
                  certifiedUntil={person.certifiedUntil}
                  isExpired={person.isExpired}
                  size="md"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Info list */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <InfoRow icon={<EmailIcon />} label="Email" value={person.email} />
                <InfoRow icon={<CakeIcon />} label="Age" value={formatAge(person.age)} />
                <InfoRow
                  icon={<VerifiedUserIcon />}
                  label="Certified Until"
                  value={formatDate(person.certifiedUntil)}
                />
                <InfoRow
                  icon={<ApartmentIcon />}
                  label="Farm Assignments"
                  value={`${person.assignments.length} active`}
                />
              </Box>

              {/* Cert timeline bar */}
              {!person.isExpired && certDaysLeft !== null && (
                <Box sx={{ mt: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Certification validity
                    </Typography>
                    <Typography variant="caption" fontWeight={700}
                      color={certDaysLeft < 30 ? 'error.main' : certDaysLeft < 90 ? 'warning.main' : 'success.main'}
                    >
                      {certDaysLeft}d left
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={certPercent}
                    color={certDaysLeft < 30 ? 'error' : certDaysLeft < 90 ? 'warning' : 'success'}
                    sx={{ borderRadius: 1, height: 6 }}
                  />
                </Box>
              )}

              <Divider sx={{ mt: 2.5, mb: 2 }} />

              {/* Dates */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    Added {formatDateTime(person.createdAt)}
                  </Typography>
                </Box>
                {person.updatedAt !== person.createdAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UpdateIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      Updated {formatDateTime(person.updatedAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ── RIGHT: Assignments ── */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <WaterIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Farm Assignments
              </Typography>
              <Chip
                label={person.assignments.length}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 'auto' }}
              />
            </Box>

            {person.assignments.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                  color: 'text.secondary',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                  borderRadius: 2,
                  border: (t) => `1px dashed ${alpha(t.palette.primary.main, 0.2)}`,
                }}
              >
                <ApartmentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.25 }} />
                <Typography variant="body2">Not assigned to any farm</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {person.assignments.map((assignment, idx) => (
                  <AssignmentCard key={assignment.farmWorkerId} assignment={assignment} index={idx} />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Edit dialog ── */}
      <PersonFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        person={person}
      />

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={deleteDialog}
        title="Remove Person"
        message={
          `Are you sure you want to permanently remove ${person.name} from the registry? ` +
          `This will also remove all their farm assignments. This action cannot be undone.`
        }
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
        loading={deletePerson.isPending}
      />
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: 'primary.main', mt: 0.15, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function AssignmentCard({
  assignment,
  index,
}: {
  assignment: PersonFarmAssignmentDto;
  index: number;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        transition: 'background-color 0.15s, box-shadow 0.15s',
        '&:hover': {
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
          boxShadow: 1,
        },
      }}
    >
      {/* Farm number badge */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {assignment.farmName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'text.secondary',
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              px: 0.75,
              py: 0.1,
              borderRadius: 1,
              flexShrink: 0,
            }}
          >
            {assignment.farmCode}
          </Typography>
        </Box>
        <PositionChip position={assignment.position} size="sm" />
      </Box>

      <Tooltip title="Go to farm">
        <IconButton
          size="small"
          component={Link}
          to={`/farms/${assignment.fishFarmId}`}
          color="primary"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

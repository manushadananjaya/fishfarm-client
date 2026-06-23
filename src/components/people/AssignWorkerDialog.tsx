import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  alpha,
  Skeleton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { usePeople } from '../../hooks/usePeople';
import { useAssignPersonToFarm } from '../../hooks/useWorkers';
import { useDebounce } from '../../hooks/useDebounce';
import { CertificationChip, PositionChip } from '../common/StatusChip';
import PersonFormDialog from './PersonFormDialog';
import type { PersonSummaryDto, WorkerPosition, FarmWorkerDto } from '../../types';
import { POSITION_TO_NUMBER } from '../../types';
import { getApiErrorMessage } from '../../utils/formErrors';

const POSITIONS: { label: string; value: WorkerPosition }[] = [
  { label: 'Worker', value: 'Worker' },
  { label: 'Captain', value: 'Captain' },
  { label: 'CEO', value: 'CEO' },
];

interface AssignWorkerDialogProps {
  open: boolean;
  onClose: () => void;
  farmId: string;
  farmName: string;
  assignedWorkers: FarmWorkerDto[];
}

export default function AssignWorkerDialog({
  open,
  onClose,
  farmId,
  farmName,
  assignedWorkers,
}: AssignWorkerDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const assignPerson = useAssignPersonToFarm(farmId);

  const [search, setSearch]               = useState('');
  const [selected, setSelected]           = useState<PersonSummaryDto | null>(null);
  const [role, setRole]                   = useState<WorkerPosition>('Worker');
  const [serverError, setServerError]     = useState<string | null>(null);
  const [createOpen, setCreateOpen]       = useState(false);
  const [pageSize, setPageSize]           = useState(20);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = usePeople({
    search: debouncedSearch || undefined,
    pageSize,
  });

  const hasCeo = assignedWorkers.some((w) => w.position === 'CEO');

  const assignedPersonIds = new Set(assignedWorkers.map((w) => w.personId));

  const handleSelect = (person: PersonSummaryDto) => {
    setSelected((prev) => (prev?.id === person.id ? null : person));
    setServerError(null);
  };

  const handleAssign = async () => {
    if (!selected) return;
    setServerError(null);

    const posNumber = POSITION_TO_NUMBER[role];
    if (!posNumber) {
      setServerError('Invalid role selected');
      return;
    }

    try {
      await assignPerson.mutateAsync({
        personId: selected.id,
        position: posNumber,
      });
      enqueueSnackbar(`${selected.name} assigned to ${farmName} as ${role}`, {
        variant: 'success',
      });
      handleClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const handleClose = () => {
    setSearch('');
    setSelected(null);
    setRole('Worker');
    setServerError(null);
    onClose();
  };

  const handlePersonCreated = (newPerson: { id: string; name: string; email: string }) => {
    setCreateOpen(false);
    enqueueSnackbar('Person created — you can now assign them to this farm.', {
      variant: 'info',
    });
    setSelected({
      id: newPerson.id,
      name: newPerson.name,
      email: newPerson.email,
      personCode: 'NEW',
      age: 0,
      certifiedUntil: '',
      isExpired: false,
      pictureUrl: null,
      farmCount: 0,
      createdAt: '',
      updatedAt: '',
    });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <GroupAddIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Assign Person to Farm
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {farmName}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ mb: 1.5 }}
            autoFocus
          />

          {/* Person list */}
          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              border: (t) => `1px solid ${t.palette.divider}`,
              borderRadius: 2,
              mb: 2,
            }}
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              ))
            ) : !data?.items.length ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No people found.{' '}
                  <Button
                    size="small"
                    onClick={() => setCreateOpen(true)}
                    startIcon={<PersonAddIcon />}
                  >
                    Create one
                  </Button>
                </Typography>
              </Box>
            ) : (
              data.items.map((person, idx) => {
                const isAssigned = assignedPersonIds.has(person.id);
                const isSelected = selected?.id === person.id;

                return (
                  <Box key={person.id}>
                    {idx > 0 && <Divider />}
                    <Tooltip
                      title={isAssigned ? 'Already assigned to this farm' : ''}
                      placement="left"
                    >
                      <span style={{ display: 'block' }}>
                        <Box
                          onClick={() => !isAssigned && handleSelect(person)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: 1.25,
                            cursor: isAssigned ? 'not-allowed' : 'pointer',
                            opacity: isAssigned ? 0.45 : 1,
                            bgcolor: isSelected
                              ? (t) => alpha(t.palette.primary.main, 0.1)
                              : 'transparent',
                            transition: 'background-color 0.15s',
                            '&:hover': !isAssigned
                              ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) }
                              : {},
                          }}
                        >
                          <Avatar
                            src={person.pictureUrl ?? undefined}
                            alt={person.name}
                            sx={{
                              width: 40,
                              height: 40,
                              border: isSelected
                                ? (t) => `2px solid ${t.palette.primary.main}`
                                : '2px solid transparent',
                            }}
                          >
                            {person.name.charAt(0).toUpperCase()}
                          </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {person.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{
                                bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                                px: 0.75,
                                py: 0.1,
                                borderRadius: 1,
                                flexShrink: 0,
                              }}
                            >
                              {person.personCode}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {person.email}
                            </Typography>
                            <CertificationChip
                              certifiedUntil={person.certifiedUntil}
                              isExpired={person.isExpired}
                              size="sm"
                            />
                          </Box>
                        </Box>

                        {isAssigned && (
                          <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                            Already assigned
                          </Typography>
                        )}
                        {isSelected && !isAssigned && (
                          <CheckCircleIcon color="primary" fontSize="small" sx={{ flexShrink: 0 }} />
                        )}
                      </Box>
                      </span>
                    </Tooltip>
                  </Box>
                );
              })
            )}
            {data && data.totalCount > data.items.length && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button size="small" onClick={() => setPageSize((p) => p + 20)}>
                  Load More
                </Button>
              </Box>
            )}
          </Box>

          {/* Role selector */}
          <FormControl fullWidth size="small">
            <InputLabel>Role at this farm</InputLabel>
            <Select
              value={role}
              label="Role at this farm"
              onChange={(e) => setRole(e.target.value as WorkerPosition)}
            >
              {POSITIONS.map(({ value }) => {
                const disabled = value === 'CEO' && hasCeo;
                return (
                  <MenuItem key={value} value={value} disabled={disabled}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PositionChip position={value} size="sm" />
                      {disabled && (
                        <Typography variant="caption" color="text.secondary">
                          (farm already has a CEO)
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: 'space-between' }}>
          {/* Create new person shortcut */}
          <Button
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ color: 'text.secondary' }}
          >
            Create new person first
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} disabled={assignPerson.isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={!selected || assignPerson.isPending}
              startIcon={
                assignPerson.isPending ? <CircularProgress size={16} /> : <GroupAddIcon />
              }
            >
              {assignPerson.isPending ? 'Assigning…' : 'Assign'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Inline person creation */}
      <PersonFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handlePersonCreated}
      />
    </>
  );
}

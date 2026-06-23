import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Avatar,
  alpha,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useSnackbar } from 'notistack';
import { useUpdateFarmWorkerRole } from '../../hooks/useWorkers';
import { getApiErrorMessage } from '../../utils/formErrors';
import { PositionChip } from '../common/StatusChip';
import type { FarmWorkerDto, WorkerPosition, PositionNumber } from '../../types';
import { POSITION_TO_NUMBER } from '../../types';

const POSITIONS: WorkerPosition[] = ['Worker', 'Captain', 'CEO'];

interface ChangeRoleDialogProps {
  open: boolean;
  onClose: () => void;
  farmId: string;
  worker: FarmWorkerDto | null;
  hasCeo: boolean;
}

export default function ChangeRoleDialog({
  open,
  onClose,
  farmId,
  worker,
  hasCeo,
}: ChangeRoleDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const updateRole = useUpdateFarmWorkerRole(farmId, worker?.id ?? '');

  const [role, setRole]             = useState<WorkerPosition>('Worker');
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open && worker) {
      setRole(worker.position);
      setServerError(null);
    }
  }, [open, worker]);

  const handleSave = async () => {
    if (!worker) return;
    setServerError(null);
    try {
      await updateRole.mutateAsync({ position: POSITION_TO_NUMBER[role] as PositionNumber });
      enqueueSnackbar(`${worker.personName}'s role updated to ${role}`, { variant: 'success' });
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const isUnchanged = worker?.position === role;
  const ceoBlocked = role === 'CEO' && hasCeo && worker?.position !== 'CEO';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SwapHorizIcon color="primary" />
        Change Role
      </DialogTitle>

      <DialogContent>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {worker && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, p: 1.5, borderRadius: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.05) }}>
            <Avatar src={worker.pictureUrl ?? undefined} sx={{ width: 40, height: 40 }}>
              {worker.personName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>{worker.personName}</Typography>
              <Typography variant="caption" color="text.secondary">{worker.personCode}</Typography>
            </Box>
          </Box>
        )}

        <FormControl fullWidth>
          <InputLabel>Role at this farm</InputLabel>
          <Select
            value={role}
            label="Role at this farm"
            onChange={(e) => setRole(e.target.value as WorkerPosition)}
          >
            {POSITIONS.map((pos) => {
              const disabled = pos === 'CEO' && hasCeo && worker?.position !== 'CEO';
              return (
                <MenuItem key={pos} value={pos} disabled={disabled}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PositionChip position={pos} size="sm" />
                    {disabled && (
                      <Typography variant="caption" color="text.secondary">
                        (already has a CEO)
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={updateRole.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isUnchanged || ceoBlocked || updateRole.isPending}
          startIcon={updateRole.isPending ? <CircularProgress size={16} /> : null}
        >
          {updateRole.isPending ? 'Saving…' : 'Save Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

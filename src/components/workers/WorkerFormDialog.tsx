import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  workerSchema,
  workerDefaultValues,
  type WorkerFormValues,
} from '../../schemas/workerSchema';
import ImageUpload from '../common/ImageUpload';
import type { Worker, WorkerPosition } from '../../types';
import { applyServerErrors } from '../../utils/formErrors';
import {
  useCreateWorker,
  useUpdateWorker,
  useUpdateWorkerPicture,
  useDeleteWorkerPicture,
} from '../../hooks/useWorkers';
import { useSnackbar } from 'notistack';

const POSITIONS: { value: WorkerPosition; label: string }[] = [
  { value: 'CEO', label: 'CEO' },
  { value: 'Captain', label: 'Captain' },
  { value: 'Worker', label: 'Worker' },
];

interface WorkerFormDialogProps {
  open: boolean;
  onClose: () => void;
  farmId: string;
  worker?: Worker | null;
  hasCeo?: boolean;
}

export default function WorkerFormDialog({
  open,
  onClose,
  farmId,
  worker,
  hasCeo = false,
}: WorkerFormDialogProps) {
  const isEdit = Boolean(worker);
  const { enqueueSnackbar } = useSnackbar();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pictureRemoved, setPictureRemoved] = useState(false);

  const createWorker = useCreateWorker(farmId);
  const updateWorker = useUpdateWorker(farmId, worker?.id ?? '');
  const updatePicture = useUpdateWorkerPicture(farmId, worker?.id ?? '');
  const deletePicture = useDeleteWorkerPicture(farmId, worker?.id ?? '');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: workerDefaultValues,
  });

  const pictureFile = watch('picture');
  const selectedPosition = watch('position');

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setServerError(null);
      setPictureRemoved(false);
      if (worker) {
        reset({
          name: worker.name,
          age: worker.age,
          email: worker.email,
          position: worker.position,
          certifiedUntil: worker.certifiedUntil,
          picture: undefined,
        });
      } else {
        reset(workerDefaultValues);
      }
    }
  }, [open, worker, reset]);

  const loading =
    createWorker.isPending ||
    updateWorker.isPending ||
    updatePicture.isPending ||
    deletePicture.isPending;

  const onSubmit = async (values: WorkerFormValues) => {
    setServerError(null);
    try {
      if (isEdit && worker) {
        await updateWorker.mutateAsync({
          name: values.name,
          age: values.age,
          email: values.email,
          position: values.position,
          certifiedUntil: values.certifiedUntil,
        });

        if (values.picture) {
          await updatePicture.mutateAsync(values.picture);
        } else if (pictureRemoved && worker.pictureUrl) {
          await deletePicture.mutateAsync();
        }

        enqueueSnackbar(`${values.name} updated successfully`, {
          variant: 'success',
        });
      } else {
        await createWorker.mutateAsync({
          name: values.name,
          age: values.age,
          email: values.email,
          position: values.position,
          certifiedUntil: values.certifiedUntil,
          picture: values.picture,
        });
        enqueueSnackbar(`${values.name} added to farm`, { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const msg = applyServerErrors(err, setError);
      if (msg) setServerError(msg);
    }
  };

  const showCeoWarning =
    !isEdit && selectedPosition === 'CEO' && hasCeo;
  const showExpiredWarning = isEdit && worker?.isExpired;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEdit ? <EditIcon color="primary" /> : <PersonAddIcon color="primary" />}
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? 'Edit Worker' : 'Add Worker'}
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{ ml: 'auto' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {showCeoWarning && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon />}
            sx={{ mb: 2 }}
          >
            This farm already has a CEO. Each farm can only have one CEO.
          </Alert>
        )}

        {showExpiredWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This worker's certification has expired. You must set a future
            "Certified Until" date to save changes.
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              {...register('name')}
              label="Full Name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              fullWidth
              disabled={loading}
              autoFocus
            />
          </Grid>

          {/* Age */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  label="Age"
                  type="number"
                  inputProps={{ min: 18, max: 80 }}
                  error={Boolean(errors.age)}
                  helperText={errors.age?.message ?? '18–80'}
                  fullWidth
                  disabled={loading}
                />
              )}
            />
          </Grid>

          {/* Position */}
          <Grid item xs={12} sm={8}>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Position"
                  error={Boolean(errors.position)}
                  helperText={errors.position?.message}
                  fullWidth
                  disabled={loading}
                >
                  {POSITIONS.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              error={Boolean(errors.email)}
              helperText={
                errors.email?.message ??
                'Must be globally unique across all active workers'
              }
              fullWidth
              disabled={loading}
            />
          </Grid>

          {/* Certified Until */}
          <Grid item xs={12}>
            <TextField
              {...register('certifiedUntil')}
              label="Certified Until"
              type="date"
              error={Boolean(errors.certifiedUntil)}
              helperText={
                errors.certifiedUntil?.message ??
                'Must be a future date (not today)'
              }
              fullWidth
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTomorrow() }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Picture */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              PROFILE PICTURE (optional)
            </Typography>
            <Controller
              name="picture"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={pictureFile ?? null}
                  existingUrl={isEdit ? worker?.pictureUrl : null}
                  onChange={(file) => field.onChange(file ?? undefined)}
                  onRemoveExisting={() => setPictureRemoved(true)}
                  maxSizeMb={3}
                  label=""
                  error={errors.picture?.message as string}
                  disabled={loading}
                  enableCrop
                  cropAspect={1}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : isEdit ? (
              <EditIcon />
            ) : (
              <PersonAddIcon />
            )
          }
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Worker'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

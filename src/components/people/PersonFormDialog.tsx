import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { useSnackbar } from 'notistack';
import { personSchema, personDefaultValues } from '../../schemas/personSchema';
import type { PersonFormValues } from '../../schemas/personSchema';
import {
  useCreatePerson,
  useUpdatePerson,
  useUpdatePersonPicture,
  useDeletePersonPicture,
} from '../../hooks/usePeople';
import { applyServerErrors } from '../../utils/formErrors';
import ImageUpload from '../common/ImageUpload';
import type { PersonDto } from '../../types';

interface PersonFormDialogProps {
  open: boolean;
  onClose: () => void;
  person?: PersonDto | null;
  onCreated?: (person: { id: string; name: string; email: string }) => void;
}

export default function PersonFormDialog({
  open,
  onClose,
  person,
  onCreated,
}: PersonFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = Boolean(person);

  const createPerson    = useCreatePerson();
  const updatePerson    = useUpdatePerson(person?.id ?? '');
  const updatePicture   = useUpdatePersonPicture(person?.id ?? '');
  const deletePicture   = useDeletePersonPicture(person?.id ?? '');

  const [serverError, setServerError]       = useState<string | null>(null);
  const [pictureRemoved, setPictureRemoved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: personDefaultValues,
  });

  const pictureFile = watch('picture');

  useEffect(() => {
    if (open) {
      setServerError(null);
      setPictureRemoved(false);
      if (person) {
        reset({
          name: person.name,
          email: person.email,
          age: person.age,
          certifiedUntil: person.isExpired ? '' : person.certifiedUntil,
          picture: undefined,
        });
      } else {
        reset(personDefaultValues);
      }
    }
  }, [open, person, reset]);

  const loading =
    createPerson.isPending ||
    updatePerson.isPending ||
    updatePicture.isPending ||
    deletePicture.isPending;

  const onSubmit = async (values: PersonFormValues) => {
    setServerError(null);
    try {
      if (isEdit && person) {
        await updatePerson.mutateAsync({
          name: values.name,
          email: values.email,
          age: values.age,
          certifiedUntil: values.certifiedUntil,
        });

        if (values.picture) {
          await updatePicture.mutateAsync(values.picture);
        } else if (pictureRemoved && person.pictureUrl) {
          await deletePicture.mutateAsync();
        }

        enqueueSnackbar(`${values.name} updated`, { variant: 'success' });
        onClose();
      } else {
        const { id } = await createPerson.mutateAsync({
          name: values.name,
          email: values.email,
          age: values.age,
          certifiedUntil: values.certifiedUntil,
          picture: values.picture,
        });

        enqueueSnackbar(`${values.name} created`, { variant: 'success' });
        onCreated?.({ id, name: values.name, email: values.email });
        onClose();
      }
    } catch (err) {
      const msg = applyServerErrors(err, setError);
      setServerError(msg ?? 'An unexpected error occurred. Please try again.');
    }
  };

  const showExpiredWarning = isEdit && person?.isExpired;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <PersonIcon color="primary" />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          {isEdit ? 'Edit Person Profile' : 'Create New Person'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {showExpiredWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This person&apos;s certification has expired. Enter a new future date
            in the <strong>Certified Until</strong> field to renew it.
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Profile picture */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="picture"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <ImageUpload
                      value={value ?? null}
                      existingUrl={person?.pictureUrl ?? null}
                      onChange={onChange}
                      enableCrop
                      cropAspect={1}
                      onRemoveExisting={() => setPictureRemoved(true)}
                    />
                  )}
                />
              </Box>
            </Box>
          </Grid>

          {/* Name */}
          <Grid item xs={12}>
            <TextField
              {...register('name')}
              label="Full Name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              fullWidth
              disabled={loading}
              autoFocus={!isEdit}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              fullWidth
              disabled={loading}
            />
          </Grid>

          {/* Age */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Age"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={Boolean(errors.age)}
                  helperText={errors.age?.message ?? '18–80'}
                  inputProps={{ min: 18, max: 80 }}
                  fullWidth
                  disabled={loading}
                />
              )}
            />
          </Grid>

          {/* Certified Until */}
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('certifiedUntil')}
              label="Certified Until"
              type="date"
              error={Boolean(errors.certifiedUntil)}
              helperText={errors.certifiedUntil?.message ?? 'Maritime certification expiry'}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={loading}
            />
          </Grid>
        </Grid>

        {/* Show new picture preview info */}
        {pictureFile && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            New picture selected: {pictureFile.name} ({(pictureFile.size / 1024).toFixed(0)} KB)
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Person'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

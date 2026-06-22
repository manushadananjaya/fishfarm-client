import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  Alert,
  Paper,
  alpha,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import GridViewIcon from '@mui/icons-material/GridView';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { farmSchema, farmDefaultValues, type FarmFormValues } from '../../schemas/farmSchema';
import GpsMapPicker from './GpsMapPicker';
import ImageUpload from '../common/ImageUpload';
import type { FishFarm } from '../../types';

interface FarmFormProps {
  initialData?: FishFarm | null;
  onSubmit: (values: FarmFormValues) => Promise<void>;
  loading?: boolean;
  serverError?: string | null;
  isEdit?: boolean;
  onPictureRemoved?: () => void;
}

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function FarmForm({
  initialData,
  onSubmit,
  loading = false,
  serverError,
  isEdit = false,
  onPictureRemoved,
}: FarmFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          gpsLatitude: initialData.gpsLatitude,
          gpsLongitude: initialData.gpsLongitude,
          numberOfCages: initialData.numberOfCages,
          hasBarge: initialData.hasBarge,
          picture: undefined,
        }
      : farmDefaultValues,
  });

  const latitude = watch('gpsLatitude');
  const longitude = watch('gpsLongitude');
  const pictureFile = watch('picture');

  const handleCoordinateChange = (lat: number, lng: number) => {
    setValue('gpsLatitude', lat, { shouldValidate: true });
    setValue('gpsLongitude', lng, { shouldValidate: true });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      {/* Two-column layout: left = details, right = map + photo */}
      <Grid container spacing={4}>

        {/* ── LEFT COLUMN ── */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Farm Details section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.025),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <SectionHeading
                icon={<InfoOutlinedIcon fontSize="small" />}
                title="Farm Details"
                subtitle="Basic information about the fish farm"
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  {...register('name')}
                  label="Farm Name"
                  placeholder="e.g. Fjord Atlantic Salmon Farm"
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message ?? 'Max 200 characters'}
                  fullWidth
                  autoFocus
                  disabled={loading}
                />

                <Controller
                  name="numberOfCages"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      label="Number of Cages"
                      type="number"
                      inputProps={{ min: 1 }}
                      error={Boolean(errors.numberOfCages)}
                      helperText={errors.numberOfCages?.message ?? 'Must be at least 1'}
                      fullWidth
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <GridViewIcon
                            fontSize="small"
                            sx={{ mr: 1, color: 'text.secondary' }}
                          />
                        ),
                      }}
                    />
                  )}
                />

                <Controller
                  name="hasBarge"
                  control={control}
                  render={({ field }) => (
                    <Box
                      onClick={() => !loading && field.onChange(!field.value)}
                      role="checkbox"
                      aria-checked={field.value}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && !loading) {
                          e.preventDefault();
                          field.onChange(!field.value);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        border: (theme) =>
                          `2px solid ${
                            field.value
                              ? theme.palette.primary.main
                              : theme.palette.divider
                          }`,
                        bgcolor: (theme) =>
                          field.value
                            ? alpha(theme.palette.primary.main, 0.06)
                            : 'background.paper',
                        transition: 'all 0.18s ease',
                        outline: 'none',
                        '&:focus-visible': {
                          boxShadow: (theme) =>
                            `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
                        },
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          bgcolor: (theme) =>
                            field.value
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.grey[500], 0.08),
                          color: field.value ? 'primary.main' : 'text.disabled',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <DirectionsBoatIcon />
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          Service Barge
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {field.value
                            ? 'This farm has a service barge'
                            : 'Click to indicate this farm has a barge'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          color: field.value ? 'primary.main' : 'text.disabled',
                          display: 'flex',
                          transition: 'color 0.18s ease',
                        }}
                      >
                        {field.value ? (
                          <CheckCircleIcon />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )}
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            </Paper>

            {/* Photo section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.025),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <SectionHeading
                icon={<PhotoCameraIcon fontSize="small" />}
                title="Farm Photo"
                subtitle={
                  isEdit
                    ? 'Upload a new photo to replace, or remove the current one'
                    : 'Optional — JPEG, PNG, or WebP · max 5 MB'
                }
              />
              <Controller
                name="picture"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={pictureFile ?? null}
                    existingUrl={isEdit ? initialData?.pictureUrl : null}
                    onChange={(file) => field.onChange(file ?? undefined)}
                    onRemoveExisting={onPictureRemoved}
                    maxSizeMb={5}
                    label=""
                    error={errors.picture?.message as string}
                    disabled={loading}
                  />
                )}
              />
            </Paper>
          </Box>
        </Grid>

        {/* ── RIGHT COLUMN ── */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.025),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <SectionHeading
              icon={<LocationOnIcon fontSize="small" />}
              title="GPS Location"
              subtitle="Click the map or drag the marker to set the farm's coordinates"
            />

            <GpsMapPicker
              latitude={latitude}
              longitude={longitude}
              onCoordinateChange={handleCoordinateChange}
              latError={errors.gpsLatitude?.message}
              lngError={errors.gpsLongitude?.message}
              disabled={loading}
            />
          </Paper>
        </Grid>

        {/* ── FULL-WIDTH SUBMIT ── */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 3 }} />
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{ minWidth: 220, py: 1.5 }}
            >
              {loading
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                ? 'Save Changes'
                : 'Register Fish Farm'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

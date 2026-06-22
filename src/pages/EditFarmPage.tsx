import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Breadcrumbs,
  Alert,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

import FarmForm from '../components/farms/FarmForm';
import type { FarmFormValues } from '../schemas/farmSchema';
import {
  useFishFarm,
  useUpdateFishFarm,
  useUpdateFishFarmPicture,
  useDeleteFishFarmPicture,
} from '../hooks/useFishFarms';
import { getApiErrorMessage } from '../utils/formErrors';
import { useSnackbar } from 'notistack';

export default function EditFarmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [serverError, setServerError] = useState<string | null>(null);
  // Tracks whether the user explicitly removed the existing photo
  const [pictureRemoved, setPictureRemoved] = useState(false);

  const { data: farm, isLoading, isError } = useFishFarm(id!);
  const updateFarm = useUpdateFishFarm(id!);
  const updatePicture = useUpdateFishFarmPicture(id!);
  const deletePicture = useDeleteFishFarmPicture(id!);

  const handleSubmit = async (values: FarmFormValues) => {
    setServerError(null);
    try {
      await updateFarm.mutateAsync({
        name: values.name,
        gpsLatitude: values.gpsLatitude,
        gpsLongitude: values.gpsLongitude,
        numberOfCages: values.numberOfCages,
        hasBarge: values.hasBarge,
      });

      if (values.picture) {
        // New file selected — replace photo
        await updatePicture.mutateAsync(values.picture);
      } else if (pictureRemoved && farm?.pictureUrl) {
        // User removed existing photo and didn't pick a new one → DELETE
        await deletePicture.mutateAsync();
      }

      enqueueSnackbar(`"${values.name}" updated successfully`, {
        variant: 'success',
      });
      navigate(`/farms/${id}`);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
    }
  };

  const loading =
    updateFarm.isPending ||
    updatePicture.isPending ||
    deletePicture.isPending;

  if (isError) {
    return (
      <Box>
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to Farms
        </Button>
        <Alert severity="error">Farm not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Button
          component={Link}
          to="/"
          startIcon={<HomeIcon />}
          color="inherit"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Fish Farms
        </Button>
        <Button
          component={Link}
          to={`/farms/${id}`}
          color="inherit"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          {isLoading ? <Skeleton width={120} /> : farm?.name}
        </Button>
        <Typography color="text.primary" variant="body2">
          Edit
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          component={Link}
          to={`/farms/${id}`}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Edit Farm
            </Typography>
            {isLoading ? (
              <Skeleton width={200} height={20} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {farm?.name}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Form Card */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={320} />
          </Box>
        ) : (
          <FarmForm
            initialData={farm}
            onSubmit={handleSubmit}
            loading={loading}
            serverError={serverError}
            isEdit
            onPictureRemoved={() => setPictureRemoved(true)}
          />
        )}
      </Paper>
    </Box>
  );
}

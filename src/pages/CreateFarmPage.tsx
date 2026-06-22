import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Paper, Typography, Button, Breadcrumbs } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

import FarmForm from '../components/farms/FarmForm';
import type { FarmFormValues } from '../schemas/farmSchema';
import { useCreateFishFarm, useUpdateFishFarmPicture } from '../hooks/useFishFarms';
import { getApiErrorMessage } from '../utils/formErrors';
import { useSnackbar } from 'notistack';

export default function CreateFarmPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [serverError, setServerError] = useState<string | null>(null);

  const createFarm = useCreateFishFarm();
  const updatePicture = useUpdateFishFarmPicture('');

  const handleSubmit = async (values: FarmFormValues) => {
    setServerError(null);
    try {
      const result = await createFarm.mutateAsync({
        name: values.name,
        gpsLatitude: values.gpsLatitude,
        gpsLongitude: values.gpsLongitude,
        numberOfCages: values.numberOfCages,
        hasBarge: values.hasBarge,
        picture: values.picture,
      });

      enqueueSnackbar(`"${values.name}" registered successfully!`, {
        variant: 'success',
      });
      navigate(`/farms/${result.id}`);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
    }
  };

  const loading = createFarm.isPending || updatePicture.isPending;

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
        <Typography color="text.primary" variant="body2">
          Register New Farm
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddBusinessIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Register Fish Farm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a new Norwegian fish farm to the registry
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form Card */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}
      >
        <FarmForm
          onSubmit={handleSubmit}
          loading={loading}
          serverError={serverError}
        />
      </Paper>
    </Box>
  );
}

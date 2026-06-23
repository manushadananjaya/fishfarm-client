
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useFarmWorker } from '../hooks/useWorkers';

export default function WorkerProfilePage() {
  const { farmId, workerId } = useParams<{ farmId: string; workerId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useFarmWorker(farmId!, workerId!);

  useEffect(() => {
    if (data?.personId) {
      navigate(`/people/${data.personId}`, { replace: true });
    }
  }, [data, navigate]);

  if (isError) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 2 }}>
      <CircularProgress size={24} />
      <Typography color="text.secondary">{isLoading ? 'Loading profile…' : 'Redirecting…'}</Typography>
    </Box>
  );
}

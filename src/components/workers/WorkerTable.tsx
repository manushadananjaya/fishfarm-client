import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Paper,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Worker } from '../../types';
import { PositionChip, CertificationChip } from '../common/StatusChip';
import { formatDate, formatAge } from '../../utils/formatters';

interface WorkerTableProps {
  workers: Worker[];
  loading?: boolean;
  onEdit?: (worker: Worker) => void;
  onDelete?: (worker: Worker) => void;
  readOnly?: boolean;
  farmId?: string;
}

export default function WorkerTable({
  workers,
  loading = false,
  onEdit,
  onDelete,
  readOnly = false,
  farmId,
}: WorkerTableProps) {
  const navigate = useNavigate();
  if (loading) {
    return (
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <WorkerTableHead showActions={!readOnly} />
          </TableHead>
          <TableBody>
            {[...Array(4)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton variant="circular" width={36} height={36} /></TableCell>
                <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                <TableCell><Skeleton variant="text" width={30} /></TableCell>
                <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                {!readOnly && <TableCell />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (workers.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
          borderRadius: 2,
          border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary" variant="body2">
          No workers registered yet
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: 2, overflowX: 'auto' }}
    >
      <Table size="small">
        <TableHead>
          <WorkerTableHead showActions={!readOnly} />
        </TableHead>
        <TableBody>
          {workers.map((worker) => (
            <TableRow
              key={worker.id}
              onClick={() =>
                farmId && navigate(`/farms/${farmId}/workers/${worker.id}`)
              }
              sx={{
                opacity: worker.isExpired ? 0.75 : 1,
                bgcolor: worker.isExpired
                  ? (theme) => alpha(theme.palette.error.main, 0.03)
                  : undefined,
                cursor: farmId ? 'pointer' : 'default',
              }}
            >
              {/* Avatar */}
              <TableCell sx={{ width: 52, pr: 0 }}>
                <Avatar
                  src={worker.pictureUrl ?? undefined}
                  alt={worker.name}
                  sx={{
                    width: 36,
                    height: 36,
                    border: (theme) =>
                      `2px solid ${
                        worker.isExpired
                          ? theme.palette.error.light
                          : theme.palette.divider
                      }`,
                  }}
                >
                  {worker.name.charAt(0).toUpperCase()}
                </Avatar>
              </TableCell>

              {/* Name */}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {worker.name}
                  </Typography>
                  {farmId && (
                    <OpenInNewIcon
                      sx={{ fontSize: 13, color: 'text.disabled', opacity: 0, '.MuiTableRow-root:hover &': { opacity: 1 }, transition: 'opacity 0.15s' }}
                    />
                  )}
                </Box>
              </TableCell>

              {/* Code */}
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.secondary' }}>
                  {worker.workerCode}
                </Typography>
              </TableCell>

              {/* Position */}
              <TableCell>
                <PositionChip position={worker.position} />
              </TableCell>

              {/* Age */}
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatAge(worker.age)}
                </Typography>
              </TableCell>

              {/* Email */}
              <TableCell sx={{ minWidth: 180 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 200,
                    }}
                  >
                    {worker.email}
                  </Typography>
                </Box>
              </TableCell>

              {/* Certified Until */}
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {formatDate(worker.certifiedUntil)}
                </Typography>
              </TableCell>

              {/* Certification Status */}
              <TableCell>
                <CertificationChip
                  isExpired={worker.isExpired}
                  certifiedUntil={worker.certifiedUntil}
                />
              </TableCell>

              {/* Actions */}
              {!readOnly && (
                <TableCell
                  align="right"
                  sx={{ whiteSpace: 'nowrap' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEdit && (
                    <Tooltip title="Edit worker">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(worker)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Remove worker">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(worker)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function WorkerTableHead({ showActions }: { showActions: boolean }) {
  return (
    <TableRow>
      <TableCell />
      <TableCell>Name</TableCell>
      <TableCell>ID</TableCell>
      <TableCell>Position</TableCell>
      <TableCell>Age</TableCell>
      <TableCell>Email</TableCell>
      <TableCell>Certified Until</TableCell>
      <TableCell>Status</TableCell>
      {showActions && <TableCell align="right">Actions</TableCell>}
    </TableRow>
  );
}

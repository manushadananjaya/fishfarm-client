import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Skeleton,
  alpha,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GridViewIcon from '@mui/icons-material/GridView';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import { useFishFarm } from '../../hooks/useFishFarms';
import { formatGps, formatDateTime } from '../../utils/formatters';

const FARM_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='260' viewBox='0 0 600 260'%3E%3Crect width='600' height='260' fill='%23003D7A' opacity='0.1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23003D7A' opacity='0.25' font-size='72'%3E🐟%3C/text%3E%3C/svg%3E`;

interface FarmQuickViewModalProps {
  farmId: string | null;
  onClose: () => void;
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.25 }}>
      <Box sx={{ color: 'primary.main', mt: 0.1, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.4 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.5 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function FarmQuickViewModal({ farmId, onClose }: FarmQuickViewModalProps) {
  const navigate = useNavigate();
  const { data: farm, isLoading } = useFishFarm(farmId ?? '');

  const open = Boolean(farmId);

  const handleViewFull = () => {
    if (farmId) {
      onClose();
      navigate(`/farms/${farmId}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        },
      }}
    >
      {/* Hero image */}
      <Box
        sx={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height={220} />
        ) : (
          <>
            <Box
              component="img"
              src={farm?.pictureUrl ?? FARM_PLACEHOLDER}
              alt={farm?.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Dark gradient for text legibility */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,20,60,0.82) 0%, rgba(0,20,60,0.15) 55%, transparent 100%)",
              }}
            />

            {/* Farm name + code over image */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: 2.5,
              }}
            >
              {/* Farm code badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.3,
                  borderRadius: "6px",
                  bgcolor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(4px)",
                  mb: 0.75,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "white",
                  }}
                >
                  {isLoading ? "——" : (farm?.farmCode ?? "")}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                fontWeight={800}
                color="white"
                sx={{
                  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                  lineHeight: 1.2,
                }}
              >
                {isLoading ? (
                  <Skeleton
                    width="60%"
                    sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                  />
                ) : (
                  farm?.name
                )}
              </Typography>
            </Box>
          </>
        )}

        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "rgba(0,0,0,0.45)",
            color: "white",
            backdropFilter: "blur(4px)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Details */}
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[...Array(5)].map((_, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                >
                  <Skeleton variant="circular" width={20} height={20} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="30%" height={12} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : farm ? (
            <>
              {/* GPS */}
              <StatRow
                icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                label="GPS Position"
                value={
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontFamily: "monospace" }}
                  >
                    {formatGps(farm.gpsLatitude, farm.gpsLongitude)}
                  </Typography>
                }
              />
              <Divider />

              {/* Cages + barge in a two-col layout */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <StatRow
                  icon={<GridViewIcon sx={{ fontSize: 18 }} />}
                  label="Number of Cages"
                  value={`${farm.numberOfCages} cage${farm.numberOfCages !== 1 ? "s" : ""}`}
                />
                <StatRow
                  icon={<DirectionsBoatIcon sx={{ fontSize: 18 }} />}
                  label="Service Barge"
                  value={
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.4,
                        px: 0.9,
                        py: 0.2,
                        borderRadius: "5px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        bgcolor: farm.hasBarge
                          ? (theme) => alpha(theme.palette.primary.main, 0.1)
                          : (theme) => alpha(theme.palette.text.disabled, 0.08),
                        color: farm.hasBarge ? "primary.main" : "text.disabled",
                      }}
                    >
                      {farm.hasBarge ? "⚓ Has Barge" : "No Barge"}
                    </Box>
                  }
                />
              </Box>
              <Divider />

              <StatRow
                icon={<GroupIcon sx={{ fontSize: 18 }} />}
                label="Workers"
                value={`${farm.workers.length} worker${farm.workers.length !== 1 ? "s" : ""}`}
              />
              <Divider />

              {/* Dates */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <StatRow
                  icon={<CalendarTodayIcon sx={{ fontSize: 18 }} />}
                  label="Registered"
                  value={formatDateTime(farm.createdAt)}
                />
                <StatRow
                  icon={<UpdateIcon sx={{ fontSize: 18 }} />}
                  label="Last Updated"
                  value={formatDateTime(farm.updatedAt)}
                />
              </Box>
            </>
          ) : null}
        </Box>

        {/* Action footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            size="large"
            endIcon={<OpenInNewIcon />}
            onClick={handleViewFull}
            disabled={isLoading}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            View Full Farm Details
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

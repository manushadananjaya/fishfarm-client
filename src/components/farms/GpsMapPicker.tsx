import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Box, TextField, Typography, Grid, Chip, alpha } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import L from 'leaflet';
import { roundTo4dp } from '../../utils/formatters';

// Fix default Leaflet marker icon paths broken by Vite bundling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Norway's fish-farming coastline center
const NORWAY_CENTER: [number, number] = [63.43, 10.4];
const DEFAULT_ZOOM = 5;

interface GpsMapPickerProps {
  latitude: number;
  longitude: number;
  onCoordinateChange: (lat: number, lng: number) => void;
  latError?: string;
  lngError?: string;
  disabled?: boolean;
  /** When true, renders as read-only minimap */
  readOnly?: boolean;
}

function MapClickHandler({
  onCoordinateChange,
  disabled,
}: {
  onCoordinateChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onCoordinateChange(
        roundTo4dp(e.latlng.lat),
        roundTo4dp(e.latlng.lng),
      );
    },
  });
  return null;
}

function MarkerWithDrag({
  position,
  onCoordinateChange,
  disabled,
}: {
  position: [number, number];
  onCoordinateChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onCoordinateChange(roundTo4dp(lat), roundTo4dp(lng));
      }
    },
  };

  return (
    <Marker
      draggable={!disabled}
      position={position}
      ref={markerRef}
      eventHandlers={eventHandlers}
    />
  );
}

export default function GpsMapPicker({
  latitude,
  longitude,
  onCoordinateChange,
  latError,
  lngError,
  disabled = false,
  readOnly = false,
}: GpsMapPickerProps) {
  const position: [number, number] = [
    isFinite(latitude) ? latitude : NORWAY_CENTER[0],
    isFinite(longitude) ? longitude : NORWAY_CENTER[1],
  ];

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) {
      onCoordinateChange(roundTo4dp(Math.max(-90, Math.min(90, v))), longitude);
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) {
      onCoordinateChange(latitude, roundTo4dp(Math.max(-180, Math.min(180, v))));
    }
  };

  return (
    <Box>
      {!readOnly && (
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            GPS Position — click the map or drag the marker
          </Typography>
          <Chip
            label="Norway coastline"
            size="small"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: (theme) =>
            `1px solid ${
              latError || lngError
                ? theme.palette.error.main
                : theme.palette.divider
            }`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <MapContainer
          center={NORWAY_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: readOnly ? 200 : 380, width: '100%' }}
          scrollWheelZoom={!readOnly}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && (
            <MapClickHandler
              onCoordinateChange={onCoordinateChange}
              disabled={disabled}
            />
          )}
          <MarkerWithDrag
            position={position}
            onCoordinateChange={onCoordinateChange}
            disabled={disabled || readOnly}
          />
          <RecenterMap position={position} />
        </MapContainer>
      </Box>

      {!readOnly && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <TextField
              label="Latitude"
              type="number"
              value={latitude}
              onChange={handleLatChange}
              disabled={disabled}
              error={Boolean(latError)}
              helperText={latError ?? 'Range: -90 to 90 (4 dp)'}
              inputProps={{ step: 0.0001, min: -90, max: 90 }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Longitude"
              type="number"
              value={longitude}
              onChange={handleLngChange}
              disabled={disabled}
              error={Boolean(lngError)}
              helperText={lngError ?? 'Range: -180 to 180 (4 dp)'}
              inputProps={{ step: 0.0001, min: -180, max: 180 }}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      )}

      {(latError || lngError) && !readOnly && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {latError ?? lngError}
        </Typography>
      )}
    </Box>
  );
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMapEvents({});
  // Only recenter when position is valid but don't follow every keystroke
  const prevPos = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (
      prevPos.current === null ||
      (prevPos.current[0] === NORWAY_CENTER[0] &&
        prevPos.current[1] === NORWAY_CENTER[1])
    ) {
      map.setView(position, map.getZoom());
    }
    prevPos.current = position;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

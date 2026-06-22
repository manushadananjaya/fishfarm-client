import { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import CropIcon from '@mui/icons-material/Crop';
import ImageCropDialog from './ImageCropDialog';

interface ImageUploadProps {
  value?: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  /** Called when the user removes the existing server photo (not a new-file selection) */
  onRemoveExisting?: () => void;
  maxSizeMb?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  /** When true, opens a crop/adjust dialog after file selection */
  enableCrop?: boolean;
  /** Crop aspect ratio (width/height). Default 1 = square */
  cropAspect?: number;
}

export default function ImageUpload({
  value,
  existingUrl,
  onChange,
  onRemoveExisting,
  maxSizeMb = 5,
  label = 'Upload Picture',
  error,
  disabled = false,
  enableCrop = false,
  cropAspect = 1,
}: ImageUploadProps) {
  const theme = useTheme();
  const [dragOver, setDragOver] = useState(false);

  // Crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState('photo.jpg');

  // When true, the user explicitly removed the existing server photo,
  // so we must show the dropzone even though no new File has been chosen yet.
  const [userRemovedExisting, setUserRemovedExisting] = useState(false);

  // Reset the "removed" flag whenever existingUrl changes
  // (e.g. dialog closes and reopens for a different worker/farm).
  const [trackedUrl, setTrackedUrl] = useState(existingUrl);
  if (existingUrl !== trackedUrl) {
    setTrackedUrl(existingUrl);
    if (userRemovedExisting) setUserRemovedExisting(false);
  }

  const previewUrl =
    userRemovedExisting
      ? null                                      // user removed existing → show dropzone
      : value
      ? URL.createObjectURL(value)                // new file selected
      : existingUrl ?? null;                      // fall back to server photo

  const sizePercent = value
    ? Math.min((value.size / (maxSizeMb * 1024 * 1024)) * 100, 100)
    : 0;

  const openCropOrSet = useCallback(
    (file: File) => {
      setUserRemovedExisting(false); // picking a new file clears the "removed" flag
      if (!enableCrop) {
        onChange(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropFileName(file.name);
        setCropSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [enableCrop, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) openCropOrSet(file);
    },
    [disabled, openCropOrSet],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) openCropOrSet(file);
    e.target.value = '';
  };

  const handleCropConfirm = (croppedFile: File) => {
    setCropSrc(null);
    onChange(croppedFile);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={600} mb={0.5} color="text.secondary">
          {label}
        </Typography>
      )}

      {previewUrl ? (
        <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <Box
            component="img"
            src={previewUrl}
            alt="Preview"
            sx={{
              width: '100%',
              maxHeight: 220,
              objectFit: 'cover',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              display: 'block',
            }}
          />

          {!disabled && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 0.5,
              }}
            >
              {/* Re-open crop dialog for already-selected new file */}
              {enableCrop && value && (
                <Tooltip title="Adjust crop">
                  <IconButton
                    size="small"
                    onClick={() => openCropOrSet(value)}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.55)',
                      color: 'white',
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                    }}
                  >
                    <CropIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={value ? 'Remove new photo' : 'Remove photo'}>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (value) {
                      // Clear the new file → revert to showing the existing server photo
                      onChange(null);
                    } else {
                      // Remove the existing server photo → show dropzone
                      setUserRemovedExisting(true);
                      onChange(null);
                      onRemoveExisting?.();
                    }
                  }}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {value && (
            <Box sx={{ mt: 0.75 }}>
              <LinearProgress
                variant="determinate"
                value={sizePercent}
                color={sizePercent > 90 ? 'error' : 'primary'}
                sx={{ borderRadius: 1, height: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(value.size / (1024 * 1024)).toFixed(2)} MB / {maxSizeMb} MB
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          component="label"
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 3,
            border: `2px dashed ${
              error
                ? theme.palette.error.main
                : dragOver
                ? theme.palette.primary.main
                : theme.palette.divider
            }`,
            borderRadius: 2,
            bgcolor: dragOver
              ? alpha(theme.palette.primary.main, 0.05)
              : alpha(theme.palette.grey[100], 0.5),
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            '&:hover': disabled
              ? {}
              : {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={disabled}
            onChange={handleInputChange}
          />
          <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Click to upload
              </Box>{' '}
              or drag & drop
            </Typography>
            <Typography variant="caption" color="text.disabled">
              JPEG, PNG, WebP · max {maxSizeMb} MB
              {enableCrop && ' · crop & adjust after upload'}
            </Typography>
          </Box>
          <CloudUploadIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Crop dialog — mounted only when a file has been selected */}
      {cropSrc && (
        <ImageCropDialog
          open={Boolean(cropSrc)}
          imageSrc={cropSrc}
          fileName={cropFileName}
          aspect={cropAspect}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </Box>
  );
}

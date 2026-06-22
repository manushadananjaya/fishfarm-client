import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import CropIcon from '@mui/icons-material/Crop';
import { getCroppedImageFile } from '../../utils/cropImage';

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  fileName: string;
  aspect?: number;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropDialog({
  open,
  imageSrc,
  fileName,
  aspect = 1,
  onConfirm,
  onCancel,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const ext = fileName.split('.').pop()?.toLowerCase();
      const mime =
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName,
        mime,
      );
      onConfirm(croppedFile);
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = (dir: 'left' | 'right') => {
    setRotation((r) => (r + (dir === 'right' ? 90 : -90) + 360) % 360);
  };

  return (
    <Dialog
      open={open}
      onClose={processing ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CropIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Adjust Photo
          </Typography>
          <IconButton
            onClick={onCancel}
            disabled={processing}
            size="small"
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Crop canvas area */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 320,
          bgcolor: '#1a1a1a',
        }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: 0 },
            cropAreaStyle: {
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            },
          }}
        />
      </Box>

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {/* Zoom control */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <ZoomOutIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
              Zoom
            </Typography>
            <ZoomInIcon fontSize="small" color="action" />
          </Box>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={(_, v) => setZoom(v as number)}
            color="primary"
            size="small"
          />
        </Box>

        {/* Rotation control */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
              Rotation — {rotation}°
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Rotate left 90°">
              <IconButton size="small" onClick={() => handleRotate('left')}>
                <RotateLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              onChange={(_, v) => setRotation(v as number)}
              color="primary"
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Tooltip title="Rotate right 90°">
              <IconButton size="small" onClick={() => handleRotate('right')}>
                <RotateRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onCancel} disabled={processing} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={processing}
          variant="contained"
          startIcon={
            processing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CropIcon />
            )
          }
        >
          {processing ? 'Applying…' : 'Apply Crop'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

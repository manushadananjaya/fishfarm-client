import { Box, Typography } from '@mui/material';
import type { WorkerPosition } from '../../types';
import { differenceInDays, parseISO } from 'date-fns';

// ── Shared pill style ──────────────────────────────────────────────────────

interface PillConfig {
  dot: string;
  text: string;
  bg: string;
  border: string;
}

function Pill({
  icon,
  label,
  config,
  size = 'sm',
}: {
  icon?: string;
  label: string;
  config: PillConfig;
  size?: 'sm' | 'md' | 'lg';
}) {
  const fontSize = size === 'lg' ? '0.875rem' : size === 'md' ? '0.8rem' : '0.72rem';
  const dotSize = size === 'lg' ? 8 : size === 'md' ? 7 : 6;
  const px = size === 'lg' ? '12px' : size === 'md' ? '10px' : '8px';
  const py = size === 'lg' ? '5px' : size === 'md' ? '4px' : '3px';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        px,
        py,
        borderRadius: '20px',
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {icon ? (
        <Box component="span" sx={{ fontSize: size === 'lg' ? '0.9rem' : '0.78rem', lineHeight: 1 }}>
          {icon}
        </Box>
      ) : (
        <Box
          component="span"
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            bgcolor: config.dot,
            flexShrink: 0,
          }}
        />
      )}
      <Typography
        component="span"
        sx={{
          fontSize,
          fontWeight: 600,
          color: config.text,
          lineHeight: 1,
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ── Position badge ─────────────────────────────────────────────────────────

const POSITION_CONFIGS: Record<WorkerPosition, PillConfig & { icon: string; label: string }> = {
  CEO: {
    icon: '★',
    label: 'CEO',
    dot: '#B45309',
    text: '#92400E',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  Captain: {
    icon: '⚓',
    label: 'Captain',
    dot: '#1D4ED8',
    text: '#1E40AF',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  Worker: {
    icon: '◆',
    label: 'Worker',
    dot: '#15803D',
    text: '#166534',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
};

interface PositionChipProps {
  position: WorkerPosition;
  /** sm = table rows, md = cards/lists, lg = profile page hero */
  size?: 'sm' | 'md' | 'lg';
}

export function PositionChip({ position, size = 'sm' }: PositionChipProps) {
  const cfg = POSITION_CONFIGS[position];
  return <Pill icon={cfg.icon} label={cfg.label} config={cfg} size={size} />;
}

// ── Certification badge ────────────────────────────────────────────────────

function getCertConfig(isExpired: boolean, daysLeft: number): PillConfig & { icon: string; label: string } {
  if (isExpired) {
    return {
      icon: '✕',
      label: 'Expired',
      dot: '#B91C1C',
      text: '#991B1B',
      bg: '#FEF2F2',
      border: '#FECACA',
    };
  }
  if (daysLeft <= 30) {
    return {
      icon: '⚠',
      label: `Expires in ${daysLeft}d`,
      dot: '#B45309',
      text: '#92400E',
      bg: '#FFFBEB',
      border: '#FDE68A',
    };
  }
  return {
    icon: '✓',
    label: 'Certified',
    dot: '#15803D',
    text: '#166534',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  };
}

interface CertificationChipProps {
  isExpired: boolean;
  certifiedUntil: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CertificationChip({
  isExpired,
  certifiedUntil,
  size = 'sm',
}: CertificationChipProps) {
  const daysLeft = isExpired
    ? -1
    : differenceInDays(parseISO(certifiedUntil), new Date());
  const cfg = getCertConfig(isExpired, daysLeft);
  return <Pill icon={cfg.icon} label={cfg.label} config={cfg} size={size} />;
}

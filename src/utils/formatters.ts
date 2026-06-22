import { format, parseISO, isValid } from 'date-fns';
import type { WorkerPosition } from '../types';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch {
    return dateStr;
  }
}

export function formatCoordinate(value: number, type: 'lat' | 'lng'): string {
  const abs = Math.abs(value);
  const dir =
    type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${abs.toFixed(4)}° ${dir}`;
}

export function formatGps(lat: number, lng: number): string {
  return `${formatCoordinate(lat, 'lat')}, ${formatCoordinate(lng, 'lng')}`;
}

export function roundTo4dp(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export const POSITION_LABELS: Record<WorkerPosition, string> = {
  CEO: 'CEO',
  Worker: 'Worker',
  Captain: 'Captain',
};

export const POSITION_COLORS: Record<
  WorkerPosition,
  'warning' | 'primary' | 'success'
> = {
  CEO: 'warning',
  Captain: 'primary',
  Worker: 'success',
};

export function formatAge(age: number): string {
  return `${age} yrs`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? singular + 's')}`;
}

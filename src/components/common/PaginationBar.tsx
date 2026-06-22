import { Box, Pagination, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface PaginationBarProps {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function PaginationBar({
  pageNumber,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions = [9, 18, 36],
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalCount);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing <strong>{totalCount === 0 ? 0 : start}–{end}</strong> of{' '}
        <strong>{totalCount}</strong> farms
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {onPageSizeChange && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pageSize}
              label="Per page"
              onChange={(e: SelectChangeEvent<number>) =>
                onPageSizeChange(Number(e.target.value))
              }
            >
              {pageSizeOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Pagination
          count={totalPages}
          page={pageNumber}
          onChange={(_, page) => onPageChange(page)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}

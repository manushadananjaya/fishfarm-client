import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Avatar,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Skeleton,
  Chip,
  Tooltip,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { usePeople } from '../hooks/usePeople';
import { useDebounce } from '../hooks/useDebounce';
import PaginationBar from '../components/common/PaginationBar';
import PersonFormDialog from '../components/people/PersonFormDialog';
import { formatDate, formatAge } from '../utils/formatters';

type CertFilter = 'all' | 'valid' | 'expired';
type SortField = 'name' | 'personCode' | 'age' | 'certifiedUntil' | 'farmCount';
type SortDir   = 'asc' | 'desc';

const PAGE_SIZE = 50;

export default function PeoplePage() {
  const navigate = useNavigate();

  const [search, setSearch]         = useState('');
  const [certFilter, setCertFilter] = useState<CertFilter>('all');
  const [page, setPage]             = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [sortField, setSortField]   = useState<SortField>('name');
  const [sortDir, setSortDir]       = useState<SortDir>('asc');

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isError } = usePeople({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    certExpired:
      certFilter === 'expired' ? true
      : certFilter === 'valid'   ? false
      : undefined,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (_: unknown, val: CertFilter | null) => {
    if (val !== null) {
      setCertFilter(val);
      setPage(1);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handlePersonCreated = (person: { id: string; name: string; email: string }) => {
    setCreateOpen(false);
    navigate(`/people/${person.id}`);
  };

  // Client-side sort (server doesn't expose a sort param for people list)
  const sortedItems = [...(data?.items ?? [])].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'name':          cmp = a.name.localeCompare(b.name);                   break;
      case 'personCode':    cmp = a.personCode.localeCompare(b.personCode);        break;
      case 'age':           cmp = a.age - b.age;                                   break;
      case 'certifiedUntil':cmp = a.certifiedUntil.localeCompare(b.certifiedUntil);break;
      case 'farmCount':     cmp = a.farmCount - b.farmCount;                       break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <Box>
      {/* ── Hero ── */}
      <Box
        sx={{
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 60%, ${alpha(t.palette.secondary.main, 0.8)} 100%)`,
          color: 'white',
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 5 },
          mb: 3,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <PeopleIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>
              People Registry
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Global directory of maritime personnel and their farm assignments
          </Typography>
          {data && (
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
              {data.totalCount} person{data.totalCount !== 1 ? 's' : ''} registered
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            fontWeight: 700,
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
          }}
        >
          New Person
        </Button>
      </Box>

      {/* ── Toolbar ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <ClearIcon
                  fontSize="small"
                  color="action"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSearchChange('')}
                />
              </InputAdornment>
            ) : null,
          }}
          sx={{ flex: '1 1 260px', maxWidth: 400 }}
        />

        <ToggleButtonGroup
          value={certFilter}
          exclusive
          onChange={handleFilterChange}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="valid">
            <VerifiedUserIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Valid cert
          </ToggleButton>
          <ToggleButton value="expired">
            <WarningAmberIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Expired
          </ToggleButton>
        </ToggleButtonGroup>

        {data && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {data.totalCount} result{data.totalCount !== 1 ? 's' : ''}
            {' · '}page {page} of {data.totalPages}
          </Typography>
        )}
      </Box>

      {/* ── Error ── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load people. Please refresh and try again.
        </Alert>
      )}

      {/* ── Table ── */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}
      >
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {/* Avatar col — not sortable */}
                <TableCell sx={{ width: 56, pl: 2 }} />

                <TableCell sortDirection={sortField === 'name' ? sortDir : false}>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDir : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={sortField === 'personCode' ? sortDir : false}>
                  <TableSortLabel
                    active={sortField === 'personCode'}
                    direction={sortField === 'personCode' ? sortDir : 'asc'}
                    onClick={() => handleSort('personCode')}
                  >
                    Code
                  </TableSortLabel>
                </TableCell>

                <TableCell>Email</TableCell>

                <TableCell
                  align="center"
                  sortDirection={sortField === 'age' ? sortDir : false}
                >
                  <TableSortLabel
                    active={sortField === 'age'}
                    direction={sortField === 'age' ? sortDir : 'asc'}
                    onClick={() => handleSort('age')}
                  >
                    Age
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  align="center"
                  sortDirection={sortField === 'farmCount' ? sortDir : false}
                >
                  <TableSortLabel
                    active={sortField === 'farmCount'}
                    direction={sortField === 'farmCount' ? sortDir : 'asc'}
                    onClick={() => handleSort('farmCount')}
                  >
                    Farms
                  </TableSortLabel>
                </TableCell>

                <TableCell align="center">Certification</TableCell>

                <TableCell
                  align="right"
                  sortDirection={sortField === 'certifiedUntil' ? sortDir : false}
                  sx={{ pr: 2 }}
                >
                  <TableSortLabel
                    active={sortField === 'certifiedUntil'}
                    direction={sortField === 'certifiedUntil' ? sortDir : 'asc'}
                    onClick={() => handleSort('certifiedUntil')}
                  >
                    Cert. Until
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading
                ? [...Array(12)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ pl: 2 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                      </TableCell>
                      {[200, 80, 160, 40, 40, 90, 90].map((w, j) => (
                        <TableCell key={j}>
                          <Skeleton width={w} height={16} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : sortedItems.map((person) => (
                    <TableRow
                      key={person.id}
                      hover
                      onClick={() => navigate(`/people/${person.id}`)}
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td': { border: 0 },
                        transition: 'background 0.15s',
                        ...(person.isExpired && {
                          bgcolor: (t) => alpha(t.palette.error.main, 0.04),
                          '&:hover': {
                            bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                          },
                        }),
                      }}
                    >
                      {/* Avatar */}
                      <TableCell sx={{ pl: 2, pr: 0 }}>
                        <Avatar
                          src={person.pictureUrl ?? undefined}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: (t) =>
                              `2px solid ${
                                person.isExpired
                                  ? t.palette.error.light
                                  : t.palette.divider
                              }`,
                          }}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {person.name}
                          </Typography>
                          <OpenInNewIcon
                            sx={{
                              fontSize: 12,
                              color: 'text.disabled',
                              opacity: 0,
                              transition: 'opacity 0.15s',
                              '.MuiTableRow-root:hover &': { opacity: 1 },
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Code */}
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                          }}
                        >
                          {person.personCode}
                        </Typography>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 220 }}
                        >
                          {person.email}
                        </Typography>
                      </TableCell>

                      {/* Age */}
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatAge(person.age)}
                        </Typography>
                      </TableCell>

                      {/* Farms */}
                      <TableCell align="center">
                        <Chip
                          label={person.farmCount}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>

                      {/* Cert status */}
                      <TableCell align="center">
                        <Tooltip
                          title={person.isExpired ? 'Certification expired' : 'Valid certification'}
                          arrow
                        >
                          <Chip
                            icon={
                              person.isExpired ? (
                                <WarningAmberIcon style={{ fontSize: 13 }} />
                              ) : (
                                <VerifiedUserIcon style={{ fontSize: 13 }} />
                              )
                            }
                            label={person.isExpired ? 'Expired' : 'Valid'}
                            size="small"
                            color={person.isExpired ? 'error' : 'success'}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* Cert until */}
                      <TableCell align="right" sx={{ pr: 2 }}>
                        <Typography
                          variant="body2"
                          color={person.isExpired ? 'error' : 'text.secondary'}
                          fontWeight={person.isExpired ? 600 : 400}
                          noWrap
                        >
                          {formatDate(person.certifiedUntil)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Empty state ── */}
      {!isLoading && !isError && data?.items.length === 0 && (
        <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
          <PeopleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.25 }} />
          <Typography variant="h6">No people found</Typography>
          <Typography variant="body2">
            {search ? 'Try a different search term.' : 'Create your first person to get started.'}
          </Typography>
          {!search && (
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ mt: 2 }}
            >
              Create Person
            </Button>
          )}
        </Box>
      )}

      {/* ── Pagination ── */}
      {data && data.totalPages > 1 && (
        <PaginationBar
          pageNumber={page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* ── Create dialog ── */}
      <PersonFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handlePersonCreated}
      />
    </Box>
  );
}

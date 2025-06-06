import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  GET_PRODUCTION_BATCHES,
  GET_PRODUCTION_BATCHES_BY_STATUS,
  GET_PRODUCTION_BATCHES_BY_REQUEST,
} from '../../graphql/productionManagement';

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  switch (status) {
    case 'PLANNED':
      color = 'info';
      break;
    case 'IN_PROGRESS':
      color = 'primary';
      break;
    case 'COMPLETED':
      color = 'success';
      break;
    case 'CANCELLED':
      color = 'error';
      break;
    case 'ON_HOLD':
      color = 'warning';
      break;
    default:
      color = 'default';
  }

  return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
};

const ProductionBatches = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Query for production batches
  const getQueryAndVariables = () => {
    if (filterRequestId) {
      return {
        query: GET_PRODUCTION_BATCHES_BY_REQUEST,
        variables: { requestId: filterRequestId },
      };
    } else if (filterStatus) {
      return {
        query: GET_PRODUCTION_BATCHES_BY_STATUS,
        variables: { status: filterStatus },
      };
    } else {
      return {
        query: GET_PRODUCTION_BATCHES,
        variables: {},
      };
    }
  };

  const { query, variables } = getQueryAndVariables();

  const {
    loading,
    error,
    data,
    refetch,
  } = useQuery(query, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setFilterRequestId(''); // Clear request filter when status filter is applied
    setPage(0);
  };

  // Handle request ID filter change
  const handleFilterRequestIdChange = (event) => {
    setFilterRequestId(event.target.value);
    setFilterStatus(''); // Clear status filter when request filter is applied
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterRequestId('');
    setSearchTerm('');
    setPage(0);
  };

  // Navigate to create batch page
  const handleCreateBatch = () => {
    navigate('/production-batches/create');
  };

  // Navigate to view batch page
  const handleViewBatch = (id) => {
    navigate(`/production-batches/${id}`);
  };

  // Navigate to edit batch page
  const handleEditBatch = (id) => {
    navigate(`/production-batches/${id}/edit`);
  };

  // Get batches data based on the current filter
  const getBatchesData = () => {
    if (!data) return [];
    
    if (filterRequestId) {
      return data.productionBatchesByRequest || [];
    } else if (filterStatus) {
      return data.productionBatchesByStatus || [];
    } else {
      return data.productionBatches || [];
    }
  };

  // Filter and paginate production batches
  const filteredBatches = getBatchesData().filter((batch) =>
    batch.batchNumber.toString().includes(searchTerm)
  );

  const paginatedBatches = filteredBatches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Production Batches</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBatch}
          >
            Create Batch
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search by Batch Number"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={filterStatus}
              onChange={handleFilterStatusChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              disabled={!!filterRequestId}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PLANNED">Planned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Filter by Request ID"
              value={filterRequestId}
              onChange={handleFilterRequestIdChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              disabled={!!filterStatus}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!filterStatus && !filterRequestId && !searchTerm}
              sx={{ height: '40px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading production batches: {error.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && !data && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && filteredBatches.length === 0 ? (
          <Alert severity="info">
            No production batches found. {searchTerm || filterStatus || filterRequestId ? 'Try clearing filters.' : ''}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>{batch.requestId}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>
                        {batch.startDate ? format(new Date(batch.startDate), 'dd MMM yyyy') : 'Not set'}
                      </TableCell>
                      <TableCell>
                        {batch.endDate ? format(new Date(batch.endDate), 'dd MMM yyyy') : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={batch.status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(batch.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBatch(batch.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(batch.status === 'PLANNED' || batch.status === 'ON_HOLD') && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditBatch(batch.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBatches.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ProductionBatches;
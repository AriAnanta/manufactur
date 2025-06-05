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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  GET_PRODUCTION_REQUESTS,
  GET_PRODUCTION_REQUESTS_BY_STATUS,
  CANCEL_PRODUCTION_REQUEST,
} from '../../graphql/productionManagement';

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  switch (status) {
    case 'PENDING':
      color = 'warning';
      break;
    case 'APPROVED':
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
    default:
      color = 'default';
  }

  return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
};

// Priority chip component
const PriorityChip = ({ priority }) => {
  let color = 'default';
  switch (priority) {
    case 'HIGH':
      color = 'error';
      break;
    case 'MEDIUM':
      color = 'warning';
      break;
    case 'LOW':
      color = 'success';
      break;
    default:
      color = 'default';
  }

  return <Chip label={priority} color={color} size="small" variant="outlined" />;
};

const ProductionRequests = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Query for production requests
  const {
    loading,
    error,
    data,
    refetch,
  } = useQuery(filterStatus ? GET_PRODUCTION_REQUESTS_BY_STATUS : GET_PRODUCTION_REQUESTS, {
    variables: filterStatus ? { status: filterStatus } : {},
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for cancelling a production request
  const [cancelProductionRequest, { loading: cancelLoading }] = useMutation(CANCEL_PRODUCTION_REQUEST, {
    onCompleted: () => {
      toast.success('Production request cancelled successfully');
      setOpenCancelDialog(false);
      setCancelReason('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel production request: ${error.message}`);
    },
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
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
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
    setSearchTerm('');
    setPage(0);
  };

  // Open cancel dialog
  const handleOpenCancelDialog = (id) => {
    setSelectedRequestId(id);
    setOpenCancelDialog(true);
  };

  // Close cancel dialog
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedRequestId(null);
    setCancelReason('');
  };

  // Handle cancel request
  const handleCancelRequest = () => {
    cancelProductionRequest({
      variables: {
        id: selectedRequestId,
        input: { notes: cancelReason },
      },
    });
  };

  // Navigate to create request page
  const handleCreateRequest = () => {
    navigate('/production-requests/create');
  };

  // Navigate to view request page
  const handleViewRequest = (id) => {
    navigate(`/production-requests/${id}`);
  };

  // Navigate to edit request page
  const handleEditRequest = (id) => {
    navigate(`/production-requests/${id}/edit`);
  };

  // Filter and paginate production requests
  const filteredRequests = data
    ? (filterStatus
      ? data.productionRequestsByStatus
      : data.productionRequests
    ).filter((request) =>
      request.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Production Requests</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRequest}
          >
            Create Request
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by Product Name"
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={filterStatus}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!filterStatus && !searchTerm}
              sx={{ height: '40px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading production requests: {error.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && !data && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && filteredRequests.length === 0 ? (
          <Alert severity="info">
            No production requests found. {searchTerm || filterStatus ? 'Try clearing filters.' : ''}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.productName}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>
                        {format(new Date(request.dueDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <PriorityChip priority={request.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={request.status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'PENDING' && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditRequest(request.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenCancelDialog(request.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
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
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Cancel Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Production Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this production request? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Cancellation"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Cancel</Button>
          <Button
            onClick={handleCancelRequest}
            color="error"
            disabled={cancelLoading}
            startIcon={cancelLoading && <CircularProgress size={20} />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionRequests;
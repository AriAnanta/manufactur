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
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  GET_PLANS,
  DELETE_PLAN,
  APPROVE_PLAN,
} from '../../graphql/productionPlanning';

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  switch (status) {
    case 'DRAFT':
      color = 'default';
      break;
    case 'PENDING_APPROVAL':
      color = 'warning';
      break;
    case 'APPROVED':
      color = 'success';
      break;
    case 'REJECTED':
      color = 'error';
      break;
    case 'IN_PROGRESS':
      color = 'primary';
      break;
    case 'COMPLETED':
      color = 'info';
      break;
    default:
      color = 'default';
  }

  return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
};

const ProductionPlans = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Query for production plans
  const {
    loading,
    error,
    data,
    refetch,
  } = useQuery(GET_PLANS, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for deleting a plan
  const [deletePlan, { loading: deleteLoading }] = useMutation(DELETE_PLAN, {
    onCompleted: () => {
      toast.success('Production plan deleted successfully');
      setOpenDeleteDialog(false);
      setDeleteReason('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete production plan: ${error.message}`);
    },
  });

  // Mutation for approving a plan
  const [approvePlan, { loading: approveLoading }] = useMutation(APPROVE_PLAN, {
    onCompleted: () => {
      toast.success('Production plan approved successfully');
      setOpenApproveDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to approve production plan: ${error.message}`);
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

  // Open delete dialog
  const handleOpenDeleteDialog = (id) => {
    setSelectedPlanId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPlanId(null);
    setDeleteReason('');
  };

  // Open approve dialog
  const handleOpenApproveDialog = (id) => {
    setSelectedPlanId(id);
    setOpenApproveDialog(true);
  };

  // Close approve dialog
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setSelectedPlanId(null);
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    deletePlan({
      variables: {
        id: selectedPlanId,
      },
    });
  };

  // Handle approve plan
  const handleApprovePlan = () => {
    approvePlan({
      variables: {
        id: selectedPlanId,
      },
    });
  };

  // Navigate to create plan page
  const handleCreatePlan = () => {
    navigate('/production-plans/create');
  };

  // Navigate to view plan page
  const handleViewPlan = (id) => {
    navigate(`/production-plans/${id}`);
  };

  // Navigate to edit plan page
  const handleEditPlan = (id) => {
    navigate(`/production-plans/${id}/edit`);
  };

  // Filter and paginate production plans
  const filteredPlans = data
    ? data.plans.filter((plan) =>
        (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         plan.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus ? plan.status === filterStatus : true)
      )
    : [];

  const paginatedPlans = filteredPlans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Production Plans</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePlan}
          >
            Create Plan
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by Name or Description"
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
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
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
            Error loading production plans: {error.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && !data && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && filteredPlans.length === 0 ? (
          <Alert severity="info">
            No production plans found. {searchTerm || filterStatus ? 'Try clearing filters.' : ''}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>
                        {plan.description.length > 50
                          ? `${plan.description.substring(0, 50)}...`
                          : plan.description}
                      </TableCell>
                      <TableCell>
                        {format(new Date(plan.startDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(plan.endDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={plan.status} />
                      </TableCell>
                      <TableCell>{plan.createdBy}</TableCell>
                      <TableCell>
                        {format(new Date(plan.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPlan(plan.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {plan.status === 'DRAFT' && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditPlan(plan.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(plan.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {plan.status === 'PENDING_APPROVAL' && (
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenApproveDialog(plan.id)}
                            >
                              <CheckCircleIcon fontSize="small" />
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
              count={filteredPlans.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Production Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this production plan? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Deletion"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeletePlan}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog}>
        <DialogTitle>Approve Production Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this production plan? This will make the plan available for execution.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Cancel</Button>
          <Button
            onClick={handleApprovePlan}
            color="success"
            disabled={approveLoading}
            startIcon={approveLoading && <CircularProgress size={20} />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionPlans;
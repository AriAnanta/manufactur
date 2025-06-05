import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  GET_MACHINES,
  GET_MACHINE_TYPES,
  CREATE_MACHINE,
  UPDATE_MACHINE,
  DELETE_MACHINE,
} from '../../graphql/machineQueue';

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  switch (status) {
    case 'AVAILABLE':
      color = 'success';
      break;
    case 'BUSY':
      color = 'warning';
      break;
    case 'MAINTENANCE':
      color = 'error';
      break;
    case 'OFFLINE':
      color = 'default';
      break;
    default:
      color = 'default';
  }

  return <Chip label={status} color={color} size="small" />;
};

const Machines = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'AVAILABLE',
    capacity: 1,
    location: '',
    description: '',
  });

  // Query for machines
  const {
    loading,
    error,
    data,
    refetch,
  } = useQuery(GET_MACHINES, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for machine types
  const {
    loading: typesLoading,
    error: typesError,
    data: typesData,
  } = useQuery(GET_MACHINE_TYPES, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for creating a machine
  const [createMachine, { loading: createLoading }] = useMutation(CREATE_MACHINE, {
    onCompleted: () => {
      toast.success('Machine created successfully');
      setOpenCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create machine: ${error.message}`);
    },
  });

  // Mutation for updating a machine
  const [updateMachine, { loading: updateLoading }] = useMutation(UPDATE_MACHINE, {
    onCompleted: () => {
      toast.success('Machine updated successfully');
      setOpenEditDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update machine: ${error.message}`);
    },
  });

  // Mutation for deleting a machine
  const [deleteMachine, { loading: deleteLoading }] = useMutation(DELETE_MACHINE, {
    onCompleted: () => {
      toast.success('Machine deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedMachine(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete machine: ${error.message}`);
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
  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event) => {
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
    setFilterType('');
    setFilterStatus('');
    setSearchTerm('');
    setPage(0);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      status: 'AVAILABLE',
      capacity: 1,
      location: '',
      description: '',
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? Number(value) : value,
    });
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // Close create dialog
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  // Open edit dialog
  const handleOpenEditDialog = (machine) => {
    setSelectedMachine(machine);
    setFormData({
      name: machine.name,
      type: machine.type,
      status: machine.status,
      capacity: machine.capacity,
      location: machine.location || '',
      description: machine.description || '',
    });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedMachine(null);
    resetForm();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (machine) => {
    setSelectedMachine(machine);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedMachine(null);
  };

  // Handle create machine
  const handleCreateMachine = () => {
    createMachine({
      variables: {
        input: {
          name: formData.name,
          type: formData.type,
          status: formData.status,
          capacity: formData.capacity,
          location: formData.location || null,
          description: formData.description || null,
        },
      },
    });
  };

  // Handle update machine
  const handleUpdateMachine = () => {
    updateMachine({
      variables: {
        id: selectedMachine.id,
        input: {
          name: formData.name,
          type: formData.type,
          status: formData.status,
          capacity: formData.capacity,
          location: formData.location || null,
          description: formData.description || null,
        },
      },
    });
  };

  // Handle delete machine
  const handleDeleteMachine = () => {
    deleteMachine({
      variables: {
        id: selectedMachine.id,
      },
    });
  };

  // Filter and paginate machines
  const filteredMachines = data
    ? data.machines.filter((machine) =>
        (machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (machine.description && machine.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filterType ? machine.type === filterType : true) &&
        (filterStatus ? machine.status === filterStatus : true)
      )
    : [];

  const paginatedMachines = filteredMachines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Machines</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Machine
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleFilterTypeChange}
                label="Filter by Type"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Types</MenuItem>
                {typesData && typesData.machineTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Filter by Status"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="BUSY">Busy</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="OFFLINE">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!filterType && !filterStatus && !searchTerm}
              sx={{ height: '40px' }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading machines: {error.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && !data && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && filteredMachines.length === 0 ? (
          <Alert severity="info">
            No machines found. {searchTerm || filterType || filterStatus ? 'Try clearing filters.' : ''}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMachines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell>{machine.name}</TableCell>
                      <TableCell>{machine.type}</TableCell>
                      <TableCell>
                        <StatusChip status={machine.status} />
                      </TableCell>
                      <TableCell>{machine.capacity}</TableCell>
                      <TableCell>{machine.location || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(machine.updatedAt), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(machine)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(machine)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMachines.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Create Machine Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Machine</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Machine Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Machine Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Machine Type"
                >
                  {typesLoading ? (
                    <MenuItem disabled>Loading machine types...</MenuItem>
                  ) : typesError ? (
                    <MenuItem disabled>Error loading machine types</MenuItem>
                  ) : typesData && typesData.machineTypes ? (
                    typesData.machineTypes.map((type) => (
                      <MenuItem key={type.id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No machine types available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="BUSY">Busy</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  <MenuItem value="OFFLINE">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 1 } }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateMachine}
            color="primary"
            disabled={createLoading || !formData.name || !formData.type}
            startIcon={createLoading && <CircularProgress size={20} />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Machine Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Machine</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Machine Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Machine Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Machine Type"
                >
                  {typesLoading ? (
                    <MenuItem disabled>Loading machine types...</MenuItem>
                  ) : typesError ? (
                    <MenuItem disabled>Error loading machine types</MenuItem>
                  ) : typesData && typesData.machineTypes ? (
                    typesData.machineTypes.map((type) => (
                      <MenuItem key={type.id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No machine types available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="BUSY">Busy</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  <MenuItem value="OFFLINE">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 1 } }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateMachine}
            color="primary"
            disabled={updateLoading || !formData.name || !formData.type}
            startIcon={updateLoading && <CircularProgress size={20} />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Machine Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Machine</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the machine "{selectedMachine?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteMachine}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Machines;
import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  GET_MACHINES,
  GET_MACHINE_QUEUES,
  GET_BATCH_QUEUES,
  CREATE_MACHINE_QUEUE,
  UPDATE_MACHINE_QUEUE,
  DELETE_MACHINE_QUEUE,
  CHANGE_QUEUE_PRIORITY,
  REORDER_QUEUE,
  START_QUEUE,
  COMPLETE_QUEUE,
} from '../../graphql/machineQueue';
import { GET_PRODUCTION_BATCHES } from '../../graphql/productionManagement';

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  switch (status) {
    case 'PENDING':
      color = 'warning';
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
      color = 'info';
      break;
    default:
      color = 'default';
  }

  return <Chip label={priority} color={color} size="small" />;
};

const MachineQueue = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterMachine, setFilterMachine] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStartDialog, setOpenStartDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    machineId: '',
    batchId: '',
    priority: 'MEDIUM',
    estimatedStartTime: new Date(),
    estimatedEndTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    notes: '',
  });

  // Query for machine queues
  const {
    loading: queuesLoading,
    error: queuesError,
    data: queuesData,
    refetch: refetchQueues,
  } = useQuery(GET_MACHINE_QUEUES, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for batch queues
  const {
    loading: batchQueuesLoading,
    error: batchQueuesError,
    data: batchQueuesData,
    refetch: refetchBatchQueues,
  } = useQuery(GET_BATCH_QUEUES, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for machines
  const {
    loading: machinesLoading,
    error: machinesError,
    data: machinesData,
  } = useQuery(GET_MACHINES, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for production batches
  const {
    loading: batchesLoading,
    error: batchesError,
    data: batchesData,
  } = useQuery(GET_PRODUCTION_BATCHES, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for creating a queue
  const [createQueue, { loading: createLoading }] = useMutation(CREATE_MACHINE_QUEUE, {
    onCompleted: () => {
      toast.success('Machine queue created successfully');
      setOpenCreateDialog(false);
      resetForm();
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to create machine queue: ${error.message}`);
    },
  });

  // Mutation for updating a queue
  const [updateQueue, { loading: updateLoading }] = useMutation(UPDATE_MACHINE_QUEUE, {
    onCompleted: () => {
      toast.success('Machine queue updated successfully');
      setOpenEditDialog(false);
      resetForm();
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to update machine queue: ${error.message}`);
    },
  });

  // Mutation for deleting a queue
  const [deleteQueue, { loading: deleteLoading }] = useMutation(DELETE_MACHINE_QUEUE, {
    onCompleted: () => {
      toast.success('Machine queue deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedQueue(null);
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to delete machine queue: ${error.message}`);
    },
  });

  // Mutation for changing queue priority
  const [changeQueuePriority, { loading: priorityLoading }] = useMutation(CHANGE_QUEUE_PRIORITY, {
    onCompleted: () => {
      toast.success('Queue priority changed successfully');
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to change queue priority: ${error.message}`);
    },
  });

  // Mutation for reordering queue
  const [reorderQueue, { loading: reorderLoading }] = useMutation(REORDER_QUEUE, {
    onCompleted: () => {
      toast.success('Queue reordered successfully');
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to reorder queue: ${error.message}`);
    },
  });

  // Mutation for starting a queue
  const [startQueue, { loading: startLoading }] = useMutation(START_QUEUE, {
    onCompleted: () => {
      toast.success('Queue started successfully');
      setOpenStartDialog(false);
      setSelectedQueue(null);
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to start queue: ${error.message}`);
    },
  });

  // Mutation for completing a queue
  const [completeQueue, { loading: completeLoading }] = useMutation(COMPLETE_QUEUE, {
    onCompleted: () => {
      toast.success('Queue completed successfully');
      setOpenCompleteDialog(false);
      setSelectedQueue(null);
      refetchQueues();
      refetchBatchQueues();
    },
    onError: (error) => {
      toast.error(`Failed to complete queue: ${error.message}`);
    },
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setFilterMachine('');
    setFilterStatus('');
    setFilterBatch('');
    setSearchTerm('');
  };

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
  const handleFilterMachineChange = (event) => {
    setFilterMachine(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleFilterBatchChange = (event) => {
    setFilterBatch(event.target.value);
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterMachine('');
    setFilterStatus('');
    setFilterBatch('');
    setSearchTerm('');
    setPage(0);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      machineId: '',
      batchId: '',
      priority: 'MEDIUM',
      estimatedStartTime: new Date(),
      estimatedEndTime: new Date(new Date().setHours(new Date().getHours() + 2)),
      notes: '',
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
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
  const handleOpenEditDialog = (queue) => {
    setSelectedQueue(queue);
    setFormData({
      machineId: queue.machine.id,
      batchId: queue.batch.id,
      priority: queue.priority,
      estimatedStartTime: new Date(queue.estimatedStartTime),
      estimatedEndTime: new Date(queue.estimatedEndTime),
      notes: queue.notes || '',
    });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedQueue(null);
    resetForm();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (queue) => {
    setSelectedQueue(queue);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedQueue(null);
  };

  // Open start dialog
  const handleOpenStartDialog = (queue) => {
    setSelectedQueue(queue);
    setOpenStartDialog(true);
  };

  // Close start dialog
  const handleCloseStartDialog = () => {
    setOpenStartDialog(false);
    setSelectedQueue(null);
  };

  // Open complete dialog
  const handleOpenCompleteDialog = (queue) => {
    setSelectedQueue(queue);
    setOpenCompleteDialog(true);
  };

  // Close complete dialog
  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
    setSelectedQueue(null);
  };

  // Handle create queue
  const handleCreateQueue = () => {
    createQueue({
      variables: {
        input: {
          machineId: formData.machineId,
          batchId: formData.batchId,
          priority: formData.priority,
          estimatedStartTime: formData.estimatedStartTime.toISOString(),
          estimatedEndTime: formData.estimatedEndTime.toISOString(),
          notes: formData.notes || null,
        },
      },
    });
  };

  // Handle update queue
  const handleUpdateQueue = () => {
    updateQueue({
      variables: {
        id: selectedQueue.id,
        input: {
          machineId: formData.machineId,
          batchId: formData.batchId,
          priority: formData.priority,
          estimatedStartTime: formData.estimatedStartTime.toISOString(),
          estimatedEndTime: formData.estimatedEndTime.toISOString(),
          notes: formData.notes || null,
        },
      },
    });
  };

  // Handle delete queue
  const handleDeleteQueue = () => {
    deleteQueue({
      variables: {
        id: selectedQueue.id,
      },
    });
  };

  // Handle change priority
  const handleChangePriority = (queueId, newPriority) => {
    changeQueuePriority({
      variables: {
        id: queueId,
        priority: newPriority,
      },
    });
  };

  // Handle start queue
  const handleStartQueue = () => {
    startQueue({
      variables: {
        id: selectedQueue.id,
      },
    });
  };

  // Handle complete queue
  const handleCompleteQueue = () => {
    completeQueue({
      variables: {
        id: selectedQueue.id,
      },
    });
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const machineId = source.droppableId;
    const oldIndex = source.index;
    const newIndex = destination.index;

    reorderQueue({
      variables: {
        machineId,
        oldIndex,
        newIndex,
      },
    });
  };

  // Filter and paginate machine queues
  const filteredQueues = queuesData
    ? queuesData.machineQueues.filter((queue) =>
        (queue.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         queue.batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (queue.notes && queue.notes.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filterMachine ? queue.machine.id === filterMachine : true) &&
        (filterStatus ? queue.status === filterStatus : true) &&
        (filterBatch ? queue.batch.id === filterBatch : true)
      )
    : [];

  const paginatedQueues = filteredQueues.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Group queues by machine for the visual queue view
  const queuesByMachine = {};
  if (queuesData && queuesData.machineQueues) {
    queuesData.machineQueues.forEach(queue => {
      if (queue.status === 'PENDING' || queue.status === 'IN_PROGRESS') {
        if (!queuesByMachine[queue.machine.id]) {
          queuesByMachine[queue.machine.id] = {
            machine: queue.machine,
            queues: [],
          };
        }
        queuesByMachine[queue.machine.id].queues.push(queue);
      }
    });

    // Sort queues by priority and order
    Object.values(queuesByMachine).forEach(machineQueue => {
      machineQueue.queues.sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.order - b.order;
      });
    });
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Machine Queue</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add to Queue
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Queue List" />
            <Tab label="Visual Queue" />
            <Tab label="Batch Queues" />
          </Tabs>
        </Box>

        {/* Queue List Tab */}
        {tabValue === 0 && (
          <>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Search"
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
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Machine</InputLabel>
                  <Select
                    value={filterMachine}
                    onChange={handleFilterMachineChange}
                    label="Machine"
                  >
                    <MenuItem value="">All Machines</MenuItem>
                    {machinesData && machinesData.machines.map((machine) => (
                      <MenuItem key={machine.id} value={machine.id}>
                        {machine.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleFilterStatusChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Batch</InputLabel>
                  <Select
                    value={filterBatch}
                    onChange={handleFilterBatchChange}
                    label="Batch"
                  >
                    <MenuItem value="">All Batches</MenuItem>
                    {batchesData && batchesData.productionBatches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.batchNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!filterMachine && !filterStatus && !filterBatch && !searchTerm}
                  sx={{ height: '40px' }}
                  fullWidth
                >
                  Clear
                </Button>
              </Grid>
            </Grid>

            {/* Error message */}
            {queuesError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Error loading machine queues: {queuesError.message}
              </Alert>
            )}

            {/* Loading indicator */}
            {queuesLoading && !queuesData && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Table */}
            {!queuesLoading && filteredQueues.length === 0 ? (
              <Alert severity="info">
                No machine queues found. {searchTerm || filterMachine || filterStatus || filterBatch ? 'Try clearing filters.' : ''}
              </Alert>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Machine</TableCell>
                        <TableCell>Batch</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Estimated Start</TableCell>
                        <TableCell>Estimated End</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedQueues.map((queue) => (
                        <TableRow key={queue.id}>
                          <TableCell>{queue.machine.name}</TableCell>
                          <TableCell>{queue.batch.batchNumber}</TableCell>
                          <TableCell>
                            <StatusChip status={queue.status} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PriorityChip priority={queue.priority} />
                              {queue.status === 'PENDING' && (
                                <Box sx={{ ml: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleChangePriority(queue.id, 'HIGH')}
                                    disabled={queue.priority === 'HIGH' || priorityLoading}
                                    color="error"
                                  >
                                    <ArrowUpwardIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleChangePriority(queue.id, 'LOW')}
                                    disabled={queue.priority === 'LOW' || priorityLoading}
                                    color="info"
                                  >
                                    <ArrowDownwardIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {format(new Date(queue.estimatedStartTime), 'dd MMM yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(queue.estimatedEndTime), 'dd MMM yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            {queue.status === 'PENDING' && (
                              <>
                                <Tooltip title="Start">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenStartDialog(queue)}
                                  >
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditDialog(queue)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(queue)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {queue.status === 'IN_PROGRESS' && (
                              <Tooltip title="Complete">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenCompleteDialog(queue)}
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
                  count={filteredQueues.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </>
        )}

        {/* Visual Queue Tab */}
        {tabValue === 1 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            {queuesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : queuesError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Error loading machine queues: {queuesError.message}
              </Alert>
            ) : Object.keys(queuesByMachine).length === 0 ? (
              <Alert severity="info">
                No active machine queues found.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {Object.values(queuesByMachine).map((machineQueue) => (
                  <Grid item xs={12} md={6} lg={4} key={machineQueue.machine.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {machineQueue.machine.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Type: {machineQueue.machine.type} | Status: <StatusChip status={machineQueue.machine.status} />
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Droppable droppableId={machineQueue.machine.id}>
                          {(provided) => (
                            <List
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{ bgcolor: 'background.paper' }}
                            >
                              {machineQueue.queues.map((queue, index) => (
                                <Draggable
                                  key={queue.id}
                                  draggableId={queue.id}
                                  index={index}
                                  isDragDisabled={queue.status !== 'PENDING'}
                                >
                                  {(provided) => (
                                    <ListItem
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        mb: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        bgcolor: queue.status === 'IN_PROGRESS' ? 'action.selected' : 'inherit',
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="subtitle1">
                                              {queue.batch.batchNumber}
                                            </Typography>
                                            <Box sx={{ ml: 1 }}>
                                              <PriorityChip priority={queue.priority} />
                                            </Box>
                                            <Box sx={{ ml: 1 }}>
                                              <StatusChip status={queue.status} />
                                            </Box>
                                          </Box>
                                        }
                                        secondary={
                                          <>
                                            <Typography variant="body2" component="span" display="block">
                                              Start: {format(new Date(queue.estimatedStartTime), 'dd MMM HH:mm')}
                                            </Typography>
                                            <Typography variant="body2" component="span" display="block">
                                              End: {format(new Date(queue.estimatedEndTime), 'dd MMM HH:mm')}
                                            </Typography>
                                            {queue.notes && (
                                              <Typography variant="body2" component="span" display="block">
                                                Notes: {queue.notes}
                                              </Typography>
                                            )}
                                          </>
                                        }
                                      />
                                      <ListItemSecondaryAction>
                                        {queue.status === 'PENDING' && (
                                          <>
                                            <Tooltip title="Start">
                                              <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenStartDialog(queue)}
                                              >
                                                <PlayArrowIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleOpenEditDialog(queue)}
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </>
                                        )}
                                        {queue.status === 'IN_PROGRESS' && (
                                          <Tooltip title="Complete">
                                            <IconButton
                                              size="small"
                                              color="success"
                                              onClick={() => handleOpenCompleteDialog(queue)}
                                            >
                                              <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {machineQueue.queues.length === 0 && (
                                <ListItem>
                                  <ListItemText
                                    primary="No queued batches"
                                    secondary="This machine has no pending or in-progress batches"
                                  />
                                </ListItem>
                              )}
                            </List>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </DragDropContext>
        )}

        {/* Batch Queues Tab */}
        {tabValue === 2 && (
          <>
            {/* Error message */}
            {batchQueuesError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Error loading batch queues: {batchQueuesError.message}
              </Alert>
            )}

            {/* Loading indicator */}
            {batchQueuesLoading && !batchQueuesData && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Batch Queues */}
            {!batchQueuesLoading && (!batchQueuesData || batchQueuesData.batchQueues.length === 0) ? (
              <Alert severity="info">
                No batch queues found.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {batchQueuesData && batchQueuesData.batchQueues.map((batchQueue) => (
                  <Grid item xs={12} md={6} lg={4} key={batchQueue.batch.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Batch: {batchQueue.batch.batchNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Product: {batchQueue.batch.productName} | Quantity: {batchQueue.batch.quantity}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <List sx={{ bgcolor: 'background.paper' }}>
                          {batchQueue.queues.length === 0 ? (
                            <ListItem>
                              <ListItemText
                                primary="No machine queues"
                                secondary="This batch is not assigned to any machine queues"
                              />
                            </ListItem>
                          ) : (
                            batchQueue.queues.map((queue) => (
                              <ListItem
                                key={queue.id}
                                sx={{
                                  mb: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  bgcolor: queue.status === 'IN_PROGRESS' ? 'action.selected' : 'inherit',
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="subtitle1">
                                        {queue.machine.name}
                                      </Typography>
                                      <Box sx={{ ml: 1 }}>
                                        <PriorityChip priority={queue.priority} />
                                      </Box>
                                      <Box sx={{ ml: 1 }}>
                                        <StatusChip status={queue.status} />
                                      </Box>
                                    </Box>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="body2" component="span" display="block">
                                        Start: {format(new Date(queue.estimatedStartTime), 'dd MMM HH:mm')}
                                      </Typography>
                                      <Typography variant="body2" component="span" display="block">
                                        End: {format(new Date(queue.estimatedEndTime), 'dd MMM HH:mm')}
                                      </Typography>
                                      {queue.notes && (
                                        <Typography variant="body2" component="span" display="block">
                                          Notes: {queue.notes}
                                        </Typography>
                                      )}
                                    </>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  {queue.status === 'PENDING' && (
                                    <>
                                      <Tooltip title="Start">
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={() => handleOpenStartDialog(queue)}
                                        >
                                          <PlayArrowIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Edit">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleOpenEditDialog(queue)}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}
                                  {queue.status === 'IN_PROGRESS' && (
                                    <Tooltip title="Complete">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleOpenCompleteDialog(queue)}
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Paper>

      {/* Create Queue Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Machine Queue</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Machine</InputLabel>
                <Select
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleInputChange}
                  label="Machine"
                >
                  {machinesLoading ? (
                    <MenuItem disabled>Loading machines...</MenuItem>
                  ) : machinesError ? (
                    <MenuItem disabled>Error loading machines</MenuItem>
                  ) : machinesData && machinesData.machines ? (
                    machinesData.machines
                      .filter(machine => machine.status === 'AVAILABLE')
                      .map((machine) => (
                        <MenuItem key={machine.id} value={machine.id}>
                          {machine.name} ({machine.type})
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem disabled>No available machines</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Batch</InputLabel>
                <Select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  label="Batch"
                >
                  {batchesLoading ? (
                    <MenuItem disabled>Loading batches...</MenuItem>
                  ) : batchesError ? (
                    <MenuItem disabled>Error loading batches</MenuItem>
                  ) : batchesData && batchesData.productionBatches ? (
                    batchesData.productionBatches
                      .filter(batch => batch.status === 'IN_PRODUCTION')
                      .map((batch) => (
                        <MenuItem key={batch.id} value={batch.id}>
                          {batch.batchNumber} - {batch.productName}
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem disabled>No available batches</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Start Time"
                type="datetime-local"
                value={formData.estimatedStartTime.toISOString().slice(0, 16)}
                onChange={(e) => handleDateChange('estimatedStartTime', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated End Time"
                type="datetime-local"
                value={formData.estimatedEndTime.toISOString().slice(0, 16)}
                onChange={(e) => handleDateChange('estimatedEndTime', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
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
            onClick={handleCreateQueue}
            color="primary"
            disabled={createLoading || !formData.machineId || !formData.batchId}
            startIcon={createLoading && <CircularProgress size={20} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Queue Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Machine Queue</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Machine</InputLabel>
                <Select
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleInputChange}
                  label="Machine"
                  disabled // Disable changing machine in edit mode
                >
                  {machinesData && machinesData.machines.map((machine) => (
                    <MenuItem key={machine.id} value={machine.id}>
                      {machine.name} ({machine.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Batch</InputLabel>
                <Select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  label="Batch"
                  disabled // Disable changing batch in edit mode
                >
                  {batchesData && batchesData.productionBatches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batchNumber} - {batch.productName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Start Time"
                type="datetime-local"
                value={formData.estimatedStartTime.toISOString().slice(0, 16)}
                onChange={(e) => handleDateChange('estimatedStartTime', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated End Time"
                type="datetime-local"
                value={formData.estimatedEndTime.toISOString().slice(0, 16)}
                onChange={(e) => handleDateChange('estimatedEndTime', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
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
            onClick={handleUpdateQueue}
            color="primary"
            disabled={updateLoading}
            startIcon={updateLoading && <CircularProgress size={20} />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Queue Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Queue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this queue entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteQueue}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Start Queue Dialog */}
      <Dialog open={openStartDialog} onClose={handleCloseStartDialog}>
        <DialogTitle>Start Processing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to start processing this batch on {selectedQueue?.machine.name}?
            This will mark the queue as "In Progress" and update the machine status.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStartDialog}>Cancel</Button>
          <Button
            onClick={handleStartQueue}
            color="primary"
            disabled={startLoading}
            startIcon={startLoading && <CircularProgress size={20} />}
          >
            Start
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Queue Dialog */}
      <Dialog open={openCompleteDialog} onClose={handleCloseCompleteDialog}>
        <DialogTitle>Complete Processing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this batch as completed on {selectedQueue?.machine.name}?
            This will mark the queue as "Completed" and update the machine status.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog}>Cancel</Button>
          <Button
            onClick={handleCompleteQueue}
            color="success"
            disabled={completeLoading}
            startIcon={completeLoading && <CircularProgress size={20} />}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MachineQueue;
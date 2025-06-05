import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  IconButton, 
  Menu, 
  MenuItem, 
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { machineQueueAPI } from '../../services/api';

const QueueManagement = () => {
  const navigate = useNavigate();
  const [queueItems, setQueueItems] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState(null);

  useEffect(() => {
    fetchQueueItems();
    fetchMachines();
  }, []);

  const fetchQueueItems = async () => {
    try {
      setLoading(true);
      const response = await machineQueueAPI.getAllQueues();
      // Handle both direct array response and wrapped response
      const data = response.data.data || response.data || [];
      setQueueItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching queue items:', error);
      setError('Failed to fetch queue items');
      setQueueItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await machineQueueAPI.getAllMachines();
      // Handle both direct array response and wrapped response
      const data = response.data.data || response.data || [];
      setMachines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    }
  };

  useEffect(() => {
    fetchQueueItems();
  }, [statusFilter, machineFilter]);

  const handleDeleteQueue = async (id) => {
    if (window.confirm('Are you sure you want to delete this queue item?')) {
      try {
        setLoading(true);
        await machineQueueAPI.removeFromQueue(id);
        await fetchQueueItems();
        setError(null);
      } catch (error) {
        console.error('Error deleting queue item:', error);
        setError('Failed to delete queue item');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartQueue = async (id) => {
    try {
      setLoading(true);
      await machineQueueAPI.startQueueItem(id, {});
      await fetchQueueItems();
      setError(null);
    } catch (error) {
      console.error('Error starting queue item:', error);
      setError('Failed to start queue item');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQueue = async (id) => {
    try {
      setLoading(true);
      await machineQueueAPI.completeQueueItem(id, {});
      await fetchQueueItems();
      setError(null);
    } catch (error) {
      console.error('Error completing queue item:', error);
      setError('Failed to complete queue item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQueue = async (id) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      try {
        setLoading(true);
        await machineQueueAPI.cancelQueueItem(id, reason);
        await fetchQueueItems();
        setError(null);
      } catch (error) {
        console.error('Error cancelling queue item:', error);
        setError('Failed to cancel queue item');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedQueueId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQueueId(null);
  };

  const getSelectedQueue = () => {
    return queueItems.find(q => q.id === selectedQueueId);
  };

  const handleEditClick = () => {
    navigate(`/queue/${selectedQueueId}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleDeleteQueue(selectedQueueId);
    handleMenuClose();
  };

  const handleStartClick = () => {
    handleStartQueue(selectedQueueId);
    handleMenuClose();
  };

  const handleCompleteClick = () => {
    handleCompleteQueue(selectedQueueId);
    handleMenuClose();
  };

  const handleCancelClick = () => {
    handleCancelQueue(selectedQueueId);
    handleMenuClose();
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      waiting: { label: 'Waiting', color: 'warning' },
      in_progress: { label: 'In Progress', color: 'info' },
      completed: { label: 'Completed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      paused: { label: 'Paused', color: 'default' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { label: 'Low', color: 'default' },
      normal: { label: 'Normal', color: 'primary' },
      high: { label: 'High', color: 'warning' },
      urgent: { label: 'Urgent', color: 'error' }
    };
    
    const config = priorityConfig[priority] || { label: priority, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const filteredQueueItems = queueItems.filter(queue =>
    queue.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      field: 'queueId', 
      headerName: 'Queue ID', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'machine', 
      headerName: 'Machine', 
      width: 150,
      renderCell: (params) => params.value?.name || 'N/A'
    },
    { field: 'batchNumber', headerName: 'Batch', width: 120 },
    { field: 'productName', headerName: 'Product', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      renderCell: (params) => getStatusChip(params.value) 
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      width: 100,
      renderCell: (params) => getPriorityChip(params.value)
    },
    { 
      field: 'position', 
      headerName: 'Position', 
      width: 90,
      renderCell: (params) => params.value === 0 ? 'Active' : params.value
    },
    { 
      field: 'hoursRequired', 
      headerName: 'Hours', 
      width: 80,
      renderCell: (params) => `${params.value}h`
    },
    { 
      field: 'scheduledStartTime', 
      headerName: 'Scheduled Start', 
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            aria-label="more"
            aria-controls="queue-menu"
            aria-haspopup="true"
            onClick={(event) => handleMenuClick(event, params.row.id)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="queue-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl) && selectedQueueId === params.row.id}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: 48 * 6,
                width: '20ch',
              },
            }}
          >
            <MenuItem onClick={handleEditClick}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            {getSelectedQueue()?.status === 'waiting' && (
              <MenuItem onClick={handleStartClick}>
                <StartIcon sx={{ mr: 1 }} /> Start
              </MenuItem>
            )}
            {getSelectedQueue()?.status === 'in_progress' && (
              <MenuItem onClick={handleCompleteClick}>
                <CompleteIcon sx={{ mr: 1 }} /> Complete
              </MenuItem>
            )}
            {['waiting', 'in_progress'].includes(getSelectedQueue()?.status) && (
              <MenuItem onClick={handleCancelClick}>
                <CancelIcon sx={{ mr: 1 }} /> Cancel
              </MenuItem>
            )}
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Queue Management</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search queues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="waiting">Waiting</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Machine</InputLabel>
            <Select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              label="Machine"
            >
              <MenuItem value="">All Machines</MenuItem>
              {machines.map((machine) => (
                <MenuItem key={machine.id} value={machine.id}>
                  {machine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/queue/add')}
            sx={{ height: '56px' }}
          >
            Add Queue
          </Button>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredQueueItems}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </div>
    </Box>
  );
};

export default QueueManagement;
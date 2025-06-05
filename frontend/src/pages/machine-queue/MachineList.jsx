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
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { machineQueueAPI } from '../../services/api';

const MachineList = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await machineQueueAPI.getAllMachines();
      setMachines(response.data || []);
    } catch (err) {
      setError('Failed to fetch machines.');
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        setLoading(true);
        await machineQueueAPI.deleteMachine(id);
        await fetchMachines(); // Refresh data
      } catch (err) {
        setError('Failed to delete machine: ' + (err.response?.data?.message || err.message));
        console.error('Error deleting machine:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedMachineId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMachineId(null);
  };

  const handleViewClick = () => {
    navigate(`/machines/${selectedMachineId}`);
    handleMenuClose();
  };

  const handleEditClick = () => {
    navigate(`/machines/${selectedMachineId}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleDeleteMachine(selectedMachineId);
    handleMenuClose();
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'operational':
        color = 'success';
        break;
      case 'maintenance':
        color = 'warning';
        break;
      case 'breakdown':
        color = 'error';
        break;
      case 'inactive':
        color = 'default';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status.charAt(0).toUpperCase() + status.slice(1)} color={color} size="small" />;
  };

  const filteredMachines = machines.filter(machine =>
    machine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      field: 'machineId', 
      headerName: 'Machine ID', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'name', 
      headerName: 'Machine Name', 
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {params.value}
        </Typography>
      )
    },
    { field: 'type', headerName: 'Type', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      renderCell: (params) => getStatusChip(params.value) 
    },
    { field: 'location', headerName: 'Location', width: 150 },
    { 
      field: 'manufacturer', 
      headerName: 'Manufacturer', 
      width: 130,
      renderCell: (params) => params.value || '-'
    },
    { 
      field: 'capacity', 
      headerName: 'Capacity', 
      width: 100,
      renderCell: (params) => {
        if (params.value && params.row.capacityUnit) {
          return `${params.value} ${params.row.capacityUnit}`;
        }
        return params.value || '-';
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
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={(event) => handleMenuClick(event, params.row.id)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl) && selectedMachineId === params.row.id}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: 48 * 4.5,
                width: '20ch',
              },
            }}
          >
            <MenuItem onClick={handleViewClick}>
              <ViewIcon sx={{ mr: 1 }} /> View
            </MenuItem>
            <MenuItem onClick={handleEditClick}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
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
      <Typography variant="h4" gutterBottom>Machine Management</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Machines
              </Typography>
              <Typography variant="h5" component="div">
                {machines.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Operational
              </Typography>
              <Typography variant="h5" component="div" color="success.main">
                {machines.filter(m => m.status === 'operational').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Maintenance
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {machines.filter(m => m.status === 'maintenance').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Breakdown
              </Typography>
              <Typography variant="h5" component="div" color="error.main">
                {machines.filter(m => m.status === 'breakdown').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Search machines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/machines/add')}
        >
          Add New Machine
        </Button>
      </Box>

      {/* Data Grid */}
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredMachines}
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

export default MachineList;
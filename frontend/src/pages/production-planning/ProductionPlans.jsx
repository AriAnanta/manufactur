import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Alert, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProductionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    status: 'Pending',
    startDate: '',
    endDate: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call
      const response = await new Promise(resolve => setTimeout(() => {
        const mockPlans = [
          { id: 'PP001', name: 'Plan for Product A', description: 'Detailed plan for manufacturing Product A', status: 'Approved', startDate: '2023-01-01', endDate: '2023-01-10' },
          { id: 'PP002', name: 'Plan for Product B', description: 'Production schedule for Product B', status: 'Pending', startDate: '2023-01-15', endDate: '2023-01-25' },
          { id: 'PP003', name: 'Plan for Product C', description: 'Assembly plan for Product C', status: 'In Progress', startDate: '2023-02-01', endDate: '2023-02-15' },
        ];
        resolve({ success: true, data: mockPlans });
      }, 1000));

      if (response.success) {
        setPlans(response.data);
      }
    } catch (err) {
      setError('Failed to fetch production plans.');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan = null) => {
    setCurrentPlan(plan);
    if (plan) {
      setFormValues({
        name: plan.name,
        description: plan.description,
        status: plan.status,
        startDate: plan.startDate,
        endDate: plan.endDate,
      });
    } else {
      setFormValues({
        name: '',
        description: '',
        status: 'Pending',
        startDate: '',
        endDate: '',
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPlan(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const validateForm = () => {
    let errors = {};
    if (!formValues.name) errors.name = 'Name is required';
    if (!formValues.description) errors.description = 'Description is required';
    if (!formValues.startDate) errors.startDate = 'Start Date is required';
    if (!formValues.endDate) errors.endDate = 'End Date is required';
    if (formValues.startDate && formValues.endDate && new Date(formValues.startDate) > new Date(formValues.endDate)) {
      errors.endDate = 'End Date cannot be before Start Date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Simulate API call
      setLoading(true);
      const response = await new Promise(resolve => setTimeout(() => {
        if (currentPlan) {
          // Edit existing plan
          setPlans(plans.map(p => (p.id === currentPlan.id ? { ...p, ...formValues } : p)));
          resolve({ success: true });
        } else {
          // Add new plan
          const newPlan = { id: `PP${String(plans.length + 1).padStart(3, '0')}`, ...formValues };
          setPlans([...plans, newPlan]);
          resolve({ success: true });
        }
      }, 500));

      if (response.success) {
        handleCloseDialog();
        fetchPlans(); // Refresh data
      }
    } catch (err) {
      setError('Failed to save plan.');
      console.error('Error saving plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        // Simulate API call
        setLoading(true);
        const response = await new Promise(resolve => setTimeout(() => {
          setPlans(plans.filter(p => p.id !== id));
          resolve({ success: true });
        }, 500));

        if (response.success) {
          fetchPlans(); // Refresh data
        }
      } catch (err) {
        setError('Failed to delete plan.');
        console.error('Error deleting plan:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlanId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlanId(null);
  };

  const handleViewDetail = () => {
    navigate(`/production-plans/${selectedPlanId}`);
    handleMenuClose();
  };

  const handleEditClick = () => {
    const planToEdit = plans.find(p => p.id === selectedPlanId);
    handleOpenDialog(planToEdit);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleDeletePlan(selectedPlanId);
    handleMenuClose();
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'Approved':
        color = 'success';
        break;
      case 'Pending':
        color = 'warning';
        break;
      case 'In Progress':
        color = 'info';
        break;
      case 'Rejected':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
  };

  const columns = [
    { field: 'id', headerName: 'Plan ID', width: 120 },
    { field: 'name', headerName: 'Plan Name', width: 200 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'status', headerName: 'Status', width: 130, renderCell: (params) => getStatusChip(params.value) },
    { field: 'startDate', headerName: 'Start Date', width: 150 },
    { field: 'endDate', headerName: 'End Date', width: 150 },
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
            open={Boolean(anchorEl) && selectedPlanId === params.row.id}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: 48 * 4.5,
                width: '20ch',
              },
            }}
          >
            <MenuItem onClick={handleViewDetail}>
              <VisibilityIcon sx={{ mr: 1 }} /> View Detail
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

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Production Plans</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        Add New Plan
      </Button>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={plans}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentPlan ? 'Edit Production Plan' : 'Add New Production Plan'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Plan Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formValues.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formValues.description}
            onChange={handleChange}
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={formValues.startDate}
            onChange={handleChange}
            error={!!formErrors.startDate}
            helperText={formErrors.startDate}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={formValues.endDate}
            onChange={handleChange}
            error={!!formErrors.endDate}
            helperText={formErrors.endDate}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{currentPlan ? 'Save Changes' : 'Add Plan'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionPlans;
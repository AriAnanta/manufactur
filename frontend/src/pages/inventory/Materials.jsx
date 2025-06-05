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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  GET_MATERIALS,
  GET_MATERIAL_TYPES,
  GET_LOW_STOCK_MATERIALS,
  CREATE_MATERIAL,
  UPDATE_MATERIAL,
  DELETE_MATERIAL,
  ADJUST_STOCK,
} from '../../graphql/materialInventory';

// Stock status chip component
const StockStatusChip = ({ currentStock, minStock }) => {
  const isLow = currentStock <= minStock;
  
  return (
    <Chip 
      label={isLow ? 'Low Stock' : 'In Stock'} 
      color={isLow ? 'error' : 'success'} 
      size="small"
      icon={isLow ? <WarningIcon /> : <InventoryIcon />}
    />
  );
};

const Materials = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAdjustStockDialog, setOpenAdjustStockDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    unit: '',
    currentStock: 0,
    minStock: 0,
    costPerUnit: 0,
  });

  // Stock adjustment form state
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    reason: '',
    type: 'ADD',
  });

  // Query for materials
  const {
    loading: materialsLoading,
    error: materialsError,
    data: materialsData,
    refetch: refetchMaterials,
  } = useQuery(GET_MATERIALS, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for material types
  const {
    loading: typesLoading,
    error: typesError,
    data: typesData,
  } = useQuery(GET_MATERIAL_TYPES, {
    fetchPolicy: 'cache-and-network',
  });

  // Query for low stock materials
  const {
    loading: lowStockLoading,
    error: lowStockError,
    data: lowStockData,
    refetch: refetchLowStock,
  } = useQuery(GET_LOW_STOCK_MATERIALS, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for creating a material
  const [createMaterial, { loading: createLoading }] = useMutation(CREATE_MATERIAL, {
    onCompleted: () => {
      toast.success('Material created successfully');
      setOpenCreateDialog(false);
      resetForm();
      refetchMaterials();
      refetchLowStock();
    },
    onError: (error) => {
      toast.error(`Failed to create material: ${error.message}`);
    },
  });

  // Mutation for updating a material
  const [updateMaterial, { loading: updateLoading }] = useMutation(UPDATE_MATERIAL, {
    onCompleted: () => {
      toast.success('Material updated successfully');
      setOpenEditDialog(false);
      resetForm();
      refetchMaterials();
      refetchLowStock();
    },
    onError: (error) => {
      toast.error(`Failed to update material: ${error.message}`);
    },
  });

  // Mutation for deleting a material
  const [deleteMaterial, { loading: deleteLoading }] = useMutation(DELETE_MATERIAL, {
    onCompleted: () => {
      toast.success('Material deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedMaterial(null);
      refetchMaterials();
      refetchLowStock();
    },
    onError: (error) => {
      toast.error(`Failed to delete material: ${error.message}`);
    },
  });

  // Mutation for adjusting stock
  const [adjustStock, { loading: adjustLoading }] = useMutation(ADJUST_STOCK, {
    onCompleted: () => {
      toast.success('Stock adjusted successfully');
      setOpenAdjustStockDialog(false);
      setAdjustmentData({ quantity: 0, reason: '', type: 'ADD' });
      refetchMaterials();
      refetchLowStock();
    },
    onError: (error) => {
      toast.error(`Failed to adjust stock: ${error.message}`);
    },
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setFilterType('');
    setFilterStatus('');
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
      description: '',
      type: '',
      unit: '',
      currentStock: 0,
      minStock: 0,
      costPerUnit: 0,
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'currentStock' || name === 'minStock' || name === 'costPerUnit' 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  // Handle adjustment input changes
  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setAdjustmentData({
      ...adjustmentData,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
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
  const handleOpenEditDialog = (material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      type: material.type,
      unit: material.unit,
      currentStock: material.currentStock,
      minStock: material.minStock,
      costPerUnit: material.costPerUnit,
    });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedMaterial(null);
    resetForm();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (material) => {
    setSelectedMaterial(material);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedMaterial(null);
  };

  // Open adjust stock dialog
  const handleOpenAdjustStockDialog = (material) => {
    setSelectedMaterial(material);
    setAdjustmentData({ quantity: 0, reason: '', type: 'ADD' });
    setOpenAdjustStockDialog(true);
  };

  // Close adjust stock dialog
  const handleCloseAdjustStockDialog = () => {
    setOpenAdjustStockDialog(false);
    setSelectedMaterial(null);
    setAdjustmentData({ quantity: 0, reason: '', type: 'ADD' });
  };

  // Handle create material
  const handleCreateMaterial = () => {
    createMaterial({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          unit: formData.unit,
          currentStock: formData.currentStock,
          minStock: formData.minStock,
          costPerUnit: formData.costPerUnit,
        },
      },
    });
  };

  // Handle update material
  const handleUpdateMaterial = () => {
    updateMaterial({
      variables: {
        id: selectedMaterial.id,
        input: {
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          unit: formData.unit,
          minStock: formData.minStock,
          costPerUnit: formData.costPerUnit,
        },
      },
    });
  };

  // Handle delete material
  const handleDeleteMaterial = () => {
    deleteMaterial({
      variables: {
        id: selectedMaterial.id,
      },
    });
  };

  // Handle adjust stock
  const handleAdjustStock = () => {
    adjustStock({
      variables: {
        id: selectedMaterial.id,
        input: {
          quantity: adjustmentData.type === 'REMOVE' 
            ? -Math.abs(adjustmentData.quantity) 
            : Math.abs(adjustmentData.quantity),
          reason: adjustmentData.reason,
        },
      },
    });
  };

  // Filter and paginate materials
  const getMaterialsToDisplay = () => {
    const materials = tabValue === 0 
      ? (materialsData ? materialsData.materials : []) 
      : (lowStockData ? lowStockData.lowStockMaterials : []);

    return materials.filter((material) =>
      (material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       material.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType ? material.type === filterType : true) &&
      (filterStatus ? (material.currentStock <= material.minStock ? 'low' : 'in_stock') === filterStatus : true)
    );
  };

  const filteredMaterials = getMaterialsToDisplay();
  
  const paginatedMaterials = filteredMaterials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Materials Inventory</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Material
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Materials" />
            <Tab label="Low Stock Materials" />
          </Tabs>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Material Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleFilterTypeChange}
                label="Material Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {typesData && typesData.materialTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Stock Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
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
        {(tabValue === 0 && materialsError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading materials: {materialsError.message}
          </Alert>
        )}

        {(tabValue === 1 && lowStockError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading low stock materials: {lowStockError.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {((tabValue === 0 && materialsLoading && !materialsData) || 
          (tabValue === 1 && lowStockLoading && !lowStockData)) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!((tabValue === 0 && materialsLoading) || (tabValue === 1 && lowStockLoading)) && 
          filteredMaterials.length === 0 ? (
          <Alert severity="info">
            No materials found. {searchTerm || filterType || filterStatus ? 'Try clearing filters.' : ''}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Min Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Cost Per Unit</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <Typography variant="body1">{material.name}</Typography>
                        {material.description && (
                          <Typography variant="body2" color="text.secondary">
                            {material.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>{material.currentStock}</TableCell>
                      <TableCell>{material.minStock}</TableCell>
                      <TableCell>
                        <StockStatusChip 
                          currentStock={material.currentStock} 
                          minStock={material.minStock} 
                        />
                      </TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>${material.costPerUnit.toFixed(2)}</TableCell>
                      <TableCell>
                        <Tooltip title="Adjust Stock">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenAdjustStockDialog(material)}
                          >
                            <InventoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(material)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(material)}
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
              count={filteredMaterials.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Create Material Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Material</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  {typesLoading ? (
                    <MenuItem disabled>Loading types...</MenuItem>
                  ) : typesError ? (
                    <MenuItem disabled>Error loading types</MenuItem>
                  ) : typesData && typesData.materialTypes ? (
                    typesData.materialTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No types available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                placeholder="e.g., kg, liter, piece"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Current Stock"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Stock"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Cost Per Unit"
                name="costPerUnit"
                type="number"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateMaterial}
            color="primary"
            disabled={createLoading || !formData.name || !formData.type || !formData.unit}
            startIcon={createLoading && <CircularProgress size={20} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Material</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  {typesData && typesData.materialTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Per Unit"
                name="costPerUnit"
                type="number"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Current stock: {selectedMaterial?.currentStock} {selectedMaterial?.unit}. 
                To adjust stock, use the Adjust Stock action instead.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateMaterial}
            color="primary"
            disabled={updateLoading || !formData.name || !formData.type || !formData.unit}
            startIcon={updateLoading && <CircularProgress size={20} />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Material Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Material</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the material "{selectedMaterial?.name}"? 
            This action cannot be undone and may affect production plans and batches that use this material.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteMaterial}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={openAdjustStockDialog} onClose={handleCloseAdjustStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Stock for {selectedMaterial?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Current stock: {selectedMaterial?.currentStock} {selectedMaterial?.unit}
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Adjustment Type</InputLabel>
                <Select
                  name="type"
                  value={adjustmentData.type}
                  onChange={handleAdjustmentChange}
                  label="Adjustment Type"
                >
                  <MenuItem value="ADD">Add Stock</MenuItem>
                  <MenuItem value="REMOVE">Remove Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={adjustmentData.quantity}
                onChange={handleAdjustmentChange}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">{selectedMaterial?.unit}</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                name="reason"
                value={adjustmentData.reason}
                onChange={handleAdjustmentChange}
                required
                multiline
                rows={3}
                placeholder="Explain why you are adjusting the stock"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity={adjustmentData.type === 'ADD' ? 'success' : 'warning'}>
                This will {adjustmentData.type === 'ADD' ? 'add' : 'remove'} {adjustmentData.quantity} {selectedMaterial?.unit} 
                {adjustmentData.type === 'ADD' ? 'to' : 'from'} the current stock.
                New stock level will be: {' '}
                {adjustmentData.type === 'ADD' 
                  ? (selectedMaterial?.currentStock + adjustmentData.quantity)
                  : Math.max(0, selectedMaterial?.currentStock - adjustmentData.quantity)
                } {selectedMaterial?.unit}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdjustStockDialog}>Cancel</Button>
          <Button
            onClick={handleAdjustStock}
            color={adjustmentData.type === 'ADD' ? 'primary' : 'warning'}
            disabled={adjustLoading || adjustmentData.quantity <= 0 || !adjustmentData.reason}
            startIcon={adjustLoading && <CircularProgress size={20} />}
          >
            {adjustmentData.type === 'ADD' ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Materials;
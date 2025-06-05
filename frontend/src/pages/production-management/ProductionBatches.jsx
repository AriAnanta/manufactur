import { useState, useEffect } from 'react';
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
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

/**
 * ProductionBatches Component
 *
 * Komponen untuk mengelola batch produksi. Memungkinkan penambahan, pengeditan, penghapusan, dan
 * melihat detail batch produksi.
 */
const ProductionBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  /**
   * Mengambil daftar batch produksi dari API.
   */
  const fetchBatches = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = [
        {
          id: 1,
          batchNumber: 'BATCH-001',
          productName: 'Steel Frame A',
          quantity: 100,
          producedQuantity: 75,
          status: 'in_production',
          startDate: '2024-01-15',
          estimatedEndDate: '2024-02-15',
          actualEndDate: null,
          priority: 'high'
        },
        {
          id: 2,
          batchNumber: 'BATCH-002',
          productName: 'Aluminum Sheet B',
          quantity: 250,
          producedQuantity: 250,
          status: 'completed',
          startDate: '2024-01-10',
          estimatedEndDate: '2024-02-10',
          actualEndDate: '2024-02-08',
          priority: 'medium'
        },
        {
          id: 3,
          batchNumber: 'BATCH-003',
          productName: 'Copper Wire C',
          quantity: 500,
          producedQuantity: 0,
          status: 'pending',
          startDate: null,
          estimatedEndDate: '2024-03-01',
          actualEndDate: null,
          priority: 'low'
        }
      ];
      
      setBatches(mockData);
    } catch (err) {
      setError('Failed to load production batches');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      in_production: { color: 'info', label: 'In Production' },
      completed: { color: 'success', label: 'Completed' },
      cancelled: { color: 'error', label: 'Cancelled' },
      on_hold: { color: 'default', label: 'On Hold' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      high: { color: 'error', label: 'High' },
      medium: { color: 'warning', label: 'Medium' },
      low: { color: 'success', label: 'Low' }
    };
    
    const config = priorityConfig[priority] || { color: 'default', label: priority };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getProgressPercentage = (produced, total) => {
    return total > 0 ? Math.round((produced / total) * 100) : 0;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredBatches = batches.filter(batch =>
    (batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     batch.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus ? batch.status === filterStatus : true)
  );

  const paginatedBatches = filteredBatches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Production Batches</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Batch
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Batches"
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
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Status Filter"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_production">In Production</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Batch Number</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Est. End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {batch.batchNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {batch.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {batch.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getProgressPercentage(batch.producedQuantity, batch.quantity)}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {getProgressPercentage(batch.producedQuantity, batch.quantity)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {batch.producedQuantity} / {batch.quantity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getPriorityChip(batch.priority)}</TableCell>
                  <TableCell>{getStatusChip(batch.status)}</TableCell>
                  <TableCell>
                    {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {batch.estimatedEndDate ? new Date(batch.estimatedEndDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {batch.status === 'pending' && (
                      <Tooltip title="Start Production">
                        <IconButton size="small" color="success">
                          <StartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {batch.status === 'in_production' && (
                      <Tooltip title="Pause Production">
                        <IconButton size="small" color="warning">
                          <PauseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error">
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
          count={filteredBatches.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ProductionBatches;
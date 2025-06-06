import React, { useState, useEffect } from "react";
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
  DialogTitle,
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    requestId: "",
    customerId: "",
    productName: "",
    quantity: "",
    priority: "normal",
    dueDate: "",
    specifications: "",
    marketplaceData: null,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5001/api/production");
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching production requests:", err);
      setError("Gagal memuat permintaan produksi.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      received: { color: "info", label: "Received" },
      planned: { color: "warning", label: "Planned" },
      in_production: { color: "primary", label: "In Production" },
      completed: { color: "success", label: "Completed" },
      cancelled: { color: "error", label: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low" },
      normal: { color: "info", label: "Normal" },
      high: { color: "warning", label: "High" },
      urgent: { color: "error", label: "Urgent" },
    };

    const config = priorityConfig[priority] || {
      color: "default",
      label: priority,
    };
    return <Chip label={config.label} color={config.color} size="small" />;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post("http://localhost:5001/api/production", {
        ...formData,
        quantity: parseInt(formData.quantity),
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        marketplaceData: formData.marketplaceData
          ? JSON.parse(formData.marketplaceData)
          : null,
      });
      setOpenCreateDialog(false);
      setFormData({
        requestId: "",
        customerId: "",
        productName: "",
        quantity: "",
        priority: "normal",
        dueDate: "",
        specifications: "",
        marketplaceData: null,
      });
      fetchRequests();
    } catch (err) {
      console.error("Error creating request:", err);
      setError("Gagal membuat permintaan produksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`http://localhost:5001/api/production/${id}`);
        fetchRequests();
      } catch (err) {
        console.error("Error deleting request:", err);
        setError("Gagal menghapus permintaan produksi.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/production-requests/${id}`);
  };

  const handleEditRequest = (id) => {
    navigate(`/production-requests/${id}`);
  };

  const filteredRequests = requests.filter(
    (request) =>
      (request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.specifications &&
          request.specifications
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))) &&
      (filterStatus ? request.status === filterStatus : true)
  );

  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Production Requests</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            New Request
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Requests"
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
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
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
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in_production">In Production</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {request.requestId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {request.productName}
                    </Typography>
                  </TableCell>
                  <TableCell>{request.quantity}</TableCell>
                  <TableCell>{getPriorityChip(request.priority)}</TableCell>
                  <TableCell>{getStatusChip(request.status)}</TableCell>
                  <TableCell>
                    {new Date(request.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(request.id)}
                      >
                        <VisibilityIcon fontSize="small" />
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
          count={filteredRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create Request Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Production Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request ID"
                name="requestId"
                value={formData.requestId}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer ID"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Marketplace Data (JSON)"
                name="marketplaceData"
                value={formData.marketplaceData}
                onChange={handleInputChange}
                multiline
                rows={2}
                helperText="Enter as valid JSON string, e.g., {'marketplace':'tokopedia','order_id':'TKP-001'}"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRequest} variant="contained">
            Create Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionRequests;

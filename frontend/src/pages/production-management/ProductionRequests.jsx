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
  Card,
  CardContent,
  Fade,
  Grow,
  Avatar,
  Stack,
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
import FactoryIcon from "@mui/icons-material/Factory";

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
      received: { color: "info", label: "Received", bgcolor: "#e3f2fd" },
      planned: { color: "warning", label: "Planned", bgcolor: "#fff3e0" },
      in_production: {
        color: "primary",
        label: "In Production",
        bgcolor: "#e8f4fd",
      },
      completed: { color: "success", label: "Completed", bgcolor: "#e8f5e8" },
      cancelled: { color: "error", label: "Cancelled", bgcolor: "#ffebee" },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      bgcolor: "#f5f5f5",
    };
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color:
            config.color === "default"
              ? "text.primary"
              : `${config.color}.main`,
          border: `1px solid`,
          borderColor:
            config.color === "default" ? "grey.300" : `${config.color}.light`,
        }}
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low", bgcolor: "#e8f5e8" },
      normal: { color: "info", label: "Normal", bgcolor: "#e3f2fd" },
      high: { color: "warning", label: "High", bgcolor: "#fff3e0" },
      urgent: { color: "error", label: "Urgent", bgcolor: "#ffebee" },
    };

    const config = priorityConfig[priority] || {
      color: "default",
      label: priority,
      bgcolor: "#f5f5f5",
    };
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          fontWeight: 500,
          bgcolor: config.bgcolor,
          color: `${config.color}.main`,
          border: `1px solid ${config.color}.light`,
        }}
      />
    );
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
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Fade>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        mx: "auto",
        p: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 3, sm: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <FactoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    }}
                  >
                    Production Requests
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage and track all production requests
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                New Request
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grow in timeout={800}>
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            width: "100%",
          }}
        >
          {/* Filters Section */}
          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderBottom: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search Requests"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleFilterStatusChange}
                    label="Status Filter"
                    sx={{
                      bgcolor: "white",
                    }}
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
          </Box>

          {/* Table Section */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Request ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Product Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Priority
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>
                    Due Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRequests.map((request, index) => (
                  <Fade in timeout={300 + index * 100} key={request.id}>
                    <TableRow
                      sx={{
                        "&:hover": {
                          bgcolor: "grey.50",
                          transform: "scale(1.001)",
                          transition: "all 0.2s ease-in-out",
                        },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {request.requestId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {request.productName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {request.quantity.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {getPriorityChip(request.priority)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {getStatusChip(request.status)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {new Date(request.dueDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(request.id)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "primary.light",
                                  color: "white",
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid",
              borderColor: "grey.200",
              bgcolor: "grey.50",
            }}
          />
        </Paper>
      </Grow>

      {/* Create Request Dialog - Enhanced */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <FactoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create Production Request
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Request ID"
                name="requestId"
                value={formData.requestId}
                onChange={handleInputChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer ID"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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
                  sx={{
                    bgcolor: "white",
                    "& .MuiSelect-select": {
                      borderRadius: 2,
                    },
                  }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
          <Button onClick={() => setOpenCreateDialog(false)} size="large">
            Cancel
          </Button>
          <Button
            onClick={handleCreateRequest}
            variant="contained"
            size="large"
            sx={{ px: 4 }}
          >
            Create Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionRequests;

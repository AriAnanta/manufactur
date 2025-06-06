import { useState, useEffect } from "react";
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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  // New states for alert dialog
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertContent, setAlertContent] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  /**
   * Mengambil daftar batch produksi dari API.
   */
  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5001/api/batches");
      setBatches(response.data);
    } catch (err) {
      console.error("Error fetching production batches:", err);
      setError("Gagal memuat batch produksi");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      scheduled: { color: "info", label: "Scheduled" },
      in_progress: { color: "primary", label: "In Progress" },
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

  const handleViewDetails = (id) => {
    navigate(`/production-batches/${id}`);
  };

  const handleEditBatch = (id) => {
    navigate(`/production-batches/${id}`);
  };

  const handleDeleteBatch = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this batch? This action cannot be undone."
      )
    ) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`http://localhost:5001/api/batches/${id}`);
        fetchBatches();
      } catch (err) {
        if (err.response && err.response.status === 400) {
          const { message, steps, materialAllocations } = err.response.data;
          let content = message;

          if (steps && steps.length > 0) {
            content += "\n\nAssociated Steps:";
            steps.forEach((step) => {
              content += `\n- Step ID: ${step.id}, Name: ${step.stepName}, Status: ${step.status} (Order: ${step.stepOrder})`;
            });
          }

          if (materialAllocations && materialAllocations.length > 0) {
            content += "\n\nAssociated Material Allocations:";
            materialAllocations.forEach((ma) => {
              content += `\n- Material ID: ${ma.materialId}, Required: ${ma.quantityRequired}, Status: ${ma.status}`; // Adjusted to match backend response
            });
          }

          setAlertTitle("Cannot Delete Batch");
          setAlertContent(content);
          setOpenAlertDialog(true);
        } else {
          console.error("Error deleting batch:", err);
          setError("Gagal menghapus batch produksi.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartProduction = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(`http://localhost:5001/api/batches/${id}`, {
        status: "in_progress",
      });
      fetchBatches();
    } catch (err) {
      console.error("Error starting production:", err);
      setError("Gagal memulai produksi batch.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      (batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.request &&
          batch.request.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))) &&
      (filterStatus ? batch.status === filterStatus : true)
  );

  const paginatedBatches = filteredBatches.slice(
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
          <Typography variant="h5">Production Batches</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/production-batches/add")}
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
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
                <TableCell>Batch Number</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Scheduled Start Date</TableCell>
                <TableCell>Scheduled End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {batch.batchNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {batch.request ? batch.request.productName : "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Request ID:{" "}
                      {batch.request ? batch.request.requestId : "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>{batch.quantity}</TableCell>
                  <TableCell>
                    {getPriorityChip(
                      batch.request ? batch.request.priority : "normal"
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(batch.status)}</TableCell>
                  <TableCell>
                    {batch.scheduledStartDate
                      ? new Date(batch.scheduledStartDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {batch.scheduledEndDate
                      ? new Date(batch.scheduledEndDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {batch.status === "pending" ||
                    batch.status === "scheduled" ? (
                      <Tooltip title="Start Production">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleStartProduction(batch.id)}
                        >
                          <StartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(batch.id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/production-batches/${batch.id}/edit`)
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteBatch(batch.id)}
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
          count={filteredBatches.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Alert Dialog for Delete Errors */}
      <Dialog
        open={openAlertDialog}
        onClose={() => setOpenAlertDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{alertTitle}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">{alertContent}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAlertDialog(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionBatches;

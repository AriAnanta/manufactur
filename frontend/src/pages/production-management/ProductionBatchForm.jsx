import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import axios from "axios";

const ProductionBatchForm = () => {
  const { id } = useParams(); // Get batch ID from URL for edit mode
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [requests, setRequests] = useState([]); // To populate dropdown for requestId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    requestId: "",
    quantity: "",
    scheduledStartDate: "",
    scheduledEndDate: "",
    notes: "",
    status: "pending", // Default status for new batches
  });

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchBatchData(id);
    } else {
      setIsEditMode(false);
      setLoading(false); // No batch to load for create mode
    }
    fetchProductionRequests(); // Fetch requests for dropdown in both modes
  }, [id]);

  const fetchBatchData = async (batchId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/batches/${batchId}`
      );
      const fetchedBatch = response.data;
      setBatch(fetchedBatch);
      setFormData({
        requestId: fetchedBatch.requestId,
        quantity: fetchedBatch.quantity,
        scheduledStartDate: fetchedBatch.scheduledStartDate
          ? new Date(fetchedBatch.scheduledStartDate)
              .toISOString()
              .split("T")[0]
          : "",
        scheduledEndDate: fetchedBatch.scheduledEndDate
          ? new Date(fetchedBatch.scheduledEndDate).toISOString().split("T")[0]
          : "",
        notes: fetchedBatch.notes || "",
        status: fetchedBatch.status || "pending",
      });
    } catch (err) {
      console.error("Error fetching batch data:", err);
      setError("Gagal memuat data batch.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/production");
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching production requests for dropdown:", err);
      // Not critical, can still proceed without this data
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        scheduledStartDate: formData.scheduledStartDate
          ? new Date(formData.scheduledStartDate).toISOString()
          : null,
        scheduledEndDate: formData.scheduledEndDate
          ? new Date(formData.scheduledEndDate).toISOString()
          : null,
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5001/api/batches/${id}`, payload);
        alert("Batch produksi berhasil diperbarui!");
      } else {
        // For creating a new batch, we need to send requestId
        if (!payload.requestId) {
          setError("Request ID is required for new batches.");
          setLoading(false);
          return;
        }
        await axios.post("http://localhost:5001/api/batches", payload);
        alert("Batch produksi berhasil dibuat!");
      }
      navigate("/production-batches"); // Redirect back to batches list
    } catch (err) {
      console.error("Error saving batch:", err);
      setError("Gagal menyimpan batch produksi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/production-batches")}
        sx={{ mb: 2 }}
      >
        Kembali ke Batch Produksi
      </Button>
      <Typography variant="h4" gutterBottom>
        {isEditMode
          ? `Edit Batch: ${batch?.batchNumber}`
          : "Create New Production Batch"}
      </Typography>
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Production Request</InputLabel>
              <Select
                name="requestId"
                value={formData.requestId}
                onChange={handleInputChange}
                label="Production Request"
                disabled={isEditMode} // Cannot change request for existing batch
              >
                {requests.map((req) => (
                  <MenuItem key={req.id} value={req.id}>
                    {req.requestId} - {req.productName} ({req.quantity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Scheduled Start Date"
              name="scheduledStartDate"
              type="date"
              value={formData.scheduledStartDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Scheduled End Date"
              name="scheduledEndDate"
              type="date"
              value={formData.scheduledEndDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
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
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              {isEditMode ? "Save Changes" : "Create Batch"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductionBatchForm;

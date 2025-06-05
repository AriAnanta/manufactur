import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { machineQueueAPI, productionApiService } from "../../services/api";

const QueueForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [machines, setMachines] = useState([]);
  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    machineId: "",
    batchId: "",
    batchNumber: "",
    productName: "",
    stepId: "",
    stepName: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    hoursRequired: "",
    priority: "normal",
    operatorId: "",
    operatorName: "",
    setupTime: "",
    notes: "",
  });

  useEffect(() => {
    loadMachines();
    loadBatches();
    if (isEdit) {
      loadQueue();
    }
  }, [id, isEdit]);

  const loadMachines = async () => {
    try {
      const response = await machineQueueAPI.getAvailableMachines();
      setMachines(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading machines:", error);
    }
  };

  const loadBatches = async () => {
    try {
      // Load batches from production API
      const response = await productionApiService.getProductionBatches({
        status: "approved",
      });
      setBatches(response.data || []);
    } catch (error) {
      console.error("Error loading batches:", error);
      // Set empty array if API call fails
      setBatches([]);
    }
  };

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await machineQueueAPI.getQueueById(id);
      const queue = response.data.data || response.data;

      setFormData({
        machineId: queue.machineId || "",
        batchId: queue.batchId || "",
        batchNumber: queue.batchNumber || "",
        productName: queue.productName || "",
        stepId: queue.stepId || "",
        stepName: queue.stepName || "",
        scheduledStartTime: queue.scheduledStartTime
          ? new Date(queue.scheduledStartTime).toISOString().slice(0, 16)
          : "",
        scheduledEndTime: queue.scheduledEndTime
          ? new Date(queue.scheduledEndTime).toISOString().slice(0, 16)
          : "",
        hoursRequired: queue.hoursRequired || "",
        priority: queue.priority || "normal",
        operatorId: queue.operatorId || "",
        operatorName: queue.operatorName || "",
        setupTime: queue.setupTime || "",
        notes: queue.notes || "",
      });
    } catch (error) {
      setError("Failed to load queue data");
      console.error("Error loading queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const selectedBatch = batches.find((b) => b.id === batchId);

    setFormData((prev) => ({
      ...prev,
      batchId,
      batchNumber: selectedBatch?.batchNumber || "",
      productName: selectedBatch?.productName || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        batchId: parseInt(formData.batchId),
        machineId: parseInt(formData.machineId),
        hoursRequired: parseFloat(formData.hoursRequired),
        setupTime: formData.setupTime ? parseFloat(formData.setupTime) : null,
        stepId: formData.stepId ? parseInt(formData.stepId) : null,
      };

      if (isEdit) {
        await machineQueueAPI.updateQueue(id, submitData);
      } else {
        await machineQueueAPI.addToQueue(submitData);
      }

      navigate("/queue");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save queue item");
      console.error("Error saving queue:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? "Edit Queue Item" : "Add Queue Item"}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Machine</InputLabel>
                <Select
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleChange}
                  label="Machine"
                >
                  {machines.map((machine) => (
                    <MenuItem key={machine.id} value={machine.id}>
                      {machine.name} ({machine.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Batch</InputLabel>
                <Select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleBatchChange}
                  label="Batch"
                >
                  {batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batchNumber} - {batch.productName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Step Name"
                name="stepName"
                value={formData.stepName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hours Required"
                name="hoursRequired"
                type="number"
                value={formData.hoursRequired}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Start Time"
                name="scheduledStartTime"
                type="datetime-local"
                value={formData.scheduledStartTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled End Time"
                name="scheduledEndTime"
                type="datetime-local"
                value={formData.scheduledEndTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Setup Time (hours)"
                name="setupTime"
                type="number"
                value={formData.setupTime}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.25 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Operator ID"
                name="operatorId"
                value={formData.operatorId}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Operator Name"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/queue")}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default QueueForm;

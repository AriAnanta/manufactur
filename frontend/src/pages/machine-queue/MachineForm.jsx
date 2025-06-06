import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { machineQueueAPI } from '../../services/api';

const MachineForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    manufacturer: '',
    modelNumber: '',
    capacity: '',
    capacityUnit: '',
    location: '',
    installationDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    status: 'operational',
    hoursPerDay: '8',
    notes: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadMachine();
    }
  }, [id, isEdit]);

  const loadMachine = async () => {
    try {
      setLoading(true);
      const response = await machineQueueAPI.getMachineById(id);
      const machine = response.data;
      
      setFormData({
        name: machine.name || '',
        type: machine.type || '',
        manufacturer: machine.manufacturer || '',
        modelNumber: machine.modelNumber || '',
        capacity: machine.capacity || '',
        capacityUnit: machine.capacityUnit || '',
        location: machine.location || '',
        installationDate: machine.installationDate ? new Date(machine.installationDate).toISOString().slice(0, 10) : '',
        lastMaintenance: machine.lastMaintenance ? new Date(machine.lastMaintenance).toISOString().slice(0, 10) : '',
        nextMaintenance: machine.nextMaintenance ? new Date(machine.nextMaintenance).toISOString().slice(0, 10) : '',
        status: machine.status || 'operational',
        hoursPerDay: machine.hoursPerDay || '8',
        notes: machine.notes || ''
      });
    } catch (error) {
      setError('Failed to load machine data');
      console.error('Error loading machine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null,
        hoursPerDay: parseFloat(formData.hoursPerDay),
        installationDate: formData.installationDate || null,
        lastMaintenance: formData.lastMaintenance || null,
        nextMaintenance: formData.nextMaintenance || null
      };

      let response;
      if (isEdit) {
        response = await machineQueueAPI.updateMachine(id, submitData);
      } else {
        response = await machineQueueAPI.createMachine(submitData);
      }
      
      // Check if response indicates success
      if (response.data.success !== false) {
        navigate('/machines');
      } else {
        setError(response.data.message || 'Failed to save machine');
      }
    } catch (error) {
      console.error('Error saving machine:', error);
      setError(error.response?.data?.message || 'Failed to save machine');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Machine' : 'Add Machine'}
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
              <TextField
                fullWidth
                label="Machine Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Machine Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model Number"
                name="modelNumber"
                value={formData.modelNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacity Unit"
                name="capacityUnit"
                value={formData.capacityUnit}
                onChange={handleChange}
                placeholder="e.g., kg/hour, units/hour"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hours Per Day"
                name="hoursPerDay"
                type="number"
                value={formData.hoursPerDay}
                onChange={handleChange}
                required
                inputProps={{ min: 1, max: 24, step: 0.5 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Installation Date"
                name="installationDate"
                type="date"
                value={formData.installationDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {isEdit && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="operational">Operational</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="breakdown">Breakdown</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Maintenance"
                    name="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Next Maintenance"
                    name="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

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
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Create')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/machines')}
                >
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

export default MachineForm;

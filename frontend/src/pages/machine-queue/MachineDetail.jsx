import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { machineQueueAPI } from '../../services/api';

const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [machineQueue, setMachineQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMachineDetail();
    fetchMachineQueue();
  }, [id]);

  const fetchMachineDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await machineQueueAPI.getMachineById(id);
      setMachine(response.data);
    } catch (err) {
      setError('Failed to fetch machine details: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching machine details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineQueue = async () => {
    try {
      const response = await machineQueueAPI.getMachineQueue(id);
      setMachineQueue(response.data.data || []);
    } catch (err) {
      console.error('Error fetching machine queue:', err);
      // Don't set error here as machine details are more important
    }
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

  const getQueueStatusChip = (status) => {
    let color;
    switch (status) {
      case 'in_progress':
        color = 'info';
        break;
      case 'waiting':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status.replace('_', ' ').toUpperCase()} color={color} size="small" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/machines')}
          sx={{ mb: 3 }}
        >
          Back to Machine List
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!machine) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/machines')}
          sx={{ mb: 3 }}
        >
          Back to Machine List
        </Button>
        <Alert severity="info">No machine details available.</Alert>
      </Box>
    );
  }

  const activeQueue = machineQueue.find(q => q.status === 'in_progress');
  const waitingQueue = machineQueue.filter(q => q.status === 'waiting');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/machines')}
        >
          Back to Machine List
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/machines/${id}/edit`)}
        >
          Edit Machine
        </Button>
      </Box>

      {/* Machine Information */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {machine.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Machine ID: {machine.machineId}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Type:</strong> {machine.type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Status:</strong> {getStatusChip(machine.status)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Location:</strong> {machine.location || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Hours/Day:</strong> {machine.hoursPerDay} hours
                </Typography>
              </Grid>
              {machine.manufacturer && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Manufacturer:</strong> {machine.manufacturer}
                  </Typography>
                </Grid>
              )}
              {machine.modelNumber && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Model:</strong> {machine.modelNumber}
                  </Typography>
                </Grid>
              )}
              {machine.capacity && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Capacity:</strong> {machine.capacity} {machine.capacityUnit || ''}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Installation Date:</strong> {formatDate(machine.installationDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Last Maintenance:</strong> {formatDate(machine.lastMaintenance)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Next Maintenance:</strong> {formatDate(machine.nextMaintenance)}
                </Typography>
              </Grid>
            </Grid>

            {machine.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1">
                  <strong>Notes:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {machine.notes}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Status Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Machine Status</Typography>
                  </Box>
                  {getStatusChip(machine.status)}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Queue Status</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {machineQueue.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Queue Items
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Active: {activeQueue ? 1 : 0}
                    </Typography>
                    <Typography variant="body2">
                      Waiting: {waitingQueue.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Current Job */}
      {activeQueue && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Job
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Product:</strong> {activeQueue.productName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Batch:</strong> {activeQueue.batchNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Started:</strong> {formatDateTime(activeQueue.actualStartTime)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Operator:</strong> {activeQueue.operatorName || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Status:</strong> {getQueueStatusChip(activeQueue.status)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Queue List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Machine Queue
        </Typography>
        {machineQueue.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No items in queue
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Hours Required</TableCell>
                  <TableCell>Scheduled Start</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {machineQueue.map((queue) => (
                  <TableRow key={queue.id}>
                    <TableCell>
                      {queue.position === 0 ? 'Active' : queue.position}
                    </TableCell>
                    <TableCell>{queue.productName}</TableCell>
                    <TableCell>{queue.batchNumber}</TableCell>
                    <TableCell>{getQueueStatusChip(queue.status)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={queue.priority.toUpperCase()} 
                        size="small" 
                        variant="outlined"
                        color={queue.priority === 'urgent' ? 'error' : queue.priority === 'high' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{queue.hoursRequired}h</TableCell>
                    <TableCell>{formatDateTime(queue.scheduledStartTime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default MachineDetail;
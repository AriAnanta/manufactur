import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Button, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ProductionBatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        // Simulate API call
        setLoading(true);
        setError(null);
        const response = await new Promise(resolve => setTimeout(() => {
          const mockBatches = [
            { id: 'PB001', name: 'Batch A', status: 'In Progress', quantity: 100, startDate: '2023-01-01', endDate: '2023-01-05', productionRequestId: 'PR001' },
            { id: 'PB002', name: 'Batch B', status: 'Completed', quantity: 150, startDate: '2023-01-06', endDate: '2023-01-10', productionRequestId: 'PR002' },
            { id: 'PB003', name: 'Batch C', status: 'Pending', quantity: 200, startDate: '2023-01-11', endDate: '2023-01-15', productionRequestId: 'PR003' },
          ];
          const foundBatch = mockBatches.find(b => b.id === id);
          if (foundBatch) {
            resolve({ success: true, data: foundBatch });
          } else {
            resolve({ success: false, message: 'Batch not found' });
          }
        }, 1000));

        if (response.success) {
          setBatch(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to fetch batch details.');
        console.error('Error fetching batch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetail();
  }, [id]);

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

  if (!batch) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="info">No batch details found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/production-batches')} sx={{ mb: 2 }}>
        Back to Production Batches
      </Button>
      <Typography variant="h4" gutterBottom>Production Batch Detail: {batch.name}</Typography>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Batch ID:</Typography>
              <Typography>{batch.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Status:</Typography>
              <Typography>{batch.status}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Quantity:</Typography>
              <Typography>{batch.quantity}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Start Date:</Typography>
              <Typography>{batch.startDate}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">End Date:</Typography>
              <Typography>{batch.endDate}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Production Request ID:</Typography>
              <Typography>{batch.productionRequestId}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductionBatchDetail;
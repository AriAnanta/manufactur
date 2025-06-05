import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanDetail();
  }, [id]);

  const fetchPlanDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call to fetch plan details
      const response = await new Promise(resolve => setTimeout(() => {
        const mockPlans = [
          { id: 'PP001', name: 'Plan for Product A', description: 'Detailed plan for manufacturing Product A', status: 'Approved', startDate: '2023-01-01', endDate: '2023-01-10', details: 'This plan involves the assembly of 1000 units of Product A, requiring specific components X, Y, and Z. Quality control checks are scheduled at every stage.' },
          { id: 'PP002', name: 'Plan for Product B', description: 'Production schedule for Product B', status: 'Pending', startDate: '2023-01-15', endDate: '2023-01-25', details: 'Production of Product B will focus on optimizing machine utilization. Raw materials are expected to arrive by 2023-01-12. Final testing will be conducted on 10% of the batch.' },
          { id: 'PP003', name: 'Plan for Product C', description: 'Assembly plan for Product C', status: 'In Progress', startDate: '2023-02-01', endDate: '2023-02-15', details: 'Assembly line for Product C is currently active. Daily targets are set at 500 units. Any deviations from the plan must be reported immediately to the production manager.' },
        ];
        const foundPlan = mockPlans.find(p => p.id === id);
        if (foundPlan) {
          resolve({ success: true, data: foundPlan });
        } else {
          resolve({ success: false, message: 'Plan not found' });
        }
      }, 1000));

      if (response.success) {
        setPlan(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch plan details.');
      console.error('Error fetching plan details:', err);
    } finally {
      setLoading(false);
    }
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="info">No plan details available.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/production-plans')}
        sx={{ mb: 3 }}
      >
        Back to Production Plans
      </Button>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{plan.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>Plan ID: {plan.id}</Typography>
        <Typography variant="body1" paragraph><strong>Description:</strong> {plan.description}</Typography>
        <Typography variant="body1" paragraph><strong>Status:</strong> {plan.status}</Typography>
        <Typography variant="body1" paragraph><strong>Start Date:</strong> {plan.startDate}</Typography>
        <Typography variant="body1" paragraph><strong>End Date:</strong> {plan.endDate}</Typography>
        <Typography variant="body1" paragraph><strong>Details:</strong> {plan.details}</Typography>
      </Paper>
    </Box>
  );
};

export default PlanDetail;
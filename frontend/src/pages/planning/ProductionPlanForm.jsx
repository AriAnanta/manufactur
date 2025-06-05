import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  GET_PLAN,
  CREATE_PLAN,
  UPDATE_PLAN,
} from '../../graphql/productionPlanning';

const ProductionPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    status: 'DRAFT',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Query for getting plan details in edit mode
  const {
    loading: planLoading,
    error: planError,
    data: planData,
  } = useQuery(GET_PLAN, {
    variables: { id },
    skip: !isEditMode,
    fetchPolicy: 'cache-and-network',
  });

  // Mutation for creating a new plan
  const [createPlan, { loading: createLoading }] = useMutation(CREATE_PLAN, {
    onCompleted: (data) => {
      toast.success('Production plan created successfully');
      navigate(`/production-plans/${data.createPlan.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create production plan: ${error.message}`);
      setSubmitting(false);
    },
  });

  // Mutation for updating an existing plan
  const [updatePlan, { loading: updateLoading }] = useMutation(UPDATE_PLAN, {
    onCompleted: () => {
      toast.success('Production plan updated successfully');
      navigate(`/production-plans/${id}`);
    },
    onError: (error) => {
      toast.error(`Failed to update production plan: ${error.message}`);
      setSubmitting(false);
    },
  });

  // Load plan data in edit mode
  useEffect(() => {
    if (isEditMode && planData && planData.plan) {
      const { plan } = planData;
      setFormData({
        name: plan.name,
        description: plan.description,
        startDate: new Date(plan.startDate),
        endDate: new Date(plan.endDate),
        status: plan.status,
      });
    }
  }, [isEditMode, planData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const variables = {
      input: {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      },
    };

    if (isEditMode) {
      updatePlan({
        variables: {
          id,
          ...variables,
        },
      });
    } else {
      createPlan({
        variables,
      });
    }
  };

  // Handle cancel/back
  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/production-plans/${id}`);
    } else {
      navigate('/production-plans');
    }
  };

  // Show loading state while fetching plan data in edit mode
  if (isEditMode && planLoading && !planData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if plan data fetch fails in edit mode
  if (isEditMode && planError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading production plan: {planError.message}
      </Alert>
    );
  }

  // Show error if plan not found in edit mode
  if (isEditMode && planData && !planData.plan) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Production plan not found
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleCancel} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">
                {isEditMode ? 'Edit Production Plan' : 'Create Production Plan'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              type="submit"
              disabled={submitting || createLoading || updateLoading}
            >
              {(submitting || createLoading || updateLoading) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Save'
              )}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                error={Boolean(errors.description)}
                helperText={errors.description}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(errors.startDate)}
                    helperText={errors.startDate}
                    required
                  />
                )}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.startDate),
                    helperText: errors.startDate,
                    required: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(errors.endDate)}
                    helperText={errors.endDate}
                    required
                  />
                )}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.endDate),
                    helperText: errors.endDate,
                    required: true,
                  },
                }}
              />
            </Grid>

            {isEditMode && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                    disabled={formData.status !== 'DRAFT'}
                  >
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ProductionPlanForm;
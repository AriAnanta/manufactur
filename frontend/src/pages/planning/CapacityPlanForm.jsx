import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
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
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  GET_PLAN,
  GET_CAPACITY_PLAN,
  ADD_CAPACITY_PLAN,
  UPDATE_CAPACITY_PLAN,
} from "../../graphql/productionPlanning";
import { GET_MACHINE_TYPES } from "../../graphql/machineQueue";

const CapacityPlanForm = () => {
  const { id, capacityId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(capacityId);

  // Form state
  const [formData, setFormData] = useState({
    machineType: "",
    hoursRequired: 8,
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days from now
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Query for getting production plan details
  const {
    loading: planLoading,
    error: planError,
    data: planData,
  } = useQuery(GET_PLAN, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  // Query for getting capacity plan details in edit mode
  const {
    loading: capacityPlanLoading,
    error: capacityPlanError,
    data: capacityPlanData,
  } = useQuery(GET_CAPACITY_PLAN, {
    variables: { id: capacityId },
    skip: !isEditMode,
    fetchPolicy: "cache-and-network",
  });

  // Query for getting machine types
  const {
    loading: machineTypesLoading,
    error: machineTypesError,
    data: machineTypesData,
  } = useQuery(GET_MACHINE_TYPES, {
    fetchPolicy: "cache-and-network",
  });

  // Mutation for adding a new capacity plan
  const [addCapacityPlan, { loading: addLoading }] = useMutation(
    ADD_CAPACITY_PLAN,
    {
      onCompleted: () => {
        toast.success("Capacity plan added successfully");
        navigate(`/production-plans/${id}`);
      },
      onError: (error) => {
        toast.error(`Failed to add capacity plan: ${error.message}`);
        setSubmitting(false);
      },
    }
  );

  // Mutation for updating an existing capacity plan
  const [updateCapacityPlan, { loading: updateLoading }] = useMutation(
    UPDATE_CAPACITY_PLAN,
    {
      onCompleted: () => {
        toast.success("Capacity plan updated successfully");
        navigate(`/production-plans/${id}`);
      },
      onError: (error) => {
        toast.error(`Failed to update capacity plan: ${error.message}`);
        setSubmitting(false);
      },
    }
  );

  // Load capacity plan data in edit mode
  useEffect(() => {
    if (isEditMode && capacityPlanData && capacityPlanData.capacityPlan) {
      const { capacityPlan } = capacityPlanData;
      setFormData({
        machineType: capacityPlan.machineType || "",
        hoursRequired: capacityPlan.hoursRequired || 0,
        startDate: capacityPlan.startDate
          ? new Date(capacityPlan.startDate)
          : null,
        endDate: capacityPlan.endDate ? new Date(capacityPlan.endDate) : null,
        notes: capacityPlan.notes || "",
      });
    }
  }, [isEditMode, capacityPlanData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "hoursRequired" ? Number(value) : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
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
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.machineType) {
      newErrors.machineType = "Machine type is required";
    }

    if (formData.hoursRequired <= 0) {
      newErrors.hoursRequired = "Hours required must be greater than 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    // Check if dates are within plan dates
    if (planData && planData.plan) {
      const planPlannedStartDate = planData.plan.plannedStartDate
        ? new Date(planData.plan.plannedStartDate)
        : null;
      const planPlannedEndDate = planData.plan.plannedEndDate
        ? new Date(planData.plan.plannedEndDate)
        : null;

      if (planPlannedStartDate && formData.startDate < planPlannedStartDate) {
        newErrors.startDate = `Start date cannot be before plan start date (${planPlannedStartDate.toLocaleDateString()})`;
      }

      if (planPlannedEndDate && formData.endDate > planPlannedEndDate) {
        newErrors.endDate = `End date cannot be after plan end date (${planPlannedEndDate.toLocaleDateString()})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const input = {
      machineType: formData.machineType,
      hoursRequired: formData.hoursRequired,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.endDate ? formData.endDate.toISOString() : null,
      notes: formData.notes,
    };

    try {
      if (isEditMode) {
        await updateCapacityPlan({
          variables: {
            id: capacityId,
            input,
          },
        });
      } else {
        await addCapacityPlan({
          variables: {
            planId: id,
            input,
          },
        });
      }
    } catch (err) {
      // Error is already handled by onError in useMutation
    }
  };

  // Handle cancel/back
  const handleCancel = () => {
    navigate(`/production-plans/${id}`);
  };

  // Show loading state while fetching data
  if (
    (planLoading && !planData) ||
    (isEditMode && capacityPlanLoading && !capacityPlanData) ||
    machineTypesLoading
  ) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if data fetch fails
  if (planError || (isEditMode && capacityPlanError) || machineTypesError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading data:{" "}
        {planError?.message ||
          capacityPlanError?.message ||
          machineTypesError?.message}
      </Alert>
    );
  }

  // Show error if plan not found
  if (!planData || !planData.plan) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Production plan not found
      </Alert>
    );
  }

  // Show error if capacity plan not found in edit mode
  if (isEditMode && (!capacityPlanData || !capacityPlanData.capacityPlan)) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Capacity plan not found
      </Alert>
    );
  }

  const productionPlan = planData?.plan;

  if (!productionPlan) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Production Plan not found.
      </Alert>
    );
  }

  // Check if plan status allows adding/editing capacity plans
  const isPlanEditable = productionPlan.status.toLowerCase() === "draft";

  if (!isPlanEditable && !isEditMode) {
    return (
      <Alert severity="warning" sx={{ mt: 4 }}>
        Capacity plans can only be added for plans in DRAFT status. Current
        status: {productionPlan.status}
      </Alert>
    );
  }

  if (!isPlanEditable && isEditMode) {
    return (
      <Alert severity="warning" sx={{ mt: 4 }}>
        Capacity plans can only be edited for plans in DRAFT status. Current
        status: {productionPlan.status}
      </Alert>
    );
  }

  const machineTypes = machineTypesData?.machineTypes || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={handleCancel} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">
                {isEditMode ? "Edit Capacity Plan" : "Add Capacity Plan"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              type="submit"
              disabled={submitting || addLoading || updateLoading}
            >
              {submitting || addLoading || updateLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save"
              )}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle1" gutterBottom>
            Production Plan: {productionPlan.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Plan Period:{" "}
            {productionPlan.plannedStartDate
              ? new Date(productionPlan.plannedStartDate).toLocaleDateString()
              : "N/A"}{" "}
            -{" "}
            {productionPlan.plannedEndDate
              ? new Date(productionPlan.plannedEndDate).toLocaleDateString()
              : "N/A"}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.machineType)}>
                <InputLabel>Machine Type</InputLabel>
                <Select
                  name="machineType"
                  value={formData.machineType}
                  onChange={handleInputChange}
                  label="Machine Type"
                  required
                  disabled={isEditMode}
                >
                  {machineTypesLoading ? (
                    <MenuItem disabled>Loading machine types...</MenuItem>
                  ) : machineTypesError ? (
                    <MenuItem disabled>Error loading machine types</MenuItem>
                  ) : (
                    machineTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.machineType && (
                  <Typography variant="caption" color="error">
                    {errors.machineType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hours Required"
                name="hoursRequired"
                type="number"
                value={formData.hoursRequired}
                onChange={handleInputChange}
                error={Boolean(errors.hoursRequired)}
                helperText={errors.hoursRequired}
                InputProps={{
                  inputProps: { min: 0.1, step: 0.1 },
                  endAdornment: (
                    <InputAdornment position="end">hours</InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                minDate={
                  productionPlan.plannedStartDate
                    ? new Date(productionPlan.plannedStartDate)
                    : null
                }
                maxDate={
                  productionPlan.plannedEndDate
                    ? new Date(productionPlan.plannedEndDate)
                    : null
                }
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
                onChange={(date) => handleDateChange("endDate", date)}
                minDate={
                  productionPlan.plannedStartDate
                    ? new Date(productionPlan.plannedStartDate)
                    : null
                }
                maxDate={
                  productionPlan.plannedEndDate
                    ? new Date(productionPlan.plannedEndDate)
                    : null
                }
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                error={Boolean(errors.notes)}
                helperText={errors.notes}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CapacityPlanForm;

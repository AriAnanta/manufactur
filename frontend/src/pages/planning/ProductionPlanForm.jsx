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
  CREATE_PLAN,
  UPDATE_PLAN,
} from "../../graphql/productionPlanning";

const ProductionPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    planningNotes: "",
    plannedStartDate: new Date(),
    plannedEndDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    priority: "MEDIUM",
    requestId: "",
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
    fetchPolicy: "cache-and-network",
  });

  // Mutation for creating a new plan
  const [createPlan, { loading: createLoading }] = useMutation(CREATE_PLAN, {
    onCompleted: (data) => {
      toast.success("Production plan created successfully");
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
      toast.success("Production plan updated successfully");
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
        productName: plan.productName || "",
        planningNotes: plan.planningNotes || "",
        plannedStartDate: plan.plannedStartDate
          ? new Date(plan.plannedStartDate)
          : new Date(),
        plannedEndDate: plan.plannedEndDate
          ? new Date(plan.plannedEndDate)
          : new Date(new Date().setDate(new Date().getDate() + 30)),
        priority: plan.priority || "MEDIUM",
        requestId: plan.requestId || "",
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

    if (!formData.productName.trim()) {
      newErrors.productName = "Product Name is required";
    }

    if (!formData.planningNotes.trim()) {
      newErrors.planningNotes = "Planning Notes is required";
    }

    if (!formData.plannedStartDate) {
      newErrors.plannedStartDate = "Planned start date is required";
    }

    if (!formData.plannedEndDate) {
      newErrors.plannedEndDate = "Planned end date is required";
    }

    if (
      formData.plannedStartDate &&
      formData.plannedEndDate &&
      formData.plannedStartDate > formData.plannedEndDate
    ) {
      newErrors.plannedEndDate =
        "Planned end date must be after planned start date";
    }

    if (!formData.requestId) {
      newErrors.requestId = "Request ID is required";
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

    // Check if the plan data has changed before updating
    let hasChanges = false;
    if (isEditMode && planData && planData.plan) {
      const originalPlan = planData.plan;
      // Compare only the fields that are part of the form
      if (
        formData.productName !== originalPlan.productName ||
        formData.planningNotes !== originalPlan.planningNotes ||
        (formData.plannedStartDate &&
          originalPlan.plannedStartDate &&
          formData.plannedStartDate.toISOString() !==
            originalPlan.plannedStartDate) ||
        (formData.plannedEndDate &&
          originalPlan.plannedEndDate &&
          formData.plannedEndDate.toISOString() !==
            originalPlan.plannedEndDate) ||
        formData.priority !== originalPlan.priority ||
        formData.requestId !== originalPlan.requestId
      ) {
        hasChanges = true;
      }
    }

    if (isEditMode && !hasChanges) {
      toast.info("No changes detected.");
      setSubmitting(false);
      navigate(`/production-plans/${id}`);
      return;
    }

    const input = {
      productName: formData.productName,
      planningNotes: formData.planningNotes,
      plannedStartDate: formData.plannedStartDate
        ? formData.plannedStartDate.toISOString()
        : null,
      plannedEndDate: formData.plannedEndDate
        ? formData.plannedEndDate.toISOString()
        : null,
      priority: formData.priority,
      requestId: Number(formData.requestId),
    };

    try {
      if (isEditMode) {
        await updatePlan({
          variables: {
            id,
            input,
          },
        });
      } else {
        await createPlan({
          variables: {
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
    if (isEditMode) {
      navigate(`/production-plans/${id}`);
    } else {
      navigate("/production-plans");
    }
  };

  if (planLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (planError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading production plan: {planError.message}
      </Alert>
    );
  }

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
                {isEditMode ? "Edit Production Plan" : "Create Production Plan"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              type="submit"
              disabled={submitting || createLoading || updateLoading}
            >
              {submitting || createLoading || updateLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save"
              )}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                error={Boolean(errors.productName)}
                helperText={errors.productName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planning Notes"
                name="planningNotes"
                value={formData.planningNotes}
                onChange={handleInputChange}
                error={Boolean(errors.planningNotes)}
                helperText={errors.planningNotes}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Planned Start Date"
                value={formData.plannedStartDate}
                onChange={(date) => handleDateChange("plannedStartDate", date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.plannedStartDate),
                    helperText: errors.plannedStartDate,
                    required: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Planned End Date"
                value={formData.plannedEndDate}
                onChange={(date) => handleDateChange("plannedEndDate", date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.plannedEndDate),
                    helperText: errors.plannedEndDate,
                    required: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={Boolean(errors.priority)}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Priority"
                  onChange={handleInputChange}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
                {errors.priority && (
                  <Typography color="error" variant="caption">
                    {errors.priority}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Request ID"
                name="requestId"
                value={formData.requestId}
                onChange={handleInputChange}
                error={Boolean(errors.requestId)}
                helperText={errors.requestId}
                required
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ProductionPlanForm;

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
  Avatar,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
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
    priority: "normal",
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
    refetchQueries: [{ query: GET_PLAN, variables: { id } }],
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
          : null,
        plannedEndDate: plan.plannedEndDate
          ? new Date(plan.plannedEndDate)
          : null,
        priority: plan.priority ? plan.priority.toLowerCase() : "normal",
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
    } else if (
      isNaN(Number(formData.requestId)) ||
      Number(formData.requestId) <= 0
    ) {
      newErrors.requestId = "Request ID must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called");

    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    setSubmitting(true);
    console.log("Submitting state set to true");

    // Check if the plan data has changed before updating
    let hasChanges = false;
    if (isEditMode && planData && planData.plan) {
      const originalPlan = planData.plan;
      console.log("Original plan data:", originalPlan);
      console.log("Current form data:", formData);
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
        formData.priority.toLowerCase() !==
          originalPlan.priority.toLowerCase() ||
        Number(formData.requestId) !== originalPlan.requestId
      ) {
        hasChanges = true;
      }
      console.log("hasChanges:", hasChanges);
    }

    if (isEditMode && !hasChanges) {
      toast.info("No changes detected.");
      setSubmitting(false);
      navigate(`/production-plans/${id}`);
      console.log("No changes detected, returning.");
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
    console.log("Input for mutation:", input);

    try {
      if (isEditMode) {
        console.log("Calling updatePlan mutation");
        await updatePlan({
          variables: {
            id,
            input,
          },
        });
      } else {
        console.log("Calling createPlan mutation");
        await createPlan({
          variables: {
            input,
          },
        });
      }
      console.log("Mutation call completed (or started)");
    } catch (err) {
      console.error("Error during mutation call:", err);
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
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 3, sm: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    }}
                  >
                    {isEditMode
                      ? "Edit Production Plan"
                      : "Create Production Plan"}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {isEditMode
                      ? "Modify plan details and settings"
                      : "Set up a new production plan"}
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  type="submit"
                  disabled={submitting || createLoading || updateLoading}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  {submitting || createLoading || updateLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            width: "100%",
          }}
        >
          <Box sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "text.primary",
                borderBottom: "1px solid",
                borderColor: "grey.300",
                pb: 2,
              }}
            >
              Plan Information
            </Typography>

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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Planned Start Date"
                  value={formData.plannedStartDate}
                  onChange={(date) =>
                    handleDateChange("plannedStartDate", date)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.plannedStartDate),
                      helperText: errors.plannedStartDate,
                      required: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
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
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    label="Priority"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ProductionPlanForm;

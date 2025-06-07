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
  Avatar,
  Card,
  CardContent,
  Stack,
  Fade,
  Grow,
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
  GET_MATERIAL_PLAN,
  ADD_MATERIAL_PLAN,
  UPDATE_MATERIAL_PLAN,
} from "../../graphql/productionPlanning";
import { GET_MATERIALS } from "../../graphql/materialInventory";
import InventoryIcon from "@mui/icons-material/Inventory";

const MaterialPlanForm = () => {
  const { id, materialId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(materialId);

  // Form state
  const [formData, setFormData] = useState({
    materialId: "",
    materialName: "",
    quantity: 1,
    unit: "",
    requiredDate: null, // Default to null initially
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

  // Query for getting material plan details in edit mode
  const {
    loading: materialPlanLoading,
    error: materialPlanError,
    data: materialPlanData,
  } = useQuery(GET_MATERIAL_PLAN, {
    variables: { id: materialId },
    skip: !isEditMode,
    fetchPolicy: "cache-and-network",
  });

  // Query for getting materials
  const {
    loading: materialsLoading,
    error: materialsError,
    data: materialsData,
  } = useQuery(GET_MATERIALS, {
    fetchPolicy: "cache-and-network",
  });

  // Mutation for adding a new material plan
  const [addMaterialPlan, { loading: addLoading }] = useMutation(
    ADD_MATERIAL_PLAN,
    {
      onCompleted: () => {
        toast.success("Material plan added successfully");
        navigate(`/production-plans/${id}`);
      },
      onError: (error) => {
        toast.error(`Failed to add material plan: ${error.message}`);
        setSubmitting(false);
      },
    }
  );

  // Mutation for updating an existing material plan
  const [updateMaterialPlan, { loading: updateLoading }] = useMutation(
    UPDATE_MATERIAL_PLAN,
    {
      onCompleted: () => {
        toast.success("Material plan updated successfully");
        navigate(`/production-plans/${id}`);
      },
      onError: (error) => {
        toast.error(`Failed to update material plan: ${error.message}`);
        setSubmitting(false);
      },
    }
  );

  // Load material plan data in edit mode
  useEffect(() => {
    if (isEditMode && materialPlanData && materialPlanData.materialPlan) {
      const { materialPlan } = materialPlanData;
      setFormData({
        materialId: materialPlan.materialId,
        materialName: materialPlan.materialName,
        quantity: materialPlan.quantity,
        unit: materialPlan.unit,
        requiredDate: materialPlan.requiredDate
          ? new Date(materialPlan.requiredDate)
          : null,
        notes: materialPlan.notes || "",
      });
    }
  }, [isEditMode, materialPlanData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? Number(value) : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle material selection
  const handleMaterialChange = (e) => {
    const materialId = e.target.value;
    const selectedMaterial = materialsData?.materials.find(
      (m) => m.id === materialId
    );

    if (selectedMaterial) {
      setFormData({
        ...formData,
        materialId,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit,
      });
    }

    // Clear error for this field
    if (errors.materialId) {
      setErrors({
        ...errors,
        materialId: "",
      });
    }
  };

  // Handle date changes
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      requiredDate: date,
    });

    // Clear error for this field
    if (errors.requiredDate) {
      setErrors({
        ...errors,
        requiredDate: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.materialId) {
      newErrors.materialId = "Material is required";
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    if (!formData.requiredDate) {
      newErrors.requiredDate = "Required date is required";
    }

    // Check if date is within plan dates
    if (planData && planData.plan) {
      const planStartDate = new Date(planData.plan.startDate);
      const planEndDate = new Date(planData.plan.endDate);

      if (formData.requiredDate < planStartDate) {
        newErrors.requiredDate =
          "Required date cannot be before plan start date";
      }

      if (formData.requiredDate > planEndDate) {
        newErrors.requiredDate = "Required date cannot be after plan end date";
      }
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
        materialId: formData.materialId,
        materialName: formData.materialName,
        quantity: formData.quantity,
        unit: formData.unit,
        requiredDate: formData.requiredDate
          ? formData.requiredDate.toISOString()
          : null,
        notes: formData.notes,
      },
    };

    if (isEditMode) {
      updateMaterialPlan({
        variables: {
          id: materialId,
          ...variables,
        },
      });
    } else {
      addMaterialPlan({
        variables: {
          planId: id,
          ...variables,
        },
      });
    }
  };

  // Handle cancel/back
  const handleCancel = () => {
    navigate(`/production-plans/${id}`);
  };

  // Show loading state while fetching data
  if (
    (planLoading && !planData) ||
    (isEditMode && materialPlanLoading && !materialPlanData)
  ) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if data fetch fails
  if (planError || (isEditMode && materialPlanError)) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading data: {planError?.message || materialPlanError?.message}
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

  // Show error if material plan not found in edit mode
  if (isEditMode && (!materialPlanData || !materialPlanData.materialPlan)) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Material plan not found
      </Alert>
    );
  }

  // Check if plan is in draft status
  const isPlanEditable = planData.plan.status.toLowerCase() === "draft";

  if (!isPlanEditable) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Material plans can only be added or edited for plans in draft status.
        Current status: {planData.plan.status}
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
        <Fade in timeout={600}>
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
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    mr: { xs: 2, sm: 3 },
                  }}
                >
                  <InventoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    {isEditMode ? "Edit Material Plan" : "Add Material Plan"}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Production Plan: {planData?.plan?.productName}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Navigation */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            Back to Production Plan
          </Button>
        </Box>

        {/* Form Section */}
        <Grow in timeout={800}>
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
                }}
              >
                Material Plan Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(errors.materialId)}>
                    <InputLabel>Material</InputLabel>
                    <Select
                      name="materialId"
                      value={formData.materialId}
                      onChange={handleMaterialChange}
                      label="Material"
                      required
                      disabled={isEditMode} // Disable in edit mode to prevent changing material
                    >
                      {materialsLoading ? (
                        <MenuItem disabled>Loading materials...</MenuItem>
                      ) : materialsError ? (
                        <MenuItem disabled>Error loading materials</MenuItem>
                      ) : materialsData && materialsData.materials ? (
                        materialsData.materials.map((material) => (
                          <MenuItem key={material.id} value={material.id}>
                            {material.name} ({material.unit})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No materials available</MenuItem>
                      )}
                    </Select>
                    {errors.materialId && (
                      <Typography variant="caption" color="error">
                        {errors.materialId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantityRequired"
                    type="number"
                    value={formData.quantityRequired}
                    onChange={handleInputChange}
                    error={Boolean(errors.quantityRequired)}
                    helperText={errors.quantityRequired}
                    InputProps={{
                      inputProps: { min: 1 },
                      endAdornment: formData.unitOfMeasure ? (
                        <InputAdornment position="end">
                          {formData.unitOfMeasure}
                        </InputAdornment>
                      ) : null,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Availability Date"
                    value={formData.availabilityDate}
                    onChange={(date) =>
                      handleDateChange("availabilityDate", date)
                    }
                    minDate={
                      planData.plan.plannedStartDate
                        ? new Date(planData.plan.plannedStartDate)
                        : null
                    }
                    maxDate={
                      planData.plan.plannedEndDate
                        ? new Date(planData.plan.plannedEndDate)
                        : null
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(errors.availabilityDate),
                        helperText: errors.availabilityDate,
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

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<SaveIcon />}
                      type="submit"
                      disabled={submitting || addLoading || updateLoading}
                      sx={{ px: 4 }}
                    >
                      {submitting || addLoading || updateLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleCancel}
                      sx={{ px: 4 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grow>
      </Box>
    </LocalizationProvider>
  );
};

export default MaterialPlanForm;

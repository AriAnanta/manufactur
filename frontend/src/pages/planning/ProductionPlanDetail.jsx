import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  GET_PLAN,
  DELETE_PLAN,
  APPROVE_PLAN,
  DELETE_CAPACITY_PLAN,
  DELETE_MATERIAL_PLAN,
} from "../../graphql/productionPlanning";

// Status chip component
const StatusChip = ({ status }) => {
  let color = "default";
  switch (status) {
    case "DRAFT":
      color = "default";
      break;
    case "PENDING_APPROVAL":
      color = "warning";
      break;
    case "APPROVED":
      color = "success";
      break;
    case "REJECTED":
      color = "error";
      break;
    case "IN_PROGRESS":
      color = "primary";
      break;
    case "COMPLETED":
      color = "info";
      break;
    default:
      color = "default";
  }

  return <Chip label={status.replace("_", " ")} color={color} size="small" />;
};

const ProductionPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openDeleteCapacityDialog, setOpenDeleteCapacityDialog] =
    useState(false);
  const [openDeleteMaterialDialog, setOpenDeleteMaterialDialog] =
    useState(false);
  const [selectedCapacityId, setSelectedCapacityId] = useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  // Query for production plan details
  const { loading, error, data, refetch } = useQuery(GET_PLAN, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  // Mutation for deleting a plan
  const [deletePlan, { loading: deleteLoading }] = useMutation(DELETE_PLAN, {
    onCompleted: () => {
      toast.success("Production plan deleted successfully");
      navigate("/production-plans");
    },
    onError: (error) => {
      toast.error(`Failed to delete production plan: ${error.message}`);
    },
  });

  // Mutation for approving a plan
  const [approvePlan, { loading: approveLoading }] = useMutation(APPROVE_PLAN, {
    onCompleted: () => {
      toast.success("Production plan approved successfully");
      setOpenApproveDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to approve production plan: ${error.message}`);
    },
  });

  // Mutation for deleting a capacity plan
  const [deleteCapacityPlan, { loading: deleteCapacityLoading }] = useMutation(
    DELETE_CAPACITY_PLAN,
    {
      onCompleted: () => {
        toast.success("Capacity plan deleted successfully");
        setOpenDeleteCapacityDialog(false);
        setSelectedCapacityId(null);
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to delete capacity plan: ${error.message}`);
      },
    }
  );

  // Mutation for deleting a material plan
  const [deleteMaterialPlan, { loading: deleteMaterialLoading }] = useMutation(
    DELETE_MATERIAL_PLAN,
    {
      onCompleted: () => {
        toast.success("Material plan deleted successfully");
        setOpenDeleteMaterialDialog(false);
        setSelectedMaterialId(null);
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to delete material plan: ${error.message}`);
      },
    }
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Open approve dialog
  const handleOpenApproveDialog = () => {
    setOpenApproveDialog(true);
  };

  // Close approve dialog
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
  };

  // Open delete capacity dialog
  const handleOpenDeleteCapacityDialog = (id) => {
    setSelectedCapacityId(id);
    setOpenDeleteCapacityDialog(true);
  };

  // Close delete capacity dialog
  const handleCloseDeleteCapacityDialog = () => {
    setOpenDeleteCapacityDialog(false);
    setSelectedCapacityId(null);
  };

  // Open delete material dialog
  const handleOpenDeleteMaterialDialog = (id) => {
    setSelectedMaterialId(id);
    setOpenDeleteMaterialDialog(true);
  };

  // Close delete material dialog
  const handleCloseDeleteMaterialDialog = () => {
    setOpenDeleteMaterialDialog(false);
    setSelectedMaterialId(null);
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    deletePlan({
      variables: {
        id,
      },
    });
  };

  // Handle approve plan
  const handleApprovePlan = () => {
    approvePlan({
      variables: {
        id,
      },
    });
  };

  // Handle delete capacity plan
  const handleDeleteCapacityPlan = () => {
    deleteCapacityPlan({
      variables: {
        id: selectedCapacityId,
      },
    });
  };

  // Handle delete material plan
  const handleDeleteMaterialPlan = () => {
    deleteMaterialPlan({
      variables: {
        id: selectedMaterialId,
      },
    });
  };

  // Navigate to edit plan page
  const handleEditPlan = () => {
    navigate(`/production-plans/${id}/edit`);
  };

  // Navigate back to plans list
  const handleBack = () => {
    navigate("/production-plans");
  };

  // Navigate to add capacity plan page
  const handleAddCapacityPlan = () => {
    navigate(`/production-plans/${id}/capacity/add`);
  };

  // Navigate to add material plan page
  const handleAddMaterialPlan = () => {
    navigate(`/production-plans/${id}/material/add`);
  };

  // Navigate to edit capacity plan page
  const handleEditCapacityPlan = (capacityId) => {
    navigate(`/production-plans/${id}/capacity/${capacityId}/edit`);
  };

  // Navigate to edit material plan page
  const handleEditMaterialPlan = (materialId) => {
    navigate(`/production-plans/${id}/material/${materialId}/edit`);
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading production plan: {error.message}
      </Alert>
    );
  }

  if (!data || !data.plan) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Production plan not found
      </Alert>
    );
  }

  const { plan } = data;
  const isDraft = plan.status === "DRAFT";
  const isPendingApproval = plan.status === "PENDING_APPROVAL";

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">Production Plan Details</Typography>
          </Box>
          <Box>
            {isDraft && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditPlan}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                >
                  Delete
                </Button>
              </>
            )}
            {isPendingApproval && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleOpenApproveDialog}
              >
                Approve
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Plan Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Plan Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Product Name
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{plan.productName}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{plan.planningNotes}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <StatusChip status={plan.status} />
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Planned Start Date
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {format(new Date(plan.plannedStartDate), "dd MMM yyyy")}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Planned End Date
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {format(new Date(plan.plannedEndDate), "dd MMM yyyy")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Plan ID
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{plan.planId}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Request ID
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{plan.requestId}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Production Request ID
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {plan.productionRequestId}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Priority
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{plan.priority}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Capacity Required
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {plan.totalCapacityRequired || "N/A"} hours
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Material Cost
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  ${(plan.totalMaterialCost || 0).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Planned Batches
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {plan.plannedBatches || "N/A"}
                </Typography>
              </Grid>

              {plan.approvedBy && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Approved By
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{plan.approvedBy}</Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Approved At
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {format(new Date(plan.approvalDate), "dd MMM yyyy HH:mm")}
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {format(new Date(plan.createdAt), "dd MMM yyyy HH:mm")}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Updated At
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {format(new Date(plan.updatedAt), "dd MMM yyyy HH:mm")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for Capacity and Material Plans */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Capacity Plans" />
            <Tab label="Material Plans" />
          </Tabs>
        </Box>

        {/* Capacity Plans Tab */}
        {tabValue === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Capacity Plans</Typography>
              {isDraft && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCapacityPlan}
                  size="small"
                >
                  Add Capacity Plan
                </Button>
              )}
            </Box>

            {plan.capacityPlans && plan.capacityPlans.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Machine Type</TableCell>
                      <TableCell>Hours Required</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plan.capacityPlans.map((capacityPlan) => (
                      <TableRow key={capacityPlan.id}>
                        <TableCell>{capacityPlan.machineType}</TableCell>
                        <TableCell>{capacityPlan.hoursRequired}</TableCell>
                        <TableCell>
                          {format(
                            new Date(capacityPlan.startDate),
                            "dd MMM yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(capacityPlan.endDate),
                            "dd MMM yyyy"
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {isDraft && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleEditCapacityPlan(capacityPlan.id)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenDeleteCapacityDialog(
                                    capacityPlan.id
                                  )
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No capacity plans added yet.</Alert>
            )}
          </Box>
        )}

        {/* Material Plans Tab */}
        {tabValue === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Material Plans</Typography>
              {isDraft && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddMaterialPlan}
                >
                  Add Material Plan
                </Button>
              )}
            </Box>
            {plan.materialPlans && plan.materialPlans.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material Name</TableCell>
                      <TableCell>Quantity Required</TableCell>
                      <TableCell>Unit of Measure</TableCell>
                      <TableCell>Availability Date</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plan.materialPlans.map((materialPlan) => (
                      <TableRow key={materialPlan.id}>
                        <TableCell>{materialPlan.materialName}</TableCell>
                        <TableCell>{materialPlan.quantityRequired}</TableCell>
                        <TableCell>{materialPlan.unitOfMeasure}</TableCell>
                        <TableCell>
                          {format(
                            new Date(materialPlan.availabilityDate),
                            "dd MMM yyyy"
                          )}
                        </TableCell>
                        <TableCell>{materialPlan.notes || "-"}</TableCell>
                        <TableCell align="right">
                          {isDraft && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleEditMaterialPlan(materialPlan.id)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenDeleteMaterialDialog(
                                    materialPlan.id
                                  )
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No material plans added yet.</Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Plan Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Production Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this production plan? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeletePlan}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Plan Dialog */}
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog}>
        <DialogTitle>Approve Production Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this production plan? This will
            make the plan available for execution.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Cancel</Button>
          <Button
            onClick={handleApprovePlan}
            color="success"
            disabled={approveLoading}
            startIcon={approveLoading && <CircularProgress size={20} />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Capacity Plan Dialog */}
      <Dialog
        open={openDeleteCapacityDialog}
        onClose={handleCloseDeleteCapacityDialog}
      >
        <DialogTitle>Delete Capacity Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this capacity plan? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCapacityDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteCapacityPlan}
            color="error"
            disabled={deleteCapacityLoading}
            startIcon={deleteCapacityLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Material Plan Dialog */}
      <Dialog
        open={openDeleteMaterialDialog}
        onClose={handleCloseDeleteMaterialDialog}
      >
        <DialogTitle>Delete Material Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this material plan? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteMaterialDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteMaterialPlan}
            color="error"
            disabled={deleteMaterialLoading}
            startIcon={deleteMaterialLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionPlanDetail;

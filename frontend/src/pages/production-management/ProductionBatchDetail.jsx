import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios"; // Import axios

const ProductionBatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch data from backend API
        const response = await axios.get(
          `http://localhost:5001/api/batches/${id}`
        );
        if (response.data) {
          setBatch(response.data);
        } else {
          setError("Batch not found");
        }
      } catch (err) {
        console.error("Error fetching batch details:", err);
        setError("Failed to fetch batch details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetail();
  }, [id]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Alert severity="info">No batch details found.</Alert>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/production-batches")}
        sx={{ mb: 2 }}
      >
        Back to Production Batches
      </Button>
      <Typography variant="h4" gutterBottom>
        Production Batch Detail: {batch.batchNumber}
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Batch Number:</Typography>
              <Typography>{batch.batchNumber}</Typography>
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
              <Typography variant="h6">Scheduled Start Date:</Typography>
              <Typography>{formatDate(batch.scheduledStartDate)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Scheduled End Date:</Typography>
              <Typography>{formatDate(batch.scheduledEndDate)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Actual Start Date:</Typography>
              <Typography>{formatDate(batch.actualStartDate)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Actual End Date:</Typography>
              <Typography>{formatDate(batch.actualEndDate)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Notes:</Typography>
              <Typography>{batch.notes || "-"}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Production Request:</Typography>
              {batch.request ? (
                <Box>
                  <Typography variant="body1">
                    Request ID: {batch.request.requestId}
                  </Typography>
                  <Typography variant="body1">
                    Product Name: {batch.request.productName}
                  </Typography>
                  <Typography variant="body1">
                    Customer ID: {batch.request.customerId}
                  </Typography>
                  <Typography variant="body1">
                    Priority: {batch.request.priority}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">
                  No associated production request.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Production Steps:</Typography>
              {batch.steps && batch.steps.length > 0 ? (
                <ul>
                  {batch.steps.map((step) => (
                    <li key={step.id}>
                      <Typography variant="body2">
                        {step.stepOrder}. {step.stepName} (
                        {step.machineType || "N/A"}) - Status: {step.status}
                        <br />
                        Scheduled: {formatDate(step.scheduledStartTime)} -{" "}
                        {formatDate(step.scheduledEndTime)}
                        <br />
                        Actual: {formatDate(step.actualStartTime)} -{" "}
                        {formatDate(step.actualEndTime)}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">
                  No production steps defined for this batch.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Material Allocations:</Typography>
              {batch.materialAllocations &&
              batch.materialAllocations.length > 0 ? (
                <ul>
                  {batch.materialAllocations.map((material) => (
                    <li key={material.id}>
                      <Typography variant="body2">
                        Material ID: {material.materialId}, Required:{" "}
                        {material.quantityRequired} {material.unitOfMeasure},
                        Allocated: {material.quantityAllocated}{" "}
                        {material.unitOfMeasure} - Status: {material.status}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">
                  No material allocations for this batch.
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductionBatchDetail;

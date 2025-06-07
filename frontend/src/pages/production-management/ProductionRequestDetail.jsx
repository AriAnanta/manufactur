import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Stack,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Factory as FactoryIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import axios from "axios";
import { PageHeader, AlertMessage } from "../../components/common";

/**
 * ProductionRequestDetail Component
 *
 * Komponen untuk menampilkan detail permintaan produksi tertentu.
 * Mengambil ID permintaan dari URL dan menampilkan informasi terkait.
 */
const ProductionRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  /**
   * Mengambil detail permintaan produksi dari API berdasarkan ID.
   */
  const fetchRequestDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5001/api/production/${id}`
      );
      if (response.data) {
        setRequest(response.data);
      } else {
        setError("Permintaan tidak ditemukan.");
        setAlert({
          open: true,
          severity: "error",
          message: "Permintaan tidak ditemukan.",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching request detail:", err);
      setError("Gagal memuat detail permintaan.");
      setLoading(false);
      setAlert({
        open: true,
        severity: "error",
        message: "Gagal memuat detail permintaan.",
      });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      received: { color: "info", label: "Received" },
      planned: { color: "warning", label: "Planned" },
      in_production: { color: "primary", label: "In Production" },
      completed: { color: "success", label: "Completed" },
      cancelled: { color: "error", label: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low" },
      normal: { color: "info", label: "Normal" },
      high: { color: "warning", label: "High" },
      urgent: { color: "error", label: "Urgent" },
    };

    const config = priorityConfig[priority] || { color: "default", label: priority };
    return (
      <Chip
        label={config.label}
        color={config.color}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Fade>
    );
  }

  if (!request) {
    return (
      <Fade in>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          Production request not found.
        </Alert>
      </Fade>
    );
  }

  return (
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
                  <FactoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    Request: {request.requestId}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Production request details and tracking
                  </Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  component={Link}
                  to="/production-requests"
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Edit Request
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grid container spacing={4}>
        {/* Request Information */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={800}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Request Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Request ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {request.requestId}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Customer ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {request.customerId}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Product Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {request.productName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Quantity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {request.quantity.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Priority
                    </Typography>
                    <Box sx={{ mt: 1 }}>{getPriorityChip(request.priority)}</Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Status
                    </Typography>
                    <Box sx={{ mt: 1 }}>{getStatusChip(request.status)}</Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Timeline Information */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1000}>
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Timeline & Details
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(request.dueDate).toLocaleDateString("id-ID")}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(request.createdAt)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Specifications
                    </Typography>
                    <Typography variant="body1">
                      {request.specifications || "No specifications provided"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Marketplace Data
                    </Typography>
                    <Typography variant="body1">
                      {request.marketplaceData
                        ? JSON.stringify(request.marketplaceData, null, 2)
                        : "No marketplace data"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Related Batches */}
        <Grid item xs={12}>
          <Grow in timeout={1200}>
            <Card sx={{ border: "1px solid", borderColor: "grey.200" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Related Production Batches
                  </Typography>
                </Box>

                {request.batches && request.batches.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {request.batches.map((batch) => (
                      <ListItem
                        key={batch.id}
                        sx={{
                          px: 0,
                          py: 2,
                          borderBottom: "1px solid",
                          borderColor: "grey.100",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              Batch Number: {batch.batchNumber}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Quantity: {batch.quantity} | Status: {batch.status}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info" variant="outlined">
                    No production batches have been created for this request yet.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionRequestDetail;

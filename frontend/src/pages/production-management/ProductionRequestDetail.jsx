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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { PageHeader, AlertMessage } from "../../components/common";
import axios from "axios"; // Import axios

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

  return (
    <Box>
      <PageHeader
        title="Detail Permintaan Produksi"
        subtitle={`ID: ${request ? request.requestId : ""}`}
        actions={[
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/production-requests"
          >
            Kembali
          </Button>,
          request && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              // onClick={() => handleEdit(request.id)} // Tambahkan fungsi edit jika diperlukan
            >
              Edit Permintaan
            </Button>
          ),
        ]}
      />

      <AlertMessage
        open={alert.open}
        severity={alert.severity}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      ) : request ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Request ID:
              </Typography>
              <Typography variant="body1">{request.requestId}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Customer ID:
              </Typography>
              <Typography variant="body1">{request.customerId}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Nama Produk:
              </Typography>
              <Typography variant="body1">{request.productName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Kuantitas:
              </Typography>
              <Typography variant="body1">{request.quantity}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Prioritas:
              </Typography>
              <Typography variant="body1">{request.priority}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Status:
              </Typography>
              <Typography variant="body1">{request.status}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Tanggal Jatuh Tempo:
              </Typography>
              <Typography variant="body1">
                {new Date(request.dueDate).toLocaleDateString("id-ID")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary">
                Spesifikasi:
              </Typography>
              <Typography variant="body1">
                {request.specifications || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Data Marketplace:
              </Typography>
              <Typography variant="body1">
                {request.marketplaceData
                  ? JSON.stringify(request.marketplaceData)
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Dibuat Pada:
              </Typography>
              <Typography variant="body1">
                {formatDate(request.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Batch Produksi Terkait:</Typography>
              {request.batches && request.batches.length > 0 ? (
                <ul>
                  {request.batches.map((batch) => (
                    <li key={batch.id}>
                      <Typography variant="body2">
                        Batch Number: {batch.batchNumber}, Quantity:{" "}
                        {batch.quantity}, Status: {batch.status}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">
                  Tidak ada batch produksi terkait.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      ) : null}
    </Box>
  );
};

export default ProductionRequestDetail;

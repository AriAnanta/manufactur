import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Paper, Grid, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { PageHeader, AlertMessage } from '../../components/common';

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
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });

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
      // Simulasi panggilan API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dummyRequests = [
        { id: 'req1', productName: 'Meja Kayu', quantity: 100, status: 'Pending', dueDate: '2023-06-01', description: 'Permintaan untuk 100 unit meja kayu standar.', createdAt: '2023-05-25T10:00:00Z' },
        { id: 'req2', productName: 'Kursi Besi', quantity: 250, status: 'In Progress', dueDate: '2023-06-15', description: 'Permintaan untuk 250 unit kursi besi dengan desain minimalis.', createdAt: '2023-05-20T14:30:00Z' },
        { id: 'req3', productName: 'Lemari Pakaian', quantity: 50, status: 'Completed', dueDate: '2023-05-20', description: 'Permintaan untuk 50 unit lemari pakaian 3 pintu.', createdAt: '2023-05-18T09:00:00Z' },
      ];
      const foundRequest = dummyRequests.find(req => req.id === id);
      if (foundRequest) {
        setRequest(foundRequest);
      } else {
        setError('Permintaan tidak ditemukan.');
        setAlert({ open: true, severity: 'error', message: 'Permintaan tidak ditemukan.' });
      }
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat detail permintaan.');
      setLoading(false);
      setAlert({ open: true, severity: 'error', message: 'Gagal memuat detail permintaan.' });
    }
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box>
      <PageHeader
        title="Detail Permintaan Produksi"
        subtitle={`ID: ${id}`}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
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
              <Typography variant="subtitle1" color="textSecondary">Nama Produk:</Typography>
              <Typography variant="body1">{request.productName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">Kuantitas:</Typography>
              <Typography variant="body1">{request.quantity}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">Status:</Typography>
              <Typography variant="body1">{request.status}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">Tanggal Jatuh Tempo:</Typography>
              <Typography variant="body1">{new Date(request.dueDate).toLocaleDateString('id-ID')}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary">Deskripsi:</Typography>
              <Typography variant="body1">{request.description || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">Dibuat Pada:</Typography>
              <Typography variant="body1">{formatDate(request.createdAt)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      ) : null}
    </Box>
  );
};

export default ProductionRequestDetail;
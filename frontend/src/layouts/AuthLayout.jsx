import React from 'react';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

/**
 * AuthLayout Component
 *
 * Komponen layout untuk halaman otentikasi (login, register, dll.).
 * Menyediakan struktur dasar dengan latar belakang, logo, dan tautan kembali ke beranda.
 */
const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.grey[100],
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <MuiLink component={RouterLink} to="/" underline="none">
            <Typography variant="h4" component="h1" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              Manufaktur On-Demand
            </Typography>
          </MuiLink>
          <Outlet />
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
          {'Hak Cipta © '}
          <MuiLink color="inherit" href="https://mui.com/">
            Manufaktur On-Demand
          </MuiLink>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default AuthLayout;
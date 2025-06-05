import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  Feedback as FeedbackIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GET_PRODUCTION_REQUESTS_SUMMARY } from '../graphql/productionManagement';
import { GET_PLANS_SUMMARY } from '../graphql/productionPlanning';
import { GET_MACHINES_SUMMARY } from '../graphql/machineQueue';
import { GET_MATERIALS_SUMMARY } from '../graphql/materialInventory';
import { GET_FEEDBACK_SUMMARY } from '../graphql/productionFeedback';
import { GET_USERS_SUMMARY } from '../graphql/userService';

// Dashboard service card component
const ServiceCard = ({ title, icon, count, status, loading, error, linkTo, buttonText }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.light + '30',
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 1 }}>
            Failed to load data
          </Alert>
        ) : (
          <Box sx={{ my: 2 }}>
            <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
              {count}
            </Typography>
            {status && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {status.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.status}: ${item.count}`}
                    size="small"
                    color={item.color || 'default'}
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate(linkTo)}>
          {buttonText || 'View Details'}
        </Button>
      </CardActions>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Production Management
  const {
    data: productionData,
    loading: productionLoading,
    error: productionError,
  } = useQuery(GET_PRODUCTION_REQUESTS_SUMMARY);

  // Production Planning
  const {
    data: planningData,
    loading: planningLoading,
    error: planningError,
  } = useQuery(GET_PLANS_SUMMARY);

  // Machine Queue
  const {
    data: machineData,
    loading: machineLoading,
    error: machineError,
  } = useQuery(GET_MACHINES_SUMMARY);

  // Material Inventory
  const {
    data: materialData,
    loading: materialLoading,
    error: materialError,
  } = useQuery(GET_MATERIALS_SUMMARY);

  // Production Feedback
  const {
    data: feedbackData,
    loading: feedbackLoading,
    error: feedbackError,
  } = useQuery(GET_FEEDBACK_SUMMARY);

  // User Service
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USERS_SUMMARY);

  // Process data for display
  const productionSummary = productionData?.productionRequestsSummary || {
    total: 0,
    status: [],
  };

  const planningSummary = planningData?.plansSummary || {
    total: 0,
    status: [],
  };

  const machineSummary = machineData?.machinesSummary || {
    total: 0,
    status: [],
  };

  const materialSummary = materialData?.materialsSummary || {
    total: 0,
    status: [],
  };

  const feedbackSummary = feedbackData?.feedbackSummary || {
    total: 0,
    status: [],
  };

  const userSummary = userData?.usersSummary || {
    total: 0,
    status: [],
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.primary.light + '10',
          border: `1px solid ${theme.palette.primary.light}`,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.username || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This dashboard provides an overview of all manufacturing operations. Use the cards below to
          navigate to specific services or check the sidebar for detailed navigation.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Production Management */}
        <Grid item xs={12} sm={6} md={4}>
          <ServiceCard
            title="Production Management"
            icon={<FactoryIcon color="primary" />}
            count={productionSummary.total}
            status={productionSummary.status}
            loading={productionLoading}
            error={productionError}
            linkTo="/production-requests"
            buttonText="View Requests"
          />
        </Grid>

        {/* Production Planning */}
        <Grid item xs={12} sm={6} md={4}>
          <ServiceCard
            title="Production Planning"
            icon={<ScheduleIcon color="primary" />}
            count={planningSummary.total}
            status={planningSummary.status}
            loading={planningLoading}
            error={planningError}
            linkTo="/production-plans"
            buttonText="View Plans"
          />
        </Grid>

        {/* Machine Queue */}
        <Grid item xs={12} sm={6} md={4}>
          <ServiceCard
            title="Machine Queue"
            icon={<SettingsIcon color="primary" />}
            count={machineSummary.total}
            status={machineSummary.status}
            loading={machineLoading}
            error={machineError}
            linkTo="/machines"
            buttonText="View Machines"
          />
        </Grid>

        {/* Material Inventory */}
        <Grid item xs={12} sm={6} md={4}>
          <ServiceCard
            title="Material Inventory"
            icon={<InventoryIcon color="primary" />}
            count={materialSummary.total}
            status={materialSummary.status}
            loading={materialLoading}
            error={materialError}
            linkTo="/materials"
            buttonText="View Materials"
          />
        </Grid>

        {/* Production Feedback */}
        <Grid item xs={12} sm={6} md={4}>
          <ServiceCard
            title="Production Feedback"
            icon={<FeedbackIcon color="primary" />}
            count={feedbackSummary.total}
            status={feedbackSummary.status}
            loading={feedbackLoading}
            error={feedbackError}
            linkTo="/feedback"
            buttonText="View Feedback"
          />
        </Grid>

        {/* User Service */}
        <Grid item xs={12} sm={6} md={4}>
          <ServiceCard
            title="User Management"
            icon={<PeopleIcon color="primary" />}
            count={userSummary.total}
            status={userSummary.status}
            loading={userLoading}
            error={userError}
            linkTo="/users"
            buttonText="View Users"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
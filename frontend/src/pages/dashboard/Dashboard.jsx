import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalMachines: 0,
    activeMachines: 0,
    totalMaterials: 0,
    lowStockMaterials: [],
    recentTransactions: [],
    productionSummary: {
      totalRequests: 0,
      completedBatches: 0,
      inProgressBatches: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        totalMachines: 12,
        activeMachines: 8,
        totalMaterials: 45,
        lowStockMaterials: [
          { id: 1, name: 'Steel Plate', currentStock: 5, minStock: 10, unit: 'kg' },
          { id: 2, name: 'Aluminum Wire', currentStock: 2, minStock: 15, unit: 'meter' },
          { id: 3, name: 'Copper Rod', currentStock: 8, minStock: 20, unit: 'piece' }
        ],
        recentTransactions: [
          { id: 1, material: 'Steel Plate', type: 'INCOMING', quantity: 50, date: new Date() },
          { id: 2, material: 'Aluminum Wire', type: 'OUTGOING', quantity: 25, date: new Date() },
          { id: 3, material: 'Copper Rod', type: 'INCOMING', quantity: 30, date: new Date() }
        ],
        productionSummary: {
          totalRequests: 24,
          completedBatches: 18,
          inProgressBatches: 6
        }
      });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
            {subtitle && (
              <Typography color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Machines"
            value={dashboardData.totalMachines}
            subtitle={`${dashboardData.activeMachines} active`}
            icon={<BuildIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Materials"
            value={dashboardData.totalMaterials}
            subtitle={`${dashboardData.lowStockMaterials.length} low stock`}
            icon={<InventoryIcon sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Production Requests"
            value={dashboardData.productionSummary.totalRequests}
            subtitle="Total requests"
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Batches"
            value={dashboardData.productionSummary.inProgressBatches}
            subtitle="In progress"
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>

        {/* Machine Utilization */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Machine Utilization
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active Machines: {dashboardData.activeMachines} / {dashboardData.totalMachines}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(dashboardData.activeMachines / dashboardData.totalMachines) * 100}
                sx={{ mt: 1 }}
              />
            </Box>
            <Typography variant="body2">
              {Math.round((dashboardData.activeMachines / dashboardData.totalMachines) * 100)}% utilization
            </Typography>
          </Paper>
        </Grid>

        {/* Production Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Production Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="h4" color="primary">
                  {dashboardData.productionSummary.totalRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Requests
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" color="success.main">
                  {dashboardData.productionSummary.completedBatches}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" color="warning.main">
                  {dashboardData.productionSummary.inProgressBatches}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Low Stock Materials */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Low Stock Materials
              </Typography>
            </Box>
            <List>
              {dashboardData.lowStockMaterials.map((material) => (
                <ListItem key={material.id} divider>
                  <ListItemText
                    primary={material.name}
                    secondary={`${material.currentStock} ${material.unit} (Min: ${material.minStock})`}
                  />
                  <Chip 
                    label="Low Stock" 
                    color="warning" 
                    size="small" 
                  />
                </ListItem>
              ))}
              {dashboardData.lowStockMaterials.length === 0 && (
                <ListItem>
                  <ListItemText primary="No low stock materials" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {dashboardData.recentTransactions.map((transaction) => (
                <ListItem key={transaction.id} divider>
                  <ListItemText
                    primary={transaction.material}
                    secondary={`${transaction.quantity} units - ${transaction.date.toLocaleDateString()}`}
                  />
                  <Chip 
                    label={transaction.type} 
                    color={transaction.type === 'INCOMING' ? 'success' : 'error'}
                    size="small" 
                  />
                </ListItem>
              ))}
              {dashboardData.recentTransactions.length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent transactions" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
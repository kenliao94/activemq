/**
 * Dashboard page component
 * Displays broker overview with key metrics and real-time updates
 */

import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Memory,
  Storage,
  Link as LinkIcon,
  Message,
  Refresh,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import { MetricCardGrid } from '../components/common/MetricCard';
import { GaugeChart } from '../components/charts/GaugeChart';
import { useBrokerInfo } from '../hooks/useBrokerInfo';
import {
  formatUptime,
  formatNumber,
  formatRelativeTime,
} from '../utils/formatters';

/**
 * Dashboard page component
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2
 */
export function Dashboard() {
  const {
    brokerInfo,
    isLoading,
    error,
    lastUpdate,
    refresh,
    isAutoRefreshing,
    pauseAutoRefresh,
    resumeAutoRefresh,
  } = useBrokerInfo({
    autoRefresh: true,
    fetchOnMount: true,
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    await refresh();
  };

  // Toggle auto-refresh
  const handleToggleAutoRefresh = () => {
    if (isAutoRefreshing) {
      pauseAutoRefresh();
    } else {
      resumeAutoRefresh();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          {lastUpdate && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {formatRelativeTime(lastUpdate)}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={isAutoRefreshing ? 'Pause auto-refresh' : 'Resume auto-refresh'}>
            <IconButton
              onClick={handleToggleAutoRefresh}
              color={isAutoRefreshing ? 'primary' : 'default'}
              aria-label={isAutoRefreshing ? 'Pause auto-refresh' : 'Resume auto-refresh'}
            >
              {isAutoRefreshing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh now">
            <IconButton
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh broker data"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Broker Information Cards */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Broker Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Broker Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {brokerInfo?.name || 'Loading...'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Version
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {brokerInfo?.version || 'Loading...'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Broker ID
              </Typography>
              <Typography
                variant="body1"
                fontWeight={500}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={brokerInfo?.id}
              >
                {brokerInfo?.id || 'Loading...'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Uptime
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {brokerInfo?.uptimeMillis
                  ? formatUptime(brokerInfo.uptimeMillis)
                  : 'Loading...'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Metrics
        </Typography>
        <MetricCardGrid
          metrics={[
            {
              title: 'Memory Usage',
              value: brokerInfo?.memoryPercentUsage ?? 0,
              unit: '%',
              icon: <Memory />,
              color:
                (brokerInfo?.memoryPercentUsage ?? 0) >= 90
                  ? 'error'
                  : (brokerInfo?.memoryPercentUsage ?? 0) >= 70
                  ? 'warning'
                  : 'success',
              loading: isLoading,
              infoTooltip: 'Current memory usage percentage',
            },
            {
              title: 'Store Usage',
              value: brokerInfo?.storePercentUsage ?? 0,
              unit: '%',
              icon: <Storage />,
              color:
                (brokerInfo?.storePercentUsage ?? 0) >= 90
                  ? 'error'
                  : (brokerInfo?.storePercentUsage ?? 0) >= 70
                  ? 'warning'
                  : 'success',
              loading: isLoading,
              infoTooltip: 'Current persistent store usage percentage',
            },
            {
              title: 'Connections',
              value: brokerInfo?.totalConnections
                ? formatNumber(brokerInfo.totalConnections)
                : 0,
              icon: <LinkIcon />,
              color: 'primary',
              loading: isLoading,
              infoTooltip: 'Total number of active connections',
            },
            {
              title: 'Total Messages',
              value: brokerInfo?.totalMessageCount
                ? formatNumber(brokerInfo.totalMessageCount)
                : 0,
              icon: <Message />,
              color: 'info',
              loading: isLoading,
              infoTooltip: 'Total number of messages in all queues',
            },
          ]}
        />
      </Box>

      {/* Gauge Charts for Percentage Metrics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resource Usage
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <GaugeChart
                value={brokerInfo?.memoryPercentUsage ?? 0}
                title="Memory Usage"
                height={200}
                width={200}
                thresholds={{
                  warning: 70,
                  critical: 90,
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <GaugeChart
                value={brokerInfo?.storePercentUsage ?? 0}
                title="Store Usage"
                height={200}
                width={200}
                thresholds={{
                  warning: 70,
                  critical: 90,
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <GaugeChart
                value={brokerInfo?.tempPercentUsage ?? 0}
                title="Temp Usage"
                height={200}
                width={200}
                thresholds={{
                  warning: 70,
                  critical: 90,
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Additional Statistics */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Message Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Enqueued
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {brokerInfo?.totalEnqueueCount
                  ? formatNumber(brokerInfo.totalEnqueueCount)
                  : '0'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Dequeued
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {brokerInfo?.totalDequeueCount
                  ? formatNumber(brokerInfo.totalDequeueCount)
                  : '0'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Consumers
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {brokerInfo?.totalConsumerCount
                  ? formatNumber(brokerInfo.totalConsumerCount)
                  : '0'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Producers
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {brokerInfo?.totalProducerCount
                  ? formatNumber(brokerInfo.totalProducerCount)
                  : '0'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Auto-refresh indicator */}
      {isAutoRefreshing && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Chip
            label="Auto-refresh enabled"
            color="primary"
            size="small"
            icon={<Refresh />}
          />
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;

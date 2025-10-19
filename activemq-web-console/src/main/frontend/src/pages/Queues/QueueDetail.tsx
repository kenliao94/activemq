import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useDestinations } from '../../hooks/useDestinations';
import { usePolling } from '../../hooks/usePolling';
import { Queue } from '../../types/destination';
import queueService from '../../services/queueService';
import toast from 'react-hot-toast';

/**
 * Queue Detail Page
 * Shows detailed information about a specific queue
 * Provides actions: delete, purge, pause, resume
 */
export function QueueDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    severity?: 'warning' | 'error';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const {
    deleteQueue,
    purgeQueue,
    pauseQueue,
    resumeQueue,
  } = useDestinations({ type: 'queue', autoRefresh: false });

  // Fetch queue details
  const fetchQueueDetails = async () => {
    if (!name) return;

    setIsLoading(true);
    setError(null);

    try {
      const queueData = await queueService.getQueue(decodeURIComponent(name));
      setQueue({
        ...queueData,
        type: 'queue' as const,
        dispatchCount: 0,
        expiredCount: 0,
        inflightCount: 0,
        averageBlockedTime: 0,
        totalBlockedTime: 0,
      });
      setLastUpdate(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queue details');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto-refresh
  const { isPolling, pause, resume } = usePolling(fetchQueueDetails, {
    interval: 5000,
    enabled: true,
    executeImmediately: true,
  });

  // Handle delete queue
  const handleDeleteQueue = () => {
    if (!queue) return;

    setConfirmDialog({
      open: true,
      title: 'Delete Queue',
      message: `Are you sure you want to delete queue "${queue.name}"? This action cannot be undone.`,
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteQueue?.(queue.name);
          toast.success(`Queue "${queue.name}" deleted successfully`);
          navigate('/queues');
        } catch (error) {
          toast.error(`Failed to delete queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Handle purge queue
  const handlePurgeQueue = () => {
    if (!queue) return;

    setConfirmDialog({
      open: true,
      title: 'Purge Queue',
      message: `Are you sure you want to purge all messages from queue "${queue.name}"? This action cannot be undone.`,
      severity: 'warning',
      onConfirm: async () => {
        try {
          await purgeQueue?.(queue.name);
          toast.success(`Queue "${queue.name}" purged successfully`);
          await fetchQueueDetails(); // Refresh data
        } catch (error) {
          toast.error(`Failed to purge queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Handle pause queue
  const handlePauseQueue = async () => {
    if (!queue) return;

    try {
      await pauseQueue?.(queue.name);
      toast.success(`Queue "${queue.name}" paused successfully`);
      await fetchQueueDetails(); // Refresh data
    } catch (error) {
      toast.error(`Failed to pause queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle resume queue
  const handleResumeQueue = async () => {
    if (!queue) return;

    try {
      await resumeQueue?.(queue.name);
      toast.success(`Queue "${queue.name}" resumed successfully`);
      await fetchQueueDetails(); // Refresh data
    } catch (error) {
      toast.error(`Failed to resume queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading && !queue) {
    return <LoadingSpinner message="Loading queue details..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading queue details
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button onClick={fetchQueueDetails} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!queue) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Queue not found</Typography>
        <Button onClick={() => navigate('/queues')} sx={{ mt: 2 }}>
          Back to Queues
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/queues')} aria-label="Back to queues">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" component="h1">
                {queue.name}
              </Typography>
              {queue.paused && <Chip label="Paused" color="warning" />}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {lastUpdate && `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
              {isPolling && ' • Auto-refresh enabled'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title={isPolling ? 'Pause auto-refresh' : 'Resume auto-refresh'}>
              <IconButton
                onClick={() => (isPolling ? pause() : resume())}
                aria-label={isPolling ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              >
                {isPolling ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh now">
              <IconButton onClick={fetchQueueDetails} aria-label="Refresh queue details">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<ShowChartIcon />}
            onClick={() => navigate(`/queues/${encodeURIComponent(queue.name)}/graph`)}
          >
            View Graph
          </Button>
          <Button
            variant="outlined"
            startIcon={queue.paused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={queue.paused ? handleResumeQueue : handlePauseQueue}
          >
            {queue.paused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<ClearIcon />}
            onClick={handlePurgeQueue}
          >
            Purge
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteQueue}
          >
            Delete
          </Button>
        </Stack>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Messages"
            value={queue.queueSize.toLocaleString()}
            color={queue.queueSize === 0 ? 'success' : queue.queueSize < 100 ? 'info' : 'warning'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Consumers"
            value={queue.consumerCount.toString()}
            color={queue.consumerCount === 0 ? 'error' : 'success'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Producers"
            value={queue.producerCount.toString()}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Memory Usage"
            value={`${queue.memoryPercentUsage}%`}
            color={queue.memoryPercentUsage < 70 ? 'success' : queue.memoryPercentUsage < 90 ? 'warning' : 'error'}
          />
        </Grid>
      </Grid>

      {/* Detailed Statistics */}
      <Grid container spacing={3}>
        {/* Message Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Message Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Enqueued
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.enqueueCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dequeued
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.dequeueCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.queueSize.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dispatched
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.dispatchCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Expired
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.expiredCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    In Flight
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.inflightCount.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Enqueue Time
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.averageEnqueueTime.toFixed(2)} ms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Min Enqueue Time
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.minEnqueueTime.toFixed(2)} ms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Max Enqueue Time
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.maxEnqueueTime.toFixed(2)} ms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Message Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {(queue.averageMessageSize / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Min Message Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {(queue.minMessageSize / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Max Message Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {(queue.maxMessageSize / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Connection Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connection Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Consumer Count
                  </Typography>
                  <StatusBadge
                    status={queue.consumerCount === 0 ? 'error' : 'success'}
                    label={queue.consumerCount.toString()}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Producer Count
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {queue.producerCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resource Usage
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Memory Usage
                  </Typography>
                  <StatusBadge
                    status={
                      queue.memoryPercentUsage < 70
                        ? 'success'
                        : queue.memoryPercentUsage < 90
                        ? 'warning'
                        : 'error'
                    }
                    label={`${queue.memoryPercentUsage}%`}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusBadge
                    status={queue.paused ? 'warning' : 'success'}
                    label={queue.paused ? 'Paused' : 'Active'}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        severity={confirmDialog.severity}
      />
    </Box>
  );
}

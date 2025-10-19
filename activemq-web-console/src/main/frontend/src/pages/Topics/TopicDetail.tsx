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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useDestinations } from '../../hooks/useDestinations';
import { usePolling } from '../../hooks/usePolling';
import { Topic } from '../../types/destination';
import topicService from '../../services/topicService';
import toast from 'react-hot-toast';

/**
 * Topic Detail Page
 * Shows detailed information about a specific topic
 * Provides actions: delete
 */
export function TopicDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
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

  const { deleteTopic } = useDestinations({ type: 'topic', autoRefresh: false });

  // Fetch topic details
  const fetchTopicDetails = async () => {
    if (!name) return;

    setIsLoading(true);
    setError(null);

    try {
      const topicData = await topicService.getTopic(decodeURIComponent(name));
      setTopic({
        ...topicData,
        type: 'topic' as const,
        subscriptionCount: 0,
        durableSubscriptionCount: 0,
        nonDurableSubscriptionCount: 0,
      });
      setLastUpdate(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topic details');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto-refresh
  const { isPolling, pause, resume } = usePolling(fetchTopicDetails, {
    interval: 5000,
    enabled: true,
    executeImmediately: true,
  });

  // Handle delete topic
  const handleDeleteTopic = () => {
    if (!topic) return;

    setConfirmDialog({
      open: true,
      title: 'Delete Topic',
      message: `Are you sure you want to delete topic "${topic.name}"? This action cannot be undone.`,
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteTopic?.(topic.name);
          toast.success(`Topic "${topic.name}" deleted successfully`);
          navigate('/topics');
        } catch (error) {
          toast.error(`Failed to delete topic: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  if (isLoading && !topic) {
    return <LoadingSpinner message="Loading topic details..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading topic details
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button onClick={fetchTopicDetails} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!topic) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Topic not found</Typography>
        <Button onClick={() => navigate('/topics')} sx={{ mt: 2 }}>
          Back to Topics
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/topics')} aria-label="Back to topics">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1">
              {topic.name}
            </Typography>
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
              <IconButton onClick={fetchTopicDetails} aria-label="Refresh topic details">
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
            onClick={() => navigate(`/topics/${encodeURIComponent(topic.name)}/graph`)}
          >
            View Graph
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteTopic}
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
            value={topic.queueSize.toLocaleString()}
            color={topic.queueSize === 0 ? 'success' : topic.queueSize < 100 ? 'info' : 'warning'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Consumers"
            value={topic.consumerCount.toString()}
            color={topic.consumerCount === 0 ? 'warning' : 'success'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Producers"
            value={topic.producerCount.toString()}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Memory Usage"
            value={`${topic.memoryPercentUsage}%`}
            color={topic.memoryPercentUsage < 70 ? 'success' : topic.memoryPercentUsage < 90 ? 'warning' : 'error'}
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
                    {topic.enqueueCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dequeued
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.dequeueCount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.queueSize.toLocaleString()}
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
                    {topic.averageEnqueueTime.toFixed(2)} ms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Min Enqueue Time
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.minEnqueueTime.toFixed(2)} ms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Max Enqueue Time
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.maxEnqueueTime.toFixed(2)} ms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Message Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {(topic.averageMessageSize / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Min Message Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {(topic.minMessageSize / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Max Message Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {(topic.maxMessageSize / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Subscriptions
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.subscriptionCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Durable Subscriptions
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.durableSubscriptionCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Non-Durable Subscriptions
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.nonDurableSubscriptionCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Consumer Count
                  </Typography>
                  <StatusBadge
                    status={topic.consumerCount === 0 ? 'warning' : 'success'}
                    label={topic.consumerCount.toString()}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Producer Count
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {topic.producerCount}
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
                      topic.memoryPercentUsage < 70
                        ? 'success'
                        : topic.memoryPercentUsage < 90
                        ? 'warning'
                        : 'error'
                    }
                    label={`${topic.memoryPercentUsage}%`}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusBadge
                    status="success"
                    label="Active"
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

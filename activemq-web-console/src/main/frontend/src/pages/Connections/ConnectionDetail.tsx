import { useState, useMemo } from 'react';
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
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { ColumnDef } from '@tanstack/react-table';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DataTable } from '../../components/common/DataTable';
import { usePolling } from '../../hooks/usePolling';
import connectionService, { Connection, Subscriber } from '../../services/connectionService';
import toast from 'react-hot-toast';

/**
 * Connection Detail Page
 * Shows detailed information about a specific connection
 * Displays sessions, consumers, and connection metrics
 */
export function ConnectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
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

  // Fetch connection details and subscribers
  const fetchConnectionDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const decodedId = decodeURIComponent(id);
      
      // Fetch connection details
      const connectionData = await connectionService.getConnection(decodedId);
      setConnection(connectionData);

      // Fetch all subscribers and filter by connection ID
      const allSubscribers = await connectionService.getSubscribers();
      const connectionSubscribers = allSubscribers.filter(
        (sub) => sub.connectionId === decodedId
      );
      setSubscribers(connectionSubscribers);

      setLastUpdate(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connection details');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto-refresh
  const { isPolling, pause, resume } = usePolling(fetchConnectionDetails, {
    interval: 5000,
    enabled: true,
    executeImmediately: true,
  });

  // Handle close connection
  const handleCloseConnection = () => {
    if (!connection) return;

    setConfirmDialog({
      open: true,
      title: 'Close Connection',
      message: `Are you sure you want to close connection "${connection.connectionId}"? This will disconnect the client.`,
      severity: 'warning',
      onConfirm: async () => {
        try {
          await connectionService.closeConnection(connection.connectionId);
          toast.success(`Connection "${connection.connectionId}" closed successfully`);
          navigate('/connections');
        } catch (error) {
          toast.error(
            `Failed to close connection: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Handle delete subscriber
  const handleDeleteSubscriber = (subscriberId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Subscriber',
      message: `Are you sure you want to delete subscriber "${subscriberId}"?`,
      severity: 'warning',
      onConfirm: async () => {
        try {
          await connectionService.deleteSubscriber(subscriberId);
          toast.success(`Subscriber "${subscriberId}" deleted successfully`);
          await fetchConnectionDetails(); // Refresh data
        } catch (error) {
          toast.error(
            `Failed to delete subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Calculate connection metrics
  const connectionMetrics = useMemo(() => {
    if (!subscribers.length) {
      return {
        totalEnqueued: 0,
        totalDequeued: 0,
        totalDispatched: 0,
        totalPending: 0,
      };
    }

    return subscribers.reduce(
      (acc, sub) => ({
        totalEnqueued: acc.totalEnqueued + sub.enqueueCounter,
        totalDequeued: acc.totalDequeued + sub.dequeueCounter,
        totalDispatched: acc.totalDispatched + sub.dispatchedCounter,
        totalPending: acc.totalPending + sub.dispatchedQueueSize,
      }),
      { totalEnqueued: 0, totalDequeued: 0, totalDispatched: 0, totalPending: 0 }
    );
  }, [subscribers]);

  // Define subscriber table columns
  const subscriberColumns = useMemo<ColumnDef<Subscriber>[]>(
    () => [
      {
        accessorKey: 'consumerId',
        header: 'Consumer ID',
        cell: (info) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'destination',
        header: 'Destination',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'selector',
        header: 'Selector',
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return value ? (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {value}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              None
            </Typography>
          );
        },
      },
      {
        accessorKey: 'enqueueCounter',
        header: 'Enqueued',
        cell: (info) => (info.getValue() as number).toLocaleString(),
      },
      {
        accessorKey: 'dequeueCounter',
        header: 'Dequeued',
        cell: (info) => (info.getValue() as number).toLocaleString(),
      },
      {
        accessorKey: 'dispatchedCounter',
        header: 'Dispatched',
        cell: (info) => (info.getValue() as number).toLocaleString(),
      },
      {
        accessorKey: 'dispatchedQueueSize',
        header: 'Pending',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <StatusBadge
              status={value === 0 ? 'success' : value < 10 ? 'info' : 'warning'}
              label={value.toLocaleString()}
            />
          );
        },
      },
      {
        accessorKey: 'prefetchSize',
        header: 'Prefetch',
        cell: (info) => (info.getValue() as number).toString(),
      },
      {
        id: 'flags',
        header: 'Flags',
        cell: (info) => {
          const subscriber = info.row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              {subscriber.exclusive && <Chip label="Exclusive" size="small" color="primary" />}
              {subscriber.retroactive && <Chip label="Retroactive" size="small" color="info" />}
            </Stack>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const subscriber = info.row.original;
          return (
            <Tooltip title="Delete Subscriber">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubscriber(subscriber.consumerId);
                }}
                aria-label="Delete subscriber"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  if (isLoading && !connection) {
    return <LoadingSpinner message="Loading connection details..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading connection details
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button onClick={fetchConnectionDetails} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!connection) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Connection not found</Typography>
        <Button onClick={() => navigate('/connections')} sx={{ mt: 2 }}>
          Back to Connections
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/connections')} aria-label="Back to connections">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h5" component="h1" sx={{ fontFamily: 'monospace' }}>
                {connection.connectionId}
              </Typography>
              {connection.connected && <Chip label="Connected" size="small" color="success" />}
              {connection.active && <Chip label="Active" size="small" color="info" />}
              {connection.slow && <Chip label="Slow" size="small" color="warning" />}
              {connection.blocked && <Chip label="Blocked" size="small" color="error" />}
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
              <IconButton onClick={fetchConnectionDetails} aria-label="Refresh connection details">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleCloseConnection}
          >
            Close Connection
          </Button>
        </Stack>
      </Box>

      {/* Connection Info */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connection Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Connection ID
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                    {connection.connectionId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Remote Address
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                    {connection.remoteAddress}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    User Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {connection.userName || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Client ID
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                    {connection.clientId || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Connector
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {connection.connectorName || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connection Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Connected
                  </Typography>
                  <StatusBadge
                    status={connection.connected ? 'success' : 'error'}
                    label={connection.connected ? 'Yes' : 'No'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                  <StatusBadge
                    status={connection.active ? 'success' : 'warning'}
                    label={connection.active ? 'Yes' : 'No'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Slow Consumer
                  </Typography>
                  <StatusBadge
                    status={connection.slow ? 'warning' : 'success'}
                    label={connection.slow ? 'Yes' : 'No'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Blocked
                  </Typography>
                  <StatusBadge
                    status={connection.blocked ? 'error' : 'success'}
                    label={connection.blocked ? 'Yes' : 'No'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dispatch Queue Size
                  </Typography>
                  <StatusBadge
                    status={
                      connection.dispatchQueueSize === 0
                        ? 'success'
                        : connection.dispatchQueueSize < 100
                        ? 'info'
                        : 'warning'
                    }
                    label={connection.dispatchQueueSize.toLocaleString()}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Message Throughput Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Enqueued"
            value={connectionMetrics.totalEnqueued.toLocaleString()}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Dequeued"
            value={connectionMetrics.totalDequeued.toLocaleString()}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Dispatched"
            value={connectionMetrics.totalDispatched.toLocaleString()}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Pending"
            value={connectionMetrics.totalPending.toLocaleString()}
            color={connectionMetrics.totalPending === 0 ? 'success' : 'warning'}
          />
        </Grid>
      </Grid>

      {/* Subscribers/Consumers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Consumers ({subscribers.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {subscribers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No consumers found for this connection
            </Typography>
          ) : (
            <DataTable
              data={subscribers}
              columns={subscriberColumns}
              enableSorting
              enableFiltering={false}
              enablePagination={subscribers.length > 10}
              initialPageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage="No consumers found"
              ariaLabel="Consumers table"
            />
          )}
        </CardContent>
      </Card>

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

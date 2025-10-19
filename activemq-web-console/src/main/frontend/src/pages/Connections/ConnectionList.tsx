import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import connectionService, { Connection } from '../../services/connectionService';
import toast from 'react-hot-toast';

/**
 * Connection List Page
 * Displays all active connections with sortable, filterable table
 * Provides action to close connections
 */
export function ConnectionList() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
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

  // Fetch connections
  const fetchConnections = async () => {
    try {
      setError(null);
      const data = await connectionService.getConnections();
      setConnections(data);
      setLastUpdate(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConnections();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefreshing) return;

    const interval = setInterval(() => {
      fetchConnections();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoRefreshing]);

  // Filter connections by search term
  const displayConnections = useMemo(() => {
    if (!searchFilter) return connections;
    const lowerFilter = searchFilter.toLowerCase();
    return connections.filter(
      (conn) =>
        conn.connectionId.toLowerCase().includes(lowerFilter) ||
        conn.remoteAddress.toLowerCase().includes(lowerFilter) ||
        conn.userName?.toLowerCase().includes(lowerFilter) ||
        conn.clientId?.toLowerCase().includes(lowerFilter)
    );
  }, [connections, searchFilter]);

  // Handle connection row click - navigate to detail page
  const handleRowClick = (connection: Connection) => {
    navigate(`/connections/${encodeURIComponent(connection.connectionId)}`);
  };

  // Handle close connection
  const handleCloseConnection = (connectionId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Close Connection',
      message: `Are you sure you want to close connection "${connectionId}"? This will disconnect the client.`,
      severity: 'warning',
      onConfirm: async () => {
        try {
          await connectionService.closeConnection(connectionId);
          toast.success(`Connection "${connectionId}" closed successfully`);
          await fetchConnections(); // Refresh the list
        } catch (error) {
          toast.error(
            `Failed to close connection: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Connection>[]>(
    () => [
      {
        accessorKey: 'connectionId',
        header: 'Connection ID',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'remoteAddress',
        header: 'Remote Address',
        cell: (info) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'userName',
        header: 'User',
        cell: (info) => {
          const value = info.getValue() as string;
          return value || <Typography variant="body2" color="text.secondary">N/A</Typography>;
        },
      },
      {
        accessorKey: 'clientId',
        header: 'Client ID',
        cell: (info) => {
          const value = info.getValue() as string;
          return value ? (
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {value}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">N/A</Typography>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const connection = info.row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              {connection.connected && (
                <Chip label="Connected" size="small" color="success" />
              )}
              {connection.active && (
                <Chip label="Active" size="small" color="info" />
              )}
              {connection.slow && (
                <Chip label="Slow" size="small" color="warning" />
              )}
              {connection.blocked && (
                <Chip label="Blocked" size="small" color="error" />
              )}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'dispatchQueueSize',
        header: 'Dispatch Queue',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <StatusBadge
              status={value === 0 ? 'success' : value < 100 ? 'info' : 'warning'}
              label={value.toLocaleString()}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const connection = info.row.original;
          return (
            <Tooltip title="Close Connection">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseConnection(connection.connectionId);
                }}
                aria-label="Close connection"
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

  if (error && !connections.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading connections
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button onClick={fetchConnections} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Connections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lastUpdate && `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
            {isAutoRefreshing && ' • Auto-refresh enabled'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={isAutoRefreshing ? 'Pause auto-refresh' : 'Resume auto-refresh'}>
            <IconButton
              onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
              aria-label={isAutoRefreshing ? 'Pause auto-refresh' : 'Resume auto-refresh'}
            >
              {isAutoRefreshing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh now">
            <IconButton onClick={fetchConnections} aria-label="Refresh connections">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Search Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter by connection ID, address, user, or client ID..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{ maxWidth: 600 }}
          inputProps={{ 'aria-label': 'Filter connections' }}
        />
      </Box>

      {/* Connection Table */}
      {isLoading && !connections.length ? (
        <LoadingSpinner message="Loading connections..." />
      ) : (
        <DataTable
          data={displayConnections}
          columns={columns}
          enableSorting
          enableFiltering={false}
          enablePagination
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyMessage="No connections found"
          onRowClick={handleRowClick}
          ariaLabel="Connections table"
        />
      )}

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

import { useState, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useDestinations } from '../../hooks/useDestinations';
import { Queue } from '../../types/destination';
import toast from 'react-hot-toast';

/**
 * Queue List Page
 * Displays all queues with sortable, filterable table
 * Provides actions: create, delete, purge, pause, resume
 */
export function QueueList() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
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
    filteredQueues,
    isLoading,
    error,
    lastUpdate,
    refresh,
    createQueue,
    deleteQueue,
    purgeQueue,
    pauseQueue,
    resumeQueue,
    isAutoRefreshing,
    pauseAutoRefresh,
    resumeAutoRefresh,
  } = useDestinations({ type: 'queue', autoRefresh: true });

  // Filter queues by search term
  const displayQueues = useMemo(() => {
    if (!searchFilter) return filteredQueues;
    const lowerFilter = searchFilter.toLowerCase();
    return filteredQueues.filter((queue) =>
      queue.name.toLowerCase().includes(lowerFilter)
    );
  }, [filteredQueues, searchFilter]);

  // Handle queue row click - navigate to detail page
  const handleRowClick = (queue: Queue) => {
    navigate(`/queues/${encodeURIComponent(queue.name)}`);
  };

  // Handle create queue
  const handleCreateQueue = async () => {
    if (!newQueueName.trim()) {
      toast.error('Queue name cannot be empty');
      return;
    }

    try {
      await createQueue?.(newQueueName.trim());
      toast.success(`Queue "${newQueueName}" created successfully`);
      setCreateDialogOpen(false);
      setNewQueueName('');
    } catch (error) {
      toast.error(`Failed to create queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle delete queue
  const handleDeleteQueue = (queueName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Queue',
      message: `Are you sure you want to delete queue "${queueName}"? This action cannot be undone.`,
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteQueue?.(queueName);
          toast.success(`Queue "${queueName}" deleted successfully`);
        } catch (error) {
          toast.error(`Failed to delete queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Handle purge queue
  const handlePurgeQueue = (queueName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Purge Queue',
      message: `Are you sure you want to purge all messages from queue "${queueName}"? This action cannot be undone.`,
      severity: 'warning',
      onConfirm: async () => {
        try {
          await purgeQueue?.(queueName);
          toast.success(`Queue "${queueName}" purged successfully`);
        } catch (error) {
          toast.error(`Failed to purge queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Handle pause queue
  const handlePauseQueue = async (queueName: string) => {
    try {
      await pauseQueue?.(queueName);
      toast.success(`Queue "${queueName}" paused successfully`);
    } catch (error) {
      toast.error(`Failed to pause queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle resume queue
  const handleResumeQueue = async (queueName: string) => {
    try {
      await resumeQueue?.(queueName);
      toast.success(`Queue "${queueName}" resumed successfully`);
    } catch (error) {
      toast.error(`Failed to resume queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Queue>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Queue Name',
        cell: (info) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {info.getValue() as string}
            </Typography>
            {info.row.original.paused && (
              <Chip label="Paused" size="small" color="warning" />
            )}
          </Box>
        ),
      },
      {
        accessorKey: 'queueSize',
        header: 'Pending',
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
        accessorKey: 'enqueueCount',
        header: 'Enqueued',
        cell: (info) => (info.getValue() as number).toLocaleString(),
      },
      {
        accessorKey: 'dequeueCount',
        header: 'Dequeued',
        cell: (info) => (info.getValue() as number).toLocaleString(),
      },
      {
        accessorKey: 'consumerCount',
        header: 'Consumers',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <StatusBadge
              status={value === 0 ? 'error' : 'success'}
              label={value.toString()}
            />
          );
        },
      },
      {
        accessorKey: 'producerCount',
        header: 'Producers',
        cell: (info) => (info.getValue() as number).toString(),
      },
      {
        accessorKey: 'memoryPercentUsage',
        header: 'Memory %',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <StatusBadge
              status={value < 70 ? 'success' : value < 90 ? 'warning' : 'error'}
              label={`${value}%`}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const queue = info.row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={queue.paused ? 'Resume' : 'Pause'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (queue.paused) {
                      handleResumeQueue(queue.name);
                    } else {
                      handlePauseQueue(queue.name);
                    }
                  }}
                  aria-label={queue.paused ? 'Resume queue' : 'Pause queue'}
                >
                  {queue.paused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Purge">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurgeQueue(queue.name);
                  }}
                  aria-label="Purge queue"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQueue(queue.name);
                  }}
                  aria-label="Delete queue"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading queues
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button onClick={refresh} sx={{ mt: 2 }}>
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
            Queues
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lastUpdate && `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
            {isAutoRefreshing && ' • Auto-refresh enabled'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={isAutoRefreshing ? 'Pause auto-refresh' : 'Resume auto-refresh'}>
            <IconButton
              onClick={() => (isAutoRefreshing ? pauseAutoRefresh?.() : resumeAutoRefresh?.())}
              aria-label={isAutoRefreshing ? 'Pause auto-refresh' : 'Resume auto-refresh'}
            >
              {isAutoRefreshing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh now">
            <IconButton onClick={refresh} aria-label="Refresh queues">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Queue
          </Button>
        </Stack>
      </Box>

      {/* Search Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter queues by name..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{ maxWidth: 400 }}
          inputProps={{ 'aria-label': 'Filter queues' }}
        />
      </Box>

      {/* Queue Table */}
      {isLoading && !filteredQueues.length ? (
        <LoadingSpinner message="Loading queues..." />
      ) : (
        <DataTable
          data={displayQueues}
          columns={columns}
          enableSorting
          enableFiltering={false}
          enablePagination
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyMessage="No queues found"
          onRowClick={handleRowClick}
          ariaLabel="Queues table"
        />
      )}

      {/* Create Queue Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setNewQueueName('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Queue</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Queue Name"
            value={newQueueName}
            onChange={(e) => setNewQueueName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateQueue();
              }
            }}
            placeholder="e.g., my.queue.name"
            inputProps={{ 'aria-label': 'Queue name' }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setNewQueueName('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateQueue} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

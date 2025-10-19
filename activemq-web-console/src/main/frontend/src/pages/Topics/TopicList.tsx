import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
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
import { useDestinations } from '../../hooks/useDestinations';
import { Topic } from '../../types/destination';
import toast from 'react-hot-toast';

/**
 * Topic List Page
 * Displays all topics with sortable, filterable table
 * Provides actions: create, delete
 */
export function TopicList() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
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
    filteredTopics,
    isLoading,
    error,
    lastUpdate,
    refresh,
    createTopic,
    deleteTopic,
    isAutoRefreshing,
    pauseAutoRefresh,
    resumeAutoRefresh,
  } = useDestinations({ type: 'topic', autoRefresh: true });

  // Filter topics by search term
  const displayTopics = useMemo(() => {
    if (!searchFilter) return filteredTopics;
    const lowerFilter = searchFilter.toLowerCase();
    return filteredTopics.filter((topic) =>
      topic.name.toLowerCase().includes(lowerFilter)
    );
  }, [filteredTopics, searchFilter]);

  // Handle topic row click - navigate to detail page
  const handleRowClick = (topic: Topic) => {
    navigate(`/topics/${encodeURIComponent(topic.name)}`);
  };

  // Handle create topic
  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      toast.error('Topic name cannot be empty');
      return;
    }

    try {
      await createTopic?.(newTopicName.trim());
      toast.success(`Topic "${newTopicName}" created successfully`);
      setCreateDialogOpen(false);
      setNewTopicName('');
    } catch (error) {
      toast.error(`Failed to create topic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle delete topic
  const handleDeleteTopic = (topicName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Topic',
      message: `Are you sure you want to delete topic "${topicName}"? This action cannot be undone.`,
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteTopic?.(topicName);
          toast.success(`Topic "${topicName}" deleted successfully`);
        } catch (error) {
          toast.error(`Failed to delete topic: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Topic>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Topic Name',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500}>
            {info.getValue() as string}
          </Typography>
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
              status={value === 0 ? 'warning' : 'success'}
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
        accessorKey: 'subscriptionCount',
        header: 'Subscriptions',
        cell: (info) => {
          const topic = info.row.original;
          const total = topic.subscriptionCount || 0;
          const durable = topic.durableSubscriptionCount || 0;
          const nonDurable = topic.nonDurableSubscriptionCount || 0;
          return (
            <Tooltip title={`Durable: ${durable}, Non-durable: ${nonDurable}`}>
              <span>{total.toString()}</span>
            </Tooltip>
          );
        },
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
          const topic = info.row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTopic(topic.name);
                  }}
                  aria-label="Delete topic"
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
          Error loading topics
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
            Topics
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
            <IconButton onClick={refresh} aria-label="Refresh topics">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Topic
          </Button>
        </Stack>
      </Box>

      {/* Search Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter topics by name..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{ maxWidth: 400 }}
          inputProps={{ 'aria-label': 'Filter topics' }}
        />
      </Box>

      {/* Topic Table */}
      {isLoading && !filteredTopics.length ? (
        <LoadingSpinner message="Loading topics..." />
      ) : (
        <DataTable
          data={displayTopics}
          columns={columns}
          enableSorting
          enableFiltering={false}
          enablePagination
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyMessage="No topics found"
          onRowClick={handleRowClick}
          ariaLabel="Topics table"
        />
      )}

      {/* Create Topic Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setNewTopicName('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Topic Name"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateTopic();
              }
            }}
            placeholder="e.g., my.topic.name"
            inputProps={{ 'aria-label': 'Topic name' }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setNewTopicName('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateTopic} variant="contained">
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

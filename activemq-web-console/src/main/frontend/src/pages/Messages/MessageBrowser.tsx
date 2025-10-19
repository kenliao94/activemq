import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  Stack,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { usePolling } from '../../hooks/usePolling';
import messageService, { Message } from '../../services/messageService';
import toast from 'react-hot-toast';

/**
 * Message Browser Page
 * Browse messages in a queue with filtering, pagination, and auto-refresh
 * Requirements: 6.1, 6.5, 7.1, 7.3
 */
export function MessageBrowser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get queue name from URL params
  const queueName = searchParams.get('queue') || '';
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [propertyKeyFilter, setPropertyKeyFilter] = useState('');
  const [propertyValueFilter, setPropertyValueFilter] = useState('');
  const [headerKeyFilter, setHeaderKeyFilter] = useState('');
  const [headerValueFilter, setHeaderValueFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [redeliveredFilter, setRedeliveredFilter] = useState<string>('');

  // Fetch messages
  const fetchMessages = async () => {
    if (!queueName) {
      setError('No queue selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await messageService.browseMessages(queueName, page, pageSize);
      setMessages(response.data || []);
      setTotalCount(response.totalElements || 0);
      setLastUpdate(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh with polling
  const { isPolling, toggle } = usePolling(
    fetchMessages,
    {
      interval: 5000,
      enabled: !!queueName,
      executeImmediately: true,
    }
  );

  // Update queue name in URL
  const handleQueueChange = (newQueue: string) => {
    setSearchParams({ queue: newQueue });
    setPage(0);
  };

  // Apply filters to messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Search filter (message ID or body preview)
    if (searchFilter) {
      const lowerSearch = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.messageId.toLowerCase().includes(lowerSearch) ||
          msg.bodyPreview.toLowerCase().includes(lowerSearch)
      );
    }

    // Property filter
    if (propertyKeyFilter && propertyValueFilter) {
      filtered = filtered.filter((msg) => {
        const propValue = msg.properties[propertyKeyFilter];
        return propValue?.toString().toLowerCase().includes(propertyValueFilter.toLowerCase());
      });
    }

    // Header filter
    if (headerKeyFilter && headerValueFilter) {
      filtered = filtered.filter((msg) => {
        const headerValue = msg.headers[headerKeyFilter];
        return headerValue?.toString().toLowerCase().includes(headerValueFilter.toLowerCase());
      });
    }

    // Priority filter
    if (priorityFilter) {
      const priority = parseInt(priorityFilter, 10);
      filtered = filtered.filter((msg) => msg.priority === priority);
    }

    // Redelivered filter
    if (redeliveredFilter) {
      const isRedelivered = redeliveredFilter === 'true';
      filtered = filtered.filter((msg) => msg.redelivered === isRedelivered);
    }

    return filtered;
  }, [
    messages,
    searchFilter,
    propertyKeyFilter,
    propertyValueFilter,
    headerKeyFilter,
    headerValueFilter,
    priorityFilter,
    redeliveredFilter,
  ]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchFilter('');
    setPropertyKeyFilter('');
    setPropertyValueFilter('');
    setHeaderKeyFilter('');
    setHeaderValueFilter('');
    setPriorityFilter('');
    setRedeliveredFilter('');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchFilter ||
    propertyKeyFilter ||
    propertyValueFilter ||
    headerKeyFilter ||
    headerValueFilter ||
    priorityFilter ||
    redeliveredFilter;

  // Handle row click - navigate to message detail
  const handleRowClick = (message: Message) => {
    navigate(`/messages/${encodeURIComponent(queueName)}/${encodeURIComponent(message.messageId)}`);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format body preview
  const formatBodyPreview = (body: string, maxLength: number = 100) => {
    if (!body) return '<empty>';
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '...';
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Message>[]>(
    () => [
      {
        accessorKey: 'messageId',
        header: 'Message ID',
        cell: (info) => (
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: (info) => (
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {formatTimestamp(info.getValue() as number)}
          </Typography>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: (info) => {
          const priority = info.getValue() as number;
          return (
            <StatusBadge
              status={priority >= 7 ? 'error' : priority >= 4 ? 'warning' : 'info'}
              label={priority.toString()}
            />
          );
        },
      },
      {
        accessorKey: 'redelivered',
        header: 'Status',
        cell: (info) => {
          const message = info.row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              {message.redelivered && (
                <Chip
                  label={`Redelivered (${message.redeliveryCounter})`}
                  size="small"
                  color="warning"
                />
              )}
              {message.persistent && (
                <Chip label="Persistent" size="small" color="info" />
              )}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'bodyPreview',
        header: 'Body Preview',
        cell: (info) => (
          <Typography
            variant="body2"
            sx={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatBodyPreview(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        accessorKey: 'size',
        header: 'Size',
        cell: (info) => {
          const size = info.getValue() as number;
          const kb = size / 1024;
          return (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              {kb < 1 ? `${size} B` : `${kb.toFixed(2)} KB`}
            </Typography>
          );
        },
      },
    ],
    []
  );

  // Show error state
  if (error && !queueName) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          No queue selected
        </Typography>
        <Typography color="text.secondary">
          Please select a queue to browse messages.
        </Typography>
        <Button onClick={() => navigate('/queues')} sx={{ mt: 2 }}>
          Go to Queues
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" component="h1">
            Message Browser
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title={isPolling ? 'Pause auto-refresh' : 'Resume auto-refresh'}>
              <IconButton
                onClick={toggle}
                color={isPolling ? 'primary' : 'default'}
                aria-label={isPolling ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              >
                {isPolling ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh now">
              <IconButton onClick={fetchMessages} aria-label="Refresh messages">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Queue selector and status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Queue Name"
            value={queueName}
            onChange={(e) => handleQueueChange(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            inputProps={{ 'aria-label': 'Queue name' }}
          />
          <Typography variant="body2" color="text.secondary">
            {totalCount} message{totalCount !== 1 ? 's' : ''}
            {lastUpdate && ` • Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
            {isPolling && ' • Auto-refresh enabled'}
          </Typography>
        </Box>
      </Box>

      {/* Filter Section */}
      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded(!filterExpanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filter-content"
          id="filter-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            <Typography>Filters</Typography>
            {hasActiveFilters && (
              <Chip label="Active" size="small" color="primary" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Search filter */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Search (ID or Body)"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search message ID or body..."
                inputProps={{ 'aria-label': 'Search messages' }}
              />
            </Grid>

            {/* Priority filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="">All</MenuItem>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => (
                    <MenuItem key={p} value={p.toString()}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Redelivered filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Redelivered</InputLabel>
                <Select
                  value={redeliveredFilter}
                  onChange={(e) => setRedeliveredFilter(e.target.value)}
                  label="Redelivered"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Property filters */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Property Key"
                value={propertyKeyFilter}
                onChange={(e) => setPropertyKeyFilter(e.target.value)}
                placeholder="e.g., userId"
                inputProps={{ 'aria-label': 'Property key' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Property Value"
                value={propertyValueFilter}
                onChange={(e) => setPropertyValueFilter(e.target.value)}
                placeholder="e.g., 12345"
                inputProps={{ 'aria-label': 'Property value' }}
                disabled={!propertyKeyFilter}
              />
            </Grid>

            {/* Header filters */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Header Key"
                value={headerKeyFilter}
                onChange={(e) => setHeaderKeyFilter(e.target.value)}
                placeholder="e.g., JMSCorrelationID"
                inputProps={{ 'aria-label': 'Header key' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Header Value"
                value={headerValueFilter}
                onChange={(e) => setHeaderValueFilter(e.target.value)}
                placeholder="e.g., abc-123"
                inputProps={{ 'aria-label': 'Header value' }}
                disabled={!headerKeyFilter}
              />
            </Grid>

            {/* Clear filters button */}
            <Grid item xs={12}>
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                Clear All Filters
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Messages Table */}
      {isLoading && messages.length === 0 ? (
        <LoadingSpinner message="Loading messages..." />
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            Error loading messages
          </Typography>
          <Typography color="text.secondary">{error}</Typography>
          <Button onClick={fetchMessages} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Paper>
      ) : (
        <DataTable
          data={filteredMessages}
          columns={columns}
          enableSorting
          enableFiltering={false}
          enablePagination
          initialPageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100, 200]}
          emptyMessage={
            queueName
              ? 'No messages found in this queue'
              : 'Please select a queue to browse messages'
          }
          onRowClick={handleRowClick}
          ariaLabel="Messages table"
          loading={isLoading}
        />
      )}

      {/* Info message for virtual scrolling */}
      {filteredMessages.length > 100 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            Tip: Use pagination controls to navigate through large message lists efficiently.
            Filters can help narrow down results.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

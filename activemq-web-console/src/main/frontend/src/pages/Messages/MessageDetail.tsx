import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  DriveFileMove as MoveIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useConfirmDialog } from '../../components/common/ConfirmDialog';
import { useTheme } from '../../hooks/useTheme';
import messageService, { Message } from '../../services/messageService';
import toast from 'react-hot-toast';

/**
 * Message Detail Page
 * Display full message details with syntax highlighting for JSON/XML
 * Provides actions to delete, move, or copy messages
 * Requirements: 6.2, 6.3, 6.4, 6.6
 */
export function MessageDetail() {
  const { queueName, messageId } = useParams<{ queueName: string; messageId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  // State
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [bodyFormat, setBodyFormat] = useState<'text' | 'json' | 'xml'>('text');
  
  // Move/Copy dialog state
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [targetDestination, setTargetDestination] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch message details
  const fetchMessage = async () => {
    if (!queueName || !messageId) {
      setError('Invalid queue name or message ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await messageService.getMessage(queueName, messageId);
      setMessage(data);
      
      // Auto-detect body format
      detectBodyFormat(data.body);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load message';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-detect body format
  const detectBodyFormat = (body: string) => {
    if (!body) {
      setBodyFormat('text');
      return;
    }

    const trimmed = body.trim();
    
    // Check for JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        setBodyFormat('json');
        return;
      } catch {
        // Not valid JSON
      }
    }

    // Check for XML
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      setBodyFormat('xml');
      return;
    }

    setBodyFormat('text');
  };

  useEffect(() => {
    fetchMessage();
  }, [queueName, messageId]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format size
  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format body for display
  const formattedBody = useMemo(() => {
    if (!message?.body) return '';
    
    if (viewMode === 'raw') {
      return message.body;
    }

    // Try to format JSON
    if (bodyFormat === 'json') {
      try {
        const parsed = JSON.parse(message.body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return message.body;
      }
    }

    // Try to format XML
    if (bodyFormat === 'xml') {
      try {
        // Basic XML formatting
        const formatted = message.body
          .replace(/></g, '>\n<')
          .replace(/\n\s*\n/g, '\n');
        return formatted;
      } catch {
        return message.body;
      }
    }

    return message.body;
  }, [message?.body, viewMode, bodyFormat]);

  // Get editor language
  const getEditorLanguage = () => {
    if (bodyFormat === 'json') return 'json';
    if (bodyFormat === 'xml') return 'xml';
    return 'plaintext';
  };

  // Handle delete
  const handleDelete = () => {
    if (!message || !queueName) return;

    showConfirm({
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
      destructive: true,
      details: `Message ID: ${message.messageId}`,
      onConfirm: async () => {
        try {
          await messageService.deleteMessage(queueName, message.messageId);
          toast.success('Message deleted successfully');
          navigate(`/messages?queue=${encodeURIComponent(queueName)}`);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
          toast.error(errorMessage);
          throw err;
        }
      },
    });
  };

  // Handle move
  const handleMove = async () => {
    if (!message || !queueName || !targetDestination) return;

    setIsProcessing(true);
    try {
      await messageService.moveMessage(queueName, message.messageId, targetDestination);
      toast.success(`Message moved to ${targetDestination}`);
      setMoveDialogOpen(false);
      navigate(`/messages?queue=${encodeURIComponent(queueName)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move message';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle copy
  const handleCopy = async () => {
    if (!message || !queueName || !targetDestination) return;

    setIsProcessing(true);
    try {
      await messageService.copyMessage(queueName, message.messageId, targetDestination);
      toast.success(`Message copied to ${targetDestination}`);
      setCopyDialogOpen(false);
      setTargetDestination('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy message';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle download raw
  const handleDownloadRaw = () => {
    if (!message) return;

    const blob = new Blob([message.body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${message.messageId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Message downloaded');
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading message details..." />;
  }

  // Error state
  if (error || !message) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Message not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/messages?queue=${encodeURIComponent(queueName || '')}`)}
        >
          Back to Messages
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate(`/messages?queue=${encodeURIComponent(queueName || '')}`)}
              aria-label="Back to messages"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Message Details
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchMessage} aria-label="Refresh message">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download raw">
              <IconButton onClick={handleDownloadRaw} aria-label="Download raw message">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<CopyIcon />}
              onClick={() => {
                setTargetDestination('');
                setCopyDialogOpen(true);
              }}
              variant="outlined"
            >
              Copy
            </Button>
            <Button
              startIcon={<MoveIcon />}
              onClick={() => {
                setTargetDestination('');
                setMoveDialogOpen(true);
              }}
              variant="outlined"
            >
              Move
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          </Stack>
        </Box>

        {/* Message ID and Queue */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`Queue: ${queueName}`}
            color="primary"
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary" fontFamily="monospace">
            ID: {message.messageId}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Message Metadata */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Message Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body2">
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Priority
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge
                      status={message.priority >= 7 ? 'error' : message.priority >= 4 ? 'warning' : 'info'}
                      label={message.priority.toString()}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Size
                  </Typography>
                  <Typography variant="body2">
                    {formatSize(message.size)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {message.persistent && (
                      <Chip label="Persistent" size="small" color="info" />
                    )}
                    {message.redelivered && (
                      <Chip
                        label={`Redelivered (${message.redeliveryCounter})`}
                        size="small"
                        color="warning"
                      />
                    )}
                  </Stack>
                </Box>
                {message.expiration > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Expiration
                    </Typography>
                    <Typography variant="body2">
                      {formatTimestamp(message.expiration)}
                    </Typography>
                  </Box>
                )}
                {message.correlationId && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Correlation ID
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {message.correlationId}
                    </Typography>
                  </Box>
                )}
                {message.type && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body2">
                      {message.type}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Headers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Headers
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.keys(message.headers).length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(message.headers).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {String(value)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No headers
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Properties */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Properties
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.keys(message.properties).length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(message.properties).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {String(value)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {typeof value}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No properties
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Message Body */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Message Body
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={bodyFormat}
                      onChange={(e) => setBodyFormat(e.target.value as any)}
                      label="Format"
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="xml">XML</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>View</InputLabel>
                    <Select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value as any)}
                      label="View"
                    >
                      <MenuItem value="formatted">Formatted</MenuItem>
                      <MenuItem value="raw">Raw</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {message.body ? (
                message.size > 1024 * 1024 ? (
                  // Large message warning
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    This message is large ({formatSize(message.size)}). 
                    Consider downloading the raw message for better performance.
                  </Alert>
                ) : null
              ) : null}

              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  minHeight: 400,
                }}
              >
                {message.body ? (
                  <Editor
                    height="400px"
                    language={getEditorLanguage()}
                    value={formattedBody}
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: message.size > 10240 },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      folding: true,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Empty message body
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Move Dialog */}
      {moveDialogOpen && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            p: 3,
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Move Message
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the destination queue or topic name:
          </Typography>
          <TextField
            fullWidth
            label="Target Destination"
            value={targetDestination}
            onChange={(e) => setTargetDestination(e.target.value)}
            placeholder="e.g., queue.target"
            sx={{ mb: 2 }}
            autoFocus
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setMoveDialogOpen(false);
                setTargetDestination('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              variant="contained"
              disabled={!targetDestination || isProcessing}
            >
              {isProcessing ? 'Moving...' : 'Move'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Copy Dialog */}
      {copyDialogOpen && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            p: 3,
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Copy Message
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the destination queue or topic name:
          </Typography>
          <TextField
            fullWidth
            label="Target Destination"
            value={targetDestination}
            onChange={(e) => setTargetDestination(e.target.value)}
            placeholder="e.g., queue.target"
            sx={{ mb: 2 }}
            autoFocus
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setCopyDialogOpen(false);
                setTargetDestination('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              variant="contained"
              disabled={!targetDestination || isProcessing}
            >
              {isProcessing ? 'Copying...' : 'Copy'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Backdrop for dialogs */}
      {(moveDialogOpen || copyDialogOpen) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1299,
          }}
          onClick={() => {
            if (!isProcessing) {
              setMoveDialogOpen(false);
              setCopyDialogOpen(false);
              setTargetDestination('');
            }
          }}
        />
      )}

      {/* Confirm Dialog */}
      {ConfirmDialog}
    </Box>
  );
}

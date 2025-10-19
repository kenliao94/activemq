import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  IconButton,
  Autocomplete,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import messageService, { SendMessageRequest } from '../../services/messageService';
import queueService from '../../services/queueService';
import topicService from '../../services/topicService';
import { useTheme } from '../../hooks/useTheme';

// Validation schema
const sendMessageSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  destinationType: z.enum(['queue', 'topic']),
  body: z.string().min(1, 'Message body is required'),
  priority: z.number().min(0).max(9).optional(),
  timeToLive: z.number().min(0).optional(),
  persistent: z.boolean().optional(),
  correlationId: z.string().optional(),
});

type SendMessageFormData = z.infer<typeof sendMessageSchema>;

interface MessageHeader {
  key: string;
  value: string;
}

interface MessageProperty {
  key: string;
  value: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  destination: string;
  destinationType: 'queue' | 'topic';
  body: string;
  headers: MessageHeader[];
  properties: MessageProperty[];
  priority?: number;
  timeToLive?: number;
  persistent?: boolean;
  timestamp: number;
}

export const SendMessage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [destinations, setDestinations] = useState<string[]>([]);
  const [headers, setHeaders] = useState<MessageHeader[]>([]);
  const [properties, setProperties] = useState<MessageProperty[]>([]);
  const [bodyFormat, setBodyFormat] = useState<'text' | 'json' | 'xml'>('text');
  const [isValidBody, setIsValidBody] = useState(true);
  const [bodyError, setBodyError] = useState<string>('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      destination: '',
      destinationType: 'queue',
      body: '',
      priority: 4,
      timeToLive: 0,
      persistent: true,
      correlationId: '',
    },
  });

  const destinationType = watch('destinationType');
  const body = watch('body');

  // Load destinations
  useEffect(() => {
    loadDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationType]);

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('messageTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    }
  }, []);

  // Validate body format
  useEffect(() => {
    validateBody(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, bodyFormat]);

  const loadDestinations = async () => {
    try {
      if (destinationType === 'queue') {
        const response = await queueService.getQueues(0, 1000);
        setDestinations(response.data.map((q: { name: string }) => q.name));
      } else {
        const response = await topicService.getTopics(0, 1000);
        setDestinations(response.data.map((t: { name: string }) => t.name));
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
      toast.error('Failed to load destinations');
    }
  };

  const validateBody = (content: string) => {
    if (!content) {
      setIsValidBody(true);
      setBodyError('');
      return;
    }

    if (bodyFormat === 'json') {
      try {
        JSON.parse(content);
        setIsValidBody(true);
        setBodyError('');
      } catch (error) {
        setIsValidBody(false);
        setBodyError(`Invalid JSON: ${(error as Error).message}`);
      }
    } else if (bodyFormat === 'xml') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          setIsValidBody(false);
          setBodyError('Invalid XML format');
        } else {
          setIsValidBody(true);
          setBodyError('');
        }
      } catch (error) {
        setIsValidBody(false);
        setBodyError(`Invalid XML: ${(error as Error).message}`);
      }
    } else {
      setIsValidBody(true);
      setBodyError('');
    }
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const updateProperty = (index: number, field: 'key' | 'value', value: string) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SendMessageFormData) => {
    if (!isValidBody) {
      toast.error('Please fix validation errors before sending');
      return;
    }

    setIsSending(true);

    try {
      const headersObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value;
        }
      });

      const propertiesObj: Record<string, any> = {};
      properties.forEach((p) => {
        if (p.key && p.value) {
          propertiesObj[p.key] = p.value;
        }
      });

      const request: SendMessageRequest = {
        destination: data.destination,
        body: data.body,
        headers: Object.keys(headersObj).length > 0 ? headersObj : undefined,
        properties: Object.keys(propertiesObj).length > 0 ? propertiesObj : undefined,
        persistent: data.persistent,
        priority: data.priority,
        timeToLive: data.timeToLive && data.timeToLive > 0 ? data.timeToLive : undefined,
      };

      await messageService.sendMessage(request);
      toast.success(`Message sent successfully to ${data.destination}`);

      // Save to history
      saveToHistory(data);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const saveToHistory = (data: SendMessageFormData) => {
    const template: MessageTemplate = {
      id: Date.now().toString(),
      name: `${data.destination} - ${new Date().toLocaleString()}`,
      destination: data.destination,
      destinationType: data.destinationType,
      body: data.body,
      headers: headers.filter((h) => h.key && h.value),
      properties: properties.filter((p) => p.key && p.value),
      priority: data.priority,
      timeToLive: data.timeToLive,
      persistent: data.persistent,
      timestamp: Date.now(),
    };

    const newTemplates = [template, ...templates].slice(0, 20); // Keep last 20
    setTemplates(newTemplates);
    localStorage.setItem('messageTemplates', JSON.stringify(newTemplates));
  };

  const saveAsTemplate = () => {
    const data = watch();
    const name = prompt('Enter template name:');
    if (!name) return;

    const template: MessageTemplate = {
      id: Date.now().toString(),
      name,
      destination: data.destination,
      destinationType: data.destinationType,
      body: data.body,
      headers: headers.filter((h) => h.key && h.value),
      properties: properties.filter((p) => p.key && p.value),
      priority: data.priority,
      timeToLive: data.timeToLive,
      persistent: data.persistent,
      timestamp: Date.now(),
    };

    const newTemplates = [template, ...templates];
    setTemplates(newTemplates);
    localStorage.setItem('messageTemplates', JSON.stringify(newTemplates));
    toast.success('Template saved successfully');
  };

  const loadTemplate = (template: MessageTemplate) => {
    setValue('destination', template.destination);
    setValue('destinationType', template.destinationType);
    setValue('body', template.body);
    setValue('priority', template.priority);
    setValue('timeToLive', template.timeToLive);
    setValue('persistent', template.persistent);
    setHeaders(template.headers);
    setProperties(template.properties);
    setShowTemplates(false);
    toast.success('Template loaded');
  };

  const deleteTemplate = (id: string) => {
    const newTemplates = templates.filter((t) => t.id !== id);
    setTemplates(newTemplates);
    localStorage.setItem('messageTemplates', JSON.stringify(newTemplates));
    toast.success('Template deleted');
  };

  const clearForm = () => {
    reset();
    setHeaders([]);
    setProperties([]);
    setBodyError('');
    setIsValidBody(true);
  };

  const formatBody = () => {
    try {
      if (bodyFormat === 'json') {
        const formatted = JSON.stringify(JSON.parse(body), null, 2);
        setValue('body', formatted);
        toast.success('JSON formatted');
      } else if (bodyFormat === 'xml') {
        // Basic XML formatting
        const formatted = body
          .replace(/>\s*</g, '>\n<')
          .split('\n')
          .map((line, i, arr) => {
            const indent = line.match(/^<\//g) ? arr.slice(0, i).filter((l) => l.match(/^<[^/]/)).length - 1 : arr.slice(0, i).filter((l) => l.match(/^<[^/]/)).length;
            return '  '.repeat(Math.max(0, indent)) + line.trim();
          })
          .join('\n');
        setValue('body', formatted);
        toast.success('XML formatted');
      }
    } catch (error) {
      toast.error('Failed to format body');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Send Message
        </Typography>
        <Box>
          <Button
            startIcon={<HistoryIcon />}
            onClick={() => setShowTemplates(!showTemplates)}
            sx={{ mr: 1 }}
          >
            Templates ({templates.length})
          </Button>
          <Button startIcon={<SaveIcon />} onClick={saveAsTemplate}>
            Save as Template
          </Button>
        </Box>
      </Box>

      {showTemplates && templates.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Message Templates & History
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {templates.map((template) => (
              <Box
                key={template.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body1">{template.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.destinationType}: {template.destination} •{' '}
                    {new Date(template.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Button size="small" onClick={() => loadTemplate(template)}>
                    Load
                  </Button>
                  <IconButton size="small" onClick={() => deleteTemplate(template.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Destination
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Controller
                name="destinationType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      <MenuItem value="queue">Queue</MenuItem>
                      <MenuItem value="topic">Topic</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={destinations}
                    freeSolo
                    onChange={(_, value) => field.onChange(value || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Destination Name"
                        error={!!errors.destination}
                        helperText={errors.destination?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Message Body</Typography>
            <Box>
              <Button
                size="small"
                onClick={() => setBodyFormat('text')}
                variant={bodyFormat === 'text' ? 'contained' : 'outlined'}
                sx={{ mr: 1 }}
              >
                Text
              </Button>
              <Button
                size="small"
                onClick={() => setBodyFormat('json')}
                variant={bodyFormat === 'json' ? 'contained' : 'outlined'}
                sx={{ mr: 1 }}
              >
                JSON
              </Button>
              <Button
                size="small"
                onClick={() => setBodyFormat('xml')}
                variant={bodyFormat === 'xml' ? 'contained' : 'outlined'}
                sx={{ mr: 1 }}
              >
                XML
              </Button>
              {(bodyFormat === 'json' || bodyFormat === 'xml') && (
                <Button size="small" onClick={formatBody}>
                  Format
                </Button>
              )}
            </Box>
          </Box>

          {!isValidBody && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bodyError}
            </Alert>
          )}

          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Editor
                  height="400px"
                  language={bodyFormat === 'json' ? 'json' : bodyFormat === 'xml' ? 'xml' : 'plaintext'}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  value={field.value}
                  onChange={(value) => field.onChange(value || '')}
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </Box>
            )}
          />
          {errors.body && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {errors.body.message}
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Headers</Typography>
            <Button startIcon={<AddIcon />} onClick={addHeader} size="small">
              Add Header
            </Button>
          </Box>
          {headers.map((header, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => removeHeader(index)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Properties</Typography>
            <Button startIcon={<AddIcon />} onClick={addProperty} size="small">
              Add Property
            </Button>
          </Box>
          {properties.map((property, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Key"
                  value={property.key}
                  onChange={(e) => updateProperty(index, 'key', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={property.value}
                  onChange={(e) => updateProperty(index, 'value', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => removeProperty(index)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Message Options
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Priority (0-9)"
                    inputProps={{ min: 0, max: 9 }}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    error={!!errors.priority}
                    helperText={errors.priority?.message || 'Default: 4'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="timeToLive"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Time to Live (ms)"
                    inputProps={{ min: 0 }}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    error={!!errors.timeToLive}
                    helperText={errors.timeToLive?.message || '0 = no expiration'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="persistent"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Persistent Delivery"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="correlationId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Correlation ID (optional)"
                    error={!!errors.correlationId}
                    helperText={errors.correlationId?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button startIcon={<ClearIcon />} onClick={clearForm} disabled={isSending}>
            Clear
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={isSending || !isValidBody}
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};



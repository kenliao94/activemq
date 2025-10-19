import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, LineChartDataPoint, LineChartSeries } from '../../components/charts/LineChart'
import topicService, { Topic } from '../../services/topicService'
import { usePolling } from '../../hooks/usePolling'

type TimeRange = '1h' | '24h' | '7d'

interface TopicDataPoint extends LineChartDataPoint {
  timestamp: number
  enqueueCount: number
  dequeueCount: number
  queueSize: number
  consumerCount: number
  enqueueRate: number
  dequeueRate: number
}

const TIME_RANGES = {
  '1h': { label: 'Last Hour', duration: 60 * 60 * 1000, interval: 5000 },
  '24h': { label: 'Last 24 Hours', duration: 24 * 60 * 60 * 1000, interval: 30000 },
  '7d': { label: 'Last 7 Days', duration: 7 * 24 * 60 * 60 * 1000, interval: 300000 },
}

export const TopicGraph: React.FC = () => {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<TimeRange>('1h')
  const [dataPoints, setDataPoints] = useState<TopicDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastTopic, setLastTopic] = useState<Topic | null>(null)

  // Series visibility toggles
  const [visibleSeries, setVisibleSeries] = useState({
    enqueueRate: true,
    dequeueRate: true,
    queueSize: true,
    consumerCount: true,
  })

  const fetchTopicData = useCallback(async () => {
    if (!name) return

    try {
      const topic = await topicService.getTopic(name)
      const now = Date.now()

      // Calculate rates if we have previous data
      let enqueueRate = 0
      let dequeueRate = 0

      if (lastTopic && dataPoints.length > 0) {
        const lastPoint = dataPoints[dataPoints.length - 1]
        const timeDiff = (now - lastPoint.timestamp) / 1000 // seconds
        
        if (timeDiff > 0) {
          enqueueRate = Math.max(0, (topic.enqueueCount - lastTopic.enqueueCount) / timeDiff)
          dequeueRate = Math.max(0, (topic.dequeueCount - lastTopic.dequeueCount) / timeDiff)
        }
      }

      const newDataPoint: TopicDataPoint = {
        timestamp: now,
        enqueueCount: topic.enqueueCount,
        dequeueCount: topic.dequeueCount,
        queueSize: topic.queueSize,
        consumerCount: topic.consumerCount,
        enqueueRate: Math.round(enqueueRate * 100) / 100,
        dequeueRate: Math.round(dequeueRate * 100) / 100,
      }

      setDataPoints((prev) => {
        const updated = [...prev, newDataPoint]
        const cutoff = now - TIME_RANGES[timeRange].duration
        return updated.filter((point) => point.timestamp >= cutoff)
      })

      setLastTopic(topic)
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching topic data:', err)
      setError('Failed to fetch topic data')
      setLoading(false)
    }
  }, [name, lastTopic, dataPoints, timeRange])

  // Use polling hook with dynamic interval based on time range
  usePolling(fetchTopicData, {
    interval: TIME_RANGES[timeRange].interval,
    enabled: true,
    executeImmediately: true,
  })

  // Reset data when time range changes
  useEffect(() => {
    setDataPoints([])
    setLastTopic(null)
    setLoading(true)
  }, [timeRange])

  // Reset data when topic name changes
  useEffect(() => {
    setDataPoints([])
    setLastTopic(null)
    setLoading(true)
  }, [name])

  const handleTimeRangeChange = (_event: React.MouseEvent<HTMLElement>, newRange: TimeRange | null) => {
    if (newRange) {
      setTimeRange(newRange)
    }
  }

  const handleSeriesToggle = (series: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }))
  }

  const handleBackToList = () => {
    navigate('/topics')
  }

  if (!name) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Topic name is required</Alert>
      </Box>
    )
  }

  // Build series configuration based on visibility
  const allSeries: LineChartSeries[] = [
    {
      dataKey: 'enqueueRate',
      name: 'Enqueue Rate (msg/s)',
      color: '#2196f3',
    },
    {
      dataKey: 'dequeueRate',
      name: 'Dequeue Rate (msg/s)',
      color: '#4caf50',
    },
    {
      dataKey: 'queueSize',
      name: 'Message Count',
      color: '#ff9800',
    },
    {
      dataKey: 'consumerCount',
      name: 'Subscriber Count',
      color: '#9c27b0',
    },
  ]

  const activeSeries = allSeries.filter((s) => visibleSeries[s.dataKey as keyof typeof visibleSeries])

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={handleBackToList}
          >
            ← Back to Topics
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>
            Topic Metrics: {name}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Time Range
            </Typography>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range selector"
              size="small"
            >
              <ToggleButton value="1h" aria-label="last hour">
                {TIME_RANGES['1h'].label}
              </ToggleButton>
              <ToggleButton value="24h" aria-label="last 24 hours">
                {TIME_RANGES['24h'].label}
              </ToggleButton>
              <ToggleButton value="7d" aria-label="last 7 days">
                {TIME_RANGES['7d'].label}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Visible Metrics
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleSeries.enqueueRate}
                    onChange={() => handleSeriesToggle('enqueueRate')}
                    size="small"
                  />
                }
                label="Enqueue Rate"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleSeries.dequeueRate}
                    onChange={() => handleSeriesToggle('dequeueRate')}
                    size="small"
                  />
                }
                label="Dequeue Rate"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleSeries.queueSize}
                    onChange={() => handleSeriesToggle('queueSize')}
                    size="small"
                  />
                }
                label="Message Count"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleSeries.consumerCount}
                    onChange={() => handleSeriesToggle('consumerCount')}
                    size="small"
                  />
                }
                label="Subscriber Count"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Chart */}
      <Paper sx={{ p: 3 }}>
        {loading && dataPoints.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : dataPoints.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography color="text.secondary">
              Collecting data... Please wait for metrics to appear.
            </Typography>
          </Box>
        ) : (
          <LineChart
            data={dataPoints}
            series={activeSeries}
            title="Topic Metrics Over Time"
            height={400}
            xAxisLabel="Time"
            yAxisLabel="Value"
            showGrid={true}
            showLegend={true}
            curve="monotone"
          />
        )}
      </Paper>

      {/* Info */}
      {dataPoints.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {dataPoints.length} data points collected over {TIME_RANGES[timeRange].label.toLowerCase()}.
            Data updates every {TIME_RANGES[timeRange].interval / 1000} seconds.
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

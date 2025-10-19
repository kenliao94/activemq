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
import queueService, { Queue } from '../../services/queueService'
import { usePolling } from '../../hooks/usePolling'

type TimeRange = '1h' | '24h' | '7d'

interface QueueDataPoint extends LineChartDataPoint {
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

export const QueueGraph: React.FC = () => {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<TimeRange>('1h')
  const [dataPoints, setDataPoints] = useState<QueueDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastQueue, setLastQueue] = useState<Queue | null>(null)

  // Series visibility toggles
  const [visibleSeries, setVisibleSeries] = useState({
    enqueueRate: true,
    dequeueRate: true,
    queueSize: true,
    consumerCount: true,
  })

  const fetchQueueData = useCallback(async () => {
    if (!name) return

    try {
      const queue = await queueService.getQueue(name)
      const now = Date.now()

      // Calculate rates if we have previous data
      let enqueueRate = 0
      let dequeueRate = 0

      if (lastQueue && dataPoints.length > 0) {
        const lastPoint = dataPoints[dataPoints.length - 1]
        const timeDiff = (now - lastPoint.timestamp) / 1000 // seconds
        
        if (timeDiff > 0) {
          enqueueRate = Math.max(0, (queue.enqueueCount - lastQueue.enqueueCount) / timeDiff)
          dequeueRate = Math.max(0, (queue.dequeueCount - lastQueue.dequeueCount) / timeDiff)
        }
      }

      const newDataPoint: QueueDataPoint = {
        timestamp: now,
        enqueueCount: queue.enqueueCount,
        dequeueCount: queue.dequeueCount,
        queueSize: queue.queueSize,
        consumerCount: queue.consumerCount,
        enqueueRate: Math.round(enqueueRate * 100) / 100,
        dequeueRate: Math.round(dequeueRate * 100) / 100,
      }

      setDataPoints((prev) => {
        const updated = [...prev, newDataPoint]
        const cutoff = now - TIME_RANGES[timeRange].duration
        return updated.filter((point) => point.timestamp >= cutoff)
      })

      setLastQueue(queue)
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching queue data:', err)
      setError('Failed to fetch queue data')
      setLoading(false)
    }
  }, [name, lastQueue, dataPoints, timeRange])

  // Use polling hook with dynamic interval based on time range
  usePolling(fetchQueueData, {
    interval: TIME_RANGES[timeRange].interval,
    enabled: true,
    executeImmediately: true,
  })

  // Reset data when time range changes
  useEffect(() => {
    setDataPoints([])
    setLastQueue(null)
    setLoading(true)
  }, [timeRange])

  // Reset data when queue name changes
  useEffect(() => {
    setDataPoints([])
    setLastQueue(null)
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
    navigate('/queues')
  }

  if (!name) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Queue name is required</Alert>
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
      name: 'Queue Size',
      color: '#ff9800',
    },
    {
      dataKey: 'consumerCount',
      name: 'Consumer Count',
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
            ← Back to Queues
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>
            Queue Metrics: {name}
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
                label="Queue Size"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleSeries.consumerCount}
                    onChange={() => handleSeriesToggle('consumerCount')}
                    size="small"
                  />
                }
                label="Consumer Count"
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
            title="Queue Metrics Over Time"
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

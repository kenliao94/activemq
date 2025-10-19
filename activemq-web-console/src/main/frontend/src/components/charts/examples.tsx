import React from 'react'
import { Box, Grid, Paper } from '@mui/material'
import { LineChart, BarChart, GaugeChart } from './index'

/**
 * Example usage of chart components
 * This file demonstrates how to use the LineChart, BarChart, and GaugeChart components
 */

export const ChartExamples: React.FC = () => {
  // Sample data for LineChart - Queue activity over time
  const lineChartData = [
    { timestamp: Date.now() - 300000, enqueueCount: 100, dequeueCount: 95, queueSize: 5 },
    { timestamp: Date.now() - 240000, enqueueCount: 120, dequeueCount: 110, queueSize: 15 },
    { timestamp: Date.now() - 180000, enqueueCount: 150, dequeueCount: 140, queueSize: 25 },
    { timestamp: Date.now() - 120000, enqueueCount: 180, dequeueCount: 175, queueSize: 30 },
    { timestamp: Date.now() - 60000, enqueueCount: 200, dequeueCount: 190, queueSize: 40 },
    { timestamp: Date.now(), enqueueCount: 220, dequeueCount: 210, queueSize: 50 },
  ]

  const lineChartSeries = [
    { dataKey: 'enqueueCount', name: 'Enqueued', color: '#c62828' },
    { dataKey: 'dequeueCount', name: 'Dequeued', color: '#2e7d32' },
    { dataKey: 'queueSize', name: 'Queue Size', color: '#1976d2' },
  ]

  // Sample data for BarChart - Queue comparison
  const barChartData = [
    { name: 'orders.new', messages: 150, consumers: 5 },
    { name: 'orders.processing', messages: 80, consumers: 3 },
    { name: 'orders.completed', messages: 320, consumers: 2 },
    { name: 'notifications', messages: 45, consumers: 1 },
    { name: 'audit.log', messages: 200, consumers: 4 },
  ]

  const barChartSeries = [
    { dataKey: 'messages', name: 'Messages', color: '#c62828' },
    { dataKey: 'consumers', name: 'Consumers', color: '#2e7d32' },
  ]

  // Sample data for stacked BarChart
  const stackedBarData = [
    { name: 'Queue A', pending: 50, processing: 30, completed: 120 },
    { name: 'Queue B', pending: 80, processing: 45, completed: 200 },
    { name: 'Queue C', pending: 20, processing: 15, completed: 90 },
  ]

  const stackedBarSeries = [
    { dataKey: 'pending', name: 'Pending', color: '#ed6c02', stackId: 'a' },
    { dataKey: 'processing', name: 'Processing', color: '#1976d2', stackId: 'a' },
    { dataKey: 'completed', name: 'Completed', color: '#2e7d32', stackId: 'a' },
  ]

  // Sample data for color-by-value BarChart
  const usageData = [
    { name: 'Memory', usage: 75 },
    { name: 'Store', usage: 92 },
    { name: 'Temp', usage: 45 },
    { name: 'CPU', usage: 88 },
  ]

  const getUsageColor = (value: number) => {
    if (value >= 90) return '#d32f2f'
    if (value >= 70) return '#ed6c02'
    return '#2e7d32'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* LineChart Example */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <LineChart
              data={lineChartData}
              series={lineChartSeries}
              title="Queue Activity Over Time"
              height={400}
              yAxisLabel="Count"
              showGrid={true}
              showLegend={true}
            />
          </Paper>
        </Grid>

        {/* BarChart Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              data={barChartData}
              series={barChartSeries}
              title="Queue Comparison"
              height={300}
              yAxisLabel="Count"
              showGrid={true}
              showLegend={true}
            />
          </Paper>
        </Grid>

        {/* Stacked BarChart Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              data={stackedBarData}
              series={stackedBarSeries}
              title="Message Status by Queue"
              height={300}
              yAxisLabel="Messages"
              showGrid={true}
              showLegend={true}
            />
          </Paper>
        </Grid>

        {/* Color-by-Value BarChart Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              data={usageData}
              series={[{ dataKey: 'usage', name: 'Usage %' }]}
              title="Resource Usage"
              height={300}
              yAxisLabel="Percentage"
              colorByValue={true}
              getBarColor={getUsageColor}
              showLegend={false}
            />
          </Paper>
        </Grid>

        {/* Horizontal BarChart Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BarChart
              data={barChartData.slice(0, 3)}
              series={[{ dataKey: 'messages', name: 'Messages' }]}
              title="Top Queues by Message Count"
              height={300}
              layout="vertical"
              xAxisLabel="Messages"
              showLegend={false}
            />
          </Paper>
        </Grid>

        {/* GaugeChart Examples */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <GaugeChart
              value={75}
              title="Memory Usage"
              height={200}
              width={200}
              thresholds={{ warning: 70, critical: 90 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <GaugeChart
              value={92}
              title="Store Usage"
              height={200}
              width={200}
              thresholds={{ warning: 70, critical: 90 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <GaugeChart
              value={45}
              title="Temp Usage"
              height={200}
              width={200}
              thresholds={{ warning: 70, critical: 90 }}
            />
          </Paper>
        </Grid>

        {/* Custom colored GaugeChart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <GaugeChart
              value={1500}
              max={2000}
              title="Active Connections"
              height={200}
              width={200}
              showPercentage={false}
              unit=""
              colors={{
                low: '#4caf50',
                medium: '#ff9800',
                high: '#f44336',
                background: '#e0e0e0',
              }}
            />
          </Paper>
        </Grid>

        {/* Another custom GaugeChart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <GaugeChart
              value={850}
              max={1000}
              title="Messages/sec"
              height={200}
              width={200}
              showPercentage={false}
              unit=""
              thresholds={{ warning: 80, critical: 95 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ChartExamples

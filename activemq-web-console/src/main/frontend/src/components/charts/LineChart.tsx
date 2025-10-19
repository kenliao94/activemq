import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Paper, Typography } from '@mui/material'
import { format } from 'date-fns'

export interface LineChartDataPoint {
  timestamp: number
  [key: string]: number | string
}

export interface LineChartSeries {
  dataKey: string
  name: string
  color?: string
  strokeWidth?: number
}

export interface LineChartProps {
  data: LineChartDataPoint[]
  series: LineChartSeries[]
  title?: string
  height?: number
  xAxisLabel?: string
  yAxisLabel?: string
  formatXAxis?: (value: number) => string
  formatYAxis?: (value: number) => string
  formatTooltip?: (value: number, name: string) => string
  showGrid?: boolean
  showLegend?: boolean
  curve?: 'monotone' | 'linear' | 'step'
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  const theme = useTheme()

  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 1.5,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
        elevation={3}
      >
        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
          {typeof label === 'number'
            ? format(new Date(label), 'MMM dd, HH:mm:ss')
            : label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.value?.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    )
  }

  return null
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  title,
  height = 300,
  xAxisLabel,
  yAxisLabel,
  formatXAxis,
  formatYAxis,
  showGrid = true,
  showLegend = true,
  curve = 'monotone',
}) => {
  const theme = useTheme()

  const defaultFormatXAxis = (value: number) => {
    return format(new Date(value), 'HH:mm')
  }

  const defaultFormatYAxis = (value: number) => {
    return value.toLocaleString()
  }

  const axisColor = theme.palette.mode === 'dark' ? '#666' : '#999'
  const gridColor = theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'

  return (
    <Box
      sx={{ width: '100%' }}
      role="img"
      aria-label={title || 'Line chart visualization'}
    >
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          )}
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis || defaultFormatXAxis}
            stroke={axisColor}
            label={
              xAxisLabel
                ? {
                    value: xAxisLabel,
                    position: 'insideBottom',
                    offset: -5,
                  }
                : undefined
            }
            aria-label={xAxisLabel || 'Time axis'}
          />
          <YAxis
            tickFormatter={formatYAxis || defaultFormatYAxis}
            stroke={axisColor}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                  }
                : undefined
            }
            aria-label={yAxisLabel || 'Value axis'}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
              }}
            />
          )}
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.name}
              stroke={
                s.color ||
                [
                  theme.palette.primary.main,
                  theme.palette.secondary.main,
                  theme.palette.success.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ][index % 5]
              }
              strokeWidth={s.strokeWidth || 2}
              dot={false}
              activeDot={{ r: 6 }}
              aria-label={`${s.name} data series`}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  )
}

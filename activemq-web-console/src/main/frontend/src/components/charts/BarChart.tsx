import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Paper, Typography } from '@mui/material'

export interface BarChartDataPoint {
  name: string
  [key: string]: number | string
}

export interface BarChartSeries {
  dataKey: string
  name: string
  color?: string
  stackId?: string
}

export interface BarChartProps {
  data: BarChartDataPoint[]
  series: BarChartSeries[]
  title?: string
  height?: number
  xAxisLabel?: string
  yAxisLabel?: string
  formatYAxis?: (value: number) => string
  formatTooltip?: (value: number, name: string) => string
  showGrid?: boolean
  showLegend?: boolean
  layout?: 'horizontal' | 'vertical'
  colorByValue?: boolean
  getBarColor?: (value: number, index: number) => string
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
          {label}
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  title,
  height = 300,
  xAxisLabel,
  yAxisLabel,
  formatYAxis,
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
  colorByValue = false,
  getBarColor,
}) => {
  const theme = useTheme()

  const defaultFormatYAxis = (value: number) => {
    return value.toLocaleString()
  }

  const axisColor = theme.palette.mode === 'dark' ? '#666' : '#999'
  const gridColor = theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ]

  const getDefaultBarColor = (value: number, index: number) => {
    if (getBarColor) {
      return getBarColor(value, index)
    }
    return defaultColors[index % defaultColors.length]
  }

  return (
    <Box
      sx={{ width: '100%' }}
      role="img"
      aria-label={title || 'Bar chart visualization'}
    >
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          )}
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey="name"
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
                aria-label={xAxisLabel || 'Category axis'}
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
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tickFormatter={formatYAxis || defaultFormatYAxis}
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
                aria-label={xAxisLabel || 'Value axis'}
              />
              <YAxis
                type="category"
                dataKey="name"
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
                aria-label={yAxisLabel || 'Category axis'}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && series.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
              }}
            />
          )}
          {series.map((s, index) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color || defaultColors[index % defaultColors.length]}
              stackId={s.stackId}
              aria-label={`${s.name} data series`}
            >
              {colorByValue &&
                data.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={getDefaultBarColor(
                      entry[s.dataKey] as number,
                      idx
                    )}
                  />
                ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  )
}

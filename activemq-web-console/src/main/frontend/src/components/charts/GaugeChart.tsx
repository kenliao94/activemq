import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

export interface GaugeChartProps {
  value: number
  max?: number
  title?: string
  height?: number
  width?: number
  showPercentage?: boolean
  unit?: string
  thresholds?: {
    warning?: number
    critical?: number
  }
  colors?: {
    low?: string
    medium?: string
    high?: string
    background?: string
  }
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 100,
  title,
  height = 200,
  width = 200,
  showPercentage = true,
  unit = '%',
  thresholds = {
    warning: 70,
    critical: 90,
  },
  colors,
}) => {
  const theme = useTheme()

  // Calculate percentage
  const percentage = Math.min((value / max) * 100, 100)

  // Determine color based on thresholds
  const getColor = () => {
    if (colors) {
      if (percentage >= (thresholds.critical || 90)) {
        return colors.high || theme.palette.error.main
      }
      if (percentage >= (thresholds.warning || 70)) {
        return colors.medium || theme.palette.warning.main
      }
      return colors.low || theme.palette.success.main
    }

    if (percentage >= (thresholds.critical || 90)) {
      return theme.palette.error.main
    }
    if (percentage >= (thresholds.warning || 70)) {
      return theme.palette.warning.main
    }
    return theme.palette.success.main
  }

  const activeColor = getColor()
  const backgroundColor =
    colors?.background ||
    (theme.palette.mode === 'dark' ? '#333' : '#e0e0e0')

  // Data for the gauge (semi-circle)
  const data = [
    { name: 'value', value: percentage },
    { name: 'remaining', value: 100 - percentage },
  ]

  // Custom label component for center text
  const CenterLabel: React.FC<{ viewBox?: { cx: number; cy: number } }> = ({
    viewBox,
  }) => {
    const { cx = 0, cy = 0 } = viewBox || {}
    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            fill: theme.palette.text.primary,
          }}
        >
          {showPercentage
            ? `${Math.round(percentage)}${unit}`
            : value.toLocaleString()}
        </text>
        {title && (
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '14px',
              fill: theme.palette.text.secondary,
            }}
          >
            {title}
          </text>
        )}
      </g>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      role="img"
      aria-label={
        title
          ? `${title}: ${Math.round(percentage)}${unit}`
          : `Gauge showing ${Math.round(percentage)}${unit}`
      }
    >
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={activeColor} />
            <Cell fill={backgroundColor} />
            <Label content={<CenterLabel />} position="center" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {title && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: -2, textAlign: 'center' }}
        >
          {title}
        </Typography>
      )}
    </Box>
  )
}

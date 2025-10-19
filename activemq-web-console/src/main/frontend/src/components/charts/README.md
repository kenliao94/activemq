# Chart Components

This directory contains reusable chart components built with Recharts for visualizing ActiveMQ metrics and data.

## Components

### LineChart

A responsive line chart component for displaying time series data.

**Features:**
- Multiple data series support
- Customizable colors and styling
- Responsive sizing
- Interactive tooltips
- Configurable grid and legend
- Accessibility labels for screen readers
- Support for different curve types (monotone, linear, step)

**Usage:**

```tsx
import { LineChart } from '@/components/charts'

const data = [
  { timestamp: 1234567890000, enqueueCount: 100, dequeueCount: 95 },
  { timestamp: 1234567895000, enqueueCount: 120, dequeueCount: 110 },
  { timestamp: 1234567900000, enqueueCount: 150, dequeueCount: 140 },
]

const series = [
  { dataKey: 'enqueueCount', name: 'Enqueued', color: '#c62828' },
  { dataKey: 'dequeueCount', name: 'Dequeued', color: '#2e7d32' },
]

<LineChart
  data={data}
  series={series}
  title="Queue Activity"
  height={400}
  yAxisLabel="Message Count"
  showGrid={true}
  showLegend={true}
/>
```

### BarChart

A responsive bar chart component for displaying categorical data comparisons.

**Features:**
- Horizontal and vertical layouts
- Multiple data series with stacking support
- Color-by-value support
- Customizable colors
- Interactive tooltips
- Responsive sizing
- Accessibility labels

**Usage:**

```tsx
import { BarChart } from '@/components/charts'

const data = [
  { name: 'Queue A', messages: 100, consumers: 5 },
  { name: 'Queue B', messages: 250, consumers: 3 },
  { name: 'Queue C', messages: 180, consumers: 7 },
]

const series = [
  { dataKey: 'messages', name: 'Messages', color: '#c62828' },
  { dataKey: 'consumers', name: 'Consumers', color: '#2e7d32' },
]

<BarChart
  data={data}
  series={series}
  title="Queue Comparison"
  height={300}
  yAxisLabel="Count"
  showGrid={true}
  showLegend={true}
/>
```

**Stacked Bar Chart:**

```tsx
const series = [
  { dataKey: 'pending', name: 'Pending', color: '#ed6c02', stackId: 'a' },
  { dataKey: 'processed', name: 'Processed', color: '#2e7d32', stackId: 'a' },
]

<BarChart
  data={data}
  series={series}
  title="Message Status"
/>
```

**Color by Value:**

```tsx
<BarChart
  data={data}
  series={[{ dataKey: 'usage', name: 'Usage %' }]}
  colorByValue={true}
  getBarColor={(value) => {
    if (value > 90) return '#d32f2f'
    if (value > 70) return '#ed6c02'
    return '#2e7d32'
  }}
/>
```

### GaugeChart

A semi-circular gauge chart for displaying percentage metrics.

**Features:**
- Percentage or absolute value display
- Color-coded thresholds (success, warning, critical)
- Customizable colors
- Responsive sizing
- Center label with title
- Accessibility labels

**Usage:**

```tsx
import { GaugeChart } from '@/components/charts'

<GaugeChart
  value={75}
  max={100}
  title="Memory Usage"
  height={200}
  width={200}
  showPercentage={true}
  thresholds={{
    warning: 70,
    critical: 90,
  }}
/>
```

**Custom Colors:**

```tsx
<GaugeChart
  value={85}
  title="Store Usage"
  colors={{
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    background: '#e0e0e0',
  }}
/>
```

**Absolute Values:**

```tsx
<GaugeChart
  value={1500}
  max={2000}
  title="Active Connections"
  showPercentage={false}
  unit=""
/>
```

## Accessibility

All chart components include:
- ARIA labels for screen readers
- Semantic role attributes
- Keyboard-accessible tooltips
- High contrast colors meeting WCAG 2.1 AA standards
- Descriptive titles and labels

## Responsive Design

All charts use `ResponsiveContainer` from Recharts to automatically adapt to their container's width. Height can be customized via the `height` prop.

## Theme Integration

Charts automatically adapt to the application's theme (light/dark mode) using Material-UI's theme system. Colors, grid lines, and text adjust based on the current theme.

## Performance

- Charts use React's memoization to prevent unnecessary re-renders
- Large datasets are handled efficiently by Recharts
- Tooltips and interactions are optimized for smooth performance

## Examples

See the `examples.tsx` file for complete working examples of all chart components.

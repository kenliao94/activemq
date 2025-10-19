# Pages

This directory contains the main page components for the ActiveMQ Web Console.

## Dashboard

The Dashboard page (`Dashboard.tsx`) provides a comprehensive overview of the ActiveMQ broker status and metrics.

### Features

- **Broker Information**: Displays broker name, version, ID, and uptime
- **Key Metrics**: Shows memory usage, store usage, connection count, and total messages using MetricCard components
- **Gauge Charts**: Visual representation of resource usage (memory, store, temp) with color-coded thresholds
- **Message Statistics**: Displays total enqueued, dequeued, consumers, and producers
- **Auto-refresh**: Automatically updates data every 5 seconds (configurable via UI store)
- **Manual Refresh**: Provides a refresh button for on-demand updates
- **Pause/Resume**: Allows users to pause and resume auto-refresh
- **Last Update Timestamp**: Shows when data was last updated

### Requirements Satisfied

- **4.1**: Displays key metrics including broker uptime, memory usage, store percentage, and connection count
- **4.2**: Shows data using modern chart components (gauge charts)
- **4.3**: Highlights warnings or errors with appropriate visual indicators (color-coded metrics)
- **4.4**: Updates metrics automatically every 5 seconds without user intervention
- **4.5**: Shows broker name, version, ID, and uptime in an organized card layout
- **7.1**: Automatically refreshes data at configurable intervals (default 5 seconds)
- **7.2**: Provides a visual indicator showing the last update time

### Usage

The Dashboard is the default landing page when users access the web console. It uses:

- `useBrokerInfo` hook for fetching broker data with auto-refresh
- `MetricCardGrid` component for displaying key metrics
- `GaugeChart` component for percentage-based visualizations
- Utility functions from `utils/formatters.ts` for data formatting

### Auto-refresh

The Dashboard respects the global auto-refresh settings from the UI store:
- Default interval: 5 seconds
- Can be paused/resumed using the controls in the header
- Shows a chip indicator when auto-refresh is enabled

### Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation is fully supported
- Color contrast meets WCAG 2.1 AA standards
- Loading states are properly indicated

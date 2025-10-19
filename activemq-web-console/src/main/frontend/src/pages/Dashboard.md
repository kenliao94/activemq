# Dashboard Page

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard                                    [Pause] [Refresh]   │
│ Last updated: 2 seconds ago                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Broker Information                                          │ │
│ │                                                             │ │
│ │ Broker Name    Version         Broker ID          Uptime   │ │
│ │ localhost      5.18.0          ID:xxx...          2d 5h    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Key Metrics                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│ │ MEMORY USAGE │ │ STORE USAGE  │ │ CONNECTIONS  │ │ TOTAL   │ │
│ │              │ │              │ │              │ │ MESSAGES│ │
│ │    75%    [M]│ │    45%    [S]│ │    12     [L]│ │ 1,234[M]│ │
│ │              │ │              │ │              │ │         │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
│                                                                   │
│ Resource Usage                                                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│ │              │ │              │ │              │             │
│ │   ╭─────╮    │ │   ╭─────╮    │ │   ╭─────╮    │             │
│ │  │  75% │    │ │  │  45% │    │ │  │  12% │    │             │
│ │   ╰─────╯    │ │   ╰─────╯    │ │   ╰─────╯    │             │
│ │ Memory Usage │ │ Store Usage  │ │ Temp Usage   │             │
│ └──────────────┘ └──────────────┘ └──────────────┘             │
│                                                                   │
│ Message Statistics                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│ │Total Enqueued│ │Total Dequeued│ │Total Consumers│ │Total    │ │
│ │              │ │              │ │              │ │Producers│ │
│ │   1,234,567  │ │   1,234,000  │ │      25      │ │   10    │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
│                                                                   │
│                                    [Auto-refresh enabled] ◄──────┤
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Dashboard
├── Container (maxWidth="xl")
│   ├── Header Section
│   │   ├── Title & Last Update
│   │   └── Controls (Pause/Resume, Refresh)
│   │
│   ├── Error Alert (conditional)
│   │
│   ├── Broker Information Card (Paper)
│   │   └── Grid (4 columns)
│   │       ├── Broker Name
│   │       ├── Version
│   │       ├── Broker ID
│   │       └── Uptime
│   │
│   ├── Key Metrics Section
│   │   └── MetricCardGrid
│   │       ├── Memory Usage MetricCard
│   │       ├── Store Usage MetricCard
│   │       ├── Connections MetricCard
│   │       └── Total Messages MetricCard
│   │
│   ├── Resource Usage Section
│   │   └── Grid (3 columns)
│   │       ├── Memory GaugeChart (Paper)
│   │       ├── Store GaugeChart (Paper)
│   │       └── Temp GaugeChart (Paper)
│   │
│   ├── Message Statistics Section
│   │   └── Grid (4 columns)
│   │       ├── Total Enqueued (Paper)
│   │       ├── Total Dequeued (Paper)
│   │       ├── Total Consumers (Paper)
│   │       └── Total Producers (Paper)
│   │
│   └── Auto-refresh Indicator (Chip, fixed position)
```

## Color Coding

### Metric Cards
- **Green** (success): < 70%
- **Yellow** (warning): 70% - 89%
- **Red** (error): >= 90%

### Gauge Charts
- **Green**: < 70%
- **Yellow**: 70% - 89%
- **Red**: >= 90%

## Responsive Behavior

### Desktop (>= 1024px)
- 4 metric cards per row
- 3 gauge charts per row
- 4 statistics cards per row

### Tablet (768px - 1023px)
- 2 metric cards per row
- 3 gauge charts per row
- 2 statistics cards per row

### Mobile (< 768px)
- 1 metric card per row
- 1 gauge chart per row
- 1 statistics card per row

## Data Flow

```
Dashboard Component
    ↓
useBrokerInfo Hook
    ↓
brokerService.getBrokerInfo()
    ↓
REST API: GET /api/v1/broker/info
    ↓
BrokerController
    ↓
BrokerService
    ↓
JMX MBeans
```

## Auto-refresh Cycle

```
1. Component mounts
2. useBrokerInfo hook initializes
3. usePolling hook starts (if enabled)
4. Fetch broker info immediately
5. Wait 5 seconds (default interval)
6. Fetch broker info again
7. Update UI with new data
8. Repeat from step 5
```

## User Interactions

1. **Pause Auto-refresh**: Click pause button to stop automatic updates
2. **Resume Auto-refresh**: Click play button to restart automatic updates
3. **Manual Refresh**: Click refresh button to fetch data immediately
4. **View Details**: Metric cards can be clicked (if onClick handler is provided)

## Accessibility Features

- All buttons have aria-labels
- Keyboard navigation supported
- Screen reader friendly
- Color contrast meets WCAG 2.1 AA
- Loading states announced
- Error messages accessible

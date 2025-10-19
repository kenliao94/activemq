# Common Reusable Components

This directory contains reusable UI components that are used throughout the ActiveMQ Web Console modern UI. All components are built with Material-UI and meet WCAG 2.1 AA accessibility standards.

## Components

### DataTable

A powerful, accessible data table component with sorting, filtering, and pagination capabilities.

**Features:**
- Sortable columns (click header to sort)
- Global search/filter
- Pagination with customizable page sizes
- Keyboard navigation support
- Row click handlers
- Loading states
- Empty state messages

**Usage:**
```tsx
import { DataTable } from '@/components/common';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
];

<DataTable
  data={myData}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
  onRowClick={(row) => console.log(row)}
/>
```

### LoadingSpinner

Loading indicators with multiple variants for different use cases.

**Variants:**
- `LoadingSpinner`: Circular progress with optional message
- `SkeletonLoader`: Generic skeleton placeholders
- `TableSkeleton`: Table-specific skeleton loader
- `CardSkeleton`: Card grid skeleton loader

**Usage:**
```tsx
import { LoadingSpinner, TableSkeleton, CardSkeleton } from '@/components/common';

// Simple spinner
<LoadingSpinner message="Loading data..." />

// Fullscreen overlay
<LoadingSpinner fullscreen />

// Table skeleton
<TableSkeleton rows={5} columns={4} />

// Card skeleton
<CardSkeleton count={4} />
```

### ErrorBoundary

React error boundary for graceful error handling.

**Features:**
- Catches React component errors
- Displays user-friendly error message
- Provides retry and reload options
- Optional error details display
- Custom fallback UI support

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/common';

<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    // Log to error tracking service
  }}
>
  <MyComponent />
</ErrorBoundary>

// Or use HOC
const SafeComponent = withErrorBoundary(MyComponent, {
  showDetails: true,
});
```

### ConfirmDialog

Confirmation dialog for destructive or important actions.

**Features:**
- Multiple severity levels (warning, error, info, question)
- Destructive action styling
- Loading states
- Additional details section
- Keyboard navigation

**Usage:**
```tsx
import { useConfirmDialog } from '@/components/common';

function MyComponent() {
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Queue',
      message: 'Are you sure you want to delete this queue?',
      severity: 'error',
      destructive: true,
      details: 'This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteQueue();
      },
    });
  };

  return (
    <>
      <Button onClick={handleDelete}>Delete</Button>
      {ConfirmDialog}
    </>
  );
}
```

### StatusBadge

Color-coded status indicators with icons.

**Variants:**
- `StatusBadge`: Chip-style badge with icon and label
- `StatusDot`: Simple dot indicator

**Status Types:**
- `success`, `healthy`, `active` - Green
- `error`, `unhealthy` - Red
- `warning`, `degraded` - Orange
- `info` - Blue
- `inactive`, `stopped`, `paused` - Gray
- `pending` - Gray with hourglass
- `running` - Blue with play icon

**Usage:**
```tsx
import { StatusBadge, StatusDot } from '@/components/common';

<StatusBadge
  status="success"
  label="Active"
  showIcon
  tooltip="Queue is active and processing messages"
/>

<StatusDot
  status="healthy"
  animate
  tooltip="Broker is healthy"
/>
```

### MetricCard

Dashboard metric display cards with optional trend indicators.

**Features:**
- Icon support
- Color themes
- Trend indicators (up/down/flat)
- Loading states
- Info tooltips
- Click handlers
- Responsive grid layout

**Usage:**
```tsx
import { MetricCard, MetricCardGrid } from '@/components/common';

<MetricCard
  title="Memory Usage"
  value={75}
  unit="%"
  subtitle="of 2GB total"
  icon={<MemoryIcon />}
  color="warning"
  trend="up"
  trendValue="+5%"
  infoTooltip="Current memory usage of the broker"
/>

// Grid layout
<MetricCardGrid
  metrics={[
    { title: 'Queues', value: 42, icon: <QueueIcon /> },
    { title: 'Messages', value: 1234, icon: <MessageIcon /> },
    // ...
  ]}
  minCardWidth={250}
/>
```

## Accessibility Features

All components include:

- **Semantic HTML**: Proper use of HTML5 semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG 2.1 AA compliant contrast ratios (4.5:1 for text)
- **Screen Reader Support**: Tested with NVDA/JAWS
- **Role Attributes**: Proper ARIA roles for interactive elements

## Testing

Components can be tested using React Testing Library:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/common';

test('renders data table with data', () => {
  const data = [{ id: 1, name: 'Test' }];
  const columns = [{ accessorKey: 'name', header: 'Name' }];
  
  render(<DataTable data={data} columns={columns} />);
  
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

## Styling

Components use Material-UI's `sx` prop for styling and respect the application theme (light/dark mode). Custom styling can be applied via the `sx` prop or by wrapping components.

## Performance

- Components use React.memo where appropriate
- Table virtualization for large datasets (via TanStack Table)
- Lazy loading support
- Optimized re-renders

# Queue Pages Implementation

This directory contains the Queue list and detail pages for the ActiveMQ Web Console.

## Components

### QueueList.tsx
The main queue list page that displays all queues in a sortable, filterable table.

**Features:**
- Sortable table with columns: name, pending messages, enqueued, dequeued, consumers, producers, memory usage
- Real-time search/filter by queue name
- Auto-refresh with configurable interval (default 5 seconds)
- Actions for each queue:
  - Pause/Resume
  - Purge (clear all messages)
  - Delete
- Create new queue dialog
- Status badges for visual feedback
- Responsive design

**Usage:**
```tsx
import { QueueList } from './pages/Queues';

// In routing
<Route path="queues" element={<QueueList />} />
```

### QueueDetail.tsx
Detailed view for a specific queue showing comprehensive metrics and statistics.

**Features:**
- Detailed queue information with auto-refresh
- Key metrics displayed in cards:
  - Pending messages
  - Consumer count
  - Producer count
  - Memory usage
- Detailed statistics sections:
  - Message statistics (enqueued, dequeued, dispatched, expired, in-flight)
  - Performance metrics (enqueue times, message sizes)
  - Connection statistics
  - Resource usage
- Actions:
  - Pause/Resume
  - Purge
  - Delete
- Back navigation to queue list
- Responsive grid layout

**Usage:**
```tsx
import { QueueDetail } from './pages/Queues';

// In routing
<Route path="queues/:name" element={<QueueDetail />} />
```

## Dependencies

### Hooks
- `useDestinations` - Fetches and manages queue data with auto-refresh
- `usePolling` - Provides auto-refresh functionality

### Services
- `queueService` - API calls for queue operations

### Components
- `DataTable` - Sortable, filterable table component
- `MetricCard` - Dashboard metric display
- `StatusBadge` - Color-coded status indicators
- `ConfirmDialog` - Confirmation dialogs for destructive actions
- `LoadingSpinner` - Loading state indicator

### UI Libraries
- Material-UI (MUI) - UI components
- TanStack Table - Table functionality
- React Router - Navigation
- React Hot Toast - Notifications

## API Integration

The pages integrate with the following REST API endpoints:

- `GET /api/v1/queues` - List all queues (with pagination)
- `GET /api/v1/queues/{name}` - Get queue details
- `POST /api/v1/queues` - Create new queue
- `DELETE /api/v1/queues/{name}` - Delete queue
- `POST /api/v1/queues/{name}/purge` - Purge queue messages
- `POST /api/v1/queues/{name}/pause` - Pause queue
- `POST /api/v1/queues/{name}/resume` - Resume queue

## Accessibility

Both components follow WCAG 2.1 AA accessibility standards:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast
- Focus indicators

## Auto-Refresh

Both pages support auto-refresh functionality:
- Default interval: 5 seconds
- Can be paused/resumed via UI
- Configurable through UI store preferences
- Shows last update timestamp

## Error Handling

- API errors are caught and displayed via toast notifications
- Loading states are shown during data fetching
- Confirmation dialogs prevent accidental destructive actions
- Retry functionality for failed requests

## Responsive Design

Both pages are fully responsive:
- Mobile: Single column layout, touch-friendly controls
- Tablet: 2-column grid for metrics
- Desktop: 4-column grid for metrics, full table view

## Testing

To test the queue pages:

1. Start the development server
2. Navigate to `/queues` to see the queue list
3. Click on a queue name to view details
4. Test actions: create, pause, resume, purge, delete
5. Verify auto-refresh functionality
6. Test search/filter functionality
7. Test responsive behavior on different screen sizes

## Future Enhancements

Potential improvements for future iterations:
- Queue statistics graphs (time series)
- Bulk operations (select multiple queues)
- Export queue data
- Advanced filtering options
- Message preview in queue list
- Queue templates for quick creation

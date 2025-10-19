# Message Browser Implementation

## Overview

The Message Browser page allows users to browse messages in a queue with advanced filtering, pagination, and real-time updates.

## Features Implemented

### 1. Paginated Message List (Requirement 6.1)
- Displays messages in a table with pagination support
- Shows message ID, timestamp, priority, status, body preview, and size
- Configurable page sizes: 10, 25, 50, 100, 200 messages per page
- Uses TanStack Table for efficient rendering

### 2. Message Display (Requirement 6.1, 6.5)
- **Message ID**: Displayed in monospace font with ellipsis for long IDs
- **Timestamp**: Formatted as locale-specific date and time
- **Priority**: Color-coded badge (0-3: info, 4-6: warning, 7-9: error)
- **Status**: Shows redelivered count and persistent flag as chips
- **Body Preview**: Truncated to 100 characters with ellipsis
- **Size**: Formatted as bytes or kilobytes

### 3. Advanced Filtering (Requirement 6.5)
Expandable filter panel with multiple filter options:

#### Search Filter
- Search by message ID or body content
- Real-time filtering as you type

#### Property Filters
- Filter by custom message property key and value
- Key-value pair matching

#### Header Filters
- Filter by JMS header key and value
- Supports standard JMS headers (e.g., JMSCorrelationID)

#### Priority Filter
- Dropdown to filter by message priority (0-9)
- Shows all priorities by default

#### Redelivered Filter
- Filter by redelivered status (Yes/No/All)
- Helps identify problematic messages

#### Clear Filters
- One-click button to clear all active filters
- Shows active filter indicator badge

### 4. Virtual Scrolling Support (Requirement 6.5)
- Pagination provides efficient handling of large message lists
- Info tip displayed when viewing more than 100 messages
- Recommends using filters to narrow results

### 5. Auto-Refresh with Pause/Resume (Requirement 7.1, 7.3)
- Automatic refresh every 5 seconds using `usePolling` hook
- Pause/Resume toggle button in header
- Visual indicator showing auto-refresh status
- Last update timestamp displayed
- Manual refresh button available

### 6. Queue Selection
- Queue name input field in header
- Updates URL search params when queue changes
- Resets pagination when switching queues
- Shows total message count

### 7. Navigation
- Click any message row to view full message details
- Navigates to `/messages/{queueName}/{messageId}`
- Keyboard accessible (Enter/Space keys)

### 8. Error Handling
- Displays error messages when API calls fail
- Shows toast notifications for errors
- Provides retry button on error
- Handles missing queue selection gracefully

### 9. Loading States
- Loading spinner on initial load
- Loading indicator in table during refresh
- Skeleton states for better UX

### 10. Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Proper focus management
- Meets WCAG 2.1 AA standards

## Component Structure

```
MessageBrowser.tsx
├── Header Section
│   ├── Title
│   ├── Auto-refresh controls (pause/resume/refresh)
│   └── Queue selector with status
├── Filter Section (Accordion)
│   ├── Search filter
│   ├── Priority filter
│   ├── Redelivered filter
│   ├── Property filters (key/value)
│   ├── Header filters (key/value)
│   └── Clear filters button
├── Messages Table (DataTable)
│   ├── Message ID column
│   ├── Timestamp column
│   ├── Priority column (with badge)
│   ├── Status column (chips)
│   ├── Body preview column
│   └── Size column
└── Info Tip (for large lists)
```

## State Management

### Local State
- `messages`: Array of message objects
- `isLoading`: Loading state
- `error`: Error message
- `lastUpdate`: Timestamp of last update
- `page`: Current page number
- `pageSize`: Number of messages per page
- `totalCount`: Total number of messages
- Filter states for each filter type

### URL State
- `queue`: Queue name (search param)

### Polling State
- Managed by `usePolling` hook
- Auto-refresh enabled/disabled
- 5-second interval

## API Integration

Uses `messageService.browseMessages()`:
```typescript
browseMessages(queueName: string, page: number, pageSize: number)
  -> Promise<PagedResponse<Message>>
```

Response structure:
```typescript
{
  content: Message[],
  totalElements: number,
  page: number,
  pageSize: number,
  hasMore: boolean
}
```

## Filtering Logic

Filters are applied client-side using `useMemo`:
1. Search filter (message ID or body preview)
2. Property filter (key-value match)
3. Header filter (key-value match)
4. Priority filter (exact match)
5. Redelivered filter (boolean match)

All filters are combined with AND logic.

## Performance Considerations

1. **Pagination**: Limits rendered rows for better performance
2. **Memoization**: Filtered messages computed with `useMemo`
3. **Debouncing**: Could be added to search filter for better performance
4. **Virtual Scrolling**: Handled by pagination instead of rendering all rows
5. **Auto-refresh**: Configurable interval (default 5 seconds)

## Usage Example

```typescript
// Navigate to message browser with queue
navigate('/messages?queue=my.queue.name');

// Or use the component directly
<MessageBrowser />
```

## Future Enhancements

1. **Server-side filtering**: Move filtering to backend API
2. **Advanced search**: Support for complex query syntax
3. **Bulk operations**: Select multiple messages for batch actions
4. **Export**: Export filtered messages to CSV/JSON
5. **Column customization**: Show/hide columns
6. **Saved filters**: Save and load filter presets
7. **WebSocket updates**: Real-time push instead of polling
8. **Message preview modal**: Quick view without navigation

## Requirements Coverage

✅ **6.1**: Paginated message list with ID, timestamp, and preview  
✅ **6.5**: Filtering by properties, headers, and other attributes  
✅ **7.1**: Auto-refresh with configurable interval  
✅ **7.3**: Pause/resume toggle for auto-refresh  

## Testing Recommendations

1. Test with empty queue
2. Test with large number of messages (1000+)
3. Test all filter combinations
4. Test auto-refresh pause/resume
5. Test queue switching
6. Test error scenarios (invalid queue, network errors)
7. Test keyboard navigation
8. Test with screen reader
9. Test on mobile devices
10. Test pagination with different page sizes

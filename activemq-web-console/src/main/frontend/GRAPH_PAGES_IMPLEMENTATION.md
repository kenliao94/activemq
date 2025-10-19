# Queue and Topic Graph Pages Implementation

## Overview
This document describes the implementation of interactive graph pages for queues and topics, providing real-time visualization of metrics over time.

## Implementation Summary

### Components Created

#### 1. QueueGraph Component (`src/pages/Queues/QueueGraph.tsx`)
- **Purpose**: Display interactive line charts for queue metrics over time
- **Features**:
  - Time range selector (Last Hour, Last 24 Hours, Last 7 Days)
  - Toggle visibility of individual metrics (Enqueue Rate, Dequeue Rate, Queue Size, Consumer Count)
  - Real-time data collection with automatic polling
  - Dynamic polling intervals based on selected time range
  - Rate calculation for enqueue/dequeue operations
  - Responsive chart with tooltips and legends

#### 2. TopicGraph Component (`src/pages/Topics/TopicGraph.tsx`)
- **Purpose**: Display interactive line charts for topic metrics over time
- **Features**:
  - Same features as QueueGraph but adapted for topics
  - Displays subscriber count instead of consumer count
  - Message count visualization

### Key Features

#### Time Range Selection
Three time ranges with optimized polling intervals:
- **Last Hour**: 5-second polling interval, shows last 60 minutes
- **Last 24 Hours**: 30-second polling interval, shows last day
- **Last 7 Days**: 5-minute polling interval, shows last week

#### Metric Visualization
Both graph pages display:
1. **Enqueue Rate**: Messages per second being added (calculated)
2. **Dequeue Rate**: Messages per second being consumed (calculated)
3. **Queue/Message Size**: Current number of pending messages
4. **Consumer/Subscriber Count**: Number of active consumers/subscribers

#### Interactive Controls
- **Time Range Toggle**: Switch between different time windows
- **Series Visibility Checkboxes**: Show/hide individual metrics
- **Auto-refresh**: Automatic data collection at appropriate intervals
- **Back Navigation**: Easy return to list views

### Technical Implementation

#### Data Collection Strategy
Since the backend doesn't provide historical statistics endpoints, the implementation uses a client-side approach:
1. Poll current queue/topic data at regular intervals
2. Store data points in component state
3. Calculate rates by comparing consecutive data points
4. Filter data points based on selected time range
5. Automatically clean up old data points

#### Rate Calculation
```typescript
const timeDiff = (now - lastPoint.timestamp) / 1000 // seconds
enqueueRate = (currentEnqueueCount - lastEnqueueCount) / timeDiff
dequeueRate = (currentDequeueCount - lastDequeueCount) / timeDiff
```

#### Polling Intervals
- Dynamically adjusted based on time range
- Shorter intervals for recent data (5s for 1h view)
- Longer intervals for historical data (5m for 7d view)
- Reduces server load while maintaining data freshness

### Integration Points

#### Routing
Added routes in `App.tsx`:
```typescript
<Route path="queues/:name/graph" element={<QueueGraph />} />
<Route path="topics/:name/graph" element={<TopicGraph />} />
```

#### Navigation
Added "View Graph" buttons in:
- `QueueDetail.tsx`: Navigate to queue graph page
- `TopicDetail.tsx`: Navigate to topic graph page

#### Exports
Updated index files:
- `src/pages/Queues/index.ts`: Export QueueGraph
- `src/pages/Topics/index.ts`: Export TopicGraph

### Dependencies Used

#### Existing Components
- `LineChart`: Reusable chart component from `src/components/charts/LineChart.tsx`
- Material-UI components for UI elements

#### Existing Hooks
- `usePolling`: Auto-refresh functionality with configurable intervals
- React Router hooks for navigation and params

#### Existing Services
- `queueService`: Fetch queue data
- `topicService`: Fetch topic data

### User Experience

#### Loading States
- Shows loading spinner while collecting initial data
- Displays message when waiting for first data points
- Smooth transitions when data arrives

#### Error Handling
- Displays error alerts if data fetching fails
- Continues polling even after errors
- Provides clear error messages

#### Accessibility
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly tooltips
- Semantic HTML structure

### Performance Considerations

#### Memory Management
- Automatically removes old data points outside time range
- Prevents unbounded memory growth
- Efficient state updates

#### Network Optimization
- Adaptive polling intervals
- Reuses existing API endpoints
- No unnecessary requests

#### Rendering Optimization
- React hooks for efficient re-renders
- Memoized calculations where appropriate
- Smooth chart animations

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

### Requirement 9.1: Interactive Charts
✅ Uses Recharts library for interactive line charts
✅ Smooth animations and transitions
✅ Responsive design

### Requirement 9.2: Tooltips
✅ Hover tooltips show detailed information
✅ Formatted timestamps and values
✅ Color-coded series

### Requirement 9.3: Time Range Selectors
✅ Three time range options (1h, 24h, 7d)
✅ Easy toggle between ranges
✅ Data automatically filtered

### Requirement 9.4: Toggle Data Series
✅ Checkboxes to show/hide individual metrics
✅ All series can be toggled independently
✅ Legend updates dynamically

## Future Enhancements

### Backend Statistics Endpoint
When a backend statistics endpoint is implemented:
1. Replace client-side data collection with server-side historical data
2. Support longer time ranges (30 days, 90 days)
3. Add more granular metrics
4. Implement data aggregation for performance

### Additional Features
- Export chart data to CSV
- Zoom and pan functionality
- Compare multiple queues/topics
- Alert thresholds visualization
- Predictive analytics

### Performance Improvements
- WebSocket support for real-time updates
- Data compression for large datasets
- Progressive loading for historical data
- Caching strategies

## Testing Recommendations

### Manual Testing
1. Navigate to queue/topic detail page
2. Click "View Graph" button
3. Verify chart displays and updates
4. Test time range switching
5. Test series visibility toggles
6. Verify back navigation works
7. Test with different queue/topic names
8. Verify error handling with invalid names

### Automated Testing
- Component rendering tests
- Data collection logic tests
- Rate calculation tests
- Time range filtering tests
- Navigation tests

## Conclusion

The graph pages provide a powerful visualization tool for monitoring queue and topic metrics in real-time. The implementation is efficient, user-friendly, and follows best practices for React development. The adaptive polling strategy ensures data freshness while minimizing server load.

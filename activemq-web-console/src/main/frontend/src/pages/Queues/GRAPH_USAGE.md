# Queue Graph Page Usage Guide

## Accessing the Graph Page

### From Queue List
1. Navigate to the Queues page
2. Click on a queue name to view details
3. Click the "View Graph" button in the action buttons section

### Direct URL
Navigate to: `/queues/{queueName}/graph`

Example: `/queues/test.queue/graph`

## Features

### Time Range Selection
Choose from three time ranges:
- **Last Hour**: Shows data from the past 60 minutes with 5-second updates
- **Last 24 Hours**: Shows data from the past day with 30-second updates  
- **Last 7 Days**: Shows data from the past week with 5-minute updates

### Visible Metrics
Toggle any of these metrics on/off:
- **Enqueue Rate**: Messages being added per second
- **Dequeue Rate**: Messages being consumed per second
- **Queue Size**: Current number of pending messages
- **Consumer Count**: Number of active consumers

### Chart Interactions
- **Hover**: View exact values at any point in time
- **Legend**: Click series names to toggle visibility
- **Responsive**: Chart adapts to screen size

## Understanding the Metrics

### Enqueue Rate (msg/s)
- Calculated from the change in total enqueued messages over time
- Higher values indicate more messages being produced
- Spikes may indicate burst traffic

### Dequeue Rate (msg/s)
- Calculated from the change in total dequeued messages over time
- Higher values indicate more messages being consumed
- Should ideally match or exceed enqueue rate for healthy queues

### Queue Size
- Current number of messages waiting in the queue
- Growing size may indicate consumers can't keep up
- Zero size indicates all messages are being processed

### Consumer Count
- Number of active consumers connected to the queue
- Zero consumers means messages will accumulate
- Multiple consumers enable parallel processing

## Best Practices

### Monitoring
1. Check that dequeue rate matches enqueue rate
2. Watch for growing queue size over time
3. Ensure adequate consumer count for load
4. Look for patterns in traffic (daily cycles, etc.)

### Troubleshooting
- **Growing Queue**: Add more consumers or optimize processing
- **Zero Dequeue Rate**: Check if consumers are connected
- **Spiky Enqueue Rate**: Consider rate limiting or buffering
- **Low Consumer Count**: Scale up consumer instances

## Example Scenarios

### Healthy Queue
- Enqueue rate: 100 msg/s
- Dequeue rate: 100 msg/s
- Queue size: Stable around 10-50 messages
- Consumer count: 3-5 consumers

### Overloaded Queue
- Enqueue rate: 200 msg/s
- Dequeue rate: 100 msg/s
- Queue size: Growing continuously
- Consumer count: 2 consumers (insufficient)
- **Action**: Add more consumers

### Idle Queue
- Enqueue rate: 0 msg/s
- Dequeue rate: 0 msg/s
- Queue size: 0 messages
- Consumer count: 1 consumer
- **Status**: Normal, waiting for messages

## Navigation

### Back to Queue Detail
Click "← Back to Queues" at the top of the page

### Back to Queue List
Navigate through the sidebar or breadcrumbs

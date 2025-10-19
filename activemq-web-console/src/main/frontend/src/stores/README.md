# State Management Stores

This directory contains Zustand stores for managing application state.

## Stores

### brokerStore.ts
Manages broker-related state including:
- Broker information (name, version, uptime, etc.)
- Broker statistics (memory usage, message counts, etc.)
- Broker health status
- Loading and error states
- Last update timestamps

**Usage:**
```typescript
import { useBrokerStore } from './stores';

function BrokerDashboard() {
  const { brokerInfo, isLoadingInfo, setBrokerInfo } = useBrokerStore();
  
  // Use broker data...
}
```

### destinationStore.ts
Manages queue and topic state including:
- List of queues and topics
- Selected destination details
- Destination statistics over time
- Filter and sort preferences
- Loading and error states

**Usage:**
```typescript
import { useDestinationStore } from './stores';

function QueueList() {
  const { 
    queues, 
    queueFilter, 
    setQueueFilter,
    isLoadingQueues 
  } = useDestinationStore();
  
  // Use queue data...
}
```

### uiStore.ts
Manages UI preferences and state with localStorage persistence:
- Theme mode (light/dark/system)
- Sidebar state (open/collapsed)
- Auto-refresh settings
- Display preferences (compact mode, timestamps, etc.)
- Notification state
- Modal state
- Responsive device detection

**Usage:**
```typescript
import { useUIStore } from './stores';

function Header() {
  const { theme, setTheme, toggleSidebar } = useUIStore();
  
  // Use UI preferences...
}
```

## Persistence

The `uiStore` automatically persists user preferences to localStorage under the key `activemq-ui-preferences`. This ensures that user settings are maintained across browser sessions.

Only UI preferences are persisted, not transient state like:
- Device type (mobile/tablet/desktop)
- Active modals
- Notifications
- Global loading state

## Best Practices

1. **Use selectors**: Only subscribe to the state you need to avoid unnecessary re-renders
   ```typescript
   const brokerName = useBrokerStore((state) => state.brokerInfo?.name);
   ```

2. **Batch updates**: Zustand automatically batches updates within the same tick

3. **Clear data on logout**: Call clear methods when user logs out
   ```typescript
   useBrokerStore.getState().clearBrokerData();
   useDestinationStore.getState().clearAllDestinations();
   ```

4. **Error handling**: Always check error states before displaying data
   ```typescript
   const { brokerInfo, infoError } = useBrokerStore();
   
   if (infoError) {
     return <ErrorMessage message={infoError} />;
   }
   ```

## Memory Management

Both `brokerStore` and `destinationStore` limit the number of statistics stored in memory:
- Maximum 100 statistics entries per destination/broker
- Older entries are automatically removed when limit is reached
- This prevents memory leaks during long-running sessions

## Testing

When testing components that use these stores, you can access the store directly:

```typescript
import { useBrokerStore } from './stores';

// In your test
beforeEach(() => {
  useBrokerStore.getState().clearBrokerData();
});

test('displays broker info', () => {
  useBrokerStore.getState().setBrokerInfo({
    name: 'test-broker',
    version: '5.18.0',
    // ... other fields
  });
  
  // Test component...
});
```

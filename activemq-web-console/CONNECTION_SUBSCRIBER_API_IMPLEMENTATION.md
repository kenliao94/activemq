# Connection and Subscriber API Implementation

## Overview
This document describes the implementation of the Connection and Subscriber REST API endpoints for the ActiveMQ Web Console modernization project.

## Implementation Summary

### DTOs Created
1. **ConnectionDTO.java** - Data transfer object for connection information
   - Contains all connection properties: connectionId, remoteAddress, userName, clientId, etc.
   - Includes connection state: connected, active, slow, blocked
   - Includes metrics: dispatchQueueSize, activeTransactionCount, connectedTimestamp

2. **SubscriberDTO.java** - Data transfer object for subscriber/consumer information
   - Contains subscriber identification: consumerId, connectionId, sessionId, subscriptionId
   - Includes destination information: destinationName, selector, destination type flags
   - Includes metrics: pendingQueueSize, dispatchedQueueSize, counters
   - Includes configuration: prefetchSize, priority, durable, exclusive, etc.

### Mappers Created
1. **ConnectionMapper.java** - Maps ConnectionViewMBean to ConnectionDTO
   - Extracts all connection properties from JMX MBean
   - Handles connection ID extraction

2. **SubscriberMapper.java** - Maps SubscriptionViewMBean to SubscriberDTO
   - Extracts all subscriber properties from JMX MBean
   - Handles consumer ID generation

### Services Created
1. **ConnectionService.java** - Business logic for connection operations
   - `getConnections()` - Retrieves all active connections
   - `getConnection(String connectionId)` - Retrieves a specific connection by ID
   - `closeConnection(String connectionId)` - Closes a connection
   - Includes error handling and logging

2. **SubscriberService.java** - Business logic for subscriber operations
   - `getSubscribers()` - Retrieves all subscribers (queue consumers and topic subscribers)
   - `getSubscriber(String subscriberId)` - Retrieves a specific subscriber by ID
   - `deleteSubscriber(String subscriberId)` - Deletes/closes a subscriber
   - Aggregates subscribers from both queues and topics
   - Includes error handling and logging

### Controllers Created
1. **ConnectionController.java** - REST endpoints for connection management
   - `GET /api/v1/connections` - List all connections
   - `GET /api/v1/connections/{id}` - Get connection details
   - `DELETE /api/v1/connections/{id}` - Close a connection

2. **SubscriberController.java** - REST endpoints for subscriber management
   - `GET /api/v1/subscribers` - List all subscribers
   - `GET /api/v1/subscribers/{id}` - Get subscriber details
   - `DELETE /api/v1/subscribers/{id}` - Delete/close a subscriber

## Requirements Mapping

### Requirement 8.1: Connection List Display
✅ **Implemented**: `GET /api/v1/connections` endpoint returns list of connections with:
- Connection ID
- Remote address
- User name
- Client ID
- Connection time (connectedTimestamp)

### Requirement 8.2: Consumer Information Display
✅ **Implemented**: `GET /api/v1/subscribers` endpoint returns list of subscribers with:
- Consumer ID (generated from connectionId:sessionId:subscriptionId)
- Destination
- Selector
- Message counts (enqueueCounter, dequeueCounter, dispatchedCounter)

### Requirement 8.3: Connection Detail View
✅ **Implemented**: `GET /api/v1/connections/{id}` endpoint returns detailed connection information including:
- All connection properties
- Active sessions (via dispatchQueueSize)
- Transaction information (activeTransactionCount, oldestActiveTransactionDuration)

### Requirement 8.4: Connection Management Actions
✅ **Implemented**: `DELETE /api/v1/connections/{id}` endpoint allows closing connections with:
- Confirmation required (handled by frontend)
- Error handling for non-existent connections

## API Endpoints

### Connection Endpoints
```
GET    /api/v1/connections          - List all connections
GET    /api/v1/connections/{id}     - Get connection details
DELETE /api/v1/connections/{id}     - Close a connection
```

### Subscriber Endpoints
```
GET    /api/v1/subscribers          - List all subscribers
GET    /api/v1/subscribers/{id}     - Get subscriber details
DELETE /api/v1/subscribers/{id}     - Delete/close a subscriber
```

## Response Format
All endpoints return responses wrapped in the standard `ApiResponse` format:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": 1234567890
}
```

## Error Handling
- 404 errors for non-existent connections/subscribers
- 500 errors for internal server errors
- All errors include descriptive messages
- Errors are logged for debugging

## Integration with Existing Infrastructure
- Uses existing `BrokerFacade` for JMX access
- Leverages existing `ConnectionViewMBean` and `SubscriptionViewMBean` interfaces
- Follows established patterns from other controllers (BrokerController, QueueController)
- Uses existing exception handling framework (`ApiException`, `RestExceptionHandler`)

## Testing
The implementation has been verified to:
- Compile successfully with Maven
- Follow existing code patterns and conventions
- Include proper error handling and logging
- Map all required data from JMX MBeans to DTOs

## Notes
1. **Connection ID Extraction**: The implementation uses a fallback strategy for connection IDs:
   - First tries clientId
   - Falls back to remoteAddress
   - Last resort uses toString()

2. **Consumer ID Generation**: Subscriber IDs are generated as `connectionId:sessionId:subscriptionId` to ensure uniqueness.

3. **Subscriber Aggregation**: The `getSubscribers()` method aggregates subscribers from:
   - Queue consumers (via `getQueueConsumers()`)
   - Non-durable topic subscribers (via `getNonDurableTopicSubscribers()`)

4. **Delete Operations**: The delete operations for subscribers are simplified in this implementation. In a production environment, you may need to use specific JMX operations to properly close subscriptions.

## Compilation Status
✅ All Java files compile successfully
✅ No diagnostics or errors reported
✅ Maven compiler:compile succeeds

# ActiveMQ REST API

This package contains the REST API implementation for the modern ActiveMQ Web Console.

## Package Structure

```
org.apache.activemq.web.rest/
├── config/              # Configuration classes
│   ├── RestApiConfig.java    # Main REST API configuration
│   └── CorsConfig.java        # CORS configuration
├── controller/          # REST controllers
│   └── HealthController.java  # Health check endpoint
├── service/             # Business logic layer
├── dto/                 # Data Transfer Objects
│   ├── ApiResponse.java       # Generic response wrapper
│   └── ErrorResponse.java     # Error response model
├── mapper/              # JMX to DTO mappers
└── exception/           # Exception handling
    ├── ApiException.java           # Base API exception
    ├── ResourceNotFoundException.java
    └── RestExceptionHandler.java  # Global exception handler
```

## API Endpoints

All REST API endpoints are prefixed with `/api/v1/`

### Health Check
- `GET /api/v1/health` - Health check endpoint

### Broker (Coming in Task 3)
- `GET /api/v1/broker/info` - Get broker information
- `GET /api/v1/broker/statistics` - Get broker statistics
- `GET /api/v1/broker/health` - Get broker health status

### Queues (Coming in Task 4)
- `GET /api/v1/queues` - List all queues
- `GET /api/v1/queues/{name}` - Get queue details
- `POST /api/v1/queues` - Create a queue
- `DELETE /api/v1/queues/{name}` - Delete a queue
- `POST /api/v1/queues/{name}/purge` - Purge a queue
- `POST /api/v1/queues/{name}/pause` - Pause a queue
- `POST /api/v1/queues/{name}/resume` - Resume a queue

### Topics (Coming in Task 4)
- `GET /api/v1/topics` - List all topics
- `GET /api/v1/topics/{name}` - Get topic details
- `POST /api/v1/topics` - Create a topic
- `DELETE /api/v1/topics/{name}` - Delete a topic

### Messages (Coming in Task 5)
- `GET /api/v1/messages/queue/{name}` - Browse messages in a queue
- `GET /api/v1/messages/{id}` - Get message details
- `POST /api/v1/messages/send` - Send a message
- `DELETE /api/v1/messages/{id}` - Delete a message
- `POST /api/v1/messages/{id}/move` - Move a message
- `POST /api/v1/messages/{id}/copy` - Copy a message

### Connections (Coming in Task 6)
- `GET /api/v1/connections` - List all connections
- `GET /api/v1/connections/{id}` - Get connection details
- `DELETE /api/v1/connections/{id}` - Close a connection

### Subscribers (Coming in Task 6)
- `GET /api/v1/subscribers` - List all subscribers
- `GET /api/v1/subscribers/{id}` - Get subscriber details
- `DELETE /api/v1/subscribers/{id}` - Delete a subscriber

## Error Handling

All errors follow a standard format:

```json
{
  "status": 404,
  "message": "Queue not found: test.queue",
  "timestamp": 1234567890,
  "path": "/api/v1/queues/test.queue"
}
```

HTTP Status Codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## CORS Configuration

CORS is enabled for localhost development:
- Allowed origins: `http://localhost:*`, `http://127.0.0.1:*`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Credentials: Allowed

## Testing

Test the health endpoint:
```bash
curl http://localhost:8080/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": 1234567890,
    "service": "ActiveMQ REST API"
  }
}
```

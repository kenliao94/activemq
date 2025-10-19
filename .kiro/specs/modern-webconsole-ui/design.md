# Design Document: Modern ActiveMQ Web Console UI

## Overview

This design document outlines the architecture and implementation approach for modernizing the ActiveMQ Web Console. The solution will transform the current JSP-based interface into a modern single-page application (SPA) while maintaining backward compatibility and leveraging the existing backend infrastructure.

The modernization will be implemented as a parallel UI that coexists with the legacy JSP interface, allowing for gradual migration and fallback options. The new UI will be built with React, TypeScript, and modern web technologies, communicating with a new RESTful API layer that wraps the existing JMX-based broker management functionality.

### Key Design Principles

1. **Progressive Enhancement**: Build the new UI alongside the existing one without breaking changes
2. **API-First Approach**: Create a clean REST API that can serve both the new UI and external integrations
3. **Responsive Design**: Mobile-first approach ensuring usability across all devices
4. **Real-Time Updates**: Implement efficient polling with optional WebSocket support for live data
5. **Accessibility**: Follow WCAG 2.1 AA standards throughout the application
6. **Performance**: Optimize bundle size, lazy loading, and rendering performance

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React SPA (Modern UI)                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │Dashboard │  │ Queues   │  │Messages  │  ...       │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │     State Management (React Context/Zustand) │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │     API Client Layer (Axios/Fetch)           │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST + WebSocket (optional)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   ActiveMQ Web Console WAR                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         REST API Controllers (New)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Broker   │  │ Queue    │  │ Message  │  ...       │ │
│  │  │ API      │  │ API      │  │ API      │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Service Layer (New)                            │ │
│  │  - BrokerService                                       │ │
│  │  - DestinationService                                  │ │
│  │  - MessageService                                      │ │
│  │  - ConnectionService                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    Existing Infrastructure (Reuse)                     │ │
│  │  - JMX Connection Management                           │ │
│  │  - BrokerFacade                                        │ │
│  │  - Spring MVC Controllers (.action endpoints)          │ │
│  │  - JSP Pages (Legacy UI)                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JMX
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   ActiveMQ Broker                            │
│                   (JMX MBeans)                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast builds, HMR, optimized production bundles)
- **UI Component Library**: Material-UI (MUI) v5
  - Comprehensive component set
  - Built-in theming and dark mode support
  - Excellent accessibility
  - Active community and documentation
- **State Management**: Zustand (lightweight, simple API)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors for error handling
- **Charts**: Recharts (React-native charts, responsive)
- **Code Editor**: Monaco Editor (for message body editing)
- **Data Tables**: TanStack Table (React Table v8)
- **Form Handling**: React Hook Form with Zod validation
- **Date/Time**: date-fns (lightweight alternative to moment.js)
- **Notifications**: React Hot Toast
- **Icons**: Material Icons (included with MUI)

#### Backend (New Components)
- **REST API**: Spring MVC REST Controllers
- **JSON Serialization**: Jackson
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **WebSocket** (Optional): Spring WebSocket with STOMP

#### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright (optional)

## Components and Interfaces

### Frontend Component Structure

```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Root component with routing
├── components/                 # Reusable components
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main layout with nav and header
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Header.tsx         # Top header with breadcrumbs
│   │   └── Footer.tsx         # Footer component
│   ├── common/
│   │   ├── DataTable.tsx      # Reusable table component
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   ├── ErrorBoundary.tsx  # Error boundary wrapper
│   │   ├── ConfirmDialog.tsx  # Confirmation modal
│   │   ├── StatusBadge.tsx    # Status indicator
│   │   └── MetricCard.tsx     # Dashboard metric card
│   └── charts/
│       ├── LineChart.tsx      # Time series chart
│       ├── BarChart.tsx       # Bar chart component
│       └── GaugeChart.tsx     # Gauge/radial chart
├── pages/                      # Page components
│   ├── Dashboard.tsx          # Main dashboard
│   ├── Queues/
│   │   ├── QueueList.tsx      # Queue list view
│   │   ├── QueueDetail.tsx    # Queue detail view
│   │   └── QueueGraph.tsx     # Queue metrics graph
│   ├── Topics/
│   │   ├── TopicList.tsx      # Topic list view
│   │   └── TopicDetail.tsx    # Topic detail view
│   ├── Messages/
│   │   ├── MessageBrowser.tsx # Browse messages
│   │   ├── MessageDetail.tsx  # Message detail view
│   │   └── SendMessage.tsx    # Send message form
│   ├── Connections/
│   │   ├── ConnectionList.tsx # Connection list
│   │   └── ConnectionDetail.tsx
│   └── Settings.tsx           # Settings page
├── services/                   # API service layer
│   ├── api.ts                 # Axios instance configuration
│   ├── brokerService.ts       # Broker API calls
│   ├── queueService.ts        # Queue API calls
│   ├── topicService.ts        # Topic API calls
│   ├── messageService.ts      # Message API calls
│   └── connectionService.ts   # Connection API calls
├── stores/                     # State management
│   ├── brokerStore.ts         # Broker state
│   ├── destinationStore.ts    # Queue/Topic state
│   ├── uiStore.ts             # UI state (theme, sidebar)
│   └── authStore.ts           # Authentication state
├── hooks/                      # Custom React hooks
│   ├── usePolling.ts          # Auto-refresh hook
│   ├── useBrokerInfo.ts       # Broker data hook
│   ├── useDestinations.ts     # Destinations data hook
│   └── useTheme.ts            # Theme management hook
├── types/                      # TypeScript type definitions
│   ├── broker.ts              # Broker types
│   ├── destination.ts         # Queue/Topic types
│   ├── message.ts             # Message types
│   └── api.ts                 # API response types
├── utils/                      # Utility functions
│   ├── formatters.ts          # Data formatting utilities
│   ├── validators.ts          # Validation functions
│   └── constants.ts           # Application constants
└── styles/                     # Global styles
    └── theme.ts               # MUI theme configuration
```

### Backend API Structure

#### REST API Endpoints

```
/api/v1/
├── broker
│   ├── GET  /info              # Broker information
│   ├── GET  /statistics        # Broker statistics
│   └── GET  /health            # Health check
├── queues
│   ├── GET  /                  # List all queues
│   ├── GET  /{name}            # Get queue details
│   ├── POST /                  # Create queue
│   ├── DELETE /{name}          # Delete queue
│   ├── POST /{name}/purge      # Purge queue
│   ├── POST /{name}/pause      # Pause queue
│   ├── POST /{name}/resume     # Resume queue
│   └── GET  /{name}/statistics # Queue statistics over time
├── topics
│   ├── GET  /                  # List all topics
│   ├── GET  /{name}            # Get topic details
│   ├── POST /                  # Create topic
│   ├── DELETE /{name}          # Delete topic
│   └── GET  /{name}/statistics # Topic statistics over time
├── messages
│   ├── GET  /queue/{name}      # Browse messages in queue
│   ├── GET  /{id}              # Get message details
│   ├── POST /send              # Send message
│   ├── DELETE /{id}            # Delete message
│   ├── POST /{id}/move         # Move message
│   ├── POST /{id}/copy         # Copy message
│   └── POST /{id}/retry        # Retry message
├── connections
│   ├── GET  /                  # List connections
│   ├── GET  /{id}              # Get connection details
│   └── DELETE /{id}            # Close connection
├── subscribers
│   ├── GET  /                  # List all subscribers
│   ├── GET  /{id}              # Get subscriber details
│   ├── POST /                  # Create subscriber
│   └── DELETE /{id}            # Delete subscriber
└── scheduled
    ├── GET  /                  # List scheduled jobs
    └── DELETE /{id}            # Delete scheduled job
```

#### Java Package Structure

```
org.apache.activemq.web.rest/
├── controller/
│   ├── BrokerController.java
│   ├── QueueController.java
│   ├── TopicController.java
│   ├── MessageController.java
│   ├── ConnectionController.java
│   ├── SubscriberController.java
│   └── ScheduledJobController.java
├── service/
│   ├── BrokerService.java
│   ├── DestinationService.java
│   ├── MessageService.java
│   ├── ConnectionService.java
│   └── SubscriberService.java
├── dto/                        # Data Transfer Objects
│   ├── BrokerInfoDTO.java
│   ├── QueueDTO.java
│   ├── TopicDTO.java
│   ├── MessageDTO.java
│   ├── ConnectionDTO.java
│   └── StatisticsDTO.java
├── mapper/                     # JMX to DTO mappers
│   ├── BrokerMapper.java
│   ├── DestinationMapper.java
│   └── MessageMapper.java
├── config/
│   ├── RestApiConfig.java     # REST API configuration
│   ├── CorsConfig.java        # CORS configuration
│   └── WebSocketConfig.java   # WebSocket configuration (optional)
└── exception/
    ├── RestExceptionHandler.java
    └── ApiException.java
```

## Data Models

### Frontend TypeScript Interfaces

```typescript
// Broker Information
interface BrokerInfo {
  name: string;
  version: string;
  id: string;
  uptime: number;
  uptimeMillis: number;
  dataDirectory: string;
  vmURL: string;
  storePercentUsage: number;
  memoryPercentUsage: number;
  tempPercentUsage: number;
  totalConnections: number;
  totalEnqueueCount: number;
  totalDequeueCount: number;
  totalConsumerCount: number;
  totalProducerCount: number;
  totalMessageCount: number;
}

// Queue/Topic Destination
interface Destination {
  name: string;
  type: 'queue' | 'topic';
  enqueueCount: number;
  dequeueCount: number;
  consumerCount: number;
  producerCount: number;
  queueSize: number;
  memoryPercentUsage: number;
  averageEnqueueTime: number;
  maxEnqueueTime: number;
  minEnqueueTime: number;
  averageMessageSize: number;
  maxMessageSize: number;
  minMessageSize: number;
  paused: boolean;
}

// Message
interface Message {
  id: string;
  messageId: string;
  destination: string;
  timestamp: number;
  expiration: number;
  priority: number;
  redelivered: boolean;
  redeliveryCounter: number;
  correlationId?: string;
  type?: string;
  persistent: boolean;
  properties: Record<string, any>;
  headers: Record<string, any>;
  body: string;
  bodyPreview: string;
  size: number;
}

// Connection
interface Connection {
  connectionId: string;
  remoteAddress: string;
  userName: string;
  clientId: string;
  connectorName: string;
  connected: boolean;
  active: boolean;
  slow: boolean;
  blocked: boolean;
  dispatchQueueSize: number;
}

// Subscriber/Consumer
interface Subscriber {
  consumerId: string;
  connectionId: string;
  sessionId: string;
  destination: string;
  selector?: string;
  enqueueCounter: number;
  dequeueCounter: number;
  dispatchedCounter: number;
  dispatchedQueueSize: number;
  prefetchSize: number;
  maximumPendingMessageLimit: number;
  exclusive: boolean;
  retroactive: boolean;
  subscriptionName?: string;
}

// Statistics (for charts)
interface Statistics {
  timestamp: number;
  enqueueCount: number;
  dequeueCount: number;
  queueSize: number;
  consumerCount: number;
  producerCount: number;
  memoryUsage: number;
}
```

### Backend DTOs

```java
// BrokerInfoDTO.java
public class BrokerInfoDTO {
    private String name;
    private String version;
    private String id;
    private long uptime;
    private long uptimeMillis;
    private String dataDirectory;
    private String vmURL;
    private int storePercentUsage;
    private int memoryPercentUsage;
    private int tempPercentUsage;
    private int totalConnections;
    private long totalEnqueueCount;
    private long totalDequeueCount;
    private int totalConsumerCount;
    private int totalProducerCount;
    private long totalMessageCount;
    // getters and setters
}

// QueueDTO.java
public class QueueDTO {
    private String name;
    private long enqueueCount;
    private long dequeueCount;
    private int consumerCount;
    private int producerCount;
    private long queueSize;
    private int memoryPercentUsage;
    private double averageEnqueueTime;
    private long maxEnqueueTime;
    private long minEnqueueTime;
    private long averageMessageSize;
    private long maxMessageSize;
    private long minMessageSize;
    private boolean paused;
    // getters and setters
}

// MessageDTO.java
public class MessageDTO {
    private String id;
    private String messageId;
    private String destination;
    private long timestamp;
    private long expiration;
    private int priority;
    private boolean redelivered;
    private int redeliveryCounter;
    private String correlationId;
    private String type;
    private boolean persistent;
    private Map<String, Object> properties;
    private Map<String, Object> headers;
    private String body;
    private String bodyPreview;
    private long size;
    // getters and setters
}
```

## Error Handling

### Frontend Error Handling

1. **API Error Interceptor**: Axios interceptor to catch and handle HTTP errors
2. **Error Boundary**: React error boundary to catch rendering errors
3. **Toast Notifications**: User-friendly error messages via toast notifications
4. **Retry Logic**: Automatic retry for transient failures
5. **Fallback UI**: Graceful degradation when features fail

```typescript
// API Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication error
      authStore.logout();
      navigate('/login');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
    return Promise.reject(error);
  }
);
```

### Backend Error Handling

```java
@RestControllerAdvice
public class RestExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            System.currentTimeMillis()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## Testing Strategy

### Frontend Testing

1. **Unit Tests**: Test individual components and utilities
   - Component rendering tests
   - Hook behavior tests
   - Utility function tests
   - Coverage target: 70%+

2. **Integration Tests**: Test component interactions
   - API service integration
   - Store interactions
   - Form submissions

3. **E2E Tests** (Optional): Test critical user flows
   - Login flow
   - Queue management
   - Message browsing and sending

```typescript
// Example component test
describe('QueueList', () => {
  it('renders queue list with data', async () => {
    const mockQueues = [
      { name: 'test.queue', queueSize: 10, consumerCount: 2 }
    ];
    
    vi.mocked(queueService.getQueues).mockResolvedValue(mockQueues);
    
    render(<QueueList />);
    
    await waitFor(() => {
      expect(screen.getByText('test.queue')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});
```

### Backend Testing

1. **Unit Tests**: Test service layer logic
   - Service methods
   - Mapper functions
   - Validation logic

2. **Integration Tests**: Test REST controllers
   - API endpoint responses
   - Error handling
   - Authentication/authorization

```java
@WebMvcTest(QueueController.class)
public class QueueControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private DestinationService destinationService;
    
    @Test
    public void testGetQueues() throws Exception {
        List<QueueDTO> queues = Arrays.asList(
            new QueueDTO("test.queue", 10, 5, 2, 1, 5, 50, 100.0, 200, 50, 1024, 2048, 512, false)
        );
        
        when(destinationService.getQueues()).thenReturn(queues);
        
        mockMvc.perform(get("/api/v1/queues"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("test.queue"))
            .andExpect(jsonPath("$[0].queueSize").value(5));
    }
}
```

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Lazy load routes and heavy components
2. **Bundle Optimization**: Tree shaking, minification, compression
3. **Memoization**: Use React.memo, useMemo, useCallback appropriately
4. **Virtual Scrolling**: For large lists (messages, connections)
5. **Debouncing**: Search inputs and filter operations
6. **Caching**: Cache API responses with appropriate TTL
7. **Image Optimization**: Use WebP format, lazy loading

### Backend Optimization

1. **Response Caching**: Cache broker statistics with short TTL
2. **Pagination**: Implement pagination for large result sets
3. **Compression**: Enable GZIP compression for API responses
4. **Connection Pooling**: Reuse JMX connections efficiently
5. **Async Processing**: Use async controllers for long-running operations

## Security Considerations

1. **Authentication**: Leverage existing JAAS authentication
2. **Authorization**: Maintain existing role-based access control
3. **CSRF Protection**: Implement CSRF tokens for state-changing operations
4. **XSS Prevention**: Sanitize user inputs, use React's built-in XSS protection
5. **CORS**: Configure CORS appropriately for API access
6. **Content Security Policy**: Implement CSP headers
7. **HTTPS**: Enforce HTTPS in production
8. **Input Validation**: Validate all inputs on both frontend and backend
9. **Rate Limiting**: Implement rate limiting for API endpoints

## Deployment Strategy

### Build Process

1. **Frontend Build**:
   ```bash
   cd frontend
   npm install
   npm run build
   # Output: dist/ directory with optimized static files
   ```

2. **Integration with WAR**:
   - Copy frontend build output to `src/main/webapp/modern/`
   - Configure servlet to serve modern UI from `/modern` path
   - Keep legacy JSP pages at root path

3. **Maven Integration**:
   ```xml
   <plugin>
     <groupId>com.github.eirslett</groupId>
     <artifactId>frontend-maven-plugin</artifactId>
     <executions>
       <execution>
         <id>install node and npm</id>
         <goals><goal>install-node-and-npm</goal></goals>
       </execution>
       <execution>
         <id>npm install</id>
         <goals><goal>npm</goal></goals>
         <configuration>
           <arguments>install</arguments>
         </configuration>
       </execution>
       <execution>
         <id>npm build</id>
         <goals><goal>npm</goal></goals>
         <configuration>
           <arguments>run build</arguments>
         </configuration>
       </execution>
     </executions>
   </plugin>
   ```

### URL Structure

- Legacy UI: `http://localhost:8080/` (existing JSP pages)
- Modern UI: `http://localhost:8080/modern/` (new React SPA)
- REST API: `http://localhost:8080/api/v1/` (new REST endpoints)
- Legacy Actions: `http://localhost:8080/*.action` (existing Spring MVC controllers)

### Migration Path

1. **Phase 1**: Deploy modern UI alongside legacy UI
2. **Phase 2**: Add toggle in header to switch between UIs
3. **Phase 3**: Make modern UI the default, keep legacy as fallback
4. **Phase 4**: Deprecate legacy UI after stabilization period

## Accessibility

1. **Semantic HTML**: Use proper HTML5 semantic elements
2. **ARIA Labels**: Add ARIA labels for screen readers
3. **Keyboard Navigation**: Ensure all features accessible via keyboard
4. **Focus Management**: Proper focus indicators and management
5. **Color Contrast**: Meet WCAG 2.1 AA contrast ratios (4.5:1 for text)
6. **Alt Text**: Provide alt text for images and icons
7. **Form Labels**: Associate labels with form inputs
8. **Error Announcements**: Announce errors to screen readers

## Internationalization (Future Enhancement)

While not in the initial scope, the architecture supports future i18n:

1. **React-i18next**: Use for translation management
2. **Language Files**: JSON files for each supported language
3. **Date/Number Formatting**: Use locale-aware formatting
4. **RTL Support**: Design with RTL languages in mind

## Monitoring and Analytics (Future Enhancement)

1. **Error Tracking**: Integrate Sentry or similar for error tracking
2. **Performance Monitoring**: Track page load times, API response times
3. **User Analytics**: Track feature usage (with privacy considerations)
4. **Health Checks**: Expose health check endpoints for monitoring

## Documentation

1. **API Documentation**: OpenAPI/Swagger documentation for REST API
2. **Component Storybook**: Storybook for UI component documentation
3. **Developer Guide**: Setup and development instructions
4. **User Guide**: End-user documentation for new features
5. **Migration Guide**: Guide for transitioning from legacy to modern UI

# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Initialize React + TypeScript + Vite project in `activemq-web-console/src/main/frontend` directory
  - Configure ESLint, Prettier, and TypeScript compiler options
  - Set up Material-UI theme with light/dark mode support
  - Configure Vite proxy for local development to proxy API calls to backend
  - Integrate frontend build into Maven build process using frontend-maven-plugin
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2. Create backend REST API foundation
  - Create REST API package structure under `org.apache.activemq.web.rest`
  - Implement `RestApiConfig.java` to configure REST controllers with `/api/v1` base path
  - Implement `CorsConfig.java` to enable CORS for development and production
  - Create `RestExceptionHandler.java` for centralized error handling
  - Create base DTO classes and error response models
  - _Requirements: 1.2, 12.4_

- [x] 3. Implement Broker API endpoints and services
  - Create `BrokerService.java` to interact with existing BrokerFacade and JMX
  - Create `BrokerInfoDTO.java` and `BrokerMapper.java` for data transformation
  - Implement `BrokerController.java` with endpoints: GET `/api/v1/broker/info`, GET `/api/v1/broker/statistics`, GET `/api/v1/broker/health`
  - Map broker metrics including uptime, memory usage, store usage, connection counts
  - _Requirements: 4.1, 4.5_

- [ ]* 3.1 Write unit tests for Broker API
  - Create unit tests for BrokerService methods
  - Create integration tests for BrokerController endpoints
  - _Requirements: 4.1, 4.5_

- [x] 4. Implement Queue and Topic API endpoints
  - Create `DestinationService.java` to manage queues and topics via JMX
  - Create `QueueDTO.java`, `TopicDTO.java` and `DestinationMapper.java`
  - Implement `QueueController.java` with endpoints: GET `/api/v1/queues`, GET `/api/v1/queues/{name}`, POST `/api/v1/queues`, DELETE `/api/v1/queues/{name}`, POST `/api/v1/queues/{name}/purge`, POST `/api/v1/queues/{name}/pause`, POST `/api/v1/queues/{name}/resume`
  - Implement `TopicController.java` with similar endpoints for topics
  - Add pagination support for queue/topic lists
  - _Requirements: 5.1, 5.4, 5.5_

- [ ]* 4.1 Write unit tests for Destination API
  - Create unit tests for DestinationService methods
  - Create integration tests for Queue and Topic controller endpoints
  - _Requirements: 5.1, 5.4, 5.5_

- [x] 5. Implement Message API endpoints
  - Create `MessageService.java` to browse and manage messages
  - Create `MessageDTO.java` and `MessageMapper.java` with support for message body preview
  - Implement `MessageController.java` with endpoints: GET `/api/v1/messages/queue/{name}`, GET `/api/v1/messages/{id}`, POST `/api/v1/messages/send`, DELETE `/api/v1/messages/{id}`, POST `/api/v1/messages/{id}/move`, POST `/api/v1/messages/{id}/copy`
  - Implement pagination for message browsing
  - Add support for JSON and XML body formatting
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 10.1_

- [ ]* 5.1 Write unit tests for Message API
  - Create unit tests for MessageService methods
  - Create integration tests for MessageController endpoints
  - _Requirements: 6.1, 6.2, 6.4_

- [x] 6. Implement Connection and Subscriber API endpoints
  - Create `ConnectionService.java` and `SubscriberService.java`
  - Create `ConnectionDTO.java`, `SubscriberDTO.java` and corresponding mappers
  - Implement `ConnectionController.java` with endpoints: GET `/api/v1/connections`, GET `/api/v1/connections/{id}`, DELETE `/api/v1/connections/{id}`
  - Implement `SubscriberController.java` with endpoints: GET `/api/v1/subscribers`, GET `/api/v1/subscribers/{id}`, DELETE `/api/v1/subscribers/{id}`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 6.1 Write unit tests for Connection and Subscriber APIs
  - Create unit tests for ConnectionService and SubscriberService
  - Create integration tests for controller endpoints
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 7. Create frontend API client layer
  - Create `src/services/api.ts` with configured Axios instance
  - Implement API error interceptor for centralized error handling
  - Create `brokerService.ts` with methods to call broker API endpoints
  - Create `queueService.ts` and `topicService.ts` for destination management
  - Create `messageService.ts` for message operations
  - Create `connectionService.ts` for connection management
  - _Requirements: 1.2, 11.5_

- [x] 8. Define TypeScript types and interfaces
  - Create `src/types/broker.ts` with BrokerInfo interface
  - Create `src/types/destination.ts` with Queue and Topic interfaces
  - Create `src/types/message.ts` with Message interface
  - Create `src/types/connection.ts` with Connection and Subscriber interfaces
  - Create `src/types/api.ts` with API response wrapper types
  - _Requirements: 1.1_

- [x] 9. Implement state management stores
  - Create `src/stores/brokerStore.ts` using Zustand for broker state
  - Create `src/stores/destinationStore.ts` for queue/topic state
  - Create `src/stores/uiStore.ts` for theme, sidebar, and UI preferences
  - Implement state persistence to localStorage for UI preferences
  - _Requirements: 3.3, 11.6_

- [x] 10. Create custom React hooks
  - Create `src/hooks/usePolling.ts` for auto-refresh functionality with configurable intervals
  - Create `src/hooks/useBrokerInfo.ts` to fetch and manage broker data
  - Create `src/hooks/useDestinations.ts` to fetch queues and topics
  - Create `src/hooks/useTheme.ts` for theme management and dark mode toggle
  - _Requirements: 7.1, 7.2, 7.3, 3.3_

- [x] 11. Build common reusable components
  - Create `src/components/common/DataTable.tsx` with sorting, filtering, and pagination using TanStack Table
  - Create `src/components/common/LoadingSpinner.tsx` with skeleton loading states
  - Create `src/components/common/ErrorBoundary.tsx` for error handling
  - Create `src/components/common/ConfirmDialog.tsx` for destructive action confirmations
  - Create `src/components/common/StatusBadge.tsx` for color-coded status indicators
  - Create `src/components/common/MetricCard.tsx` for dashboard metrics display
  - Ensure all components meet WCAG 2.1 AA accessibility standards
  - _Requirements: 3.1, 3.2, 3.5, 11.1, 11.2, 11.3, 11.6_

- [x] 12. Build chart components
  - Create `src/components/charts/LineChart.tsx` using Recharts for time series data
  - Create `src/components/charts/BarChart.tsx` for bar chart visualizations
  - Create `src/components/charts/GaugeChart.tsx` for percentage metrics
  - Implement responsive chart sizing and tooltips
  - Add accessibility labels for screen readers
  - _Requirements: 4.2, 9.1, 9.2, 9.4_

- [x] 13. Create layout components
  - Create `src/components/layout/AppLayout.tsx` as main layout wrapper
  - Create `src/components/layout/Sidebar.tsx` with navigation menu and mobile hamburger menu
  - Create `src/components/layout/Header.tsx` with breadcrumbs and theme toggle
  - Create `src/components/layout/Footer.tsx` with version and links
  - Implement responsive behavior for mobile, tablet, and desktop
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 11.4_

- [x] 14. Implement Dashboard page
  - Create `src/pages/Dashboard.tsx` with broker overview
  - Display broker name, version, ID, and uptime in cards
  - Show key metrics: memory usage, store usage, connection count using MetricCard components
  - Add gauge charts for percentage-based metrics
  - Implement auto-refresh with usePolling hook (default 5 seconds)
  - Display last update timestamp
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2_

- [x] 15. Implement Queue list and detail pages
  - Create `src/pages/Queues/QueueList.tsx` with sortable, filterable table
  - Implement real-time search/filter by queue name
  - Display queue metrics: enqueue count, dequeue count, consumer count, pending messages
  - Add actions: create, delete, purge, pause, resume with confirmation dialogs
  - Create `src/pages/Queues/QueueDetail.tsx` showing detailed queue information
  - Implement auto-refresh for queue data
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1, 7.4_

- [x] 16. Implement Topic list and detail pages
  - Create `src/pages/Topics/TopicList.tsx` with similar functionality to QueueList
  - Display topic metrics and subscriber information
  - Add actions: create, delete with confirmation dialogs
  - Create `src/pages/Topics/TopicDetail.tsx` showing topic details and subscribers
  - Implement auto-refresh for topic data
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1_

- [x] 17. Implement Queue and Topic graph pages
  - Create `src/pages/Queues/QueueGraph.tsx` with interactive line charts
  - Display enqueue/dequeue rates, queue size, and consumer count over time
  - Implement time range selector (last hour, last day, last week)
  - Add ability to toggle data series on/off
  - Create similar graph page for topics
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 18. Implement Message browser page
  - Create `src/pages/Messages/MessageBrowser.tsx` with paginated message list
  - Display message ID, timestamp, and body preview in table
  - Implement filtering by message properties and headers
  - Add virtual scrolling for large message lists
  - Implement auto-refresh with pause/resume toggle
  - _Requirements: 6.1, 6.5, 7.1, 7.3_

- [x] 19. Implement Message detail page
  - Create `src/pages/Messages/MessageDetail.tsx` showing full message details
  - Display headers, properties, and full message body
  - Implement syntax highlighting for JSON and XML using Monaco Editor
  - Add actions: delete, move, copy with confirmation dialogs
  - Handle large message bodies efficiently with "view raw" option
  - _Requirements: 6.2, 6.3, 6.4, 6.6_

- [x] 20. Implement Send message page
  - Create `src/pages/Messages/SendMessage.tsx` with message form
  - Add fields for destination, message body, headers, and properties
  - Integrate Monaco Editor for message body with JSON/XML syntax highlighting
  - Implement validation for JSON and XML message bodies using Zod
  - Add message templates or history feature for quick reuse
  - Display success/error notifications using React Hot Toast
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.2_

- [ ] 21. Implement Connection list and detail pages
  - Create `src/pages/Connections/ConnectionList.tsx` with connection table
  - Display connection ID, remote address, user, client ID, and connection time
  - Add action to close connection with confirmation
  - Create `src/pages/Connections/ConnectionDetail.tsx` showing sessions and consumers
  - Display connection metrics: data transfer rates, message throughput
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 22. Implement routing and navigation
  - Create `src/App.tsx` with React Router configuration
  - Define routes for all pages: dashboard, queues, topics, messages, connections, settings
  - Implement lazy loading for route components using React.lazy
  - Add 404 page for unknown routes
  - Ensure browser back/forward navigation works correctly
  - _Requirements: 1.3, 11.4_

- [ ] 23. Implement authentication integration
  - Integrate with existing JAAS authentication mechanism
  - Create login page if needed or use existing authentication
  - Store authentication state in authStore
  - Implement API interceptor to handle 401 responses
  - Redirect to login on authentication failure
  - _Requirements: 12.5_

- [ ] 24. Add loading states and error handling
  - Implement loading spinners for all async operations
  - Add skeleton screens for initial page loads
  - Display toast notifications for success and error messages
  - Implement error boundaries for component error handling
  - Add retry logic for failed API calls
  - Ensure user-friendly error messages with suggested actions
  - _Requirements: 11.1, 11.2, 11.5, 11.6_

- [ ] 25. Implement responsive design and mobile optimization
  - Test and adjust layouts for mobile (320px+), tablet (768px+), and desktop (1024px+)
  - Ensure touch targets are minimum 44x44px on mobile
  - Implement hamburger menu for mobile navigation
  - Add horizontal scrolling or column hiding for tables on small screens
  - Test orientation changes on mobile devices
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 26. Implement dark mode and theming
  - Configure MUI theme with light and dark mode variants
  - Create theme toggle button in header
  - Persist theme preference to localStorage
  - Ensure all components support both themes
  - Verify color contrast meets WCAG 2.1 AA standards in both modes
  - _Requirements: 3.3, 3.6_

- [ ] 27. Add accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works for all features
  - Implement proper focus management and indicators
  - Add alt text for images and icons
  - Associate labels with form inputs
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: 3.6_

- [ ] 28. Optimize performance
  - Implement code splitting for routes using React.lazy
  - Add memoization with React.memo, useMemo, useCallback where appropriate
  - Implement virtual scrolling for large lists
  - Add debouncing for search inputs (300ms delay)
  - Configure Vite for optimal production bundle size
  - Enable GZIP compression for API responses
  - _Requirements: 1.4_

- [ ] 29. Configure deployment and build integration
  - Update `activemq-web-console/pom.xml` to include frontend-maven-plugin
  - Configure Maven to build frontend during package phase
  - Copy frontend build output to `src/main/webapp/modern/` directory
  - Create servlet configuration to serve modern UI from `/modern` path
  - Update web.xml to configure modern UI routing
  - Test full Maven build process
  - _Requirements: 12.1, 12.2_

- [ ] 30. Add UI toggle between legacy and modern interfaces
  - Add toggle link in legacy JSP header to switch to modern UI
  - Add toggle link in modern UI header to switch to legacy UI
  - Ensure both UIs are accessible and functional
  - Document URL structure: `/` for legacy, `/modern` for new UI
  - _Requirements: 12.2, 12.3_

- [ ] 31. Create API documentation
  - Add SpringDoc OpenAPI dependency to pom.xml
  - Configure Swagger UI at `/api/docs` endpoint
  - Add OpenAPI annotations to all REST controllers
  - Document request/response schemas and error codes
  - Test Swagger UI and API documentation
  - _Requirements: 1.2_

- [ ] 32. Write end-to-end tests
  - Set up Playwright for E2E testing
  - Write tests for critical user flows: login, queue management, message browsing, message sending
  - Test responsive behavior on different screen sizes
  - Test dark mode toggle
  - Run E2E tests in CI pipeline
  - _Requirements: 5.1, 6.1, 10.1_

- [ ] 33. Create documentation
  - Write developer setup guide in `frontend/README.md`
  - Document API endpoints and usage
  - Create user guide for new UI features
  - Write migration guide from legacy to modern UI
  - Document configuration options and environment variables
  - _Requirements: 12.2_

- [ ] 34. Final testing and polish
  - Perform cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Test on various devices and screen sizes
  - Verify all features work with auto-refresh enabled
  - Test error scenarios and edge cases
  - Verify accessibility with automated tools (axe, Lighthouse)
  - Fix any remaining bugs and polish UI details
  - _Requirements: 2.1, 3.1, 11.1_

# Message Detail Page Implementation

## Overview
The Message Detail page displays comprehensive information about a single message, including headers, properties, and the full message body with syntax highlighting for JSON and XML formats.

## Features Implemented

### 1. Message Information Display (Requirement 6.2)
- **Message Metadata**: Displays timestamp, priority, size, persistence status, redelivery information
- **Correlation ID**: Shows correlation ID if present
- **Message Type**: Displays message type if set
- **Expiration**: Shows expiration timestamp if set
- **Status Badges**: Visual indicators for persistent and redelivered messages

### 2. Headers and Properties Display (Requirement 6.2)
- **Headers Table**: Displays all message headers in a structured table format
- **Properties Table**: Shows all message properties with their values and types
- **Empty State**: Graceful handling when no headers or properties exist
- **Word Wrapping**: Long values are properly wrapped for readability

### 3. Syntax Highlighting (Requirement 6.3)
- **Monaco Editor Integration**: Uses Monaco Editor for professional code editing experience
- **Auto-Detection**: Automatically detects JSON and XML formats
- **Format Selection**: Manual format selection (Text, JSON, XML)
- **Theme Support**: Respects light/dark mode preference
- **Formatted View**: Pretty-prints JSON with proper indentation
- **Raw View**: Option to view unformatted raw message body

### 4. Message Actions (Requirement 6.4)
- **Delete**: Delete message with confirmation dialog
- **Move**: Move message to another destination with target input
- **Copy**: Copy message to another destination
- **Download**: Download raw message body as text file
- **Confirmation Dialogs**: All destructive actions require confirmation

### 5. Large Message Handling (Requirement 6.6)
- **Size Warning**: Displays warning for messages larger than 1MB
- **Download Option**: Provides download button for large messages
- **Minimap**: Monaco Editor minimap enabled for messages > 10KB
- **Efficient Rendering**: Monaco Editor handles large files efficiently
- **View Raw Option**: Alternative view mode for very large messages

## Component Structure

```typescript
MessageDetail
├── Header Section
│   ├── Back Button
│   ├── Title
│   └── Action Buttons (Refresh, Download, Copy, Move, Delete)
├── Message Metadata Card
│   ├── Timestamp
│   ├── Priority Badge
│   ├── Size
│   ├── Status Chips
│   ├── Expiration (if set)
│   ├── Correlation ID (if set)
│   └── Type (if set)
├── Headers Card
│   └── Headers Table
├── Properties Card
│   └── Properties Table (with type column)
└── Message Body Card
    ├── Format Selector (Text/JSON/XML)
    ├── View Mode Selector (Formatted/Raw)
    ├── Large Message Warning (if applicable)
    └── Monaco Editor
```

## Key Features

### Monaco Editor Configuration
- **Read-only mode**: Prevents accidental editing
- **Syntax highlighting**: Automatic language detection
- **Word wrap**: Enabled for better readability
- **Line numbers**: Displayed for reference
- **Folding**: Code folding for structured formats
- **Automatic layout**: Responsive sizing
- **Theme integration**: Matches application theme

### Format Detection
The component automatically detects message body format:
1. **JSON**: Checks for `{...}` or `[...]` and validates JSON parsing
2. **XML**: Checks for `<...>` tags
3. **Text**: Default fallback for other formats

### Error Handling
- Loading states with spinner
- Error alerts with retry option
- Toast notifications for action results
- Graceful handling of missing messages
- Network error handling

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Proper focus management
- Color contrast compliance

## API Integration

### Endpoints Used
- `GET /api/v1/messages/{queueName}/{messageId}` - Fetch message details
- `DELETE /api/v1/messages/{queueName}/{messageId}` - Delete message
- `POST /api/v1/messages/{queueName}/{messageId}/move` - Move message
- `POST /api/v1/messages/{queueName}/{messageId}/copy` - Copy message

### Service Methods
```typescript
messageService.getMessage(queueName, messageId)
messageService.deleteMessage(queueName, messageId)
messageService.moveMessage(queueName, messageId, targetDestination)
messageService.copyMessage(queueName, messageId, targetDestination)
```

## User Interactions

### Navigation
- Back button returns to message browser with queue context
- Breadcrumb navigation via header
- Direct URL access supported

### Actions
1. **Delete**: Click Delete → Confirm → Navigate back to browser
2. **Move**: Click Move → Enter destination → Confirm → Navigate back
3. **Copy**: Click Copy → Enter destination → Confirm → Stay on page
4. **Download**: Click Download → File downloads immediately
5. **Refresh**: Click Refresh → Reload message data

### View Options
- **Format**: Switch between Text, JSON, XML
- **View Mode**: Toggle between Formatted and Raw
- **Theme**: Automatically follows application theme

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Monaco Editor loaded on demand
2. **Memoization**: Formatted body computed only when needed
3. **Efficient Rendering**: Monaco handles large files efficiently
4. **Size Warnings**: Alerts users to large messages
5. **Download Option**: Alternative for very large messages

### Memory Management
- Monaco Editor manages its own memory
- Component cleanup on unmount
- No memory leaks from event listeners

## Testing Recommendations

### Manual Testing
1. View message with JSON body
2. View message with XML body
3. View message with plain text body
4. View message with large body (>1MB)
5. Delete message and verify navigation
6. Move message to another queue
7. Copy message to another queue
8. Download raw message
9. Test with empty headers/properties
10. Test with redelivered messages
11. Test theme switching
12. Test format switching

### Edge Cases
- Empty message body
- Very large messages (>10MB)
- Invalid JSON/XML (should still display)
- Missing correlation ID
- No expiration set
- Messages with many properties
- Long header/property values

## Dependencies

### New Dependencies
- `@monaco-editor/react`: Monaco Editor React wrapper

### Existing Dependencies
- `@mui/material`: UI components
- `react-router-dom`: Navigation
- `react-hot-toast`: Notifications
- Custom hooks: `useTheme`, `useConfirmDialog`
- Custom components: `LoadingSpinner`, `StatusBadge`, `ConfirmDialog`

## Future Enhancements

### Potential Improvements
1. **Message History**: Show message delivery history
2. **Replay**: Ability to replay/resend message
3. **Export Options**: Export as JSON, XML, CSV
4. **Search in Body**: Search within message body
5. **Compare**: Compare with another message
6. **Validation**: Validate JSON/XML schemas
7. **Pretty Print Options**: Configurable formatting
8. **Syntax Themes**: Additional Monaco themes

## Requirements Coverage

✅ **Requirement 6.2**: Display full message details including headers, properties, and body
✅ **Requirement 6.3**: Format and syntax-highlight JSON and XML content
✅ **Requirement 6.4**: Provide actions to delete, move, or copy messages
✅ **Requirement 6.6**: Handle large message bodies efficiently with "view raw" option

## Files Modified/Created

### Created
- `src/pages/Messages/MessageDetail.tsx` - Main component
- `src/pages/Messages/index.ts` - Export file
- `src/pages/Messages/MESSAGE_DETAIL_IMPLEMENTATION.md` - This documentation

### Modified
- `src/App.tsx` - Added message detail route
- `package.json` - Added @monaco-editor/react dependency

## Integration Points

### Routes
- `/messages/:queueName/:messageId` - Message detail page
- Navigates from: Message Browser (row click)
- Navigates to: Message Browser (back button, after delete/move)

### State Management
- Uses local component state
- No global state required
- Theme from `useTheme` hook

### Navigation Flow
```
Message Browser → Click Message Row → Message Detail
Message Detail → Back Button → Message Browser (with queue context)
Message Detail → Delete → Message Browser
Message Detail → Move → Message Browser
```

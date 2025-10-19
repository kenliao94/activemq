# Send Message Page Implementation

## Overview

The SendMessage component provides a comprehensive interface for sending messages to ActiveMQ queues and topics with advanced features including message templates, validation, and syntax highlighting.

## Features Implemented

### 1. Message Form
- **Destination Selection**: Autocomplete field with existing queues/topics
- **Destination Type**: Toggle between queue and topic
- **Message Body**: Monaco Editor with syntax highlighting
- **Headers**: Dynamic key-value pairs for message headers
- **Properties**: Dynamic key-value pairs for message properties
- **Message Options**:
  - Priority (0-9)
  - Time to Live (TTL in milliseconds)
  - Persistent delivery toggle
  - Correlation ID

### 2. Monaco Editor Integration
- **Syntax Highlighting**: Supports text, JSON, and XML formats
- **Theme Support**: Automatically switches between light and dark themes
- **Format Button**: Auto-format JSON and XML content
- **Real-time Validation**: Validates JSON and XML syntax as you type
- **Error Display**: Shows validation errors with helpful messages

### 3. Validation (Zod)
- **Required Fields**: Destination and message body are required
- **Priority Range**: Validates priority is between 0-9
- **TTL Validation**: Ensures time to live is non-negative
- **Body Validation**: 
  - JSON: Validates JSON syntax using JSON.parse()
  - XML: Validates XML syntax using DOMParser
  - Text: No validation required

### 4. Message Templates & History
- **Auto-save History**: Automatically saves last 20 sent messages
- **Save as Template**: Save current message as a named template
- **Load Template**: Quick load of saved templates
- **Delete Template**: Remove unwanted templates
- **LocalStorage Persistence**: Templates persist across sessions
- **Template Metadata**: Shows destination, type, and timestamp

### 5. User Experience
- **Toast Notifications**: Success/error messages using React Hot Toast
- **Loading States**: Disabled buttons and loading text during send
- **Clear Form**: Reset all fields with one click
- **Format Body**: Auto-format JSON/XML with proper indentation
- **Responsive Layout**: Works on mobile, tablet, and desktop

## Component Structure

```typescript
SendMessage
├── Form Controls
│   ├── Destination (Autocomplete)
│   ├── Destination Type (Select)
│   └── Message Body (Monaco Editor)
├── Headers Section
│   └── Dynamic Key-Value Pairs
├── Properties Section
│   └── Dynamic Key-Value Pairs
├── Message Options
│   ├── Priority
│   ├── Time to Live
│   ├── Persistent Delivery
│   └── Correlation ID
└── Templates Panel
    ├── Template List
    ├── Load Template
    └── Delete Template
```

## Validation Rules

### Form Validation (Zod Schema)
```typescript
{
  destination: string (min 1 character),
  destinationType: 'queue' | 'topic',
  body: string (min 1 character),
  priority: number (0-9, optional),
  timeToLive: number (>= 0, optional),
  persistent: boolean (optional),
  correlationId: string (optional)
}
```

### Body Format Validation
- **JSON**: Uses `JSON.parse()` to validate syntax
- **XML**: Uses `DOMParser` to validate structure
- **Text**: No validation required

## API Integration

### Send Message Request
```typescript
{
  destination: string,
  body: string,
  headers?: Record<string, string>,
  properties?: Record<string, any>,
  persistent?: boolean,
  priority?: number,
  timeToLive?: number
}
```

### Response Handling
- **Success**: Shows success toast and saves to history
- **Error**: Shows error toast with server message
- **Loading**: Disables form during submission

## LocalStorage Schema

### Message Templates
```typescript
{
  id: string,
  name: string,
  destination: string,
  destinationType: 'queue' | 'topic',
  body: string,
  headers: Array<{key: string, value: string}>,
  properties: Array<{key: string, value: string}>,
  priority?: number,
  timeToLive?: number,
  persistent?: boolean,
  timestamp: number
}
```

Stored in: `localStorage.messageTemplates`
Max items: 20 (keeps most recent)

## Usage Examples

### Sending a Simple Text Message
1. Select destination type (queue/topic)
2. Enter or select destination name
3. Enter message body in text format
4. Click "Send Message"

### Sending a JSON Message
1. Select destination
2. Click "JSON" format button
3. Enter JSON content in editor
4. Click "Format" to auto-format
5. Add headers/properties if needed
6. Click "Send Message"

### Using Templates
1. Click "Templates" button to view saved templates
2. Click "Load" on desired template
3. Modify as needed
4. Click "Send Message"

### Saving a Template
1. Fill in message form
2. Click "Save as Template"
3. Enter template name
4. Template is saved for future use

## Accessibility Features

- **Keyboard Navigation**: All controls accessible via keyboard
- **Form Labels**: Proper labels for all inputs
- **Error Messages**: Clear error messages for validation
- **Focus Management**: Proper focus indicators
- **Screen Reader Support**: ARIA labels where needed

## Performance Considerations

- **Lazy Loading**: Monaco Editor loads on demand
- **Debounced Validation**: Body validation runs on change
- **LocalStorage**: Efficient template storage
- **Autocomplete**: Loads destinations on type change

## Requirements Satisfied

- ✅ **10.1**: Form with destination, body, headers, and properties
- ✅ **10.2**: Monaco Editor with JSON/XML syntax highlighting
- ✅ **10.3**: Message templates and history feature
- ✅ **10.4**: Validation for JSON and XML using Zod
- ✅ **10.5**: Success/error notifications using React Hot Toast
- ✅ **11.2**: User-friendly error messages and feedback

## Future Enhancements

1. **Message Preview**: Preview formatted message before sending
2. **Bulk Send**: Send multiple messages at once
3. **Import/Export**: Import/export templates as JSON
4. **Advanced Properties**: Type-specific property values (number, boolean)
5. **Message Scheduling**: Schedule messages for future delivery
6. **File Upload**: Upload message body from file
7. **Message Size Warning**: Warn when message exceeds size limits

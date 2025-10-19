/**
 * Message types for browsing, sending, and managing messages
 */

export interface Message {
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

export interface MessageHeader {
  key: string;
  value: string | number | boolean;
}

export interface MessageProperty {
  key: string;
  value: any;
  type?: string;
}

export interface SendMessageRequest {
  destination: string;
  destinationType: 'queue' | 'topic';
  body: string;
  headers?: Record<string, string | number | boolean>;
  properties?: Record<string, any>;
  priority?: number;
  timeToLive?: number;
  persistent?: boolean;
  correlationId?: string;
  replyTo?: string;
  type?: string;
}

export interface MessageFilter {
  destination?: string;
  propertyKey?: string;
  propertyValue?: string;
  headerKey?: string;
  headerValue?: string;
  bodyContains?: string;
  minTimestamp?: number;
  maxTimestamp?: number;
  minPriority?: number;
  maxPriority?: number;
  redelivered?: boolean;
}

export interface MessageAction {
  action: 'delete' | 'move' | 'copy' | 'retry';
  messageId: string;
  targetDestination?: string;
}

export interface MessageBrowseRequest {
  destination: string;
  page?: number;
  pageSize?: number;
  filter?: MessageFilter;
  sortBy?: 'timestamp' | 'priority' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface MessageBrowseResponse {
  messages: Message[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type MessageBodyFormat = 'text' | 'json' | 'xml' | 'binary';

export interface FormattedMessageBody {
  format: MessageBodyFormat;
  content: string;
  isValid: boolean;
  error?: string;
}

/**
 * Connection and Subscriber/Consumer types
 */

export interface Connection {
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
  createdTimestamp?: number;
  lastActiveTimestamp?: number;
}

export interface ConnectionDetail extends Connection {
  sessions: Session[];
  statistics: ConnectionStatistics;
}

export interface Session {
  sessionId: string;
  connectionId: string;
  acknowledged: boolean;
  transacted: boolean;
  consumerCount: number;
  producerCount: number;
  pendingMessageCount: number;
}

export interface ConnectionStatistics {
  enqueueCount: number;
  dequeueCount: number;
  messagesSent: number;
  messagesReceived: number;
  bytesReceived: number;
  bytesSent: number;
  dataReceiveRate: number;
  dataSendRate: number;
}

export interface Subscriber {
  consumerId: string;
  connectionId: string;
  sessionId: string;
  destination: string;
  destinationType: 'queue' | 'topic';
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
  clientId?: string;
  active: boolean;
  slow: boolean;
  priority: number;
}

export interface SubscriberDetail extends Subscriber {
  statistics: SubscriberStatistics;
  pendingMessages: number;
  dispatchedMessages: number;
}

export interface SubscriberStatistics {
  timestamp: number;
  enqueueRate: number;
  dequeueRate: number;
  dispatchRate: number;
  pendingQueueSize: number;
  averageMessageSize: number;
}

export interface ConnectionFilter {
  userName?: string;
  clientId?: string;
  remoteAddress?: string;
  slow?: boolean;
  blocked?: boolean;
  active?: boolean;
}

export interface SubscriberFilter {
  destination?: string;
  destinationType?: 'queue' | 'topic';
  connectionId?: string;
  clientId?: string;
  exclusive?: boolean;
  slow?: boolean;
  subscriptionName?: string;
}

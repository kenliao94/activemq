/**
 * Broker information and statistics types
 */

export interface BrokerInfo {
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

export interface BrokerStatistics {
  timestamp: number;
  memoryUsage: number;
  storeUsage: number;
  tempUsage: number;
  connectionCount: number;
  enqueueCount: number;
  dequeueCount: number;
  messageCount: number;
  consumerCount: number;
  producerCount: number;
}

export interface BrokerHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  memoryPercentUsage: number;
  storePercentUsage: number;
  tempPercentUsage: number;
  issues: string[];
}

/**
 * Queue and Topic destination types
 */

export type DestinationType = 'queue' | 'topic';

export interface BaseDestination {
  name: string;
  type: DestinationType;
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
}

export interface Queue extends BaseDestination {
  type: 'queue';
  paused: boolean;
  dispatchCount: number;
  expiredCount: number;
  inflightCount: number;
  averageBlockedTime: number;
  totalBlockedTime: number;
}

export interface Topic extends BaseDestination {
  type: 'topic';
  subscriptionCount: number;
  durableSubscriptionCount: number;
  nonDurableSubscriptionCount: number;
}

export type Destination = Queue | Topic;

export interface DestinationStatistics {
  timestamp: number;
  enqueueCount: number;
  dequeueCount: number;
  queueSize: number;
  consumerCount: number;
  producerCount: number;
  memoryUsage: number;
  averageEnqueueTime: number;
  inflightCount?: number;
  expiredCount?: number;
}

export interface CreateDestinationRequest {
  name: string;
  type: DestinationType;
}

export interface DestinationAction {
  action: 'purge' | 'pause' | 'resume' | 'delete';
  destinationName: string;
  destinationType: DestinationType;
}

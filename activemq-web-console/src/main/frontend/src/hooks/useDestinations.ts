/**
 * Custom hook to fetch and manage queues and topics
 * Provides destination data with auto-refresh and filtering
 */

import { useCallback, useMemo } from 'react';
import { useDestinationStore } from '../stores/destinationStore';
import queueService from '../services/queueService';
import topicService from '../services/topicService';
import { usePolling } from './usePolling';
import { useUIStore } from '../stores/uiStore';
import { Queue, Topic } from '../types/destination';

export interface UseDestinationsOptions {
  /**
   * Type of destinations to fetch
   * @default 'both'
   */
  type?: 'queue' | 'topic' | 'both';
  
  /**
   * Whether to enable auto-refresh
   * @default true (uses UI store preference)
   */
  autoRefresh?: boolean;
  
  /**
   * Polling interval in milliseconds
   * @default Uses UI store preference (converted to ms)
   */
  interval?: number;
  
  /**
   * Whether to fetch data immediately on mount
   * @default true
   */
  fetchOnMount?: boolean;
  
  /**
   * Page number for pagination
   * @default 0
   */
  page?: number;
  
  /**
   * Page size for pagination
   * @default 20
   */
  pageSize?: number;
  
  /**
   * Filter string for destination names
   */
  filter?: string;
}

/**
 * Hook for fetching and managing destination (queue/topic) data
 * 
 * @param options - Configuration options
 * @returns Destination data and control functions
 * 
 * @example
 * ```tsx
 * const {
 *   queues,
 *   topics,
 *   isLoading,
 *   error,
 *   refresh,
 *   filteredQueues
 * } = useDestinations({ type: 'both', autoRefresh: true });
 * ```
 */
export function useDestinations(options: UseDestinationsOptions = {}) {
  const {
    type = 'both',
    autoRefresh: autoRefreshOption,
    interval: intervalOption,
    fetchOnMount = true,
    page = 0,
    pageSize = 20,
    filter,
  } = options;

  // Get UI preferences
  const autoRefreshEnabled = useUIStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useUIStore((state) => state.autoRefreshInterval);

  // Determine if auto-refresh should be enabled
  const shouldAutoRefresh = autoRefreshOption ?? autoRefreshEnabled;
  
  // Determine polling interval (convert seconds to milliseconds)
  const pollingInterval = intervalOption ?? (autoRefreshInterval * 1000);

  // Get destination store state and actions
  const {
    queues,
    topics,
    isLoadingQueues,
    isLoadingTopics,
    queuesError,
    topicsError,
    lastQueuesUpdate,
    lastTopicsUpdate,
    queueFilter,
    topicFilter,
    setQueues,
    setTopics,
    setLoadingQueues,
    setLoadingTopics,
    setQueuesError,
    setTopicsError,
    setQueueFilter,
    setTopicFilter,
  } = useDestinationStore();

  // Use provided filter or store filter
  const activeQueueFilter = filter ?? queueFilter;
  const activeTopicFilter = filter ?? topicFilter;

  // Fetch queues
  const fetchQueues = useCallback(async () => {
    if (type === 'topic') return; // Skip if only fetching topics
    
    setLoadingQueues(true);
    setQueuesError(null);
    
    try {
      const response = await queueService.getQueues(page, pageSize);
      // Convert service Queue type to store Queue type
      const queues: Queue[] = response.data.map(q => ({
        ...q,
        type: 'queue' as const,
        dispatchCount: 0,
        expiredCount: 0,
        inflightCount: 0,
        averageBlockedTime: 0,
        totalBlockedTime: 0,
      }));
      setQueues(queues);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch queues';
      setQueuesError(errorMessage);
      throw error;
    } finally {
      setLoadingQueues(false);
    }
  }, [type, page, pageSize, setQueues, setLoadingQueues, setQueuesError]);

  // Fetch topics
  const fetchTopics = useCallback(async () => {
    if (type === 'queue') return; // Skip if only fetching queues
    
    setLoadingTopics(true);
    setTopicsError(null);
    
    try {
      const response = await topicService.getTopics(page, pageSize);
      // Convert service Topic type to store Topic type
      const topics: Topic[] = response.data.map(t => ({
        ...t,
        type: 'topic' as const,
        subscriptionCount: 0,
        durableSubscriptionCount: 0,
        nonDurableSubscriptionCount: 0,
      }));
      setTopics(topics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch topics';
      setTopicsError(errorMessage);
      throw error;
    } finally {
      setLoadingTopics(false);
    }
  }, [type, page, pageSize, setTopics, setLoadingTopics, setTopicsError]);

  // Fetch all requested destinations
  const fetchAll = useCallback(async () => {
    const promises: Promise<void>[] = [];
    
    if (type === 'queue' || type === 'both') {
      promises.push(fetchQueues());
    }
    
    if (type === 'topic' || type === 'both') {
      promises.push(fetchTopics());
    }
    
    await Promise.allSettled(promises);
  }, [type, fetchQueues, fetchTopics]);

  // Set up polling
  const { pause, resume, toggle, trigger, isPolling } = usePolling(
    fetchAll,
    {
      interval: pollingInterval,
      enabled: shouldAutoRefresh,
      executeImmediately: fetchOnMount,
    }
  );

  // Refresh function (manually trigger fetch)
  const refresh = useCallback(async () => {
    await trigger();
  }, [trigger]);

  // Filter queues by name
  const filteredQueues = useMemo(() => {
    if (!activeQueueFilter) return queues;
    
    const lowerFilter = activeQueueFilter.toLowerCase();
    return queues.filter((queue) =>
      queue.name.toLowerCase().includes(lowerFilter)
    );
  }, [queues, activeQueueFilter]);

  // Filter topics by name
  const filteredTopics = useMemo(() => {
    if (!activeTopicFilter) return topics;
    
    const lowerFilter = activeTopicFilter.toLowerCase();
    return topics.filter((topic) =>
      topic.name.toLowerCase().includes(lowerFilter)
    );
  }, [topics, activeTopicFilter]);

  // Update filter in store
  const updateQueueFilter = useCallback((newFilter: string) => {
    setQueueFilter(newFilter);
  }, [setQueueFilter]);

  const updateTopicFilter = useCallback((newFilter: string) => {
    setTopicFilter(newFilter);
  }, [setTopicFilter]);

  // Get a specific queue by name
  const getQueue = useCallback(async (name: string): Promise<Queue> => {
    setLoadingQueues(true);
    setQueuesError(null);
    
    try {
      const queue = await queueService.getQueue(name);
      // Convert service Queue type to store Queue type
      return {
        ...queue,
        type: 'queue' as const,
        dispatchCount: 0,
        expiredCount: 0,
        inflightCount: 0,
        averageBlockedTime: 0,
        totalBlockedTime: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch queue';
      setQueuesError(errorMessage);
      throw error;
    } finally {
      setLoadingQueues(false);
    }
  }, [setLoadingQueues, setQueuesError]);

  // Get a specific topic by name
  const getTopic = useCallback(async (name: string): Promise<Topic> => {
    setLoadingTopics(true);
    setTopicsError(null);
    
    try {
      const topic = await topicService.getTopic(name);
      // Convert service Topic type to store Topic type
      return {
        ...topic,
        type: 'topic' as const,
        subscriptionCount: 0,
        durableSubscriptionCount: 0,
        nonDurableSubscriptionCount: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch topic';
      setTopicsError(errorMessage);
      throw error;
    } finally {
      setLoadingTopics(false);
    }
  }, [setLoadingTopics, setTopicsError]);

  // Create a new queue
  const createQueue = useCallback(async (name: string) => {
    try {
      await queueService.createQueue(name);
      await fetchQueues(); // Refresh queue list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create queue';
      setQueuesError(errorMessage);
      throw error;
    }
  }, [fetchQueues, setQueuesError]);

  // Create a new topic
  const createTopic = useCallback(async (name: string) => {
    try {
      await topicService.createTopic(name);
      await fetchTopics(); // Refresh topic list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create topic';
      setTopicsError(errorMessage);
      throw error;
    }
  }, [fetchTopics, setTopicsError]);

  // Delete a queue
  const deleteQueue = useCallback(async (name: string) => {
    try {
      await queueService.deleteQueue(name);
      await fetchQueues(); // Refresh queue list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete queue';
      setQueuesError(errorMessage);
      throw error;
    }
  }, [fetchQueues, setQueuesError]);

  // Delete a topic
  const deleteTopic = useCallback(async (name: string) => {
    try {
      await topicService.deleteTopic(name);
      await fetchTopics(); // Refresh topic list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete topic';
      setTopicsError(errorMessage);
      throw error;
    }
  }, [fetchTopics, setTopicsError]);

  // Purge a queue
  const purgeQueue = useCallback(async (name: string) => {
    try {
      await queueService.purgeQueue(name);
      await fetchQueues(); // Refresh queue list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to purge queue';
      setQueuesError(errorMessage);
      throw error;
    }
  }, [fetchQueues, setQueuesError]);

  // Pause a queue
  const pauseQueue = useCallback(async (name: string) => {
    try {
      await queueService.pauseQueue(name);
      await fetchQueues(); // Refresh queue list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause queue';
      setQueuesError(errorMessage);
      throw error;
    }
  }, [fetchQueues, setQueuesError]);

  // Resume a queue
  const resumeQueue = useCallback(async (name: string) => {
    try {
      await queueService.resumeQueue(name);
      await fetchQueues(); // Refresh queue list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resume queue';
      setQueuesError(errorMessage);
      throw error;
    }
  }, [fetchQueues, setQueuesError]);

  // Determine overall loading state
  const isLoading = 
    (type === 'queue' || type === 'both' ? isLoadingQueues : false) ||
    (type === 'topic' || type === 'both' ? isLoadingTopics : false);

  // Determine overall error state
  const error = 
    (type === 'queue' || type === 'both' ? queuesError : null) ||
    (type === 'topic' || type === 'both' ? topicsError : null);

  // Determine last update time
  const lastUpdate = Math.max(
    type === 'queue' || type === 'both' ? (lastQueuesUpdate || 0) : 0,
    type === 'topic' || type === 'both' ? (lastTopicsUpdate || 0) : 0
  ) || null;

  return {
    // Data
    queues: type === 'topic' ? [] : queues,
    topics: type === 'queue' ? [] : topics,
    filteredQueues: type === 'topic' ? [] : filteredQueues,
    filteredTopics: type === 'queue' ? [] : filteredTopics,
    
    // Loading states
    isLoading,
    isLoadingQueues: type === 'topic' ? false : isLoadingQueues,
    isLoadingTopics: type === 'queue' ? false : isLoadingTopics,
    
    // Error states
    error,
    queuesError: type === 'topic' ? null : queuesError,
    topicsError: type === 'queue' ? null : topicsError,
    
    // Metadata
    lastUpdate,
    lastQueuesUpdate: type === 'topic' ? null : lastQueuesUpdate,
    lastTopicsUpdate: type === 'queue' ? null : lastTopicsUpdate,
    
    // Fetch functions
    refresh,
    fetchQueues: type === 'topic' ? undefined : fetchQueues,
    fetchTopics: type === 'queue' ? undefined : fetchTopics,
    getQueue: type === 'topic' ? undefined : getQueue,
    getTopic: type === 'queue' ? undefined : getTopic,
    
    // CRUD operations
    createQueue: type === 'topic' ? undefined : createQueue,
    createTopic: type === 'queue' ? undefined : createTopic,
    deleteQueue: type === 'topic' ? undefined : deleteQueue,
    deleteTopic: type === 'queue' ? undefined : deleteTopic,
    
    // Queue operations
    purgeQueue: type === 'topic' ? undefined : purgeQueue,
    pauseQueue: type === 'topic' ? undefined : pauseQueue,
    resumeQueue: type === 'topic' ? undefined : resumeQueue,
    
    // Filter functions
    queueFilter: type === 'topic' ? '' : activeQueueFilter,
    topicFilter: type === 'queue' ? '' : activeTopicFilter,
    setQueueFilter: type === 'topic' ? undefined : updateQueueFilter,
    setTopicFilter: type === 'queue' ? undefined : updateTopicFilter,
    
    // Polling controls
    pauseAutoRefresh: pause,
    resumeAutoRefresh: resume,
    toggleAutoRefresh: toggle,
    isAutoRefreshing: isPolling,
  };
}

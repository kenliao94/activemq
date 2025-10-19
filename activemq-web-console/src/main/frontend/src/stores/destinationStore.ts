/**
 * Destination (Queue/Topic) state management store using Zustand
 * Manages queues, topics, and their statistics
 */

import { create } from 'zustand';
import { Queue, Topic, Destination, DestinationStatistics, DestinationType } from '../types/destination';

interface DestinationState {
  // Queue and Topic data
  queues: Queue[];
  topics: Topic[];
  
  // Selected destination for detail view
  selectedDestination: Destination | null;
  selectedDestinationType: DestinationType | null;
  
  // Statistics for selected destination
  destinationStatistics: DestinationStatistics[];
  
  // Loading states
  isLoadingQueues: boolean;
  isLoadingTopics: boolean;
  isLoadingDestination: boolean;
  isLoadingStatistics: boolean;
  
  // Error states
  queuesError: string | null;
  topicsError: string | null;
  destinationError: string | null;
  statisticsError: string | null;
  
  // Last update timestamps
  lastQueuesUpdate: number | null;
  lastTopicsUpdate: number | null;
  lastDestinationUpdate: number | null;
  lastStatisticsUpdate: number | null;
  
  // Filter and sort state
  queueFilter: string;
  topicFilter: string;
  queueSortField: string;
  queueSortOrder: 'asc' | 'desc';
  topicSortField: string;
  topicSortOrder: 'asc' | 'desc';
  
  // Actions - Queues
  setQueues: (queues: Queue[]) => void;
  addQueue: (queue: Queue) => void;
  updateQueue: (name: string, updates: Partial<Queue>) => void;
  removeQueue: (name: string) => void;
  
  // Actions - Topics
  setTopics: (topics: Topic[]) => void;
  addTopic: (topic: Topic) => void;
  updateTopic: (name: string, updates: Partial<Topic>) => void;
  removeTopic: (name: string) => void;
  
  // Actions - Selected destination
  setSelectedDestination: (destination: Destination | null, type: DestinationType | null) => void;
  clearSelectedDestination: () => void;
  
  // Actions - Statistics
  setDestinationStatistics: (statistics: DestinationStatistics[]) => void;
  addDestinationStatistic: (statistic: DestinationStatistics) => void;
  clearDestinationStatistics: () => void;
  
  // Actions - Loading states
  setLoadingQueues: (loading: boolean) => void;
  setLoadingTopics: (loading: boolean) => void;
  setLoadingDestination: (loading: boolean) => void;
  setLoadingStatistics: (loading: boolean) => void;
  
  // Actions - Error states
  setQueuesError: (error: string | null) => void;
  setTopicsError: (error: string | null) => void;
  setDestinationError: (error: string | null) => void;
  setStatisticsError: (error: string | null) => void;
  
  // Actions - Filters and sorting
  setQueueFilter: (filter: string) => void;
  setTopicFilter: (filter: string) => void;
  setQueueSort: (field: string, order: 'asc' | 'desc') => void;
  setTopicSort: (field: string, order: 'asc' | 'desc') => void;
  
  // Actions - Clear data
  clearQueues: () => void;
  clearTopics: () => void;
  clearAllDestinations: () => void;
  clearErrors: () => void;
}

export const useDestinationStore = create<DestinationState>((set) => ({
  // Initial state
  queues: [],
  topics: [],
  selectedDestination: null,
  selectedDestinationType: null,
  destinationStatistics: [],
  
  isLoadingQueues: false,
  isLoadingTopics: false,
  isLoadingDestination: false,
  isLoadingStatistics: false,
  
  queuesError: null,
  topicsError: null,
  destinationError: null,
  statisticsError: null,
  
  lastQueuesUpdate: null,
  lastTopicsUpdate: null,
  lastDestinationUpdate: null,
  lastStatisticsUpdate: null,
  
  queueFilter: '',
  topicFilter: '',
  queueSortField: 'name',
  queueSortOrder: 'asc',
  topicSortField: 'name',
  topicSortOrder: 'asc',
  
  // Queue actions
  setQueues: (queues) =>
    set({
      queues,
      lastQueuesUpdate: Date.now(),
      queuesError: null,
    }),
  
  addQueue: (queue) =>
    set((state) => ({
      queues: [...state.queues, queue],
      lastQueuesUpdate: Date.now(),
    })),
  
  updateQueue: (name, updates) =>
    set((state) => ({
      queues: state.queues.map((q) =>
        q.name === name ? { ...q, ...updates } : q
      ),
      lastQueuesUpdate: Date.now(),
    })),
  
  removeQueue: (name) =>
    set((state) => ({
      queues: state.queues.filter((q) => q.name !== name),
      lastQueuesUpdate: Date.now(),
    })),
  
  // Topic actions
  setTopics: (topics) =>
    set({
      topics,
      lastTopicsUpdate: Date.now(),
      topicsError: null,
    }),
  
  addTopic: (topic) =>
    set((state) => ({
      topics: [...state.topics, topic],
      lastTopicsUpdate: Date.now(),
    })),
  
  updateTopic: (name, updates) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.name === name ? { ...t, ...updates } : t
      ),
      lastTopicsUpdate: Date.now(),
    })),
  
  removeTopic: (name) =>
    set((state) => ({
      topics: state.topics.filter((t) => t.name !== name),
      lastTopicsUpdate: Date.now(),
    })),
  
  // Selected destination actions
  setSelectedDestination: (destination, type) =>
    set({
      selectedDestination: destination,
      selectedDestinationType: type,
      lastDestinationUpdate: Date.now(),
      destinationError: null,
    }),
  
  clearSelectedDestination: () =>
    set({
      selectedDestination: null,
      selectedDestinationType: null,
      destinationStatistics: [],
      lastDestinationUpdate: null,
      lastStatisticsUpdate: null,
    }),
  
  // Statistics actions
  setDestinationStatistics: (statistics) =>
    set({
      destinationStatistics: statistics,
      lastStatisticsUpdate: Date.now(),
      statisticsError: null,
    }),
  
  addDestinationStatistic: (statistic) =>
    set((state) => {
      // Keep only the last 100 statistics to prevent memory issues
      const maxStatistics = 100;
      const newStatistics = [...state.destinationStatistics, statistic];
      
      if (newStatistics.length > maxStatistics) {
        newStatistics.shift();
      }
      
      return {
        destinationStatistics: newStatistics,
        lastStatisticsUpdate: Date.now(),
        statisticsError: null,
      };
    }),
  
  clearDestinationStatistics: () =>
    set({
      destinationStatistics: [],
      lastStatisticsUpdate: null,
    }),
  
  // Loading state actions
  setLoadingQueues: (loading) =>
    set({ isLoadingQueues: loading }),
  
  setLoadingTopics: (loading) =>
    set({ isLoadingTopics: loading }),
  
  setLoadingDestination: (loading) =>
    set({ isLoadingDestination: loading }),
  
  setLoadingStatistics: (loading) =>
    set({ isLoadingStatistics: loading }),
  
  // Error state actions
  setQueuesError: (error) =>
    set({
      queuesError: error,
      isLoadingQueues: false,
    }),
  
  setTopicsError: (error) =>
    set({
      topicsError: error,
      isLoadingTopics: false,
    }),
  
  setDestinationError: (error) =>
    set({
      destinationError: error,
      isLoadingDestination: false,
    }),
  
  setStatisticsError: (error) =>
    set({
      statisticsError: error,
      isLoadingStatistics: false,
    }),
  
  // Filter and sort actions
  setQueueFilter: (filter) =>
    set({ queueFilter: filter }),
  
  setTopicFilter: (filter) =>
    set({ topicFilter: filter }),
  
  setQueueSort: (field, order) =>
    set({
      queueSortField: field,
      queueSortOrder: order,
    }),
  
  setTopicSort: (field, order) =>
    set({
      topicSortField: field,
      topicSortOrder: order,
    }),
  
  // Clear data actions
  clearQueues: () =>
    set({
      queues: [],
      lastQueuesUpdate: null,
    }),
  
  clearTopics: () =>
    set({
      topics: [],
      lastTopicsUpdate: null,
    }),
  
  clearAllDestinations: () =>
    set({
      queues: [],
      topics: [],
      selectedDestination: null,
      selectedDestinationType: null,
      destinationStatistics: [],
      lastQueuesUpdate: null,
      lastTopicsUpdate: null,
      lastDestinationUpdate: null,
      lastStatisticsUpdate: null,
    }),
  
  clearErrors: () =>
    set({
      queuesError: null,
      topicsError: null,
      destinationError: null,
      statisticsError: null,
    }),
}));

/**
 * Custom hook to fetch and manage broker data
 * Provides broker information, statistics, and health with auto-refresh
 */

import { useCallback } from 'react';
import { useBrokerStore } from '../stores/brokerStore';
import brokerService from '../services/brokerService';
import { usePolling } from './usePolling';
import { useUIStore } from '../stores/uiStore';
import { BrokerStatistics, BrokerHealth } from '../types/broker';

export interface UseBrokerInfoOptions {
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
   * Whether to fetch broker statistics
   * @default false
   */
  includeStatistics?: boolean;
  
  /**
   * Whether to fetch broker health
   * @default false
   */
  includeHealth?: boolean;
}

/**
 * Hook for fetching and managing broker information
 * 
 * @param options - Configuration options
 * @returns Broker data and control functions
 * 
 * @example
 * ```tsx
 * const {
 *   brokerInfo,
 *   isLoading,
 *   error,
 *   refresh,
 *   lastUpdate
 * } = useBrokerInfo({ autoRefresh: true });
 * ```
 */
export function useBrokerInfo(options: UseBrokerInfoOptions = {}) {
  const {
    autoRefresh: autoRefreshOption,
    interval: intervalOption,
    fetchOnMount = true,
    includeStatistics = false,
    includeHealth = false,
  } = options;

  // Get UI preferences
  const autoRefreshEnabled = useUIStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useUIStore((state) => state.autoRefreshInterval);

  // Determine if auto-refresh should be enabled
  const shouldAutoRefresh = autoRefreshOption ?? autoRefreshEnabled;
  
  // Determine polling interval (convert seconds to milliseconds)
  const pollingInterval = intervalOption ?? (autoRefreshInterval * 1000);

  // Get broker store state and actions
  const {
    brokerInfo,
    brokerStatistics,
    brokerHealth,
    isLoadingInfo,
    isLoadingStatistics,
    isLoadingHealth,
    infoError,
    statisticsError,
    healthError,
    lastInfoUpdate,
    lastStatisticsUpdate,
    lastHealthUpdate,
    setBrokerInfo,
    setBrokerStatistics,
    setBrokerHealth,
    setLoadingInfo,
    setLoadingStatistics,
    setLoadingHealth,
    setInfoError,
    setStatisticsError,
    setHealthError,
  } = useBrokerStore();

  // Fetch broker info
  const fetchBrokerInfo = useCallback(async () => {
    setLoadingInfo(true);
    setInfoError(null);
    
    try {
      const data = await brokerService.getBrokerInfo();
      setBrokerInfo(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch broker info';
      setInfoError(errorMessage);
      throw error;
    } finally {
      setLoadingInfo(false);
    }
  }, [setBrokerInfo, setLoadingInfo, setInfoError]);

  // Fetch broker statistics
  const fetchBrokerStatistics = useCallback(async () => {
    setLoadingStatistics(true);
    setStatisticsError(null);
    
    try {
      const data = await brokerService.getBrokerStatistics();
      // Convert to BrokerStatistics format
      const statistics: BrokerStatistics = {
        timestamp: Date.now(),
        memoryUsage: 0,
        storeUsage: 0,
        tempUsage: 0,
        connectionCount: 0,
        enqueueCount: 0,
        dequeueCount: 0,
        messageCount: 0,
        consumerCount: 0,
        producerCount: 0,
        ...data,
      };
      setBrokerStatistics([statistics]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch broker statistics';
      setStatisticsError(errorMessage);
      throw error;
    } finally {
      setLoadingStatistics(false);
    }
  }, [setBrokerStatistics, setLoadingStatistics, setStatisticsError]);

  // Fetch broker health
  const fetchBrokerHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError(null);
    
    try {
      const data = await brokerService.getBrokerHealth();
      // Convert to BrokerHealth format
      const health: BrokerHealth = {
        uptime: 0,
        memoryPercentUsage: 0,
        storePercentUsage: 0,
        tempPercentUsage: 0,
        issues: [],
        ...data,
        status: (data.status as 'healthy' | 'warning' | 'error') || 'healthy',
      };
      setBrokerHealth(health);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch broker health';
      setHealthError(errorMessage);
      throw error;
    } finally {
      setLoadingHealth(false);
    }
  }, [setBrokerHealth, setLoadingHealth, setHealthError]);

  // Fetch all requested data
  const fetchAll = useCallback(async () => {
    const promises: Promise<void>[] = [fetchBrokerInfo()];
    
    if (includeStatistics) {
      promises.push(fetchBrokerStatistics());
    }
    
    if (includeHealth) {
      promises.push(fetchBrokerHealth());
    }
    
    await Promise.allSettled(promises);
  }, [fetchBrokerInfo, fetchBrokerStatistics, fetchBrokerHealth, includeStatistics, includeHealth]);

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

  // Determine overall loading state
  const isLoading = isLoadingInfo || 
    (includeStatistics && isLoadingStatistics) || 
    (includeHealth && isLoadingHealth);

  // Determine overall error state
  const error = infoError || 
    (includeStatistics ? statisticsError : null) || 
    (includeHealth ? healthError : null);

  // Determine last update time
  const lastUpdate = Math.max(
    lastInfoUpdate || 0,
    includeStatistics ? (lastStatisticsUpdate || 0) : 0,
    includeHealth ? (lastHealthUpdate || 0) : 0
  ) || null;

  return {
    // Data
    brokerInfo,
    brokerStatistics: includeStatistics ? brokerStatistics : undefined,
    brokerHealth: includeHealth ? brokerHealth : undefined,
    
    // Loading states
    isLoading,
    isLoadingInfo,
    isLoadingStatistics: includeStatistics ? isLoadingStatistics : undefined,
    isLoadingHealth: includeHealth ? isLoadingHealth : undefined,
    
    // Error states
    error,
    infoError,
    statisticsError: includeStatistics ? statisticsError : undefined,
    healthError: includeHealth ? healthError : undefined,
    
    // Metadata
    lastUpdate,
    lastInfoUpdate,
    lastStatisticsUpdate: includeStatistics ? lastStatisticsUpdate : undefined,
    lastHealthUpdate: includeHealth ? lastHealthUpdate : undefined,
    
    // Control functions
    refresh,
    fetchBrokerInfo,
    fetchBrokerStatistics: includeStatistics ? fetchBrokerStatistics : undefined,
    fetchBrokerHealth: includeHealth ? fetchBrokerHealth : undefined,
    
    // Polling controls
    pauseAutoRefresh: pause,
    resumeAutoRefresh: resume,
    toggleAutoRefresh: toggle,
    isAutoRefreshing: isPolling,
  };
}

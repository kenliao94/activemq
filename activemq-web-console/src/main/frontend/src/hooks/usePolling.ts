/**
 * Custom hook for auto-refresh functionality with configurable intervals
 * Provides polling mechanism for real-time data updates
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UsePollingOptions {
  /**
   * Polling interval in milliseconds
   * @default 5000
   */
  interval?: number;
  
  /**
   * Whether polling is enabled
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Whether to execute immediately on mount
   * @default true
   */
  executeImmediately?: boolean;
  
  /**
   * Callback to execute on error
   */
  onError?: (error: Error) => void;
}

/**
 * Hook for polling data at regular intervals
 * 
 * @param callback - Function to execute on each poll
 * @param options - Polling configuration options
 * 
 * @example
 * ```tsx
 * const { pause, resume, isPolling } = usePolling(
 *   async () => {
 *     const data = await fetchBrokerInfo();
 *     setBrokerInfo(data);
 *   },
 *   { interval: 5000, enabled: true }
 * );
 * ```
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 5000,
    enabled = true,
    executeImmediately = true,
    onError,
  } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);
  const isPollingRef = useRef(enabled);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Execute the callback with error handling
  const executeCallback = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('Polling error:', error);
      }
    }
  }, [onError]);

  // Start polling
  const start = useCallback(() => {
    if (intervalRef.current) {
      return; // Already polling
    }

    isPollingRef.current = true;

    // Execute immediately if requested
    if (executeImmediately) {
      executeCallback();
    }

    // Set up interval
    intervalRef.current = setInterval(() => {
      executeCallback();
    }, interval);
  }, [interval, executeImmediately, executeCallback]);

  // Stop polling
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  // Pause polling (alias for stop)
  const pause = useCallback(() => {
    stop();
  }, [stop]);

  // Resume polling (alias for start)
  const resume = useCallback(() => {
    start();
  }, [start]);

  // Toggle polling
  const toggle = useCallback(() => {
    if (isPollingRef.current) {
      pause();
    } else {
      resume();
    }
  }, [pause, resume]);

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    // Cleanup on unmount
    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  // Update interval if it changes
  useEffect(() => {
    if (enabled && intervalRef.current) {
      // Restart with new interval
      stop();
      start();
    }
  }, [interval, enabled, start, stop]);

  return {
    /**
     * Whether polling is currently active
     */
    isPolling: isPollingRef.current,
    
    /**
     * Pause polling
     */
    pause,
    
    /**
     * Resume polling
     */
    resume,
    
    /**
     * Toggle polling on/off
     */
    toggle,
    
    /**
     * Manually trigger a poll
     */
    trigger: executeCallback,
  };
}

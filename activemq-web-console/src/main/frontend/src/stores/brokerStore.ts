/**
 * Broker state management store using Zustand
 * Manages broker information, statistics, and health data
 */

import { create } from 'zustand';
import { BrokerInfo, BrokerStatistics, BrokerHealth } from '../types/broker';

interface BrokerState {
  // Broker data
  brokerInfo: BrokerInfo | null;
  brokerStatistics: BrokerStatistics[];
  brokerHealth: BrokerHealth | null;
  
  // Loading states
  isLoadingInfo: boolean;
  isLoadingStatistics: boolean;
  isLoadingHealth: boolean;
  
  // Error states
  infoError: string | null;
  statisticsError: string | null;
  healthError: string | null;
  
  // Last update timestamps
  lastInfoUpdate: number | null;
  lastStatisticsUpdate: number | null;
  lastHealthUpdate: number | null;
  
  // Actions
  setBrokerInfo: (info: BrokerInfo) => void;
  setBrokerStatistics: (statistics: BrokerStatistics[]) => void;
  addBrokerStatistic: (statistic: BrokerStatistics) => void;
  setBrokerHealth: (health: BrokerHealth) => void;
  
  setLoadingInfo: (loading: boolean) => void;
  setLoadingStatistics: (loading: boolean) => void;
  setLoadingHealth: (loading: boolean) => void;
  
  setInfoError: (error: string | null) => void;
  setStatisticsError: (error: string | null) => void;
  setHealthError: (error: string | null) => void;
  
  clearBrokerData: () => void;
  clearErrors: () => void;
}

export const useBrokerStore = create<BrokerState>((set) => ({
  // Initial state
  brokerInfo: null,
  brokerStatistics: [],
  brokerHealth: null,
  
  isLoadingInfo: false,
  isLoadingStatistics: false,
  isLoadingHealth: false,
  
  infoError: null,
  statisticsError: null,
  healthError: null,
  
  lastInfoUpdate: null,
  lastStatisticsUpdate: null,
  lastHealthUpdate: null,
  
  // Actions
  setBrokerInfo: (info) =>
    set({
      brokerInfo: info,
      lastInfoUpdate: Date.now(),
      infoError: null,
    }),
  
  setBrokerStatistics: (statistics) =>
    set({
      brokerStatistics: statistics,
      lastStatisticsUpdate: Date.now(),
      statisticsError: null,
    }),
  
  addBrokerStatistic: (statistic) =>
    set((state) => {
      // Keep only the last 100 statistics to prevent memory issues
      const maxStatistics = 100;
      const newStatistics = [...state.brokerStatistics, statistic];
      
      if (newStatistics.length > maxStatistics) {
        newStatistics.shift();
      }
      
      return {
        brokerStatistics: newStatistics,
        lastStatisticsUpdate: Date.now(),
        statisticsError: null,
      };
    }),
  
  setBrokerHealth: (health) =>
    set({
      brokerHealth: health,
      lastHealthUpdate: Date.now(),
      healthError: null,
    }),
  
  setLoadingInfo: (loading) =>
    set({ isLoadingInfo: loading }),
  
  setLoadingStatistics: (loading) =>
    set({ isLoadingStatistics: loading }),
  
  setLoadingHealth: (loading) =>
    set({ isLoadingHealth: loading }),
  
  setInfoError: (error) =>
    set({
      infoError: error,
      isLoadingInfo: false,
    }),
  
  setStatisticsError: (error) =>
    set({
      statisticsError: error,
      isLoadingStatistics: false,
    }),
  
  setHealthError: (error) =>
    set({
      healthError: error,
      isLoadingHealth: false,
    }),
  
  clearBrokerData: () =>
    set({
      brokerInfo: null,
      brokerStatistics: [],
      brokerHealth: null,
      lastInfoUpdate: null,
      lastStatisticsUpdate: null,
      lastHealthUpdate: null,
    }),
  
  clearErrors: () =>
    set({
      infoError: null,
      statisticsError: null,
      healthError: null,
    }),
}));

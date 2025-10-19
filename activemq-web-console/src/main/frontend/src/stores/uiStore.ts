/**
 * UI state management store using Zustand
 * Manages theme, sidebar, and UI preferences with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UIPreferences {
  theme: ThemeMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number; // in seconds
  compactMode: boolean;
  showTimestamps: boolean;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  tablePageSize: number;
  chartAnimations: boolean;
  soundNotifications: boolean;
  desktopNotifications: boolean;
}

interface UIState extends UIPreferences {
  // Transient UI state (not persisted)
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Modal and dialog state
  activeModal: string | null;
  modalData: any;
  
  // Notification state
  notifications: UINotification[];
  
  // Loading overlay
  globalLoading: boolean;
  globalLoadingMessage: string | null;
  
  // Actions - Theme
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Actions - Sidebar
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  
  // Actions - Auto-refresh
  setAutoRefreshEnabled: (enabled: boolean) => void;
  toggleAutoRefresh: () => void;
  setAutoRefreshInterval: (interval: number) => void;
  
  // Actions - Display preferences
  setCompactMode: (compact: boolean) => void;
  toggleCompactMode: () => void;
  setShowTimestamps: (show: boolean) => void;
  setDateFormat: (format: string) => void;
  setTimeFormat: (format: '12h' | '24h') => void;
  setTablePageSize: (size: number) => void;
  setChartAnimations: (enabled: boolean) => void;
  
  // Actions - Notifications
  setSoundNotifications: (enabled: boolean) => void;
  setDesktopNotifications: (enabled: boolean) => void;
  addNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions - Responsive
  setDeviceType: (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => void;
  
  // Actions - Modal
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  
  // Actions - Global loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Actions - Reset
  resetPreferences: () => void;
}

export interface UINotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  timestamp: number;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Default preferences
const defaultPreferences: UIPreferences = {
  theme: 'system',
  sidebarOpen: true,
  sidebarCollapsed: false,
  autoRefreshEnabled: true,
  autoRefreshInterval: 5,
  compactMode: false,
  showTimestamps: true,
  dateFormat: 'MMM dd, yyyy',
  timeFormat: '24h',
  tablePageSize: 25,
  chartAnimations: true,
  soundNotifications: false,
  desktopNotifications: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state with defaults
      ...defaultPreferences,
      
      // Transient state (not persisted)
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      activeModal: null,
      modalData: null,
      notifications: [],
      globalLoading: false,
      globalLoadingMessage: null,
      
      // Theme actions
      setTheme: (theme) =>
        set({ theme }),
      
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      
      // Sidebar actions
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }),
      
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Auto-refresh actions
      setAutoRefreshEnabled: (enabled) =>
        set({ autoRefreshEnabled: enabled }),
      
      toggleAutoRefresh: () =>
        set((state) => ({ autoRefreshEnabled: !state.autoRefreshEnabled })),
      
      setAutoRefreshInterval: (interval) =>
        set({ autoRefreshInterval: Math.max(1, interval) }),
      
      // Display preference actions
      setCompactMode: (compact) =>
        set({ compactMode: compact }),
      
      toggleCompactMode: () =>
        set((state) => ({ compactMode: !state.compactMode })),
      
      setShowTimestamps: (show) =>
        set({ showTimestamps: show }),
      
      setDateFormat: (format) =>
        set({ dateFormat: format }),
      
      setTimeFormat: (format) =>
        set({ timeFormat: format }),
      
      setTablePageSize: (size) =>
        set({ tablePageSize: Math.max(10, size) }),
      
      setChartAnimations: (enabled) =>
        set({ chartAnimations: enabled }),
      
      // Notification preference actions
      setSoundNotifications: (enabled) =>
        set({ soundNotifications: enabled }),
      
      setDesktopNotifications: (enabled) =>
        set({ desktopNotifications: enabled }),
      
      addNotification: (notification) =>
        set((state) => {
          const newNotification: UINotification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
          };
          
          return {
            notifications: [...state.notifications, newNotification],
          };
        }),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      
      clearNotifications: () =>
        set({ notifications: [] }),
      
      // Responsive actions
      setDeviceType: (isMobile, isTablet, isDesktop) =>
        set({
          isMobile,
          isTablet,
          isDesktop,
          // Auto-close sidebar on mobile
          sidebarOpen: isMobile ? false : get().sidebarOpen,
        }),
      
      // Modal actions
      openModal: (modalName, data) =>
        set({
          activeModal: modalName,
          modalData: data,
        }),
      
      closeModal: () =>
        set({
          activeModal: null,
          modalData: null,
        }),
      
      // Global loading actions
      setGlobalLoading: (loading, message) =>
        set({
          globalLoading: loading,
          globalLoadingMessage: message || null,
        }),
      
      // Reset actions
      resetPreferences: () =>
        set({
          ...defaultPreferences,
          // Keep device type and transient state
          isMobile: get().isMobile,
          isTablet: get().isTablet,
          isDesktop: get().isDesktop,
        }),
    }),
    {
      name: 'activemq-ui-preferences',
      storage: createJSONStorage(() => localStorage),
      // Only persist UI preferences, not transient state
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        autoRefreshEnabled: state.autoRefreshEnabled,
        autoRefreshInterval: state.autoRefreshInterval,
        compactMode: state.compactMode,
        showTimestamps: state.showTimestamps,
        dateFormat: state.dateFormat,
        timeFormat: state.timeFormat,
        tablePageSize: state.tablePageSize,
        chartAnimations: state.chartAnimations,
        soundNotifications: state.soundNotifications,
        desktopNotifications: state.desktopNotifications,
      }),
    }
  )
);

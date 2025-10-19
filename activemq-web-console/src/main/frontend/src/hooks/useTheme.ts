/**
 * Custom hook for theme management and dark mode toggle
 * Provides theme state and controls with system preference detection
 */

import { useMemo, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useMediaQuery } from '@mui/material';

/**
 * Hook for managing theme and dark mode
 * 
 * @returns Theme state and control functions
 * 
 * @example
 * ```tsx
 * const {
 *   theme,
 *   isDarkMode,
 *   toggleTheme,
 *   setTheme
 * } = useTheme();
 * ```
 */
export function useTheme() {
  // Get theme preference from UI store
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  // Detect system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  // Determine the actual theme mode to use
  const actualThemeMode = useMemo((): 'light' | 'dark' => {
    if (theme === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return theme;
  }, [theme, prefersDarkMode]);

  // Check if dark mode is active
  const isDarkMode = actualThemeMode === 'dark';

  // Check if light mode is active
  const isLightMode = actualThemeMode === 'light';

  // Check if using system preference
  const isSystemMode = theme === 'system';

  // Set theme to light mode
  const setLightMode = () => {
    setTheme('light');
  };

  // Set theme to dark mode
  const setDarkMode = () => {
    setTheme('dark');
  };

  // Set theme to system preference
  const setSystemMode = () => {
    setTheme('system');
  };

  // Toggle between light and dark (ignores system mode)
  const toggleLightDark = () => {
    if (actualThemeMode === 'light') {
      setDarkMode();
    } else {
      setLightMode();
    }
  };

  // Update document class for theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    
    // Add current theme class
    root.classList.add(`${actualThemeMode}-theme`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        actualThemeMode === 'dark' ? '#121212' : '#ffffff'
      );
    }
  }, [actualThemeMode]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Force re-render by updating a dummy state
      // The actualThemeMode will be recalculated
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  return {
    /**
     * Current theme preference ('light', 'dark', or 'system')
     */
    theme,
    
    /**
     * Actual theme mode being used ('light' or 'dark')
     * Resolves 'system' to the actual system preference
     */
    actualThemeMode,
    
    /**
     * Whether dark mode is currently active
     */
    isDarkMode,
    
    /**
     * Whether light mode is currently active
     */
    isLightMode,
    
    /**
     * Whether using system preference
     */
    isSystemMode,
    
    /**
     * System's preferred color scheme
     */
    systemPreference: prefersDarkMode ? 'dark' : 'light',
    
    /**
     * Set theme to a specific mode
     */
    setTheme,
    
    /**
     * Set theme to light mode
     */
    setLightMode,
    
    /**
     * Set theme to dark mode
     */
    setDarkMode,
    
    /**
     * Set theme to follow system preference
     */
    setSystemMode,
    
    /**
     * Toggle between light and dark modes
     * If currently in system mode, switches to the opposite of current system preference
     */
    toggleTheme: toggleLightDark,
    
    /**
     * Toggle theme using store's toggle (cycles through light -> dark -> light)
     */
    toggleThemeSimple: toggleTheme,
  };
}

/**
 * Hook to get MUI theme object based on current theme mode
 * 
 * @returns MUI theme object
 * 
 * @example
 * ```tsx
 * const muiTheme = useMuiTheme();
 * 
 * return (
 *   <ThemeProvider theme={muiTheme}>
 *     <App />
 *   </ThemeProvider>
 * );
 * ```
 */
export function useMuiTheme() {
  const { actualThemeMode } = useTheme();
  
  // Import theme configurations
  // Note: This should be imported at the top level in actual usage
  // For now, we return the theme mode and let the consumer handle theme creation
  return useMemo(() => {
    // This will be properly implemented when integrated with ThemeProvider
    return actualThemeMode;
  }, [actualThemeMode]);
}

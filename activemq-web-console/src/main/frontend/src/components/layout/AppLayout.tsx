/**
 * Main application layout wrapper
 * Combines sidebar, header, footer, and main content area with responsive behavior
 */

import { useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUIStore } from '../../stores/uiStore';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

export const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const { sidebarCollapsed, setDeviceType } = useUIStore();

  // Update device type in store when breakpoints change
  useEffect(() => {
    setDeviceType(isMobile, isTablet, isDesktop);
  }, [isMobile, isTablet, isDesktop, setDeviceType]);

  const drawerWidth = isMobile ? 0 : (sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Header */}
        <Header />

        {/* Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Account for fixed header height
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

/**
 * Header component with breadcrumbs and theme toggle
 * Displays app bar with navigation breadcrumbs and user controls
 */

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

// Map paths to breadcrumb labels
const pathLabels: Record<string, string> = {
  '': 'Dashboard',
  'queues': 'Queues',
  'topics': 'Topics',
  'messages': 'Messages',
  'connections': 'Connections',
  'settings': 'Settings',
  'send': 'Send Message',
  'graphs': 'Graphs',
};

export const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    theme: themeMode,
    toggleTheme,
    autoRefreshEnabled,
    toggleAutoRefresh,
  } = useUIStore();

  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbs: Array<{
      label: string;
      path: string;
      icon?: React.ReactNode;
    }> = [
      {
        label: 'Home',
        path: '/',
        icon: <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />,
      },
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  const handleRefresh = () => {
    // Trigger a page refresh or data reload
    window.location.reload();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Breadcrumbs */}
        <Box sx={{ flexGrow: 1 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                mx: 0.5,
              },
            }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              
              if (isLast) {
                return (
                  <Box
                    key={crumb.path}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.primary',
                    }}
                  >
                    {crumb.icon}
                    <Typography variant="body1" fontWeight={600}>
                      {crumb.label}
                    </Typography>
                  </Box>
                );
              }

              return (
                <Link
                  key={crumb.path}
                  component="button"
                  variant="body2"
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Auto-refresh toggle */}
          {!isMobile && (
            <Tooltip title={autoRefreshEnabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}>
              <IconButton
                color={autoRefreshEnabled ? 'primary' : 'default'}
                onClick={toggleAutoRefresh}
                size="medium"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Theme toggle */}
          <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              size="medium"
              aria-label="toggle theme"
            >
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Manual refresh */}
          <Tooltip title="Refresh page">
            <IconButton
              color="inherit"
              onClick={handleRefresh}
              size="medium"
              aria-label="refresh"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

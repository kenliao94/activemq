/**
 * Sidebar navigation component with responsive behavior
 * Displays navigation menu with mobile hamburger menu support
 */

import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Queue as QueueIcon,
  Topic as TopicIcon,
  Message as MessageIcon,
  Send as SendIcon,
  Link as ConnectionIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    id: 'queues',
    label: 'Queues',
    icon: <QueueIcon />,
    children: [
      { id: 'queue-list', label: 'Queue List', icon: <QueueIcon />, path: '/queues' },
      { id: 'queue-graphs', label: 'Queue Graphs', icon: <ChartIcon />, path: '/queues/graphs' },
    ],
  },
  {
    id: 'topics',
    label: 'Topics',
    icon: <TopicIcon />,
    children: [
      { id: 'topic-list', label: 'Topic List', icon: <TopicIcon />, path: '/topics' },
      { id: 'topic-graphs', label: 'Topic Graphs', icon: <ChartIcon />, path: '/topics/graphs' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <MessageIcon />,
    children: [
      { id: 'message-browser', label: 'Browse Messages', icon: <MessageIcon />, path: '/messages' },
      { id: 'send-message', label: 'Send Message', icon: <SendIcon />, path: '/messages/send' },
    ],
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: <ConnectionIcon />,
    path: '/connections',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

export const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['queues', 'topics', 'messages']));

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <Box key={item.id}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => handleToggleExpand(item.id)}
              sx={{
                minHeight: 48,
                justifyContent: sidebarCollapsed ? 'center' : 'initial',
                px: 2.5,
                pl: depth > 0 ? 4 : 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarCollapsed ? 'auto' : 3,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!sidebarCollapsed && (
                <>
                  <ListItemText primary={item.label} />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </ListItem>
          {!sidebarCollapsed && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children?.map((child) => renderNavItem(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </Box>
      );
    }

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={() => item.path && handleNavigate(item.path)}
          selected={active}
          sx={{
            minHeight: 48,
            justifyContent: sidebarCollapsed ? 'center' : 'initial',
            px: 2.5,
            pl: depth > 0 ? 4 : 2.5,
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.contrastText,
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: sidebarCollapsed ? 'auto' : 3,
              justifyContent: 'center',
              color: active ? theme.palette.primary.contrastText : 'inherit',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!sidebarCollapsed && <ListItemText primary={item.label} />}
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {!sidebarCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QueueIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h6" noWrap component="div" fontWeight={600}>
              ActiveMQ
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={toggleSidebarCollapsed}
            size="small"
            sx={{
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List>
          {navigationItems.map((item) => renderNavItem(item))}
        </List>
      </Box>

      <Divider />

      {/* Footer */}
      {!sidebarCollapsed && (
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Modern Web Console
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            v1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Mobile drawer (temporary)
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop drawer (permanent)
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

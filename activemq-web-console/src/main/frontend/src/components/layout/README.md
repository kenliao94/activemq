# Layout Components

This directory contains the main layout components for the ActiveMQ Modern Web Console.

## Components

### AppLayout
The main layout wrapper that combines all layout components and provides the overall structure.

**Features:**
- Responsive layout that adapts to mobile, tablet, and desktop
- Integrates sidebar, header, footer, and main content area
- Manages device type detection and updates UI store
- Uses React Router's `<Outlet />` for nested routing

**Usage:**
```tsx
import { AppLayout } from './components/layout';

<Route path="/" element={<AppLayout />}>
  <Route index element={<Dashboard />} />
  {/* Other routes */}
</Route>
```

### Sidebar
Navigation sidebar with collapsible menu and mobile support.

**Features:**
- Hierarchical navigation menu with expandable sections
- Mobile hamburger menu (temporary drawer)
- Desktop permanent drawer with collapse functionality
- Active route highlighting
- Responsive behavior (temporary on mobile, permanent on desktop)
- Collapsible mode for desktop (260px → 72px)
- Auto-closes on mobile after navigation

**Navigation Structure:**
- Dashboard
- Queues (with Queue List and Queue Graphs sub-items)
- Topics (with Topic List and Topic Graphs sub-items)
- Messages (with Browse Messages and Send Message sub-items)
- Connections
- Settings

### Header
Top app bar with breadcrumbs and action buttons.

**Features:**
- Dynamic breadcrumb navigation based on current route
- Mobile hamburger menu button
- Theme toggle (light/dark mode)
- Auto-refresh toggle indicator
- Manual refresh button
- Responsive layout (adapts to sidebar width)
- Fixed positioning with proper spacing

**Breadcrumbs:**
- Automatically generated from current route
- Clickable navigation to parent routes
- Home icon for root breadcrumb

### Footer
Application footer with version info and links.

**Features:**
- Version information display
- Copyright notice
- Links to documentation and GitHub
- Link to legacy UI
- Apache license information
- Responsive layout (stacks on mobile)

## Responsive Behavior

### Mobile (< 768px)
- Sidebar: Temporary drawer (overlay)
- Header: Shows hamburger menu button
- Footer: Stacked layout
- Touch-friendly targets (44x44px minimum)

### Tablet (768px - 1024px)
- Sidebar: Permanent drawer (can be collapsed)
- Header: Full breadcrumbs
- Footer: Horizontal layout

### Desktop (> 1024px)
- Sidebar: Permanent drawer with collapse toggle
- Header: Full breadcrumbs and all actions
- Footer: Full horizontal layout

## Theme Support

All layout components support both light and dark themes:
- Theme is managed by `useUIStore`
- Theme toggle in header
- Persisted to localStorage
- System preference detection

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Semantic HTML structure

## State Management

Layout state is managed through Zustand store (`useUIStore`):
- `sidebarOpen`: Controls sidebar visibility (mobile)
- `sidebarCollapsed`: Controls sidebar collapse state (desktop)
- `theme`: Current theme mode (light/dark/system)
- `autoRefreshEnabled`: Auto-refresh toggle state
- Device type detection (isMobile, isTablet, isDesktop)

## Integration

The layout components are integrated in `App.tsx`:

```tsx
import { AppLayout } from './components/layout';

<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<Dashboard />} />
    {/* Other routes */}
  </Route>
</Routes>
```

## Customization

### Drawer Width
Adjust the drawer width constants in each component:
```tsx
const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;
```

### Navigation Items
Modify the `navigationItems` array in `Sidebar.tsx` to add/remove menu items:
```tsx
const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  // Add more items...
];
```

### Breadcrumb Labels
Update the `pathLabels` object in `Header.tsx` to customize breadcrumb text:
```tsx
const pathLabels: Record<string, string> = {
  'queues': 'Queues',
  'topics': 'Topics',
  // Add more mappings...
};
```

## Dependencies

- @mui/material: UI components
- @mui/icons-material: Icons
- react-router-dom: Routing
- zustand: State management

## Testing

To test the layout components:
1. Navigate to different routes to verify breadcrumbs
2. Toggle theme to verify dark/light mode
3. Resize browser to test responsive behavior
4. Test on mobile device for touch interactions
5. Verify keyboard navigation works
6. Test sidebar collapse/expand functionality

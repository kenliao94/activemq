/**
 * Temporary placeholder page for testing layout
 * This will be replaced with actual dashboard implementation
 */

import { Container, Box, Typography, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';

export const DashboardPlaceholder = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.includes('queues')) return 'Queues';
    if (path.includes('topics')) return 'Topics';
    if (path.includes('messages')) return 'Messages';
    if (path.includes('connections')) return 'Connections';
    if (path.includes('settings')) return 'Settings';
    return 'Page';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            {getPageTitle()}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Layout Components Implemented ✓
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            The layout is now complete with responsive sidebar, header, and footer.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Current path: {location.pathname}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

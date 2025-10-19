/**
 * Footer component with version and links
 * Displays application version, copyright, and useful links
 */

import { Box, Container, Typography, Link, Divider, useTheme } from '@mui/material';
import { GitHub as GitHubIcon, Description as DocsIcon } from '@mui/icons-material';

export const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.grey[900],
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          {/* Version and Copyright */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              ActiveMQ Web Console v6.0.0
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © {currentYear} Apache Software Foundation. All rights reserved.
            </Typography>
          </Box>

          {/* Links */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Link
              href="https://activemq.apache.org/components/classic/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              <DocsIcon fontSize="small" />
              <Typography variant="body2">Documentation</Typography>
            </Link>

            <Divider orientation="vertical" flexItem />

            <Link
              href="https://github.com/apache/activemq"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2">GitHub</Typography>
            </Link>

            <Divider orientation="vertical" flexItem />

            <Link
              href="/"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              <Typography variant="body2">Legacy UI</Typography>
            </Link>
          </Box>
        </Box>

        {/* Additional info */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Apache ActiveMQ, ActiveMQ, Apache, the Apache feather logo, and the Apache ActiveMQ
            project logo are trademarks of The Apache Software Foundation.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

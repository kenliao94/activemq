import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Fallback UI to display when error occurs
   */
  fallback?: ReactNode;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to show error details in UI
   */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors
 * Provides graceful error handling and recovery options
 * Meets WCAG 2.1 AA accessibility standards
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
          role="alert"
          aria-live="assertive"
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
              aria-hidden="true"
            />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but something unexpected happened. Please try refreshing the page or
              contact support if the problem persists.
            </Typography>

            {this.props.showDetails && this.state.error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Error Details:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      mt: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                aria-label="Try again"
              >
                Try Again
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
                aria-label="Reload page"
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

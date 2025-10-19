import {
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: number | string;
  /**
   * Loading message to display
   */
  message?: string;
  /**
   * Whether to show as fullscreen overlay
   */
  fullscreen?: boolean;
  /**
   * Minimum height for the loading container
   */
  minHeight?: number | string;
}

/**
 * Loading spinner component with optional message
 * Provides accessible loading indication
 */
export function LoadingSpinner({
  size = 40,
  message,
  fullscreen = false,
  minHeight = 200,
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: fullscreen ? '100vh' : minHeight,
        width: '100%',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CircularProgress size={size} aria-label="Loading" />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

export interface SkeletonLoaderProps {
  /**
   * Type of skeleton to display
   */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  /**
   * Width of the skeleton
   */
  width?: number | string;
  /**
   * Height of the skeleton
   */
  height?: number | string;
  /**
   * Number of skeleton items to display
   */
  count?: number;
  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | false;
}

/**
 * Skeleton loader for content placeholders
 * Provides better UX during initial page loads
 */
export function SkeletonLoader({
  variant = 'rectangular',
  width = '100%',
  height = 40,
  count = 1,
  animation = 'wave',
}: SkeletonLoaderProps) {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
          animation={animation}
          aria-label="Loading content"
        />
      ))}
    </Stack>
  );
}

export interface TableSkeletonProps {
  /**
   * Number of rows to display
   */
  rows?: number;
  /**
   * Number of columns to display
   */
  columns?: number;
  /**
   * Height of each row
   */
  rowHeight?: number;
}

/**
 * Skeleton loader specifically for tables
 * Mimics table structure during loading
 */
export function TableSkeleton({ rows = 5, columns = 4, rowHeight = 53 }: TableSkeletonProps) {
  return (
    <Box sx={{ width: '100%' }} role="status" aria-label="Loading table">
      {/* Header row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="rectangular"
            height={rowHeight}
            sx={{ flex: 1 }}
            animation="wave"
          />
        ))}
      </Box>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={`row-${rowIndex}`} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="rectangular"
              height={rowHeight}
              sx={{ flex: 1 }}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export interface CardSkeletonProps {
  /**
   * Number of cards to display
   */
  count?: number;
  /**
   * Height of each card
   */
  height?: number;
}

/**
 * Skeleton loader for card layouts
 * Used for dashboard metric cards
 */
export function CardSkeleton({ count = 4, height = 120 }: CardSkeletonProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 2,
      }}
      role="status"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={height}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
  );
}

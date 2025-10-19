import { Chip, ChipProps, Box, Tooltip } from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  HourglassEmpty,
  PlayArrow,
  Pause,
  Stop,
} from '@mui/icons-material';

export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'healthy'
  | 'unhealthy'
  | 'degraded';

export interface StatusBadgeProps {
  /**
   * Status type determines color and icon
   */
  status: StatusType;
  /**
   * Custom label text (defaults to status)
   */
  label?: string;
  /**
   * Whether to show an icon
   */
  showIcon?: boolean;
  /**
   * Size of the badge
   */
  size?: 'small' | 'medium';
  /**
   * Variant of the chip
   */
  variant?: 'filled' | 'outlined';
  /**
   * Tooltip text for additional context
   */
  tooltip?: string;
  /**
   * Additional chip props
   */
  chipProps?: Partial<ChipProps>;
}

/**
 * Color-coded status badge component
 * Provides visual indicators for various states
 * Meets WCAG 2.1 AA accessibility standards with proper contrast
 */
export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'small',
  variant = 'filled',
  tooltip,
  chipProps,
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'healthy':
      case 'active':
        return {
          color: 'success' as const,
          icon: <CheckCircle />,
          defaultLabel: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'error':
      case 'unhealthy':
        return {
          color: 'error' as const,
          icon: <Error />,
          defaultLabel: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'warning':
      case 'degraded':
        return {
          color: 'warning' as const,
          icon: <Warning />,
          defaultLabel: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'info':
        return {
          color: 'info' as const,
          icon: <Info />,
          defaultLabel: 'Info',
        };
      case 'inactive':
      case 'stopped':
        return {
          color: 'default' as const,
          icon: <Stop />,
          defaultLabel: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'pending':
        return {
          color: 'default' as const,
          icon: <HourglassEmpty />,
          defaultLabel: 'Pending',
        };
      case 'running':
        return {
          color: 'primary' as const,
          icon: <PlayArrow />,
          defaultLabel: 'Running',
        };
      case 'paused':
        return {
          color: 'default' as const,
          icon: <Pause />,
          defaultLabel: 'Paused',
        };
      default:
        return {
          color: 'default' as const,
          icon: <Info />,
          defaultLabel: status,
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const badge = (
    <Chip
      label={displayLabel}
      color={config.color}
      size={size}
      variant={variant}
      icon={showIcon ? config.icon : undefined}
      aria-label={`Status: ${displayLabel}`}
      {...chipProps}
      sx={{
        fontWeight: 500,
        ...chipProps?.sx,
      }}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {badge}
        </Box>
      </Tooltip>
    );
  }

  return badge;
}

export interface StatusDotProps {
  /**
   * Status type determines color
   */
  status: StatusType;
  /**
   * Size of the dot
   */
  size?: number;
  /**
   * Whether to animate the dot
   */
  animate?: boolean;
  /**
   * Tooltip text
   */
  tooltip?: string;
  /**
   * Accessible label
   */
  ariaLabel?: string;
}

/**
 * Simple status dot indicator
 * Useful for compact status displays
 */
export function StatusDot({
  status,
  size = 12,
  animate = false,
  tooltip,
  ariaLabel,
}: StatusDotProps) {
  const getColor = () => {
    switch (status) {
      case 'success':
      case 'healthy':
      case 'active':
        return 'success.main';
      case 'error':
      case 'unhealthy':
        return 'error.main';
      case 'warning':
      case 'degraded':
        return 'warning.main';
      case 'info':
        return 'info.main';
      case 'running':
        return 'primary.main';
      default:
        return 'action.disabled';
    }
  };

  const dot = (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: getColor(),
        display: 'inline-block',
        animation: animate ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      }}
      role="img"
      aria-label={ariaLabel || `Status: ${status}`}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {dot}
      </Tooltip>
    );
  }

  return dot;
}

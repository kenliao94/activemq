import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Tooltip,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, InfoOutlined } from '@mui/icons-material';

export interface MetricCardProps {
  /**
   * Metric title/label
   */
  title: string;
  /**
   * Main metric value
   */
  value: string | number;
  /**
   * Unit of measurement (e.g., 'MB', '%', 'ms')
   */
  unit?: string;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  /**
   * Color theme for the card
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  /**
   * Trend indicator
   */
  trend?: 'up' | 'down' | 'flat';
  /**
   * Trend value (e.g., '+5%', '-2.3')
   */
  trendValue?: string;
  /**
   * Whether the metric is loading
   */
  loading?: boolean;
  /**
   * Additional info tooltip
   */
  infoTooltip?: string;
  /**
   * Click handler for the card
   */
  onClick?: () => void;
  /**
   * Whether to show as elevated card
   */
  elevated?: boolean;
}

/**
 * Metric card component for displaying dashboard statistics
 * Provides clear visual hierarchy and optional trend indicators
 * Meets WCAG 2.1 AA accessibility standards
 */
export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  color = 'default',
  trend,
  trendValue,
  loading = false,
  infoTooltip,
  onClick,
  elevated = true,
}: MetricCardProps) {
  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return 'primary.main';
      case 'secondary':
        return 'secondary.main';
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      case 'info':
        return 'info.main';
      default:
        return 'text.primary';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />;
      case 'flat':
        return <TrendingFlat fontSize="small" sx={{ color: 'text.secondary' }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card
      elevation={elevated ? 2 : 0}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            }
          : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={`${title}: ${value}${unit || ''}`}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              {infoTooltip && (
                <Tooltip title={infoTooltip} arrow>
                  <IconButton size="small" sx={{ p: 0 }} aria-label="More information">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {loading ? (
              <>
                <Skeleton variant="text" width="60%" height={40} />
                {subtitle && <Skeleton variant="text" width="40%" height={20} />}
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      color: getColorValue(),
                    }}
                  >
                    {value}
                  </Typography>
                  {unit && (
                    <Typography variant="body1" color="text.secondary">
                      {unit}
                    </Typography>
                  )}
                </Box>

                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}

                {(trend || trendValue) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 1,
                    }}
                  >
                    {getTrendIcon()}
                    {trendValue && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: getTrendColor(),
                          fontWeight: 500,
                        }}
                      >
                        {trendValue}
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: `${getColorValue()}`,
                color: 'white',
                opacity: 0.9,
              }}
              aria-hidden="true"
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export interface MetricCardGridProps {
  /**
   * Array of metric card props
   */
  metrics: MetricCardProps[];
  /**
   * Minimum width for each card
   */
  minCardWidth?: number;
}

/**
 * Grid container for multiple metric cards
 * Provides responsive layout for dashboard metrics
 */
export function MetricCardGrid({
  metrics,
  minCardWidth = 250,
}: MetricCardGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
        gap: 2,
        width: '100%',
      }}
      role="region"
      aria-label="Metrics dashboard"
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </Box>
  );
}

/**
 * Common reusable components
 * All components meet WCAG 2.1 AA accessibility standards
 */

export { DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';

export {
  LoadingSpinner,
  SkeletonLoader,
  TableSkeleton,
  CardSkeleton,
} from './LoadingSpinner';
export type {
  LoadingSpinnerProps,
  SkeletonLoaderProps,
  TableSkeletonProps,
  CardSkeletonProps,
} from './LoadingSpinner';

export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

export { ConfirmDialog, useConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { StatusBadge, StatusDot } from './StatusBadge';
export type { StatusBadgeProps, StatusDotProps, StatusType } from './StatusBadge';

export { MetricCard, MetricCardGrid } from './MetricCard';
export type { MetricCardProps, MetricCardGridProps } from './MetricCard';

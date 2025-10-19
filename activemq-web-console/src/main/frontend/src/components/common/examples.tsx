/**
 * Example usage of common components
 * This file demonstrates how to use each component
 */

import { ColumnDef } from '@tanstack/react-table';
import {
  DataTable,
  LoadingSpinner,
  TableSkeleton,
  CardSkeleton,
  ErrorBoundary,
  useConfirmDialog,
  StatusBadge,
  StatusDot,
  MetricCardGrid,
} from './index';
import { Box, Button } from '@mui/material';
import { Memory, Queue as QueueIcon, Message as MessageIcon } from '@mui/icons-material';

// Example 1: DataTable
interface QueueData {
  name: string;
  size: number;
  consumers: number;
  status: 'active' | 'paused';
}

const queueColumns: ColumnDef<QueueData>[] = [
  {
    accessorKey: 'name',
    header: 'Queue Name',
  },
  {
    accessorKey: 'size',
    header: 'Messages',
  },
  {
    accessorKey: 'consumers',
    header: 'Consumers',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function DataTableExample() {
  const data: QueueData[] = [
    { name: 'orders.queue', size: 150, consumers: 3, status: 'active' },
    { name: 'notifications.queue', size: 42, consumers: 1, status: 'active' },
    { name: 'archive.queue', size: 0, consumers: 0, status: 'paused' },
  ];

  return (
    <DataTable
      data={data}
      columns={queueColumns}
      enableSorting
      enableFiltering
      enablePagination
      searchPlaceholder="Search queues..."
      onRowClick={(row) => console.log('Clicked:', row)}
      ariaLabel="Queue list"
    />
  );
}

// Example 2: Loading States
export function LoadingExample() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Simple spinner */}
      <LoadingSpinner message="Loading broker information..." />

      {/* Table skeleton */}
      <TableSkeleton rows={5} columns={4} />

      {/* Card skeleton */}
      <CardSkeleton count={4} height={120} />
    </Box>
  );
}

// Example 3: Error Boundary
function ComponentThatMightError(): null {
  // Simulate error
  throw new Error('Something went wrong!');
}

export function ErrorBoundaryExample() {
  return (
    <ErrorBoundary showDetails>
      <ComponentThatMightError />
    </ErrorBoundary>
  );
}

// Example 4: Confirm Dialog
export function ConfirmDialogExample() {
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const handleDeleteQueue = () => {
    showConfirm({
      title: 'Delete Queue',
      message: 'Are you sure you want to delete this queue?',
      severity: 'error',
      destructive: true,
      details: 'All messages in the queue will be permanently deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        // Perform delete operation
        console.log('Queue deleted');
      },
    });
  };

  const handlePurgeQueue = () => {
    showConfirm({
      title: 'Purge Queue',
      message: 'This will remove all messages from the queue.',
      severity: 'warning',
      confirmText: 'Purge',
      onConfirm: async () => {
        console.log('Queue purged');
      },
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button variant="contained" color="error" onClick={handleDeleteQueue}>
        Delete Queue
      </Button>
      <Button variant="outlined" color="warning" onClick={handlePurgeQueue}>
        Purge Queue
      </Button>
      {ConfirmDialog}
    </Box>
  );
}

// Example 5: Status Badges
export function StatusBadgeExample() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <StatusBadge status="success" label="Healthy" showIcon />
      <StatusBadge status="error" label="Error" showIcon />
      <StatusBadge status="warning" label="Warning" showIcon />
      <StatusBadge status="active" showIcon />
      <StatusBadge status="paused" showIcon variant="outlined" />
      
      {/* Status dots */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatusDot status="healthy" animate tooltip="Broker is healthy" />
        <StatusDot status="error" tooltip="Connection failed" />
        <StatusDot status="warning" tooltip="High memory usage" />
      </Box>
    </Box>
  );
}

// Example 6: Metric Cards
export function MetricCardExample() {
  return (
    <MetricCardGrid
      metrics={[
        {
          title: 'Memory Usage',
          value: 75,
          unit: '%',
          subtitle: 'of 2GB total',
          icon: <Memory />,
          color: 'warning',
          trend: 'up',
          trendValue: '+5%',
          infoTooltip: 'Current memory usage of the broker',
        },
        {
          title: 'Total Queues',
          value: 42,
          icon: <QueueIcon />,
          color: 'primary',
          onClick: () => console.log('Navigate to queues'),
        },
        {
          title: 'Messages',
          value: '1.2K',
          subtitle: 'pending',
          icon: <MessageIcon />,
          color: 'success',
          trend: 'down',
          trendValue: '-12%',
        },
        {
          title: 'Connections',
          value: 8,
          subtitle: 'active',
          color: 'info',
          loading: false,
        },
      ]}
      minCardWidth={250}
    />
  );
}

// Example 7: Complete Dashboard Layout
export function DashboardExample() {
  return (
    <ErrorBoundary>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Metrics */}
        <MetricCardExample />

        {/* Queue Table */}
        <DataTableExample />
      </Box>
    </ErrorBoundary>
  );
}

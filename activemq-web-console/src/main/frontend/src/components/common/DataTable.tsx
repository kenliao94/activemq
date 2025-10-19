import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  FilterList,
} from '@mui/icons-material';

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  ariaLabel?: string;
}

/**
 * Reusable data table component with sorting, filtering, and pagination
 * Built with TanStack Table and Material-UI
 * Meets WCAG 2.1 AA accessibility standards
 */
export function DataTable<T>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
  ariaLabel = 'Data table',
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableSorting,
    enableFilters: enableFiltering,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      pageIndex: 0,
      pageSize: parseInt(event.target.value, 10),
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {enableFiltering && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="action" />
          <TextField
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            variant="outlined"
            size="small"
            fullWidth
            inputProps={{
              'aria-label': 'Search table',
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table aria-label={ariaLabel}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableCell
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        fontWeight: 600,
                        backgroundColor: 'action.hover',
                      }}
                      aria-sort={
                        sortDirection === 'asc'
                          ? 'ascending'
                          : sortDirection === 'desc'
                          ? 'descending'
                          : 'none'
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                            {sortDirection === 'asc' ? (
                              <ArrowUpward fontSize="small" />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDownward fontSize="small" />
                            ) : null}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row.original)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': onRowClick
                      ? {
                          backgroundColor: 'action.hover',
                        }
                      : undefined,
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {enablePagination && !loading && data.length > 0 && (
        <TablePagination
          component="div"
          count={table.getFilteredRowModel().rows.length}
          page={pagination.pageIndex}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={pageSizeOptions}
          aria-label="Table pagination"
        />
      )}
    </Box>
  );
}

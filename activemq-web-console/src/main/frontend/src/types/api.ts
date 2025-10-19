/**
 * API response wrapper types and common API-related types
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  status: 'success' | 'error';
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  message: string;
  timestamp: number;
  path?: string;
  details?: string[];
  code?: string;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

/**
 * Sorting options
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter options base interface
 */
export interface FilterOptions {
  searchTerm?: string;
  [key: string]: any;
}

/**
 * API operation result
 */
export interface OperationResult {
  success: boolean;
  message?: string;
  timestamp: number;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  results: OperationResult[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'up' | 'down' | 'degraded';
  timestamp: number;
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
    };
  };
}

/**
 * API validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  rejectedValue?: any;
}

/**
 * API validation error response
 */
export interface ValidationErrorResponse extends ApiError {
  validationErrors: ValidationError[];
}

/**
 * Generic list response
 */
export interface ListResponse<T> {
  items: T[];
  totalCount: number;
}

/**
 * Time range for statistics queries
 */
export interface TimeRange {
  start: number;
  end: number;
}

/**
 * Statistics query options
 */
export interface StatisticsQueryOptions {
  timeRange?: TimeRange;
  interval?: number;
  metrics?: string[];
}

/**
 * Async operation status
 */
export interface AsyncOperationStatus {
  operationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  result?: any;
  error?: ApiError;
  startTime: number;
  endTime?: number;
}

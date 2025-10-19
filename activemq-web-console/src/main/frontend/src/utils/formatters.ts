/**
 * Utility functions for formatting data
 */

/**
 * Format uptime in milliseconds to human-readable string
 * @param uptimeMillis - Uptime in milliseconds
 * @returns Formatted uptime string (e.g., "2d 5h 30m")
 */
export function formatUptime(uptimeMillis: number): string {
  const seconds = Math.floor(uptimeMillis / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours % 24 > 0) {
    parts.push(`${hours % 24}h`);
  }
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60}m`);
  }
  if (parts.length === 0 && seconds % 60 > 0) {
    parts.push(`${seconds % 60}s`);
  }

  return parts.join(' ') || '0s';
}

/**
 * Format a number with thousand separators
 * @param value - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format bytes to human-readable size
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted size string (e.g., "1.5 GB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format a timestamp to a readable date/time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date/time string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Format a timestamp to a relative time string (e.g., "2 minutes ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (seconds > 5) {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

/**
 * Format a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string (e.g., "75.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

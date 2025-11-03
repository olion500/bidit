// Task T019: Create price formatting function
// Task T020: Create time formatting function

/**
 * Formats a number as Korean Won with thousand separators
 * @param price - Price in Korean Won
 * @returns Formatted string (e.g., "1,000,000원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * Calculates and formats remaining time until auction ends
 * @param endsAt - ISO timestamp string when auction ends
 * @returns Formatted time string (e.g., "1h 23m", "5m 32s", "Ended")
 */
export function formatTimeRemaining(endsAt: string): string {
  const serverTime = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, serverTime - now);

  if (diff === 0) {
    return 'Ended';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculates remaining time in milliseconds
 * @param endsAt - ISO timestamp string when auction ends
 * @returns Milliseconds remaining (0 if ended)
 */
export function getRemainingMs(endsAt: string): number {
  const serverTime = new Date(endsAt).getTime();
  const now = Date.now();
  return Math.max(0, serverTime - now);
}

/**
 * Formats a timestamp as a relative time string
 * @param timestamp - ISO timestamp string
 * @returns Relative time string (e.g., "2 minutes ago", "just now")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds > 10) {
    return `${seconds} seconds ago`;
  } else {
    return 'just now';
  }
}

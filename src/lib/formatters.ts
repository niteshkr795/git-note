/**
 * Utilities for formatting file sizes and resource attributes.
 */

export function formatFileSize(bytes?: number | null, fallbackStr?: string | null): string {
  if (typeof bytes === 'number' && !isNaN(bytes) && bytes > 0) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      const kb = (bytes / 1024).toFixed(1);
      return `${kb.endsWith('.0') ? kb.slice(0, -2) : kb} KB`;
    }
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb.endsWith('.0') ? mb.slice(0, -2) : mb} MB`;
  }

  if (fallbackStr && fallbackStr !== '0.0 MB' && fallbackStr !== '0 MB' && fallbackStr.trim() !== '') {
    return fallbackStr;
  }

  return '1.0 MB';
}

/**
 * Formats timestamps into clean, human-friendly relative or calendar strings.
 */
export function formatCommentTimestamp(dateInput?: string | Date | number | null): string {
  if (!dateInput) return 'Recently';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

    if (diffSeconds < 45) return 'Just now';
    if (diffSeconds < 90) return '1 min ago';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 7200) return '1 hour ago';
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 172800) return 'Yesterday';
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;

    const isSameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(isSameYear ? {} : { year: 'numeric' }),
    });
  } catch {
    return 'Recently';
  }
}

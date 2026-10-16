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

/**
 * CampusConnect Helper Utilities
 */

/**
 * Format date to human-readable string
 * e.g. "Oct 15, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return 'TBA';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format date and time
 * e.g. "Oct 15, 2026 at 2:30 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'TBA';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format time only
 * e.g. "10:00 AM"
 */
export function formatTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Calculate relative time from now
 */
export function getRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);

  if (diffInSeconds < 0) {
    const pastSeconds = Math.abs(diffInSeconds);
    if (pastSeconds < 60) return 'Just now';
    if (pastSeconds < 3600) return `${Math.floor(pastSeconds / 60)}m ago`;
    if (pastSeconds < 86400) return `${Math.floor(pastSeconds / 3600)}h ago`;
    return `${Math.floor(pastSeconds / 86400)}d ago`;
  }

  if (diffInSeconds < 3600) return `In ${Math.floor(diffInSeconds / 60)} mins`;
  if (diffInSeconds < 86400) return `In ${Math.floor(diffInSeconds / 3600)} hours`;
  const days = Math.floor(diffInSeconds / 86400);
  return days === 1 ? 'Tomorrow' : `In ${days} days`;
}

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Generate formatted ticket code
 * e.g. CC-TCK-948210
 */
export function generateTicketCode() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CC-TCK-${randomNum}`;
}

/**
 * Export array of objects to downloadable CSV file
 */
export function exportToCSV(filename, rows, headers) {
  if (!rows || !rows.length) {
    alert('No data available to export');
    return;
  }

  const separator = ',';
  const keys = headers ? headers.map(h => h.key) : Object.keys(rows[0]);
  const headerLabels = headers ? headers.map(h => `"${h.label.replace(/"/g, '""')}"`) : keys.map(k => `"${k}"`);

  const csvContent = [
    headerLabels.join(separator),
    ...rows.map(row =>
      keys.map(key => {
        let cell = row[key];
        if (cell === null || cell === undefined) {
          cell = '';
        } else if (typeof cell === 'object') {
          cell = JSON.stringify(cell);
        } else {
          cell = String(cell);
        }
        return `"${cell.replace(/"/g, '""')}"`;
      }).join(separator)
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to get dates relative to now (for dynamic mock data)
 */
export function getRelativeDate(daysOffset, hours = 10, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

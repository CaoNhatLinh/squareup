/**
 * Date and time formatting utilities
 */

/**
 * Format a timestamp to a readable date and time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string (e.g., "Dec 25, 2023, 2:30 PM")
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format a date string to MM/DD/YYYY format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date string (e.g., "12/25/2023")
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format a time string (HH:MM format)
 * @param {string} timeString - Time string in HH:MM format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString;
};

/**
 * Check if a date is in the past
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};
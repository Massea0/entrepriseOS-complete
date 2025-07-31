/**
 * Number and currency formatting utilities
 */

// Default locale for number formatting
const DEFAULT_LOCALE = 'fr-FR'

/**
 * Format a number with thousands separators
 * @param value - Number to format
 * @param options - Intl.NumberFormat options
 */
export function formatNumber(
  value: number | string,
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_LOCALE
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    return '—'
  }
  
  return new Intl.NumberFormat(locale, options).format(num)
}

/**
 * Format currency
 * @param value - Amount to format
 * @param currency - Currency code (default: EUR)
 * @param options - Additional formatting options
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'EUR',
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_LOCALE
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    return '—'
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(num)
}

/**
 * Format percentage
 * @param value - Value to format (0.15 = 15%)
 * @param decimals - Number of decimal places
 */
export function formatPercent(
  value: number | string,
  decimals: number = 0,
  locale: string = DEFAULT_LOCALE
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    return '—'
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format compact numbers (1K, 1M, etc.)
 * @param value - Number to format
 * @param decimals - Number of decimal places
 */
export function formatCompact(
  value: number | string,
  decimals: number = 1,
  locale: string = DEFAULT_LOCALE
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    return '—'
  }
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format bytes to human readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * Format duration in milliseconds to human readable format
 * @param ms - Duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}j ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  
  return `${seconds}s`
}

/**
 * Format phone number
 * @param phone - Phone number to format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // French phone number format
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  
  // International format
  if (cleaned.length > 10) {
    return '+' + cleaned
  }
  
  return phone
}

/**
 * Pluralize a word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, adds 's' by default)
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 0 || count === 1) {
    return singular
  }
  
  return plural || singular + 's'
}
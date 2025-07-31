import { format, formatDistance, formatRelative, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

// Locale configuration
const DEFAULT_LOCALE = fr

/**
 * Format a date to a specific format
 * @param date - Date to format (Date object, timestamp, or ISO string)
 * @param formatStr - Format string (default: 'PP' for localized date)
 * @param locale - Optional locale (default: French)
 */
export function formatDate(
  date: Date | number | string,
  formatStr: string = 'PP',
  locale = DEFAULT_LOCALE
): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    
    if (!isValid(parsedDate)) {
      console.error('Invalid date:', date)
      return 'Date invalide'
    }
    
    return format(parsedDate, formatStr, { locale })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Date invalide'
  }
}

/**
 * Common date formats
 */
export const dateFormats = {
  short: 'dd/MM/yyyy',                    // 31/12/2023
  medium: 'dd MMM yyyy',                  // 31 déc. 2023
  long: 'dd MMMM yyyy',                   // 31 décembre 2023
  full: 'EEEE dd MMMM yyyy',             // samedi 31 décembre 2023
  withTime: 'dd/MM/yyyy HH:mm',          // 31/12/2023 14:30
  withTimeSeconds: 'dd/MM/yyyy HH:mm:ss', // 31/12/2023 14:30:45
  time: 'HH:mm',                          // 14:30
  timeWithSeconds: 'HH:mm:ss',           // 14:30:45
  iso: "yyyy-MM-dd'T'HH:mm:ss",          // 2023-12-31T14:30:45
  monthYear: 'MMMM yyyy',                 // décembre 2023
  dayMonth: 'dd MMMM',                    // 31 décembre
}

/**
 * Format date relative to now
 * @param date - Date to format
 * @param baseDate - Base date to compare to (default: now)
 * @param locale - Optional locale
 */
export function formatRelativeDate(
  date: Date | number | string,
  baseDate: Date = new Date(),
  locale = DEFAULT_LOCALE
): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    
    if (!isValid(parsedDate)) {
      return 'Date invalide'
    }
    
    return formatRelative(parsedDate, baseDate, { locale })
  } catch (error) {
    console.error('Error formatting relative date:', error)
    return 'Date invalide'
  }
}

/**
 * Format distance between dates
 * @param date - Date to format
 * @param baseDate - Base date to compare to (default: now)
 * @param options - Additional options
 */
export function formatDistanceFromNow(
  date: Date | number | string,
  options?: {
    addSuffix?: boolean
    locale?: typeof DEFAULT_LOCALE
    includeSeconds?: boolean
  }
): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    
    if (!isValid(parsedDate)) {
      return 'Date invalide'
    }
    
    return formatDistance(parsedDate, new Date(), {
      addSuffix: options?.addSuffix ?? true,
      locale: options?.locale ?? DEFAULT_LOCALE,
      includeSeconds: options?.includeSeconds,
    })
  } catch (error) {
    console.error('Error formatting distance:', error)
    return 'Date invalide'
  }
}

/**
 * Get human-readable time period
 */
export function getTimePeriod(date: Date = new Date()): string {
  const hour = date.getHours()
  
  if (hour < 6) return 'nuit'
  if (hour < 12) return 'matin'
  if (hour < 18) return 'après-midi'
  return 'soir'
}

/**
 * Get greeting based on time of day
 */
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  
  if (hour < 6) return 'Bonne nuit'
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}
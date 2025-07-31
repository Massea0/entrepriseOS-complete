import { useState, useEffect } from 'react'

/**
 * Hook to track media query matches
 * 
 * @param query - Media query string
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 640px)')
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
 * const isLandscape = useMediaQuery('(orientation: landscape)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Avoid SSR issues
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    
    // Update state if it doesn't match the current value
    if (mediaQuery.matches !== matches) {
      setMatches(mediaQuery.matches)
    }

    // Define event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } 
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [query, matches])

  return matches
}

// Preset media queries based on Tailwind breakpoints
export const mediaQueries = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  
  // Max width queries
  'max-sm': '(max-width: 639px)',
  'max-md': '(max-width: 767px)',
  'max-lg': '(max-width: 1023px)',
  'max-xl': '(max-width: 1279px)',
  'max-2xl': '(max-width: 1535px)',
  
  // Common queries
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  
  // Feature queries
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',
  
  // Orientation
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Color scheme
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  
  // Motion
  reducedMotion: '(prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
} as const

// Helper hooks for common breakpoints
export const useIsMobile = () => useMediaQuery(mediaQueries.mobile)
export const useIsTablet = () => useMediaQuery(mediaQueries.tablet)
export const useIsDesktop = () => useMediaQuery(mediaQueries.desktop)
export const useIsTouch = () => useMediaQuery(mediaQueries.touch)
export const usePrefersDarkMode = () => useMediaQuery(mediaQueries.darkMode)
export const usePrefersReducedMotion = () => useMediaQuery(mediaQueries.reducedMotion)
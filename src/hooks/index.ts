// Media Query
export {
  useMediaQuery,
  mediaQueries,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouch,
  usePrefersDarkMode,
  usePrefersReducedMotion
} from './useMediaQuery'

// Debounce
export { useDebounce, useDebouncedCallback } from './useDebounce'

// Local Storage
export { useLocalStorage, useLocalStorageReducer } from './useLocalStorage'

// Click Outside
export { useOnClickOutside, useOnClickOutsideRef } from './useOnClickOutside'

// Re-export theme hook for convenience
export { useTheme } from '@/contexts/theme-context'
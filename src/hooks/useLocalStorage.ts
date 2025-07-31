import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to sync state with localStorage
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if nothing in localStorage
 * @returns [value, setValue, removeValue] tuple
 * 
 * @example
 * ```tsx
 * const [user, setUser, removeUser] = useLocalStorage('user', null)
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        // Save state
        setStoredValue(valueToStore)
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook to sync reducer state with localStorage
 * 
 * @param key - localStorage key
 * @param reducer - Reducer function
 * @param initialState - Initial state
 * @returns [state, dispatch, removeState] tuple
 */
export function useLocalStorageReducer<S, A>(
  key: string,
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, React.Dispatch<A>, () => void] {
  const [state, setState, removeState] = useLocalStorage(key, initialState)

  const dispatch = useCallback(
    (action: A) => {
      const newState = reducer(state, action)
      setState(newState)
    },
    [state, reducer, setState]
  )

  return [state, dispatch, removeState]
}
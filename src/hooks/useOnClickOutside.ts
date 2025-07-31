import { useEffect, useRef } from 'react'

/**
 * Hook to detect clicks outside of a specified element
 * 
 * @param handler - Function to call when clicking outside
 * @param mouseEvent - Mouse event to listen for
 * @param touchEvent - Touch event to listen for
 * 
 * @example
 * ```tsx
 * const ref = useOnClickOutside(() => {
 *   setIsOpen(false)
 * })
 * 
 * return (
 *   <div ref={ref}>
 *     Modal content
 *   </div>
 * )
 * ```
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
  touchEvent: 'touchstart' | 'touchend' = 'touchstart'
): React.RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event.target as Node) || null)) {
        return
      }

      handler(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener(touchEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener(touchEvent, listener)
    }
  }, [handler, mouseEvent, touchEvent])

  return ref
}

/**
 * Alternative version that accepts an existing ref
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null)
 * 
 * useOnClickOutsideRef(modalRef, () => {
 *   closeModal()
 * })
 * ```
 */
export function useOnClickOutsideRef<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
  touchEvent: 'touchstart' | 'touchend' = 'touchstart'
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event.target as Node) || null)) {
        return
      }

      handler(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener(touchEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener(touchEvent, listener)
    }
  }, [ref, handler, mouseEvent, touchEvent])
}
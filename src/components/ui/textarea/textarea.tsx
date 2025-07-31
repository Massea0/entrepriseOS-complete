import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Textarea variants configuration
 */
const textareaVariants = cva(
  'w-full transition-all duration-200 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: [
          'bg-background border rounded-lg',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
        ],
        filled: [
          'bg-accent/50 border-transparent rounded-lg',
          'hover:bg-accent/70',
          'focus:bg-accent focus:border-primary focus:ring-2 focus:ring-primary/20',
        ],
        flushed: [
          'bg-transparent border-0 border-b-2 rounded-none px-0',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-0',
        ],
        ghost: [
          'bg-transparent border-transparent',
          'hover:bg-accent/50',
          'focus:bg-accent focus:ring-2 focus:ring-primary/20 rounded-lg',
        ],
      },
      size: {
        sm: 'text-sm px-2.5 py-1.5',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-2.5',
        xl: 'text-lg px-4 py-3',
      },
      error: {
        true: 'border-destructive focus:border-destructive focus:ring-destructive/20',
        false: '',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    compoundVariants: [
      // Flushed variant padding adjustments
      {
        variant: 'flushed',
        size: 'sm',
        className: 'pb-1',
      },
      {
        variant: 'flushed',
        size: 'md',
        className: 'pb-1',
      },
      {
        variant: 'flushed',
        size: 'lg',
        className: 'pb-1',
      },
      {
        variant: 'flushed',
        size: 'xl',
        className: 'pb-1',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
      resize: 'vertical',
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  /**
   * Label for the textarea
   */
  label?: string
  
  /**
   * Helper text shown below the textarea
   */
  helperText?: string
  
  /**
   * Error message (also sets error state)
   */
  errorMessage?: string
  
  /**
   * Whether the textarea should take full width
   * @default true
   */
  fullWidth?: boolean
  
  /**
   * Whether to auto-resize based on content
   * @default false
   */
  autoResize?: boolean
  
  /**
   * Minimum number of rows when autoResize is enabled
   * @default 3
   */
  minRows?: number
  
  /**
   * Maximum number of rows when autoResize is enabled
   * @default 10
   */
  maxRows?: number
}

/**
 * Textarea Component
 * 
 * A flexible textarea component with multiple variants and auto-resize feature.
 * 
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea placeholder="Enter your message..." />
 * 
 * // With label and helper text
 * <Textarea
 *   label="Description"
 *   helperText="Provide a detailed description"
 *   rows={4}
 * />
 * 
 * // Auto-resize
 * <Textarea
 *   label="Comments"
 *   autoResize
 *   minRows={3}
 *   maxRows={10}
 * />
 * 
 * // Error state
 * <Textarea
 *   label="Bio"
 *   error
 *   errorMessage="Bio is required"
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      error,
      resize,
      label,
      helperText,
      errorMessage,
      fullWidth = true,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      id,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const textareaId = id || React.useId()
    
    // Determine if textarea has error
    const hasError = error || !!errorMessage
    
    // Local ref for auto-resize
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    
    // Handle ref forwarding
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)
    
    // Auto-resize logic
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea || !autoResize) return
      
      // Reset height to calculate new height
      textarea.style.height = 'auto'
      
      // Calculate new height
      const scrollHeight = textarea.scrollHeight
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
      const minHeight = minRows * lineHeight
      const maxHeight = maxRows * lineHeight
      
      // Set new height within bounds
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }, [autoResize, minRows, maxRows])
    
    // Adjust height on mount and value change
    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight, value])
    
    // Handle change event
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e)
        adjustHeight()
      },
      [onChange, adjustHeight]
    )
    
    const textareaElement = (
      <textarea
        ref={textareaRef}
        id={textareaId}
        className={cn(
          textareaVariants({ 
            variant, 
            size, 
            error: hasError,
            resize: autoResize ? 'none' : resize 
          }),
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          helperText || errorMessage
            ? `${textareaId}-helper`
            : undefined
        }
        onChange={handleChange}
        value={value}
        rows={autoResize ? minRows : props.rows}
        {...props}
      />
    )
    
    // If no label or helper text, return textarea only
    if (!label && !helperText && !errorMessage) {
      return textareaElement
    }
    
    // Return with wrapper for label and helper text
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
        )}
        
        {textareaElement}
        
        {(helperText || errorMessage) && (
          <p
            id={`${textareaId}-helper`}
            className={cn(
              'text-xs',
              errorMessage ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
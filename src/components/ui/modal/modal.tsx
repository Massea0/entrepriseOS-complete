import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

/**
 * Modal overlay variants
 */
const modalOverlayVariants = cva(
  'fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  {
    variants: {
      blur: {
        none: 'bg-black/50',
        sm: 'bg-black/50 backdrop-blur-sm',
        md: 'bg-black/50 backdrop-blur-md',
        lg: 'bg-black/50 backdrop-blur-lg',
      },
    },
    defaultVariants: {
      blur: 'sm',
    },
  }
)

/**
 * Modal content variants
 */
const modalContentVariants = cva(
  'fixed z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  {
    variants: {
      position: {
        center: 'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        top: 'left-[50%] top-[10%] translate-x-[-50%] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom: 'bottom-0 left-0 right-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        right: 'right-0 top-0 bottom-0 h-full data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        left: 'left-0 top-0 bottom-0 h-full data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        full: 'max-w-full',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
      },
    },
    compoundVariants: [
      // Bottom position styling
      {
        position: 'bottom',
        className: 'rounded-t-xl rounded-b-none max-h-[90vh]',
      },
      // Side positions styling
      {
        position: ['left', 'right'],
        className: 'max-w-sm sm:max-w-md rounded-none',
      },
    ],
    defaultVariants: {
      position: 'center',
      size: 'md',
      rounded: 'md',
    },
  }
)

// Root component
const Modal = DialogPrimitive.Root

// Trigger component
const ModalTrigger = DialogPrimitive.Trigger

// Portal component
const ModalPortal = DialogPrimitive.Portal

// Overlay component
interface ModalOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof modalOverlayVariants> {}

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  ModalOverlayProps
>(({ className, blur, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(modalOverlayVariants({ blur }), className)}
    {...props}
  />
))

ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

// Content component
interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean
  
  /**
   * Custom close button
   */
  closeButton?: React.ReactNode
  
  /**
   * Overlay blur amount
   * @default 'sm'
   */
  overlayBlur?: 'none' | 'sm' | 'md' | 'lg'
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    { 
      className, 
      children, 
      position, 
      size, 
      rounded,
      showCloseButton = true,
      closeButton,
      overlayBlur = 'sm',
      ...props 
    }, 
    ref
  ) => (
    <ModalPortal>
      <ModalOverlay blur={overlayBlur} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(modalContentVariants({ position, size, rounded }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          closeButton || (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )
        )}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
)

ModalContent.displayName = DialogPrimitive.Content.displayName

// Header component
const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
))

ModalHeader.displayName = 'ModalHeader'

// Title component
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))

ModalTitle.displayName = DialogPrimitive.Title.displayName

// Description component
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))

ModalDescription.displayName = DialogPrimitive.Description.displayName

// Body component
const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('py-4', className)} {...props} />
))

ModalBody.displayName = 'ModalBody'

// Footer component
interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alignment of footer content
   * @default 'right'
   */
  align?: 'left' | 'center' | 'right' | 'between'
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, align = 'right', ...props }, ref) => {
    const alignmentClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center space-x-2',
          alignmentClasses[align],
          className
        )}
        {...props}
      />
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

// Close component
const ModalClose = DialogPrimitive.Close

// Pre-configured Dialog component
export interface DialogProps {
  /**
   * Whether the dialog is open
   */
  open?: boolean
  
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void
  
  /**
   * Dialog trigger element
   */
  trigger?: React.ReactNode
  
  /**
   * Dialog title
   */
  title?: string
  
  /**
   * Dialog description
   */
  description?: string
  
  /**
   * Dialog content
   */
  children: React.ReactNode
  
  /**
   * Footer actions
   */
  actions?: React.ReactNode
  
  /**
   * Size of the dialog
   * @default 'md'
   */
  size?: ModalContentProps['size']
  
  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean
}

/**
 * Dialog Component
 * 
 * A pre-configured modal dialog for common use cases.
 * 
 * @example
 * ```tsx
 * <Dialog
 *   trigger={<Button>Open Dialog</Button>}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item?"
 *   actions={
 *     <>
 *       <ModalClose asChild>
 *         <Button variant="outline">Cancel</Button>
 *       </ModalClose>
 *       <Button variant="danger">Delete</Button>
 *     </>
 *   }
 * >
 *   <p>This action cannot be undone.</p>
 * </Dialog>
 * ```
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  actions,
  size = 'md',
  showCloseButton = true,
}) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent size={size} showCloseButton={showCloseButton}>
        {(title || description) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {description && <ModalDescription>{description}</ModalDescription>}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {actions && <ModalFooter>{actions}</ModalFooter>}
      </ModalContent>
    </Modal>
  )
}

Dialog.displayName = 'Dialog'

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  ModalPortal,
  ModalOverlay,
}
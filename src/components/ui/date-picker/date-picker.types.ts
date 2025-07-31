import { type HTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { type DayPickerProps } from 'react-day-picker'
import { datePickerVariants } from './date-picker.variants'

// Date range type
export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

// Date preset definition
export interface DatePreset {
  label: string
  value: Date | DateRange | (() => Date | DateRange)
  description?: string
}

// Base date picker props
export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  // Value
  value?: Date
  onSelect?: (date: Date | undefined) => void
  
  // Display
  placeholder?: string
  format?: string
  disabled?: boolean
  
  // Calendar props
  calendarProps?: Partial<DayPickerProps>
  
  // Presets
  presets?: DatePreset[]
  showPresets?: boolean
  
  // Validation
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[] | ((date: Date) => boolean)
  
  // Styling
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  
  // Trigger customization
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>
}

// Date range picker props
export interface DateRangePickerProps extends Omit<DatePickerProps, 'value' | 'onSelect'> {
  value?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  
  // Range-specific
  numberOfMonths?: number
  allowSingleDayRange?: boolean
}

// Time picker props
export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  // Value
  value?: string // HH:mm format
  onSelect?: (time: string | undefined) => void
  
  // Format
  format?: '12' | '24'
  step?: number // minutes
  
  // Display
  placeholder?: string
  disabled?: boolean
  
  // Validation
  minTime?: string
  maxTime?: string
  
  // Styling
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

// Date time picker props
export interface DateTimePickerProps extends Omit<DatePickerProps, 'value' | 'onSelect'> {
  value?: Date
  onSelect?: (date: Date | undefined) => void
  
  // Time options
  timeFormat?: '12' | '24'
  timeStep?: number
  showTime?: boolean
  
  // Default time when selecting date
  defaultTime?: string
}

// Calendar props (internal)
export interface CalendarProps extends DayPickerProps {
  className?: string
}

// Date input props
export interface DateInputProps extends HTMLAttributes<HTMLInputElement> {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  format?: string
  disabled?: boolean
  error?: boolean
}

// Time input props  
export interface TimeInputProps extends HTMLAttributes<HTMLInputElement> {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  format?: '12' | '24'
  step?: number
  disabled?: boolean
  error?: boolean
}

// Preset list props
export interface PresetListProps extends HTMLAttributes<HTMLDivElement> {
  presets: DatePreset[]
  onSelect: (preset: DatePreset) => void
  selected?: DatePreset
}
'use client'

import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/utils/cn'
import { Button } from '../button'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { Input } from '../input'
import { Calendar as CalendarIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Clock as ClockIcon } from 'lucide-react'

import type {
  DatePickerProps,
  DateRangePickerProps,
  TimePickerProps,
  DateTimePickerProps,
  CalendarProps,
  DateRange,
  DatePreset,
  PresetListProps
} from './date-picker.types'

import {
  datePickerVariants,
  datePickerTriggerVariants,
  calendarVariants,
  presetListVariants,
  presetItemVariants,
  timePickerVariants,
  timeInputVariants
} from './date-picker.variants'

// Default presets
const defaultPresets: DatePreset[] = [
  {
    label: 'Aujourd\'hui',
    value: new Date(),
    description: 'Sélectionner aujourd\'hui'
  },
  {
    label: 'Demain',
    value: () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    },
    description: 'Sélectionner demain'
  },
  {
    label: 'Dans 7 jours',
    value: () => {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    },
    description: 'Dans une semaine'
  },
  {
    label: 'Dans 30 jours',
    value: () => {
      const nextMonth = new Date()
      nextMonth.setDate(nextMonth.getDate() + 30)
      return nextMonth
    },
    description: 'Dans un mois'
  }
]

/**
 * Calendar Component (internal)
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, ...props }, ref) => {
    return (
      <DayPicker
        ref={ref}
        showOutsideDays={showOutsideDays}
        locale={fr}
        className={cn(calendarVariants(), className)}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-sm font-medium',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          row: 'flex w-full mt-2',
          cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          day: cn(
            'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
          ),
          day_range_end: 'day-range-end',
          day_selected:
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          day_today: 'bg-accent text-accent-foreground',
          day_outside:
            'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
          day_disabled: 'text-muted-foreground opacity-50',
          day_range_middle:
            'aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_hidden: 'invisible',
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
        }}
        {...props}
      />
    )
  }
)
Calendar.displayName = 'Calendar'

/**
 * Preset List Component
 */
export const PresetList = React.forwardRef<HTMLDivElement, PresetListProps>(
  ({ className, presets, onSelect, selected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(presetListVariants(), className)}
        {...props}
      >
        {presets.map((preset, index) => (
          <div
            key={index}
            className={cn(
              presetItemVariants({ selected: selected === preset })
            )}
            onClick={() => onSelect(preset)}
          >
            <div>
              <div className="font-medium">{preset.label}</div>
              {preset.description && (
                <div className="text-xs text-muted-foreground">
                  {preset.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
)
PresetList.displayName = 'PresetList'

/**
 * Time Picker Component
 */
export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({ 
    className,
    value,
    onSelect,
    format = '24',
    step = 15,
    placeholder = '00:00',
    disabled = false,
    minTime,
    maxTime,
    variant = 'default',
    size = 'md',
    ...props 
  }, ref) => {
    const [hours, setHours] = useState(value ? value.split(':')[0] : '')
    const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '')
    const [period, setPeriod] = useState(
      value && format === '12' && parseInt(value.split(':')[0]) >= 12 ? 'PM' : 'AM'
    )

    // Generate time options
    const hourOptions = Array.from(
      { length: format === '12' ? 12 : 24 },
      (_, i) => {
        const hour = format === '12' ? (i === 0 ? 12 : i) : i
        return hour.toString().padStart(2, '0')
      }
    )

    const minuteOptions = Array.from(
      { length: 60 / step },
      (_, i) => (i * step).toString().padStart(2, '0')
    )

    const handleTimeChange = (newHours: string, newMinutes: string, newPeriod?: string) => {
      let finalHours = newHours
      
      if (format === '12' && newPeriod) {
        if (newPeriod === 'PM' && newHours !== '12') {
          finalHours = (parseInt(newHours) + 12).toString()
        } else if (newPeriod === 'AM' && newHours === '12') {
          finalHours = '00'
        }
      }

      const timeString = `${finalHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`
      onSelect?.(timeString)
    }

    return (
      <div
        ref={ref}
        className={cn(timePickerVariants(), className)}
        {...props}
      >
        {/* Hours */}
        <Select
          value={hours}
          onValueChange={(value) => {
            setHours(value)
            handleTimeChange(value, minutes, period)
          }}
          disabled={disabled}
        >
          <SelectTrigger className={cn(timeInputVariants({ size }))}>
            <SelectValue placeholder="00" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">:</span>

        {/* Minutes */}
        <Select
          value={minutes}
          onValueChange={(value) => {
            setMinutes(value)
            handleTimeChange(hours, value, period)
          }}
          disabled={disabled}
        >
          <SelectTrigger className={cn(timeInputVariants({ size }))}>
            <SelectValue placeholder="00" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AM/PM for 12-hour format */}
        {format === '12' && (
          <Select
            value={period}
            onValueChange={(value) => {
              setPeriod(value)
              handleTimeChange(hours, minutes, value)
            }}
            disabled={disabled}
          >
            <SelectTrigger className={cn(timeInputVariants({ size }))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }
)
TimePicker.displayName = 'TimePicker'

/**
 * Date Picker Component
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ 
    className,
    value,
    onSelect,
    placeholder = 'Sélectionner une date',
    format: dateFormat = 'dd/MM/yyyy',
    disabled = false,
    calendarProps,
    presets = defaultPresets,
    showPresets = true,
    minDate,
    maxDate,
    disabledDates,
    variant = 'default',
    size = 'md',
    triggerProps,
    ...props 
  }, ref) => {
    const [open, setOpen] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState<DatePreset>()

    const handlePresetSelect = (preset: DatePreset) => {
      const presetValue = typeof preset.value === 'function' ? preset.value() : preset.value
      if (presetValue instanceof Date) {
        onSelect?.(presetValue)
        setSelectedPreset(preset)
        setOpen(false)
      }
    }

    const handleDateSelect = (date: Date | undefined) => {
      onSelect?.(date)
      setSelectedPreset(undefined)
      if (date) {
        setOpen(false)
      }
    }

    // Prepare disabled dates
    const disabled_dates = React.useMemo(() => {
      const disabled: any[] = []
      
      if (minDate) {
        disabled.push({ before: minDate })
      }
      
      if (maxDate) {
        disabled.push({ after: maxDate })
      }
      
      if (Array.isArray(disabledDates)) {
        disabled.push(...disabledDates)
      } else if (typeof disabledDates === 'function') {
        disabled.push(disabledDates)
      }
      
      return disabled.length > 0 ? disabled : undefined
    }, [minDate, maxDate, disabledDates])

    return (
      <div ref={ref} className={cn(datePickerVariants(), className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                datePickerTriggerVariants({ variant, size }),
                !value && 'text-muted-foreground'
              )}
              disabled={disabled}
              {...triggerProps}
            >
              <span>
                {value ? (
                  format(value, dateFormat, { locale: fr })
                ) : (
                  placeholder
                )}
              </span>
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start"
            sideOffset={4}
          >
            <div className="flex">
              {/* Presets */}
              {showPresets && presets.length > 0 && (
                <div className="border-r">
                  <PresetList
                    presets={presets}
                    onSelect={handlePresetSelect}
                    selected={selectedPreset}
                  />
                </div>
              )}
              
              {/* Calendar */}
              <div>
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={handleDateSelect}
                  disabled={disabled_dates}
                  initialFocus
                  {...calendarProps}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'

/**
 * Date Range Picker Component
 */
export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ 
    className,
    value,
    onSelect,
    placeholder = 'Sélectionner une période',
    format: dateFormat = 'dd/MM/yyyy',
    disabled = false,
    numberOfMonths = 2,
    allowSingleDayRange = false,
    ...props 
  }, ref) => {
    const [open, setOpen] = useState(false)

    const handleSelect = (range: DateRange | undefined) => {
      onSelect?.(range)
      if (range?.from && range?.to) {
        setOpen(false)
      }
    }

    const formatDateRange = (range: DateRange) => {
      if (!range?.from) return placeholder
      if (!range.to) return format(range.from, dateFormat, { locale: fr })
      return `${format(range.from, dateFormat, { locale: fr })} - ${format(range.to, dateFormat, { locale: fr })}`
    }

    return (
      <div ref={ref} className={cn(datePickerVariants(), className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                datePickerTriggerVariants(),
                !value?.from && 'text-muted-foreground'
              )}
              disabled={disabled}
            >
              <span>{formatDateRange(value || { from: undefined, to: undefined })}</span>
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={numberOfMonths}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
DateRangePicker.displayName = 'DateRangePicker'

/**
 * Date Time Picker Component
 */
export const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  ({ 
    className,
    value,
    onSelect,
    placeholder = 'Sélectionner date et heure',
    format: dateFormat = 'dd/MM/yyyy HH:mm',
    timeFormat = '24',
    timeStep = 15,
    showTime = true,
    defaultTime = '09:00',
    ...props 
  }, ref) => {
    const [open, setOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)
    const [selectedTime, setSelectedTime] = useState<string>(
      value ? format(value, 'HH:mm') : defaultTime
    )

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setSelectedDate(date)
        updateDateTime(date, selectedTime)
      }
    }

    const handleTimeSelect = (time: string | undefined) => {
      if (time) {
        setSelectedTime(time)
        if (selectedDate) {
          updateDateTime(selectedDate, time)
        }
      }
    }

    const updateDateTime = (date: Date, time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      onSelect?.(newDate)
    }

    const handleConfirm = () => {
      if (selectedDate) {
        updateDateTime(selectedDate, selectedTime)
        setOpen(false)
      }
    }

    return (
      <div ref={ref} className={cn(datePickerVariants(), className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                datePickerTriggerVariants(),
                !value && 'text-muted-foreground'
              )}
            >
              <span>
                {value ? (
                  format(value, dateFormat, { locale: fr })
                ) : (
                  placeholder
                )}
              </span>
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="space-y-4 p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
              
              {showTime && (
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Heure</span>
                  </div>
                  <TimePicker
                    value={selectedTime}
                    onSelect={handleTimeSelect}
                    format={timeFormat}
                    step={timeStep}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2 border-t pt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  size="sm"
                  onClick={handleConfirm}
                  disabled={!selectedDate}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
DateTimePicker.displayName = 'DateTimePicker'
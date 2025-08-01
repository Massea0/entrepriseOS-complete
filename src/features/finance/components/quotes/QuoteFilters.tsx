// QuoteFilters.tsx
// Filtres pour les devis

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CalendarIcon,
  Filter,
  X,
  Search,
  Sparkles
} from 'lucide-react'
import { QuoteFilters, QuoteStatus } from '../../types'

interface QuoteFiltersProps {
  filters: QuoteFilters
  onFiltersChange: (filters: QuoteFilters) => void
  className?: string
}

const statusOptions = [
  { value: QuoteStatus.DRAFT, label: 'Brouillon' },
  { value: QuoteStatus.SENT, label: 'Envoyé' },
  { value: QuoteStatus.VIEWED, label: 'Consulté' },
  { value: QuoteStatus.ACCEPTED, label: 'Accepté' },
  { value: QuoteStatus.REJECTED, label: 'Refusé' },
  { value: QuoteStatus.EXPIRED, label: 'Expiré' }
]

export function QuoteFilters({
  filters,
  onFiltersChange,
  className
}: QuoteFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.status?.length) count++
    if (filters.clientId) count++
    if (filters.dateRange) count++
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) count++
    if (filters.search) count++
    if (filters.aiGenerated !== undefined) count++
    return count
  }, [filters])

  const clearFilters = () => {
    onFiltersChange({})
  }

  const updateFilter = <K extends keyof QuoteFilters>(
    key: K,
    value: QuoteFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Recherche rapide */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Bouton filtres */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Filtres</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-1 text-xs"
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={filters.status?.[0] || 'all'}
                onValueChange={(value) => {
                  updateFilter('status', value === 'all' ? undefined : [value as QuoteStatus])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Période */}
            <div className="space-y-2">
              <Label>Période</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange ? (
                      <>
                        {format(filters.dateRange.start, 'dd MMM', { locale: fr })} -{' '}
                        {format(filters.dateRange.end, 'dd MMM yyyy', { locale: fr })}
                      </>
                    ) : (
                      'Sélectionner une période'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={{
                      from: filters.dateRange?.start,
                      to: filters.dateRange?.end
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        updateFilter('dateRange', {
                          start: range.from,
                          end: range.to
                        })
                      }
                    }}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Montant */}
            <div className="space-y-2">
              <Label>Montant</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={(e) => updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={(e) => updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Généré par IA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <Label>Généré par IA uniquement</Label>
              </div>
              <input
                type="checkbox"
                checked={filters.aiGenerated === true}
                onChange={(e) => updateFilter('aiGenerated', e.target.checked ? true : undefined)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Statut: {statusOptions.find(s => s.value === filters.status![0])?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('status', undefined)}
              />
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              Période sélectionnée
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('dateRange', undefined)}
              />
            </Badge>
          )}
          {filters.aiGenerated && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              IA
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('aiGenerated', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
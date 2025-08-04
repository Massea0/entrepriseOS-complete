'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'
import { 
  Play as PlayIcon, 
  Pause as PauseIcon, 
  Square as StopIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Filter as FilterIcon
} from 'lucide-react'
import type { TimeEntry, TimeEntryType } from '../types/projects.types'
import { useTimeTracking } from '../hooks/useProjects'
// import { ProjectUtils } from '../services/projects.service'

// Temporary utility functions
const ProjectUtils = {
  formatDuration: (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
  calculateTotalTime: (entries: any[]) => {
    return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
  },
  getActivityTypeColor: (type: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-800',
      meeting: 'bg-purple-100 text-purple-800',
      review: 'bg-yellow-100 text-yellow-800',
      planning: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  },
  calculateBillableAmount: (entries: TimeEntry[]) => {
    return entries
      .filter(entry => entry.billable && entry.hourlyRate)
      .reduce((total, entry) => {
        const hours = entry.duration / 60
        return total + (hours * (entry.hourlyRate || 0))
      }, 0)
  }
};

interface TimeTrackerProps {
  projectId?: string
  className?: string
}

interface ActiveTimerProps {
  activeEntry: TimeEntry | null
  onStop: (entryId: string) => Promise<void>
  onStart: (data: {
    projectId: string
    taskId?: string
    description?: string
    type?: string
  }) => Promise<void>
  className?: string
}

// Active timer display
const ActiveTimer: React.FC<ActiveTimerProps> = ({ 
  activeEntry, 
  onStop, 
  onStart, 
  className 
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState<TimeEntryType>('work')

  // Update timer display every second
  useEffect(() => {
    if (!activeEntry) return

    const interval = setInterval(() => {
      const now = new Date()
      const startTime = new Date(activeEntry.startTime)
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60) // minutes
      setCurrentTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeEntry])

  // Reset description when timer stops
  useEffect(() => {
    if (!activeEntry) {
      setDescription('')
    }
  }, [activeEntry])

  const handleStart = async () => {
    if (!description.trim()) return

    try {
      await onStart({
        projectId: 'current-project', // TODO: Get from context
        description: description.trim(),
        type: selectedType
      })
    } catch (error) {
      console.error('Failed to start timer:', error)
    }
  }

  const handleStop = async () => {
    if (!activeEntry) return

    try {
      await onStop(activeEntry.id)
    } catch (error) {
      console.error('Failed to stop timer:', error)
    }
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn('border-2', activeEntry ? 'border-green-500' : 'border-dashed', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5" />
          <span>Suivi du temps</span>
          {activeEntry && (
            <Badge variant="success" className="animate-pulse">
              En cours
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeEntry ? (
          // Active timer display
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-green-600 mb-2">
                {formatTime(currentTime)}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeEntry.description || 'Aucune description'}
              </p>
              <Badge variant="outline" className="mt-1">
                {activeEntry.type}
              </Badge>
            </div>

            <div className="flex justify-center space-x-2">
              <Button 
                variant="destructive" 
                onClick={handleStop}
                className="flex items-center space-x-2"
              >
                <StopIcon className="h-4 w-4" />
                <span>Arrêter</span>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Démarré à {new Date(activeEntry.startTime).toLocaleTimeString('fr-FR')}
            </div>
          </div>
        ) : (
          // Timer start form
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Description de la tâche
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sur quoi travaillez-vous ?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && description.trim()) {
                    handleStart()
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Type d'activité
              </label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as TimeEntryType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Travail</SelectItem>
                  <SelectItem value="meeting">Réunion</SelectItem>
                  <SelectItem value="research">Recherche</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="bug_fix">Correction de bug</SelectItem>
                  <SelectItem value="feature">Nouvelle fonctionnalité</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleStart}
              disabled={!description.trim()}
              className="w-full flex items-center space-x-2"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Démarrer le chrono</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Time entries table
const TimeEntriesTable: React.FC<{
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => Promise<void>
  isLoading: boolean
}> = ({ entries, onEdit, onDelete, isLoading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Filter entries based on selected filters
  const filteredEntries = React.useMemo(() => {
    let filtered = [...entries]

    // Filter by period
    const now = new Date()
    const startOfPeriod = new Date()

    switch (selectedPeriod) {
      case 'today':
        startOfPeriod.setHours(0, 0, 0, 0)
        break
      case 'week':
        startOfPeriod.setDate(now.getDate() - now.getDay())
        startOfPeriod.setHours(0, 0, 0, 0)
        break
      case 'month':
        startOfPeriod.setDate(1)
        startOfPeriod.setHours(0, 0, 0, 0)
        break
      case 'all':
      default:
        startOfPeriod.setFullYear(2000) // Far past
        break
    }

    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(entry => 
        new Date(entry.startTime) >= startOfPeriod
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType)
    }

    return filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }, [entries, selectedPeriod, selectedType])

  // Calculate totals
  const totalTime = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
  const billableTime = filteredEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.duration, 0)
  const totalAmount = ProjectUtils.calculateBillableAmount(filteredEntries)

  const getTypeColor = (type: TimeEntryType): string => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      meeting: 'bg-purple-100 text-purple-800',
      break: 'bg-gray-100 text-gray-800',
      research: 'bg-green-100 text-green-800',
      documentation: 'bg-yellow-100 text-yellow-800',
      bug_fix: 'bg-red-100 text-red-800',
      feature: 'bg-indigo-100 text-indigo-800',
      maintenance: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique du temps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Historique du temps</CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="work">Travail</SelectItem>
                <SelectItem value="meeting">Réunion</SelectItem>
                <SelectItem value="research">Recherche</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="bug_fix">Correction de bug</SelectItem>
                <SelectItem value="feature">Nouvelle fonctionnalité</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{ProjectUtils.formatDuration(totalTime)}</div>
            <div className="text-sm text-muted-foreground">Temps total</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{ProjectUtils.formatDuration(billableTime)}</div>
            <div className="text-sm text-muted-foreground">Temps facturable</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(totalAmount)}
            </div>
            <div className="text-sm text-muted-foreground">Montant</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune entrée de temps pour cette période</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Facturable</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="font-medium">
                      {entry.description || 'Sans description'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(entry.type)}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>
                        {new Date(entry.startTime).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.startTime).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {entry.endTime && (
                        <> - {new Date(entry.endTime).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {ProjectUtils.formatDuration(entry.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.billable ? "success" : "secondary"}>
                        {entry.billable ? 'Oui' : 'Non'}
                      </Badge>
                      {entry.billable && entry.hourlyRate && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <DollarSignIcon className="h-3 w-3" />
                          <span>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format((entry.duration / 60) * entry.hourlyRate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(entry)}
                        className="h-6 w-6 p-0"
                      >
                        <EditIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(entry.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

// Main Time Tracker component
export const TimeTracker: React.FC<TimeTrackerProps> = ({ projectId, className }) => {
  const { 
    entries, 
    activeEntry, 
    isLoading, 
    error, 
    startTimer, 
    stopTimer, 
    deleteEntry 
  } = useTimeTracking(projectId)

  const handleEdit = (entry: TimeEntry) => {
    // TODO: Implement edit time entry modal
    console.log('Edit time entry:', entry)
  }

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        await deleteEntry(entryId)
      } catch (error) {
        console.error('Failed to delete time entry:', error)
      }
    }
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <Card className="p-6">
          <div className="text-center">
            <ClockIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Actualiser
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Active Timer */}
      <ActiveTimer
        activeEntry={activeEntry}
        onStart={startTimer}
        onStop={stopTimer}
      />

      {/* Time Entries History */}
      <TimeEntriesTable
        entries={entries}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  )
}

TimeTracker.displayName = 'TimeTracker'
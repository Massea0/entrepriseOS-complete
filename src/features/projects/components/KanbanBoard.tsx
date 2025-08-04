'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { cn } from '@/utils/cn'
import { 
  Plus as PlusIcon, 
  MoreVertical as MoreVerticalIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Clock as ClockIcon,
  AlertCircle as AlertCircleIcon,
  Flag as FlagIcon,
  MessageSquare as MessageSquareIcon,
  Paperclip as PaperclipIcon,
  ArrowRight as ArrowRightIcon
} from 'lucide-react'
import type { Task, TaskStatus, Priority, KanbanColumn } from '../types/projects.types'
import { useProject } from '../hooks/useProjects'
// import { ProjectUtils } from '../services/projects.service'

// Temporary utility functions
const ProjectUtils = {
  getTaskStatusColor: (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },
  getTaskPriorityColor: (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  },
  formatDueDate: (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  },
  isOverdue: (dueDate: string) => {
    return new Date(dueDate) < new Date();
  },
  getDaysUntilDue: (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const days = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  },
  groupTasksByStatus: (tasks: Task[]): Record<string, Task[]> => {
    return tasks.reduce((groups, task) => {
      const status = task.status
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(task)
      return groups
    }, {} as Record<string, Task[]>)
  }
};

interface KanbanBoardProps {
  projectId: string
  className?: string
}

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onMove?: (taskId: string, newStatus: TaskStatus) => void
  className?: string
}

// Predefined columns configuration
const DEFAULT_COLUMNS: Array<{
  id: string
  name: string
  status: TaskStatus
  color: string
  wipLimit?: number
}> = [
  { id: 'todo', name: 'À faire', status: 'todo', color: 'bg-gray-100 border-gray-300' },
  { id: 'in_progress', name: 'En cours', status: 'in_progress', color: 'bg-blue-100 border-blue-300' },
  { id: 'in_review', name: 'En révision', status: 'in_review', color: 'bg-purple-100 border-purple-300' },
  { id: 'testing', name: 'Tests', status: 'testing', color: 'bg-orange-100 border-orange-300' },
  { id: 'done', name: 'Terminé', status: 'done', color: 'bg-green-100 border-green-300' }
]

// Task priority indicator
const PriorityIndicator: React.FC<{ priority: Priority }> = ({ priority }) => {
  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return { color: 'bg-red-600', label: 'Critique', icon: <AlertCircleIcon className="h-3 w-3" /> }
      case 'urgent':
        return { color: 'bg-red-500', label: 'Urgent', icon: <FlagIcon className="h-3 w-3" /> }
      case 'high':
        return { color: 'bg-orange-500', label: 'Élevée', icon: <FlagIcon className="h-3 w-3" /> }
      case 'medium':
        return { color: 'bg-yellow-500', label: 'Moyenne', icon: <FlagIcon className="h-3 w-3" /> }
      case 'low':
        return { color: 'bg-blue-500', label: 'Faible', icon: <FlagIcon className="h-3 w-3" /> }
      default:
        return { color: 'bg-gray-400', label: 'Non définie', icon: <FlagIcon className="h-3 w-3" /> }
    }
  }

  const config = getPriorityConfig(priority)

  return (
    <div className={cn('flex items-center space-x-1 px-2 py-1 rounded-full text-white text-xs', config.color)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  )
}

// Task card component
const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onMove, className }) => {
  const [isDragging, setIsDragging] = useState(false)

  // Calculate days until due date
  const getDaysUntilDue = (dueDate: Date | undefined) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue(task.dueDate)
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0

  return (
    <Card 
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md border-l-4',
        isDragging && 'opacity-50 rotate-2',
        isOverdue && 'border-l-red-500 bg-red-50',
        isDueSoon && 'border-l-orange-500 bg-orange-50',
        !isOverdue && !isDueSoon && 'border-l-gray-300',
        className
      )}
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onEdit?.(task)}
    >
      <CardContent className="p-3">
        {/* Header with priority */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
              {task.title}
            </h4>
          </div>
          <div className="ml-2 flex items-center space-x-1">
            {task.priority !== 'medium' && (
              <PriorityIndicator priority={task.priority} />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                // Open task menu
              }}
            >
              <MoreVerticalIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Progress bar */}
        {task.progress > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1" />
          </div>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(0, 3).map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs px-1 py-0"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </Badge>
            ))}
            {task.labels.length > 3 && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                +{task.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            {/* Due date */}
            {task.dueDate && (
              <div className={cn(
                'flex items-center space-x-1',
                isOverdue && 'text-red-600 font-medium',
                isDueSoon && 'text-orange-600 font-medium'
              )}>
                <CalendarIcon className="h-3 w-3" />
                <span>
                  {isOverdue ? `${Math.abs(daysUntilDue!)}j retard` :
                   isDueSoon ? `${daysUntilDue}j restant` :
                   new Date(task.dueDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
                  }
                </span>
              </div>
            )}

            {/* Time estimate */}
            {task.estimatedHours && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Comments count */}
            {task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquareIcon className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* Attachments count */}
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <PaperclipIcon className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Assignee */}
            {task.assignee && (
              <Avatar
                name={`${task.assignee.firstName} ${task.assignee.lastName}`}
                src={task.assignee.avatar}
                size="xs"
                className="ml-1"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Kanban column component
const KanbanColumn: React.FC<{
  column: typeof DEFAULT_COLUMNS[0]
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void
  onTaskEdit: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
}> = ({ column, tasks, onTaskMove, onTaskEdit, onAddTask }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onTaskMove(taskId, column.status)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const isAtWipLimit = column.wipLimit && tasks.length >= column.wipLimit

  return (
    <div className="flex-1 min-w-[300px] max-w-[350px]">
      <Card className={cn('h-full', column.color)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <span>{column.name}</span>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
              {column.wipLimit && (
                <Badge 
                  variant={isAtWipLimit ? "destructive" : "outline"} 
                  className="text-xs"
                >
                  Limite: {column.wipLimit}
                </Badge>
              )}
            </CardTitle>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask(column.status)}
              className="h-6 w-6 p-0"
              disabled={isAtWipLimit}
            >
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent 
          className={cn(
            'pt-0 min-h-[400px] space-y-2',
            isDragOver && 'bg-primary/5 border-2 border-dashed border-primary'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onMove={onTaskMove}
            />
          ))}

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm">Aucune tâche</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(column.status)}
                className="mt-2"
                disabled={isAtWipLimit}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter une tâche
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main Kanban Board component
export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, className }) => {
  const { project, tasks, isLoading, error, moveTask } = useProject(projectId)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return ProjectUtils.groupTasksByStatus(tasks)
  }, [tasks])

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Find current task position in new status column
      const newPosition = (tasksByStatus[newStatus]?.length || 0) + 1
      await moveTask(taskId, newStatus, newPosition)
    } catch (error) {
      console.error('Failed to move task:', error)
    }
  }

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const handleAddTask = (status: TaskStatus) => {
    // TODO: Implement add task modal
    console.log('Add task for status:', status)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[300px] max-w-[350px]">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <Card className="p-6">
          <div className="text-center">
            <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
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
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau Kanban</h2>
          <p className="text-muted-foreground">
            {project?.name} • {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <UserIcon className="h-4 w-4 mr-2" />
            Filtrer par assigné
          </Button>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {DEFAULT_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.status] || []}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      {/* Task Detail Modal */}
      <Modal open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <ModalContent className="max-w-4xl">
          <ModalHeader>
            <ModalTitle>
              {selectedTask?.title || 'Détails de la tâche'}
            </ModalTitle>
          </ModalHeader>
          <div className="p-6">
            {selectedTask && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Statut</label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedTask.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priorité</label>
                    <PriorityIndicator priority={selectedTask.priority} />
                  </div>
                  {selectedTask.assignee && (
                    <div>
                      <label className="text-sm font-medium">Assigné à</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar
                          name={`${selectedTask.assignee.firstName} ${selectedTask.assignee.lastName}`}
                          src={selectedTask.assignee.avatar}
                          size="sm"
                        />
                        <span className="text-sm">
                          {selectedTask.assignee.firstName} {selectedTask.assignee.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedTask.dueDate && (
                    <div>
                      <label className="text-sm font-medium">Date d'échéance</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedTask.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedTask.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                    Fermer
                  </Button>
                  <Button>
                    Modifier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}

KanbanBoard.displayName = 'KanbanBoard'
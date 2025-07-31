import { ReactNode } from 'react'
import { User } from '@/features/auth/types/auth.types'

// Project status types
export type ProjectStatus = 
  | 'draft'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'archived'

// Project priority levels
export type Priority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical'

// Task status types
export type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'testing'
  | 'done'
  | 'blocked'
  | 'cancelled'

// Project visibility
export type ProjectVisibility = 
  | 'public'
  | 'private'
  | 'team'
  | 'restricted'

// Time entry types
export type TimeEntryType = 
  | 'work'
  | 'meeting'
  | 'break'
  | 'research'
  | 'documentation'
  | 'bug_fix'
  | 'feature'
  | 'maintenance'

// File attachment types
export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  uploadedAt: Date
}

// Comment system
export interface Comment {
  id: string
  content: string
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  createdAt: Date
  updatedAt?: Date
  parentId?: string // For nested comments
  attachments?: Attachment[]
  reactions?: {
    emoji: string
    users: string[]
  }[]
}

// Project entity
export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: Priority
  visibility: ProjectVisibility
  
  // Dates
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
  
  // Ownership
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'email'>
  team: ProjectMember[]
  
  // Progress tracking
  progress: number // 0-100
  completedTasks: number
  totalTasks: number
  
  // Budget and time
  budget?: number
  spentBudget?: number
  estimatedHours?: number
  loggedHours?: number
  
  // Organization
  tags: string[]
  category?: string
  client?: string
  
  // Settings
  allowTimeTracking: boolean
  allowComments: boolean
  allowFileUploads: boolean
  
  // Metadata
  avatar?: string
  color?: string
  customFields?: Record<string, any>
}

// Project member with role
export interface ProjectMember {
  id: string
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'email'>
  role: ProjectRole
  joinedAt: Date
  permissions: ProjectPermission[]
  hourlyRate?: number
}

// Project roles
export type ProjectRole = 
  | 'owner'
  | 'admin'
  | 'manager'
  | 'developer'
  | 'designer'
  | 'tester'
  | 'client'
  | 'viewer'

// Project permissions
export type ProjectPermission = 
  | 'view'
  | 'edit'
  | 'delete'
  | 'manage_tasks'
  | 'manage_members'
  | 'manage_time'
  | 'manage_files'
  | 'manage_settings'

// Task entity
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  
  // Hierarchy
  projectId: string
  parentId?: string // For subtasks
  position: number // For ordering
  
  // Assignment
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  watchers: string[] // User IDs
  
  // Dates and time
  createdAt: Date
  updatedAt: Date
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  estimatedHours?: number
  loggedHours?: number
  
  // Organization
  tags: string[]
  labels: TaskLabel[]
  
  // Progress
  progress: number // 0-100
  subtasks: Task[]
  
  // Content
  attachments: Attachment[]
  comments: Comment[]
  
  // Dependencies
  dependencies: string[] // Task IDs this task depends on
  blockedBy: string[] // Task IDs blocking this task
  
  // Custom fields
  customFields?: Record<string, any>
}

// Task labels for categorization
export interface TaskLabel {
  id: string
  name: string
  color: string
  description?: string
}

// Kanban board configuration
export interface KanbanBoard {
  id: string
  name: string
  projectId: string
  columns: KanbanColumn[]
  settings: {
    allowColumnReorder: boolean
    allowTaskCreation: boolean
    showTaskDetails: boolean
    groupBy?: 'assignee' | 'priority' | 'label'
  }
}

// Kanban column
export interface KanbanColumn {
  id: string
  name: string
  status: TaskStatus
  position: number
  color?: string
  wipLimit?: number // Work In Progress limit
  tasks: Task[]
}

// Time entry for time tracking
export interface TimeEntry {
  id: string
  description?: string
  type: TimeEntryType
  
  // Time tracking
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  isRunning: boolean
  
  // Association
  projectId: string
  taskId?: string
  userId: string
  
  // Billing
  billable: boolean
  hourlyRate?: number
  amount?: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

// Gantt chart data
export interface GanttTask {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  dependencies: string[]
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  color?: string
  type: 'task' | 'milestone' | 'project'
  
  // Hierarchy for grouped tasks
  parentId?: string
  children?: GanttTask[]
}

// Timeline view configuration
export interface Timeline {
  id: string
  name: string
  projectId: string
  view: 'day' | 'week' | 'month' | 'quarter' | 'year'
  showWeekends: boolean
  showMilestones: boolean
  groupBy?: 'project' | 'assignee' | 'status'
}

// Project templates
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  
  // Template data
  projectData: Partial<Project>
  tasks: Partial<Task>[]
  kanbanColumns: Partial<KanbanColumn>[]
  
  // Usage stats
  usageCount: number
  rating: number
  isPublic: boolean
  createdBy: string
}

// Project analytics
export interface ProjectAnalytics {
  projectId: string
  period: {
    start: Date
    end: Date
  }
  
  // Task metrics
  tasksCreated: number
  tasksCompleted: number
  tasksOverdue: number
  avgTaskCompletionTime: number
  
  // Time metrics
  totalTimeLogged: number
  billableTime: number
  nonBillableTime: number
  avgDailyTime: number
  
  // Team metrics
  activeMembers: number
  topContributors: Array<{
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
    tasksCompleted: number
    timeLogged: number
  }>
  
  // Progress metrics
  progressByStatus: Record<TaskStatus, number>
  progressByPriority: Record<Priority, number>
  velocityTrend: Array<{
    date: Date
    tasksCompleted: number
    storyPoints?: number
  }>
  
  // Budget metrics
  budgetSpent: number
  budgetRemaining: number
  costPerHour: number
  projectedOverrun: number
}

// API request/response types
export interface CreateProjectRequest {
  name: string
  description?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  estimatedHours?: number
  visibility: ProjectVisibility
  tags?: string[]
  templateId?: string
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus
  priority?: Priority
}

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  parentId?: string
  assigneeId?: string
  priority?: Priority
  startDate?: Date
  dueDate?: Date
  estimatedHours?: number
  tags?: string[]
  labelIds?: string[]
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus
  progress?: number
  position?: number
}

export interface CreateTimeEntryRequest {
  projectId: string
  taskId?: string
  description?: string
  type: TimeEntryType
  startTime: Date
  endTime?: Date
  duration?: number
  billable?: boolean
}

// Hook return types
export interface UseProjectsReturn {
  projects: Project[]
  isLoading: boolean
  error: string | null
  createProject: (data: CreateProjectRequest) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseProjectReturn {
  project: Project | null
  tasks: Task[]
  kanbanBoard: KanbanBoard | null
  isLoading: boolean
  error: string | null
  
  // Task management
  createTask: (data: CreateTaskRequest) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => Promise<void>
  
  // Project management
  updateProject: (data: UpdateProjectRequest) => Promise<Project>
  addMember: (userId: string, role: ProjectRole) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  
  refresh: () => Promise<void>
}

export interface UseTimeTrackingReturn {
  entries: TimeEntry[]
  activeEntry: TimeEntry | null
  isLoading: boolean
  error: string | null
  
  startTimer: (data: Omit<CreateTimeEntryRequest, 'endTime' | 'duration'>) => Promise<TimeEntry>
  stopTimer: (entryId: string) => Promise<TimeEntry>
  createEntry: (data: CreateTimeEntryRequest) => Promise<TimeEntry>
  updateEntry: (id: string, data: Partial<TimeEntry>) => Promise<TimeEntry>
  deleteEntry: (id: string) => Promise<void>
  
  getTotalTime: (projectId?: string, period?: { start: Date; end: Date }) => number
  getBillableTime: (projectId?: string, period?: { start: Date; end: Date }) => number
}

export interface UseProjectAnalyticsReturn {
  analytics: ProjectAnalytics | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updatePeriod: (start: Date, end: Date) => void
}

// View configurations
export interface ProjectViewConfig {
  type: 'list' | 'kanban' | 'gantt' | 'timeline' | 'calendar'
  filters: {
    status?: TaskStatus[]
    priority?: Priority[]
    assignee?: string[]
    tags?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
  }
  groupBy?: 'status' | 'assignee' | 'priority' | 'project'
  sortBy?: 'name' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// Drag and drop types
export interface DragDropResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  }
}
import { ky } from '@/services/api'
import type {
  Project,
  Task,
  TimeEntry,
  KanbanBoard,
  ProjectTemplate,
  ProjectAnalytics,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTimeEntryRequest,
  ProjectMember,
  TaskLabel,
  Comment,
  Attachment
} from '../types/projects.types'

/**
 * Projects Service
 * Handles all project-related API calls
 */
export class ProjectsService {
  private static readonly ENDPOINTS = {
    // Projects
    PROJECTS: 'projects',
    PROJECT_BY_ID: (id: string) => `projects/${id}`,
    PROJECT_MEMBERS: (id: string) => `projects/${id}/members`,
    PROJECT_ANALYTICS: (id: string) => `projects/${id}/analytics`,
    
    // Tasks
    TASKS: 'tasks',
    PROJECT_TASKS: (projectId: string) => `projects/${projectId}/tasks`,
    TASK_BY_ID: (id: string) => `tasks/${id}`,
    TASK_COMMENTS: (id: string) => `tasks/${id}/comments`,
    TASK_ATTACHMENTS: (id: string) => `tasks/${id}/attachments`,
    TASK_DEPENDENCIES: (id: string) => `tasks/${id}/dependencies`,
    
    // Kanban
    KANBAN_BOARD: (projectId: string) => `projects/${projectId}/kanban`,
    KANBAN_MOVE_TASK: (projectId: string) => `projects/${projectId}/kanban/move`,
    
    // Time tracking
    TIME_ENTRIES: 'time-entries',
    PROJECT_TIME_ENTRIES: (projectId: string) => `projects/${projectId}/time-entries`,
    TIME_ENTRY_BY_ID: (id: string) => `time-entries/${id}`,
    START_TIMER: 'time-entries/start',
    STOP_TIMER: (id: string) => `time-entries/${id}/stop`,
    
    // Templates
    TEMPLATES: 'project-templates',
    TEMPLATE_BY_ID: (id: string) => `project-templates/${id}`,
    
    // Labels
    LABELS: 'task-labels',
    PROJECT_LABELS: (projectId: string) => `projects/${projectId}/labels`,
    
    // Search and filters
    SEARCH_PROJECTS: 'projects/search',
    SEARCH_TASKS: 'tasks/search',
    
    // Reports
    TIME_REPORTS: 'reports/time',
    PROJECT_REPORTS: 'reports/projects'
  } as const

  // Project Management

  /**
   * Get all projects for current user
   */
  static async getProjects(params?: {
    status?: string[]
    priority?: string[]
    tags?: string[]
    search?: string
    page?: number
    limit?: number
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.PROJECTS}?${searchParams.toString()}`).json<{
      projects: Project[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get project by ID
   */
  static async getProject(id: string): Promise<Project> {
    const response = await ky.get(this.ENDPOINTS.PROJECT_BY_ID(id)).json<Project>()
    return response
  }

  /**
   * Create new project
   */
  static async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await ky.post(this.ENDPOINTS.PROJECTS, {
      json: data
    }).json<Project>()
    return response
  }

  /**
   * Update project
   */
  static async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await ky.patch(this.ENDPOINTS.PROJECT_BY_ID(id), {
      json: data
    }).json<Project>()
    return response
  }

  /**
   * Delete project
   */
  static async deleteProject(id: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.PROJECT_BY_ID(id))
  }

  /**
   * Get project members
   */
  static async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await ky.get(this.ENDPOINTS.PROJECT_MEMBERS(projectId)).json<ProjectMember[]>()
    return response
  }

  /**
   * Add member to project
   */
  static async addProjectMember(
    projectId: string, 
    userId: string, 
    role: string
  ): Promise<ProjectMember> {
    const response = await ky.post(this.ENDPOINTS.PROJECT_MEMBERS(projectId), {
      json: { userId, role }
    }).json<ProjectMember>()
    return response
  }

  /**
   * Remove member from project
   */
  static async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await ky.delete(`${this.ENDPOINTS.PROJECT_MEMBERS(projectId)}/${userId}`)
  }

  // Task Management

  /**
   * Get tasks for project
   */
  static async getProjectTasks(projectId: string, params?: {
    status?: string[]
    assignee?: string[]
    priority?: string[]
    tags?: string[]
    includeSubtasks?: boolean
  }): Promise<Task[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.PROJECT_TASKS(projectId)}?${searchParams.toString()}`
    ).json<Task[]>()
    
    return response
  }

  /**
   * Get task by ID
   */
  static async getTask(id: string): Promise<Task> {
    const response = await ky.get(this.ENDPOINTS.TASK_BY_ID(id)).json<Task>()
    return response
  }

  /**
   * Create new task
   */
  static async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await ky.post(this.ENDPOINTS.TASKS, {
      json: data
    }).json<Task>()
    return response
  }

  /**
   * Update task
   */
  static async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await ky.patch(this.ENDPOINTS.TASK_BY_ID(id), {
      json: data
    }).json<Task>()
    return response
  }

  /**
   * Delete task
   */
  static async deleteTask(id: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.TASK_BY_ID(id))
  }

  /**
   * Move task to different status/position
   */
  static async moveTask(
    projectId: string,
    taskId: string,
    newStatus: string,
    newPosition: number
  ): Promise<Task> {
    const response = await ky.post(this.ENDPOINTS.KANBAN_MOVE_TASK(projectId), {
      json: { taskId, status: newStatus, position: newPosition }
    }).json<Task>()
    return response
  }

  // Kanban Board

  /**
   * Get kanban board for project
   */
  static async getKanbanBoard(projectId: string): Promise<KanbanBoard> {
    const response = await ky.get(this.ENDPOINTS.KANBAN_BOARD(projectId)).json<KanbanBoard>()
    return response
  }

  /**
   * Update kanban board configuration
   */
  static async updateKanbanBoard(projectId: string, data: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const response = await ky.patch(this.ENDPOINTS.KANBAN_BOARD(projectId), {
      json: data
    }).json<KanbanBoard>()
    return response
  }

  // Time Tracking

  /**
   * Get time entries
   */
  static async getTimeEntries(params?: {
    projectId?: string
    taskId?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    billable?: boolean
  }): Promise<TimeEntry[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            searchParams.append(key, value.toISOString())
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.TIME_ENTRIES}?${searchParams.toString()}`
    ).json<TimeEntry[]>()
    
    return response
  }

  /**
   * Create time entry
   */
  static async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
    const response = await ky.post(this.ENDPOINTS.TIME_ENTRIES, {
      json: data
    }).json<TimeEntry>()
    return response
  }

  /**
   * Start timer
   */
  static async startTimer(data: {
    projectId: string
    taskId?: string
    description?: string
    type?: string
  }): Promise<TimeEntry> {
    const response = await ky.post(this.ENDPOINTS.START_TIMER, {
      json: data
    }).json<TimeEntry>()
    return response
  }

  /**
   * Stop timer
   */
  static async stopTimer(entryId: string): Promise<TimeEntry> {
    const response = await ky.post(this.ENDPOINTS.STOP_TIMER(entryId)).json<TimeEntry>()
    return response
  }

  /**
   * Update time entry
   */
  static async updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<TimeEntry> {
    const response = await ky.patch(this.ENDPOINTS.TIME_ENTRY_BY_ID(id), {
      json: data
    }).json<TimeEntry>()
    return response
  }

  /**
   * Delete time entry
   */
  static async deleteTimeEntry(id: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.TIME_ENTRY_BY_ID(id))
  }

  // Comments

  /**
   * Get task comments
   */
  static async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await ky.get(this.ENDPOINTS.TASK_COMMENTS(taskId)).json<Comment[]>()
    return response
  }

  /**
   * Add comment to task
   */
  static async addTaskComment(taskId: string, content: string, parentId?: string): Promise<Comment> {
    const response = await ky.post(this.ENDPOINTS.TASK_COMMENTS(taskId), {
      json: { content, parentId }
    }).json<Comment>()
    return response
  }

  /**
   * Update comment
   */
  static async updateComment(taskId: string, commentId: string, content: string): Promise<Comment> {
    const response = await ky.patch(`${this.ENDPOINTS.TASK_COMMENTS(taskId)}/${commentId}`, {
      json: { content }
    }).json<Comment>()
    return response
  }

  /**
   * Delete comment
   */
  static async deleteComment(taskId: string, commentId: string): Promise<void> {
    await ky.delete(`${this.ENDPOINTS.TASK_COMMENTS(taskId)}/${commentId}`)
  }

  // File Attachments

  /**
   * Upload file attachment
   */
  static async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await ky.post(this.ENDPOINTS.TASK_ATTACHMENTS(taskId), {
      body: formData
    }).json<Attachment>()
    
    return response
  }

  /**
   * Delete attachment
   */
  static async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await ky.delete(`${this.ENDPOINTS.TASK_ATTACHMENTS(taskId)}/${attachmentId}`)
  }

  // Labels

  /**
   * Get project labels
   */
  static async getProjectLabels(projectId: string): Promise<TaskLabel[]> {
    const response = await ky.get(this.ENDPOINTS.PROJECT_LABELS(projectId)).json<TaskLabel[]>()
    return response
  }

  /**
   * Create label
   */
  static async createLabel(projectId: string, data: {
    name: string
    color: string
    description?: string
  }): Promise<TaskLabel> {
    const response = await ky.post(this.ENDPOINTS.PROJECT_LABELS(projectId), {
      json: data
    }).json<TaskLabel>()
    return response
  }

  // Templates

  /**
   * Get project templates
   */
  static async getProjectTemplates(params?: {
    category?: string
    tags?: string[]
    search?: string
  }): Promise<ProjectTemplate[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.TEMPLATES}?${searchParams.toString()}`
    ).json<ProjectTemplate[]>()
    
    return response
  }

  /**
   * Create project from template
   */
  static async createProjectFromTemplate(
    templateId: string, 
    data: CreateProjectRequest
  ): Promise<Project> {
    const response = await ky.post(`${this.ENDPOINTS.TEMPLATE_BY_ID(templateId)}/create`, {
      json: data
    }).json<Project>()
    return response
  }

  // Analytics

  /**
   * Get project analytics
   */
  static async getProjectAnalytics(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProjectAnalytics> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    const response = await ky.get(
      `${this.ENDPOINTS.PROJECT_ANALYTICS(projectId)}?${searchParams.toString()}`
    ).json<ProjectAnalytics>()
    
    return response
  }

  // Search

  /**
   * Search projects
   */
  static async searchProjects(query: string, filters?: {
    status?: string[]
    tags?: string[]
  }): Promise<Project[]> {
    const searchParams = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.SEARCH_PROJECTS}?${searchParams.toString()}`
    ).json<Project[]>()
    
    return response
  }

  /**
   * Search tasks
   */
  static async searchTasks(query: string, filters?: {
    projectId?: string
    status?: string[]
    assignee?: string[]
  }): Promise<Task[]> {
    const searchParams = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.SEARCH_TASKS}?${searchParams.toString()}`
    ).json<Task[]>()
    
    return response
  }
}

/**
 * Project Utilities
 * Helper functions for project management
 */
export class ProjectUtils {
  /**
   * Calculate project progress based on tasks
   */
  static calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0

    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0)
    return Math.round(totalProgress / tasks.length)
  }

  /**
   * Get overdue tasks
   */
  static getOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date()
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'done' && 
      task.status !== 'cancelled'
    )
  }

  /**
   * Get tasks due soon (within next 3 days)
   */
  static getTasksDueSoon(tasks: Task[], days: number = 3): Task[] {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) <= futureDate && 
      new Date(task.dueDate) >= now &&
      task.status !== 'done' && 
      task.status !== 'cancelled'
    )
  }

  /**
   * Format time duration
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins}min`
    } else if (mins === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${mins}min`
    }
  }

  /**
   * Get priority color
   */
  static getPriorityColor(priority: string): string {
    const colors = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
      critical: 'text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-600'
  }

  /**
   * Get status color
   */
  static getStatusColor(status: string): string {
    const colors = {
      todo: 'text-gray-600',
      in_progress: 'text-blue-600',
      in_review: 'text-purple-600',
      testing: 'text-orange-600',
      done: 'text-green-600',
      blocked: 'text-red-600',
      cancelled: 'text-gray-400'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600'
  }

  /**
   * Calculate billable amount
   */
  static calculateBillableAmount(entries: TimeEntry[]): number {
    return entries
      .filter(entry => entry.billable && entry.hourlyRate)
      .reduce((total, entry) => {
        const hours = entry.duration / 60
        return total + (hours * (entry.hourlyRate || 0))
      }, 0)
  }

  /**
   * Group tasks by status for Kanban
   */
  static groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((groups, task) => {
      const status = task.status
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(task)
      return groups
    }, {} as Record<string, Task[]>)
  }
}
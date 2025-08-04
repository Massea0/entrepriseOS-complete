'use client'

import React from 'react'
import { create } from 'zustand'
import { ProjectsService } from '../services/projects.service'
// import { useAuth } from '@/features/auth'
import { useAuth } from '@/hooks/use-auth'
import type {
  Project,
  Task,
  TimeEntry,
  KanbanBoard,
  UseProjectsReturn,
  UseProjectReturn,
  UseTimeTrackingReturn,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  ProjectRole
} from '../types/projects.types'

// Projects store state
interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Projects store actions
interface ProjectsActions {
  loadProjects: () => Promise<void>
  createProject: (data: CreateProjectRequest) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Combined projects store
interface ProjectsStore extends ProjectsState, ProjectsActions {}

// Projects store
export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  // Initial state
  projects: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions
  loadProjects: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await ProjectsService.getProjects()
      
      set({
        projects: response.projects,
        isLoading: false,
        lastUpdated: new Date()
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load projects'
      })
      throw error
    }
  },

  createProject: async (data: CreateProjectRequest) => {
    try {
      set({ isLoading: true, error: null })
      
      const project = await ProjectsService.createProject(data)
      
      set(state => ({
        projects: [...state.projects, project],
        isLoading: false
      }))
      
      return project
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create project'
      })
      throw error
    }
  },

  updateProject: async (id: string, data: UpdateProjectRequest) => {
    try {
      const project = await ProjectsService.updateProject(id, data)
      
      set(state => ({
        projects: state.projects.map(p => p.id === id ? project : p)
      }))
      
      return project
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project' })
      throw error
    }
  },

  deleteProject: async (id: string) => {
    try {
      await ProjectsService.deleteProject(id)
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== id)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete project' })
      throw error
    }
  },

  // Setters
  setProjects: (projects: Project[]) => set({ projects }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null })
}))

/**
 * Hook for projects list management
 */
export const useProjects = (): UseProjectsReturn => {
  const store = useProjectsStore()
  const { user } = useAuth()

  // Auto-load projects on mount
  React.useEffect(() => {
    if (user && store.projects.length === 0) {
      store.loadProjects().catch(console.error)
    }
  }, [user, store.projects.length])

  return {
    projects: store.projects,
    isLoading: store.isLoading,
    error: store.error,
    createProject: store.createProject,
    updateProject: store.updateProject,
    deleteProject: store.deleteProject,
    refresh: store.loadProjects
  }
}

// Single project store state
interface ProjectState {
  project: Project | null
  tasks: Task[]
  kanbanBoard: KanbanBoard | null
  isLoading: boolean
  error: string | null
}

// Single project store actions
interface ProjectActions {
  loadProject: (id: string) => Promise<void>
  loadTasks: (projectId: string) => Promise<void>
  loadKanbanBoard: (projectId: string) => Promise<void>
  createTask: (data: CreateTaskRequest) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => Promise<void>
  updateProject: (data: UpdateProjectRequest) => Promise<Project>
  addMember: (userId: string, role: ProjectRole) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  setProject: (project: Project | null) => void
  setTasks: (tasks: Task[]) => void
  setKanbanBoard: (board: KanbanBoard | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// Combined single project store
interface ProjectStore extends ProjectState, ProjectActions {}

// Single project store
export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  project: null,
  tasks: [],
  kanbanBoard: null,
  isLoading: false,
  error: null,

  // Actions
  loadProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const [project, tasks, kanbanBoard] = await Promise.allSettled([
        ProjectsService.getProject(id),
        ProjectsService.getProjectTasks(id),
        ProjectsService.getKanbanBoard(id)
      ])

      set({
        project: project.status === 'fulfilled' ? project.value : null,
        tasks: tasks.status === 'fulfilled' ? tasks.value : [],
        kanbanBoard: kanbanBoard.status === 'fulfilled' ? kanbanBoard.value : null,
        isLoading: false
      })

      if (project.status === 'rejected') {
        throw project.reason
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load project'
      })
      throw error
    }
  },

  loadTasks: async (projectId: string) => {
    try {
      const tasks = await ProjectsService.getProjectTasks(projectId)
      set({ tasks })
    } catch (error: any) {
      set({ error: error.message || 'Failed to load tasks' })
      throw error
    }
  },

  loadKanbanBoard: async (projectId: string) => {
    try {
      const kanbanBoard = await ProjectsService.getKanbanBoard(projectId)
      set({ kanbanBoard })
    } catch (error: any) {
      set({ error: error.message || 'Failed to load kanban board' })
      throw error
    }
  },

  createTask: async (data: CreateTaskRequest) => {
    try {
      const task = await ProjectsService.createTask(data)
      
      set(state => ({
        tasks: [...state.tasks, task]
      }))
      
      return task
    } catch (error: any) {
      set({ error: error.message || 'Failed to create task' })
      throw error
    }
  },

  updateTask: async (id: string, data: UpdateTaskRequest) => {
    try {
      const task = await ProjectsService.updateTask(id, data)
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? task : t)
      }))
      
      return task
    } catch (error: any) {
      set({ error: error.message || 'Failed to update task' })
      throw error
    }
  },

  deleteTask: async (id: string) => {
    try {
      await ProjectsService.deleteTask(id)
      
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete task' })
      throw error
    }
  },

  moveTask: async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    try {
      const { project } = get()
      if (!project) throw new Error('No project loaded')

      const task = await ProjectsService.moveTask(project.id, taskId, newStatus, newPosition)
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to move task' })
      throw error
    }
  },

  updateProject: async (data: UpdateProjectRequest) => {
    try {
      const { project } = get()
      if (!project) throw new Error('No project loaded')

      const updatedProject = await ProjectsService.updateProject(project.id, data)
      
      set({ project: updatedProject })
      
      return updatedProject
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project' })
      throw error
    }
  },

  addMember: async (userId: string, role: ProjectRole) => {
    try {
      const { project } = get()
      if (!project) throw new Error('No project loaded')

      await ProjectsService.addProjectMember(project.id, userId, role)
      
      // Reload project to get updated members
      await get().loadProject(project.id)
    } catch (error: any) {
      set({ error: error.message || 'Failed to add member' })
      throw error
    }
  },

  removeMember: async (userId: string) => {
    try {
      const { project } = get()
      if (!project) throw new Error('No project loaded')

      await ProjectsService.removeProjectMember(project.id, userId)
      
      // Reload project to get updated members
      await get().loadProject(project.id)
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove member' })
      throw error
    }
  },

  // Setters
  setProject: (project: Project | null) => set({ project }),
  setTasks: (tasks: Task[]) => set({ tasks }),
  setKanbanBoard: (kanbanBoard: KanbanBoard | null) => set({ kanbanBoard }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({
    project: null,
    tasks: [],
    kanbanBoard: null,
    isLoading: false,
    error: null
  })
}))

/**
 * Hook for single project management
 */
export const useProject = (projectId?: string): UseProjectReturn => {
  const store = useProjectStore()

  // Load project when ID changes
  React.useEffect(() => {
    if (projectId) {
      store.loadProject(projectId).catch(console.error)
    } else {
      store.reset()
    }
  }, [projectId])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      store.reset()
    }
  }, [])

  return {
    project: store.project,
    tasks: store.tasks,
    kanbanBoard: store.kanbanBoard,
    isLoading: store.isLoading,
    error: store.error,
    
    // Task management
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    moveTask: store.moveTask,
    
    // Project management
    updateProject: store.updateProject,
    addMember: store.addMember,
    removeMember: store.removeMember,
    
    refresh: () => projectId ? store.loadProject(projectId) : Promise.resolve()
  }
}

// Time tracking store
interface TimeTrackingState {
  entries: TimeEntry[]
  activeEntry: TimeEntry | null
  isLoading: boolean
  error: string | null
}

interface TimeTrackingActions {
  loadEntries: (params?: {
    projectId?: string
    startDate?: Date
    endDate?: Date
  }) => Promise<void>
  startTimer: (data: {
    projectId: string
    taskId?: string
    description?: string
    type?: string
  }) => Promise<TimeEntry>
  stopTimer: (entryId: string) => Promise<TimeEntry>
  createEntry: (data: any) => Promise<TimeEntry>
  updateEntry: (id: string, data: Partial<TimeEntry>) => Promise<TimeEntry>
  deleteEntry: (id: string) => Promise<void>
  setEntries: (entries: TimeEntry[]) => void
  setActiveEntry: (entry: TimeEntry | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

interface TimeTrackingStore extends TimeTrackingState, TimeTrackingActions {}

export const useTimeTrackingStore = create<TimeTrackingStore>((set, get) => ({
  // Initial state
  entries: [],
  activeEntry: null,
  isLoading: false,
  error: null,

  // Actions
  loadEntries: async (params = {}) => {
    try {
      set({ isLoading: true, error: null })
      
      const entries = await ProjectsService.getTimeEntries(params)
      const activeEntry = entries.find(entry => entry.isRunning) || null
      
      set({
        entries,
        activeEntry,
        isLoading: false
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load time entries'
      })
      throw error
    }
  },

  startTimer: async (data) => {
    try {
      // Stop any active timer first
      const { activeEntry } = get()
      if (activeEntry) {
        await get().stopTimer(activeEntry.id)
      }

      const entry = await ProjectsService.startTimer(data)
      
      set(state => ({
        entries: [...state.entries, entry],
        activeEntry: entry
      }))
      
      return entry
    } catch (error: any) {
      set({ error: error.message || 'Failed to start timer' })
      throw error
    }
  },

  stopTimer: async (entryId: string) => {
    try {
      const entry = await ProjectsService.stopTimer(entryId)
      
      set(state => ({
        entries: state.entries.map(e => e.id === entryId ? entry : e),
        activeEntry: null
      }))
      
      return entry
    } catch (error: any) {
      set({ error: error.message || 'Failed to stop timer' })
      throw error
    }
  },

  createEntry: async (data) => {
    try {
      const entry = await ProjectsService.createTimeEntry(data)
      
      set(state => ({
        entries: [...state.entries, entry]
      }))
      
      return entry
    } catch (error: any) {
      set({ error: error.message || 'Failed to create time entry' })
      throw error
    }
  },

  updateEntry: async (id: string, data: Partial<TimeEntry>) => {
    try {
      const entry = await ProjectsService.updateTimeEntry(id, data)
      
      set(state => ({
        entries: state.entries.map(e => e.id === id ? entry : e)
      }))
      
      return entry
    } catch (error: any) {
      set({ error: error.message || 'Failed to update time entry' })
      throw error
    }
  },

  deleteEntry: async (id: string) => {
    try {
      await ProjectsService.deleteTimeEntry(id)
      
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        activeEntry: state.activeEntry?.id === id ? null : state.activeEntry
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete time entry' })
      throw error
    }
  },

  // Setters
  setEntries: (entries: TimeEntry[]) => set({ entries }),
  setActiveEntry: (activeEntry: TimeEntry | null) => set({ activeEntry }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error })
}))

/**
 * Hook for time tracking
 */
export const useTimeTracking = (projectId?: string): UseTimeTrackingReturn => {
  const store = useTimeTrackingStore()

  // Load entries when project changes
  React.useEffect(() => {
    // Temporarily disabled for demo - no backend API
    // const params = projectId ? { projectId } : {}
    // store.loadEntries(params).catch(console.error)
    
    // Use mock data for demo
    const mockEntries: TimeEntry[] = [
      {
        id: '1',
        taskId: 'task-1',
        userId: 'user-1',
        projectId: projectId || 'project-1',
        startTime: new Date('2025-01-08T09:00:00'),
        endTime: new Date('2025-01-08T12:30:00'),
        duration: 210, // 3h30 en minutes
        description: 'Développement du module de facturation',
        billable: true,
        hourlyRate: 75,
        date: new Date('2025-01-08'),
        createdAt: new Date('2025-01-08T09:00:00'),
        updatedAt: new Date('2025-01-08T12:30:00'),
        isRunning: false,
        type: 'development'
      },
      {
        id: '2',
        taskId: 'task-2',
        userId: 'user-1',
        projectId: projectId || 'project-1',
        startTime: new Date('2025-01-08T14:00:00'),
        endTime: new Date('2025-01-08T16:30:00'),
        duration: 150, // 2h30 en minutes
        description: 'Réunion client et spécifications',
        billable: true,
        hourlyRate: 75,
        date: new Date('2025-01-08'),
        createdAt: new Date('2025-01-08T14:00:00'),
        updatedAt: new Date('2025-01-08T16:30:00'),
        isRunning: false,
        type: 'meeting'
      }
    ]
    
    store.setEntries(projectId ? mockEntries.filter(e => e.projectId === projectId) : mockEntries)
    store.setLoading(false)
  }, [projectId])

  // Utility functions
  const getTotalTime = React.useCallback((
    filterProjectId?: string, 
    period?: { start: Date; end: Date }
  ): number => {
    let filteredEntries = store.entries

    if (filterProjectId) {
      filteredEntries = filteredEntries.filter(entry => entry.projectId === filterProjectId)
    }

    if (period) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.startTime)
        return entryDate >= period.start && entryDate <= period.end
      })
    }

    return filteredEntries.reduce((total, entry) => total + entry.duration, 0)
  }, [store.entries])

  const getBillableTime = React.useCallback((
    filterProjectId?: string, 
    period?: { start: Date; end: Date }
  ): number => {
    let filteredEntries = store.entries.filter(entry => entry.billable)

    if (filterProjectId) {
      filteredEntries = filteredEntries.filter(entry => entry.projectId === filterProjectId)
    }

    if (period) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.startTime)
        return entryDate >= period.start && entryDate <= period.end
      })
    }

    return filteredEntries.reduce((total, entry) => total + entry.duration, 0)
  }, [store.entries])

  return {
    entries: store.entries,
    activeEntry: store.activeEntry,
    isLoading: store.isLoading,
    error: store.error,
    
    startTimer: store.startTimer,
    stopTimer: store.stopTimer,
    createEntry: store.createEntry,
    updateEntry: store.updateEntry,
    deleteEntry: store.deleteEntry,
    
    getTotalTime,
    getBillableTime
  }
}
// Hooks
export { useProjects, useProject, useTimeTracking, useProjectsStore, useProjectStore, useTimeTrackingStore } from './hooks/useProjects'

// Services
export { ProjectsService, ProjectUtils } from './services/projects.service'

// Components
export { KanbanBoard } from './components/KanbanBoard'
export { TimeTracker } from './components/TimeTracker'

// Pages
export { ProjectsPage } from './pages/ProjectsPage'

// Types
export type {
  // Core entities
  Project,
  Task,
  TimeEntry,
  KanbanBoard as KanbanBoardType,
  ProjectMember,
  TaskLabel,
  Comment,
  Attachment,
  
  // Enums and unions
  ProjectStatus,
  TaskStatus,
  Priority,
  ProjectVisibility,
  TimeEntryType,
  ProjectRole,
  ProjectPermission,
  
  // Configuration types
  KanbanColumn,
  GanttTask,
  Timeline,
  ProjectTemplate,
  ProjectAnalytics,
  ProjectViewConfig,
  DragDropResult,
  
  // API types
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTimeEntryRequest,
  
  // Hook return types
  UseProjectsReturn,
  UseProjectReturn,
  UseTimeTrackingReturn,
  UseProjectAnalyticsReturn
} from './types/projects.types'
'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/ui/container'
import { KanbanBoard } from '../components/KanbanBoard'
import { TimeTracker } from '../components/TimeTracker'
import { cn } from '@/utils/cn'
import { 
  FolderIcon,
  KanbanSquareIcon,
  GanttChartIcon,
  ClockIcon,
  CalendarIcon,
  BarChartIcon,
  PlusIcon,
  SettingsIcon,
  SearchIcon,
  Filter as FilterIcon,
  GridIcon,
  ListIcon
} from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import type { Project, ProjectStatus } from '../types/projects.types'

interface ProjectsPageProps {
  className?: string
}

interface ProjectCardProps {
  project: Project
  onSelect: (project: Project) => void
  className?: string
}

// Project card component
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, className }) => {
  const getStatusColor = (status: ProjectStatus): string => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: ProjectStatus): string => {
    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      on_hold: 'En pause',
      completed: 'Terminé',
      cancelled: 'Annulé',
      archived: 'Archivé'
    }
    return labels[status] || status
  }

  const progressPercentage = project.progress || 0
  const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed'

  return (
    <Card 
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4',
        isOverdue ? 'border-l-red-500' : 'border-l-primary',
        className
      )}
      onClick={() => onSelect(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary line-clamp-1">
              {project.name}
            </CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {project.description}
              </p>
            )}
          </div>
          
          <div className="ml-3 flex flex-col items-end space-y-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
            {project.avatar && (
              <div 
                className="w-8 h-8 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${project.avatar})` }}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Project info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tâches</span>
            <div className="font-medium">
              {project.completedTasks}/{project.totalTasks}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Équipe</span>
            <div className="font-medium">
              {project.team.length} membre{project.team.length !== 1 ? 's' : ''}
            </div>
          </div>
          {project.endDate && (
            <div>
              <span className="text-muted-foreground">Échéance</span>
              <div className={cn(
                'font-medium',
                isOverdue && 'text-red-600'
              )}>
                {new Date(project.endDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}
          {project.loggedHours !== undefined && (
            <div>
              <span className="text-muted-foreground">Temps</span>
              <div className="font-medium">
                {Math.round(project.loggedHours)}h
                {project.estimatedHours && `/${project.estimatedHours}h`}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Team avatars */}
        {project.team.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground mr-2">Équipe:</span>
            <div className="flex -space-x-2">
              {project.team.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                  title={`${member.user.firstName} ${member.user.lastName}`}
                >
                  {member.user.avatar ? (
                    <img 
                      src={member.user.avatar} 
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </span>
                  )}
                </div>
              ))}
              {project.team.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{project.team.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Projects list view
const ProjectsList: React.FC<{
  projects: Project[]
  onSelectProject: (project: Project) => void
  isLoading: boolean
}> = ({ projects, onSelectProject, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-2 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun projet</h3>
        <p className="text-muted-foreground mb-6">
          Commencez par créer votre premier projet
        </p>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau projet
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={onSelectProject}
        />
      ))}
    </div>
  )
}

// Main Projects Page component
export const ProjectsPage: React.FC<ProjectsPageProps> = ({ className }) => {
  const { projects, isLoading, error } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeView, setActiveView] = useState<string>('overview')

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setActiveView('kanban')
  }

  const handleBackToOverview = () => {
    setSelectedProject(null)
    setActiveView('overview')
  }

  if (error) {
    return (
      <Container className={cn('py-6', className)}>
        <div className="flex items-center justify-center h-64">
          <Card className="p-6">
            <div className="text-center">
              <FolderIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Actualiser
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    )
  }

  return (
    <Container size="full" className={cn('py-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              {selectedProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToOverview}
                  className="mr-2"
                >
                  ← Retour
                </Button>
              )}
              <h1 className="text-3xl font-bold tracking-tight">
                {selectedProject ? selectedProject.name : 'Projets'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {selectedProject 
                ? `Gestion du projet • ${selectedProject.team.length} membre${selectedProject.team.length !== 1 ? 's' : ''}`
                : `Gérez vos projets et tâches • ${projects.length} projet${projects.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!selectedProject && (
              <>
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button variant="outline" size="sm">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </>
            )}
            
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              {selectedProject ? 'Nouvelle tâche' : 'Nouveau projet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedProject ? (
        // Project detailed view with tabs
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="kanban" className="flex items-center space-x-2">
              <KanbanSquareIcon className="h-4 w-4" />
              <span>Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center space-x-2">
              <GanttChartIcon className="h-4 w-4" />
              <span>Gantt</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>Temps</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChartIcon className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="kanban" className="space-y-4">
              <KanbanBoard projectId={selectedProject.id} />
            </TabsContent>

            <TabsContent value="gantt" className="space-y-4">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <GanttChartIcon className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Vue Gantt</h3>
                  <p>Planification temporelle des tâches</p>
                  <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Timeline</h3>
                  <p>Chronologie des événements du projet</p>
                  <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <TimeTracker projectId={selectedProject.id} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChartIcon className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics</h3>
                  <p>Métriques et rapports de performance</p>
                  <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        // Projects overview
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FolderIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <div className="text-xs text-muted-foreground">Projets total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Projets actifs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Terminés</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(projects.reduce((sum, p) => sum + (p.loggedHours || 0), 0))}h
                    </div>
                    <div className="text-xs text-muted-foreground">Temps total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects list */}
          <ProjectsList
            projects={projects}
            onSelectProject={handleSelectProject}
            isLoading={isLoading}
          />
        </div>
      )}
    </Container>
  )
}

// Export missing CheckIcon
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
)

ProjectsPage.displayName = 'ProjectsPage'
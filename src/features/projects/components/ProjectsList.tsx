import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FolderOpen,
  Grid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  team: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  tasks: {
    total: number;
    completed: number;
  };
  client?: string;
}

// Données de démo
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Refonte Site E-commerce',
    description: 'Migration complète du site e-commerce vers une architecture moderne',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-03-31'),
    budget: 85000,
    spent: 55250,
    team: [
      { id: '1', name: 'Jean Dupont', role: 'Chef de projet' },
      { id: '2', name: 'Marie Laurent', role: 'Développeur Frontend' },
      { id: '3', name: 'Sophie Chen', role: 'Designer UX' },
    ],
    tasks: { total: 48, completed: 31 },
    client: 'TechCorp Solutions'
  },
  {
    id: '2',
    name: 'Application Mobile Banking',
    description: 'Développement d\'une application mobile pour services bancaires',
    status: 'in_progress',
    priority: 'critical',
    progress: 40,
    startDate: new Date('2025-01-02'),
    endDate: new Date('2025-06-30'),
    budget: 120000,
    spent: 28000,
    team: [
      { id: '4', name: 'Thomas Bernard', role: 'Lead Developer' },
      { id: '5', name: 'Emma Rousseau', role: 'Mobile Developer' },
    ],
    tasks: { total: 72, completed: 29 },
    client: 'Finance Plus'
  },
  {
    id: '3',
    name: 'Système de Gestion RH',
    description: 'Implémentation d\'un nouveau système RH intégré',
    status: 'planning',
    priority: 'medium',
    progress: 15,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-07-31'),
    budget: 65000,
    spent: 5000,
    team: [
      { id: '1', name: 'Jean Dupont', role: 'Chef de projet' },
    ],
    tasks: { total: 35, completed: 5 },
    client: 'HealthTech Innovation'
  },
  {
    id: '4',
    name: 'Migration Cloud Infrastructure',
    description: 'Migration de l\'infrastructure on-premise vers AWS',
    status: 'completed',
    priority: 'high',
    progress: 100,
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    budget: 45000,
    spent: 42500,
    team: [
      { id: '6', name: 'Nicolas Petit', role: 'DevOps Engineer' },
      { id: '7', name: 'Lucas Martin', role: 'Cloud Architect' },
    ],
    tasks: { total: 28, completed: 28 },
    client: 'Logistique Express'
  },
  {
    id: '5',
    name: 'API REST Microservices',
    description: 'Développement d\'une architecture microservices',
    status: 'on_hold',
    priority: 'low',
    progress: 30,
    startDate: new Date('2024-11-15'),
    endDate: new Date('2025-04-30'),
    budget: 55000,
    spent: 16500,
    team: [
      { id: '4', name: 'Thomas Bernard', role: 'Backend Lead' },
    ],
    tasks: { total: 42, completed: 13 },
  },
];

export function ProjectsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects] = useState<Project[]>(MOCK_PROJECTS);

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calcul des statistiques
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0)
  };

  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'on_hold':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-blue-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} en cours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.completed / stats.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalSpent)} dépensés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficacité Budget</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.totalSpent / stats.totalBudget) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisation du budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des projets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projets</CardTitle>
              <CardDescription>Gérez tous vos projets en cours</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau projet
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="on_hold">En pause</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vue grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const daysRemaining = getDaysRemaining(project.endDate);
                const isOverdue = daysRemaining < 0 && project.status !== 'completed';
                
                return (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {project.client && (
                            <p className="text-sm text-muted-foreground mt-1">{project.client}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Voir détails</DropdownMenuItem>
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Archiver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {project.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={cn("text-muted-foreground", isOverdue && "text-red-600")}>
                            {isOverdue ? 'En retard' : `${daysRemaining}j restants`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {project.tasks.completed}/{project.tasks.total} tâches
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 3).map((member, index) => (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.team.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                              +{project.team.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((project.spent / project.budget) * 100)}% budget
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Vue liste */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const daysRemaining = getDaysRemaining(project.endDate);
                const isOverdue = daysRemaining < 0 && project.status !== 'completed';
                
                return (
                  <Card key={project.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <Badge variant={getStatusBadgeVariant(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(project.priority)}>
                              {project.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          {project.client && (
                            <p className="text-sm font-medium text-muted-foreground">Client: {project.client}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{project.progress}%</p>
                            <p className="text-xs text-muted-foreground">Progression</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{formatCurrency(project.spent)}</p>
                            <p className="text-xs text-muted-foreground">sur {formatCurrency(project.budget)}</p>
                          </div>
                          <div className="text-center">
                            <p className={cn("text-sm font-medium", isOverdue && "text-red-600")}>
                              {isOverdue ? 'En retard' : `${daysRemaining}j`}
                            </p>
                            <p className="text-xs text-muted-foreground">Échéance</p>
                          </div>
                          <div className="flex -space-x-2">
                            {project.team.slice(0, 4).map((member) => (
                              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Voir détails</DropdownMenuItem>
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Archiver
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun projet trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
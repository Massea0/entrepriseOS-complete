import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProjectsDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">Gérez vos projets et tâches</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 priorité haute</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches en cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">12 assignées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'achèvement</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Tâches critiques</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projets en cours</CardTitle>
              <CardDescription>Vue d'ensemble de tous les projets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Liste des projets à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les tâches</CardTitle>
              <CardDescription>Gérez et assignez les tâches</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Liste des tâches à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vue Kanban</CardTitle>
              <CardDescription>Organisez vos tâches visuellement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Board Kanban à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagramme de Gantt</CardTitle>
              <CardDescription>Planification temporelle des projets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Diagramme de Gantt à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier</CardTitle>
              <CardDescription>Vue calendrier des échéances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Calendrier à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
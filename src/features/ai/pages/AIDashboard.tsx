import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Zap, BarChart3, Bot } from 'lucide-react';

export default function AIDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Intelligence Artificielle</h1>
          <p className="text-muted-foreground">Exploitez la puissance de l'IA pour votre entreprise</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            Nouvelle automatisation
          </Button>
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Analyser données
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automatisations actives</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 cette semaine</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches automatisées</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps économisé</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124h</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Précision IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Taux de réussite</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="automations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automations">Automatisations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics IA</TabsTrigger>
          <TabsTrigger value="assistant">Assistant</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatisations actives</CardTitle>
              <CardDescription>Gérez vos processus automatisés</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Liste des automatisations à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics IA</CardTitle>
              <CardDescription>Insights intelligents sur vos données</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Dashboard analytics IA à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assistant IA</CardTitle>
              <CardDescription>Votre assistant personnel intelligent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Interface assistant IA à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prédictions</CardTitle>
              <CardDescription>Anticipez les tendances avec l'IA</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Module de prédictions à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflows intelligents</CardTitle>
              <CardDescription>Orchestration automatique des processus</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gestionnaire de workflows IA à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
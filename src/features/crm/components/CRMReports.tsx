import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart,
  FileText,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function CRMReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rapports CRM</h2>
          <p className="text-muted-foreground">Analyses et insights commerciaux</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Période
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="activites">Activités</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Chiffre d'affaires</CardTitle>
                <CardDescription>Évolution mensuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€125K</div>
                <p className="text-sm text-green-600 mt-2">+15% vs mois dernier</p>
                <div className="h-32 mt-4 bg-muted rounded flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nouveaux clients</CardTitle>
                <CardDescription>Ce trimestre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">28</div>
                <Progress value={70} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  70% de l'objectif atteint
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valeur moyenne deal</CardTitle>
                <CardDescription>Évolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€42K</div>
                <p className="text-sm text-green-600 mt-2">+8% vs trimestre dernier</p>
                <div className="flex items-center gap-2 mt-4">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Tendance positive</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse du pipeline</CardTitle>
              <CardDescription>Répartition par étape</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Qualification</span>
                    <span className="text-sm text-muted-foreground">€340K</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Proposition</span>
                    <span className="text-sm text-muted-foreground">€520K</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Négociation</span>
                    <span className="text-sm text-muted-foreground">€280K</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Clôture</span>
                    <span className="text-sm text-muted-foreground">€180K</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Taux de conversion par source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Site web</span>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email marketing</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Réseaux sociaux</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Référencement</span>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temps de cycle de vente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold">42 jours</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Durée moyenne de conversion
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded">
                    <PieChart className="h-24 w-24 mx-auto text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport d'activités commerciales</CardTitle>
              <CardDescription>Vue d'ensemble des actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-sm text-muted-foreground">Appels</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-sm text-muted-foreground">Emails</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">34</div>
                  <p className="text-sm text-muted-foreground">Réunions</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Démos</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted rounded">
                <div className="flex items-center justify-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Générer un rapport détaillé</p>
                    <p className="text-sm text-muted-foreground">
                      Inclure toutes les métriques de performance
                    </p>
                  </div>
                  <Button>Générer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
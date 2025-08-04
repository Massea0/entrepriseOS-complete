import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  Star,
  MessageSquare,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar?: string;
  rating: number;
  objectives: number;
  completed: number;
  lastReview: Date;
}

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Marie Laurent',
    position: 'Développeur Senior',
    department: 'Tech',
    rating: 4.5,
    objectives: 5,
    completed: 4,
    lastReview: new Date('2024-12-15')
  },
  {
    id: '2',
    name: 'Jean Dupont',
    position: 'Chef de projet',
    department: 'Management',
    rating: 4.2,
    objectives: 6,
    completed: 5,
    lastReview: new Date('2024-11-30')
  },
  {
    id: '3',
    name: 'Sophie Chen',
    position: 'Designer UX',
    department: 'Design',
    rating: 4.8,
    objectives: 4,
    completed: 4,
    lastReview: new Date('2025-01-05')
  }
];

export function PerformanceManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évaluations en cours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 à terminer cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3/5</div>
            <p className="text-xs text-green-600">+0.2 vs trimestre dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectifs atteints</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Sur 156 objectifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaine campagne</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mars 2025</div>
            <p className="text-xs text-muted-foreground">Dans 45 jours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evaluations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
          <TabsTrigger value="objectives">Objectifs</TabsTrigger>
          <TabsTrigger value="feedback">Feedback 360°</TabsTrigger>
          <TabsTrigger value="development">Plans de développement</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Évaluations de performance</CardTitle>
                  <CardDescription>Suivez et gérez les évaluations des employés</CardDescription>
                </div>
                <Button>Nouvelle évaluation</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_EMPLOYEES.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} - {employee.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Note</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(employee.rating)}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Objectifs</p>
                        <p className="font-medium">{employee.completed}/{employee.objectives}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Dernière éval.</p>
                        <p className="text-sm">{employee.lastReview.toLocaleDateString('fr-FR')}</p>
                      </div>
                      <Button variant="outline" size="sm">Voir détails</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des objectifs</CardTitle>
              <CardDescription>Définissez et suivez les objectifs SMART</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Augmenter les ventes de 15%</h4>
                      <p className="text-sm text-muted-foreground">Équipe commerciale - Q1 2025</p>
                    </div>
                    <Badge variant="default">En cours</Badge>
                  </div>
                  <Progress value={68} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression: 68%</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Sur la bonne voie
                    </span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Réduire le temps de réponse support</h4>
                      <p className="text-sm text-muted-foreground">Service client - Q1 2025</p>
                    </div>
                    <Badge variant="secondary">En retard</Badge>
                  </div>
                  <Progress value={45} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression: 45%</span>
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="h-3 w-3" />
                      Action requise
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback 360°</CardTitle>
              <CardDescription>Collectez des retours multi-sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">Feedback managers</h4>
                      </div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Reçus ce mois</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">Feedback pairs</h4>
                      </div>
                      <p className="text-2xl font-bold">18</p>
                      <p className="text-sm text-muted-foreground">En attente</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plans de développement</CardTitle>
              <CardDescription>Accompagnez la montée en compétences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Formation Leadership</h4>
                        <p className="text-sm text-muted-foreground">5 participants</p>
                      </div>
                    </div>
                    <Badge variant="success">En cours</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Début: Jan 2025</span>
                    <span>•</span>
                    <span>Durée: 3 mois</span>
                    <span>•</span>
                    <span>Budget: 5,000€</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats, useDashboardCharts, useRecentActivities } from '@/features/dashboard/hooks/use-dashboard-data';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Package,
  Activity,
  DollarSign,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  loading 
}: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[60px] mb-1" />
          <Skeleton className="h-3 w-[120px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && (
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {' '}({trend.isPositive ? '+' : ''}{trend.value}%)
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre entreprise</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Employés actifs"
          value={stats?.totalEmployees || 0}
          description="Total des employés"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          loading={statsLoading}
        />
        <StatCard
          title="Projets en cours"
          value={stats?.activeProjects || 0}
          description="Projets actifs"
          icon={Briefcase}
          trend={{ value: 8, isPositive: true }}
          loading={statsLoading}
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats?.revenue?.toLocaleString('fr-FR') || 0} €`}
          description="Ce mois-ci"
          icon={DollarSign}
          trend={{ value: 23, isPositive: true }}
          loading={statsLoading}
        />
        <StatCard
          title="Stock total"
          value={stats?.totalInventory || 0}
          description="Articles en stock"
          icon={Package}
          trend={{ value: -5, isPositive: false }}
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>
              Dernières actions dans votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune activité récente
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3">
              <Users className="h-4 w-4" />
              <span className="text-sm">Ajouter un employé</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Créer une facture</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">Nouveau projet</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3">
              <Package className="h-4 w-4" />
              <span className="text-sm">Gérer le stock</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tâches du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">12 complétées</span>
              </div>
              <span className="text-sm text-muted-foreground">/ 15 total</span>
            </div>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: '80%' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Congés en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">3</span>
              <span className="text-sm text-muted-foreground">demandes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              À valider cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alertes stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">5</span>
              <span className="text-sm text-muted-foreground">produits</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Stock faible ou rupture
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
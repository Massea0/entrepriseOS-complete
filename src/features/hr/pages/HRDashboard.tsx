import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  UserPlus,
  Clock,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react';

// Import des composants HR
import { EmployeeList } from '../components/EmployeeList';
import { LeaveManagement } from '../components/LeaveManagement';
import { RecruitmentDashboard } from '../components/RecruitmentDashboard';
import { HRStats } from '../components/HRStats';

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ressources Humaines</h1>
          <p className="text-muted-foreground">Gérez vos employés, congés et recrutements</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel employé
        </Button>
      </div>

      {/* Statistiques */}
      <HRStats />

      {/* Onglets principaux */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">
            <Users className="mr-2 h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="leaves">
            <Calendar className="mr-2 h-4 w-4" />
            Congés
          </TabsTrigger>
          <TabsTrigger value="recruitment">
            <Briefcase className="mr-2 h-4 w-4" />
            Recrutement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeList />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeaveManagement />
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4">
          <RecruitmentDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
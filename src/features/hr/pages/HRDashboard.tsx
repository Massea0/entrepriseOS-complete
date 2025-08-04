import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HRStats } from '../components/HRStats';
import { EmployeeList } from '../components/EmployeeList';
import { LeaveManagement } from '../components/LeaveManagement';
import { RecruitmentDashboard } from '../components/RecruitmentDashboard';
import { OrgChart } from '../components/OrgChart';
import { PerformanceManagement } from '../components/PerformanceManagement';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, Building2, UserPlus } from 'lucide-react';
import { useHRMock } from '../hooks/use-hr-mock';

export default function HRDashboard() {
  const { orgChart, departments, employees, isLoading } = useHRMock();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ressources Humaines</h1>
          <p className="text-muted-foreground">Gérez vos employés et votre organisation</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel employé
          </Button>
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau poste
          </Button>
        </div>
      </div>

      {/* Statistiques RH */}
      <HRStats />

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Congés
          </TabsTrigger>
          <TabsTrigger value="orgchart" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organigramme
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Recrutement
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeList />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeaveManagement />
        </TabsContent>

        <TabsContent value="orgchart" className="space-y-4">
          <OrgChart 
            orgChart={orgChart}
            departments={departments}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4">
          <RecruitmentDashboard />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
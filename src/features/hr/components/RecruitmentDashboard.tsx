import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, UserPlus } from 'lucide-react';

export function RecruitmentDashboard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recrutement</CardTitle>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau poste
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Module de recrutement</h3>
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité sera bientôt disponible
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
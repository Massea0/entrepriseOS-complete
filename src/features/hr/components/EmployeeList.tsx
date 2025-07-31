import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '../hooks/use-hr-data';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Phone,
  Building,
  Briefcase
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeList() {
  const { data: employees, isLoading } = useEmployees();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredEmployees = employees?.filter(employee => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const email = employee.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Liste des employés</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEmployees?.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatar_url} />
                  <AvatarFallback>
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="font-semibold">
                    {employee.first_name} {employee.last_name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {employee.email}
                    </span>
                    {employee.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  {employee.departments && (
                    <div className="flex items-center gap-1 text-sm">
                      <Building className="h-3 w-3" />
                      {employee.departments.name}
                    </div>
                  )}
                  {employee.positions && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {employee.positions.title}
                    </div>
                  )}
                </div>
                
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
                
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredEmployees?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun employé trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
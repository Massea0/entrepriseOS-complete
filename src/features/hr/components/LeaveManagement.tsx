'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeaveRequests, useUpdateLeaveRequest } from '../hooks/use-hr-data';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function LeaveManagement() {
  const { data: leaveRequests, isLoading } = useLeaveRequests('pending');
  const updateLeaveRequest = useUpdateLeaveRequest();

  const handleApprove = (id: string) => {
    updateLeaveRequest.mutate({
      data: { id, status: 'approved' }
    });
  };

  const handleReject = (id: string) => {
    updateLeaveRequest.mutate({
      data: { id, status: 'rejected', rejection_reason: 'Non conforme' }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes de congés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
              <Skeleton className="h-8 w-[100px]" />
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
          <CardTitle>Demandes de congés en attente</CardTitle>
          <Badge variant="secondary">
            {leaveRequests?.length || 0} demande(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaveRequests?.map((request) => (
            <div key={request.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">
                      {request.employee?.first_name} {request.employee?.last_name}
                    </span>
                    {request.leave_type && (
                      <Badge 
                        variant="outline"
                        style={{ borderColor: request.leave_type.color }}
                      >
                        {request.leave_type.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Du {format(new Date(request.start_date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span>
                      au {format(new Date(request.end_date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {request.days_requested} jour(s)
                    </span>
                  </div>
                  
                  {request.reason && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Motif :</span> {request.reason}
                    </p>
                  )}
                </div>
                
                {getStatusBadge(request.status)}
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request.id)}
                    disabled={updateLeaveRequest.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                    disabled={updateLeaveRequest.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {leaveRequests?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande de congé en attente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
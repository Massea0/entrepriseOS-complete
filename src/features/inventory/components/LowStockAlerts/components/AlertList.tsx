import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Filter,
  MoreVertical,
  Package,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertListProps, AlertSeverity, AlertStatus } from '../LowStockAlerts.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const AlertList: React.FC<AlertListProps> = ({ 
  alerts, 
  onAlertClick,
  onStatusChange,
  onBulkAction
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'date' | 'daysLeft'>('severity');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'daysLeft':
        return a.daysUntilStockout - b.daysUntilStockout;
      default:
        return 0;
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(sortedAlerts.map(alert => alert.id));
    } else {
      setSelectedAlerts([]);
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts([...selectedAlerts, alertId]);
    } else {
      setSelectedAlerts(selectedAlerts.filter(id => id !== alertId));
    }
  };

  const handleBulkAction = (action: 'acknowledge' | 'snooze' | 'resolve') => {
    if (selectedAlerts.length > 0) {
      onBulkAction?.(selectedAlerts, action);
      setSelectedAlerts([]);
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="secondary">Acknowledged</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600">Resolved</Badge>;
      case 'snoozed':
        return <Badge variant="outline">Snoozed</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Alerts</CardTitle>
            {selectedAlerts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedAlerts.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('acknowledge')}
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('snooze')}
                >
                  Snooze
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('resolve')}
                >
                  Resolve
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="snoozed">Snoozed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="daysLeft">Days Until Stockout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedAlerts.length === sortedAlerts.length && sortedAlerts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {sortedAlerts.map((alert) => (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onAlertClick?.(alert)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedAlerts.includes(alert.id)}
                          onCheckedChange={(checked) => handleSelectAlert(alert.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <p className="font-medium">{alert.product.name}</p>
                            <p className="text-sm text-muted-foreground">{alert.product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{alert.warehouse.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{alert.currentStock}</span>
                            <span className="text-sm text-muted-foreground">/ {alert.minStockLevel}</span>
                          </div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all",
                                alert.currentStock / alert.minStockLevel < 0.5 ? "bg-red-600" :
                                alert.currentStock / alert.minStockLevel < 0.75 ? "bg-yellow-600" :
                                "bg-green-600"
                              )}
                              style={{ width: `${(alert.currentStock / alert.minStockLevel) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            alert.daysUntilStockout <= 3 ? "destructive" :
                            alert.daysUntilStockout <= 7 ? "secondary" :
                            "outline"
                          }
                        >
                          {alert.daysUntilStockout} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(alert.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(alert.createdAt, 'MMM d, HH:mm')}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAlertClick?.(alert)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange?.(alert.id, 'acknowledged')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Acknowledge
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange?.(alert.id, 'snoozed')}>
                              <Clock className="h-4 w-4 mr-2" />
                              Snooze
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange?.(alert.id, 'resolved')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {sortedAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  Filter,
  RefreshCw,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  LowStockAlertsProps, 
  AlertFilters,
  StockAlert,
  AlertStatus
} from './LowStockAlerts.types';
import {
  AlertDashboard,
  AlertList,
  AlertDetails,
  ThresholdManager,
  NotificationSettings,
  AlertTimeline,
  AlertNotification
} from './components';

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ 
  className 
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'thresholds' | 'settings'>('dashboard');
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({
    status: ['active', 'acknowledged']
  });
  const [showNotification, setShowNotification] = useState(false);
  const [latestAlert, setLatestAlert] = useState<StockAlert | null>(null);

  // Query for alerts
  const { data: alertsData, isLoading, refetch } = useQuery({
    queryKey: ['stock-alerts', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock alerts
      const mockAlerts: StockAlert[] = [
        {
          id: '1',
          productId: 'p1',
          product: {
            id: 'p1',
            name: 'Wireless Headphones',
            sku: 'WH-001',
            category: 'Electronics',
            description: 'Premium wireless headphones',
            unitPrice: 99.99,
            currency: 'EUR',
            trackingType: 'serial',
            minStockLevel: 50,
            maxStockLevel: 500,
            reorderPoint: 100,
            reorderQuantity: 200,
            currentStock: 45,
            reservedStock: 10,
            availableStock: 35,
            images: [],
            supplierProducts: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          warehouseId: 'w1',
          warehouse: {
            id: 'w1',
            name: 'Main Warehouse',
            code: 'MW-001',
            type: 'main',
            address: {
              street: '123 Main St',
              city: 'Paris',
              postalCode: '75001',
              country: 'France',
              coordinates: { lat: 48.8566, lng: 2.3522 }
            },
            capacity: { total: 10000, used: 7500, unit: 'units' },
            zones: [],
            operatingHours: { monday: { open: '08:00', close: '18:00' } },
            contactEmail: 'warehouse@example.com',
            contactPhone: '+33123456789',
            features: ['climate-controlled', 'security-24-7'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          severity: 'critical',
          status: 'active',
          currentStock: 45,
          minStockLevel: 50,
          reorderPoint: 100,
          daysUntilStockout: 3,
          suggestedOrderQuantity: 200,
          message: 'Stock level critically low. Only 3 days of inventory remaining.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          productId: 'p2',
          product: {
            id: 'p2',
            name: 'USB-C Cable 2m',
            sku: 'UC-002',
            category: 'Electronics',
            description: 'High-speed USB-C cable',
            unitPrice: 19.99,
            currency: 'EUR',
            trackingType: 'lot',
            minStockLevel: 200,
            maxStockLevel: 2000,
            reorderPoint: 400,
            reorderQuantity: 800,
            currentStock: 350,
            reservedStock: 50,
            availableStock: 300,
            images: [],
            supplierProducts: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          warehouseId: 'w1',
          warehouse: {
            id: 'w1',
            name: 'Main Warehouse',
            code: 'MW-001',
            type: 'main',
            address: {
              street: '123 Main St',
              city: 'Paris',
              postalCode: '75001',
              country: 'France',
              coordinates: { lat: 48.8566, lng: 2.3522 }
            },
            capacity: { total: 10000, used: 7500, unit: 'units' },
            zones: [],
            operatingHours: { monday: { open: '08:00', close: '18:00' } },
            contactEmail: 'warehouse@example.com',
            contactPhone: '+33123456789',
            features: ['climate-controlled', 'security-24-7'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          severity: 'warning',
          status: 'active',
          currentStock: 350,
          minStockLevel: 200,
          reorderPoint: 400,
          daysUntilStockout: 7,
          suggestedOrderQuantity: 800,
          message: 'Stock approaching reorder point. Consider placing order soon.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      const stats = {
        total: mockAlerts.length,
        critical: mockAlerts.filter(a => a.severity === 'critical').length,
        warning: mockAlerts.filter(a => a.severity === 'warning').length,
        info: mockAlerts.filter(a => a.severity === 'info').length,
        active: mockAlerts.filter(a => a.status === 'active').length,
        acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: mockAlerts.filter(a => a.status === 'resolved').length,
        averageResolutionTime: 4.5,
        productsAtRisk: 15,
        estimatedStockoutValue: 45678
      };

      return {
        alerts: mockAlerts,
        stats
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mutation for updating alert status
  const updateAlertStatusMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: AlertStatus }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { alertId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
    }
  });

  // Simulate real-time alert
  useEffect(() => {
    const timer = setTimeout(() => {
      const newAlert: StockAlert = {
        id: '99',
        productId: 'p99',
        product: {
          id: 'p99',
          name: 'Gaming Mouse RGB',
          sku: 'GM-099',
          category: 'Electronics',
          description: 'Professional gaming mouse',
          unitPrice: 79.99,
          currency: 'EUR',
          trackingType: 'serial',
          minStockLevel: 30,
          maxStockLevel: 300,
          reorderPoint: 60,
          reorderQuantity: 150,
          currentStock: 25,
          reservedStock: 5,
          availableStock: 20,
          images: [],
          supplierProducts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        warehouseId: 'w2',
        warehouse: {
          id: 'w2',
          name: 'Secondary Warehouse',
          code: 'SW-002',
          type: 'distribution',
          address: {
            street: '456 Distribution Ave',
            city: 'Lyon',
            postalCode: '69001',
            country: 'France',
            coordinates: { lat: 45.7640, lng: 4.8357 }
          },
          capacity: { total: 5000, used: 3500, unit: 'units' },
          zones: [],
          operatingHours: { monday: { open: '08:00', close: '18:00' } },
          contactEmail: 'warehouse2@example.com',
          contactPhone: '+33987654321',
          features: ['loading-dock', 'forklift'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        severity: 'critical',
        status: 'active',
        currentStock: 25,
        minStockLevel: 30,
        reorderPoint: 60,
        daysUntilStockout: 2,
        suggestedOrderQuantity: 150,
        message: 'New critical alert: Gaming Mouse RGB stock critically low!',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setLatestAlert(newAlert);
      setShowNotification(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleAlertAction = (action: 'view' | 'acknowledge' | 'create-order') => {
    if (!latestAlert) return;
    
    switch (action) {
      case 'view':
        setSelectedAlert(latestAlert);
        setActiveTab('alerts');
        break;
      case 'acknowledge':
        updateAlertStatusMutation.mutate({ 
          alertId: latestAlert.id, 
          status: 'acknowledged' 
        });
        break;
      case 'create-order':
        console.log('Creating order for', latestAlert.product.name);
        break;
    }
    
    setShowNotification(false);
  };

  const handleExport = () => {
    console.log('Exporting alerts data...');
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h2>
          <p className="text-muted-foreground">
            Monitor inventory levels and receive alerts before stockouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Bell className="h-3 w-3" />
            {alertsData?.stats.active || 0} Active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isLoading && "animate-spin"
            )} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alert Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{alertsData?.stats.critical || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Warning Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{alertsData?.stats.warning || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Products at Risk</p>
              <p className="text-2xl font-bold">{alertsData?.stats.productsAtRisk || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
              <p className="text-2xl font-bold">{alertsData?.stats.averageResolutionTime || 0}h</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            All Alerts
          </TabsTrigger>
          <TabsTrigger value="thresholds">
            <Filter className="h-4 w-4 mr-2" />
            Thresholds
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AlertDashboard 
            filters={filters}
            onAlertClick={setSelectedAlert}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertList
            alerts={alertsData?.alerts || []}
            onAlertClick={setSelectedAlert}
            onStatusChange={(alertId, status) => {
              updateAlertStatusMutation.mutate({ alertId, status });
            }}
          />
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          <ThresholdManager
            thresholds={[]}
            onThresholdUpdate={(threshold) => console.log('Update threshold', threshold)}
            onThresholdCreate={(threshold) => console.log('Create threshold', threshold)}
            onThresholdDelete={(id) => console.log('Delete threshold', id)}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings
            settings={{
              id: '1',
              userId: 'user1',
              channels: ['email', 'in-app'],
              emailRecipients: ['admin@example.com'],
              phoneNumbers: [],
              criticalAlertsOnly: false,
              dailyDigest: true,
              weeklyReport: true,
              quietHours: {
                enabled: true,
                start: '22:00',
                end: '08:00',
                timezone: 'Europe/Paris'
              },
              alertFrequency: 'immediate'
            }}
            onSettingsUpdate={(settings) => console.log('Update settings', settings)}
          />
        </TabsContent>
      </Tabs>

      {/* Alert Details Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <AlertDetails
                alert={selectedAlert}
                onStatusChange={(status) => {
                  updateAlertStatusMutation.mutate({ 
                    alertId: selectedAlert.id, 
                    status 
                  });
                  setSelectedAlert(null);
                }}
                onCreateOrder={() => {
                  console.log('Creating order for', selectedAlert.product.name);
                  setSelectedAlert(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Alert Notification */}
      <AnimatePresence>
        {showNotification && latestAlert && (
          <AlertNotification
            alert={latestAlert}
            onDismiss={() => setShowNotification(false)}
            onAction={handleAlertAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
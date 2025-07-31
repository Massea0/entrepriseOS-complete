import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Scan, 
  CheckCircle,
  AlertCircle,
  MapPin,
  Navigation,
  Package,
  Clock,
  SkipForward,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MobilePickingProps, PickingTask, PickingItem, ScanResult } from '../mobile.types';
import { BarcodeScanner } from '../BarcodeScanner';

export const MobilePicking: React.FC<MobilePickingProps> = ({
  task: initialTask,
  warehouseId,
  onComplete,
  className
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'route' | 'scan' | 'summary'>('route');
  const [showScanner, setShowScanner] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [task, setTask] = useState<PickingTask>(initialTask || {
    id: `task-${Date.now()}`,
    orderId: 'ORD-2024-001',
    warehouseId,
    assignedTo: 'current-user',
    priority: 'medium',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        product: {
          id: 'prod-1',
          name: 'Wireless Mouse',
          sku: 'WM-001',
          category: 'Electronics',
          description: 'Ergonomic wireless mouse',
          unitPrice: 29.99,
          currency: 'EUR',
          trackingType: 'serial',
          minStockLevel: 10,
          maxStockLevel: 100,
          reorderPoint: 20,
          reorderQuantity: 50,
          currentStock: 45,
          reservedStock: 5,
          availableStock: 40,
          images: [],
          supplierProducts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 2,
        location: 'A-01-02',
        picked: 0,
        status: 'pending'
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        product: {
          id: 'prod-2',
          name: 'USB-C Cable 2m',
          sku: 'UC-002',
          category: 'Electronics',
          description: 'High-speed USB-C cable',
          unitPrice: 19.99,
          currency: 'EUR',
          trackingType: 'lot',
          minStockLevel: 50,
          maxStockLevel: 500,
          reorderPoint: 100,
          reorderQuantity: 200,
          currentStock: 150,
          reservedStock: 20,
          availableStock: 130,
          images: [],
          supplierProducts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 5,
        location: 'B-02-05',
        picked: 0,
        status: 'pending'
      }
    ],
    status: 'in-progress',
    startedAt: new Date(),
    route: {
      id: 'route-1',
      stops: [
        {
          location: 'A-01-02',
          items: [],
          sequence: 1
        },
        {
          location: 'B-02-05',
          items: [],
          sequence: 2
        }
      ],
      estimatedTime: 15,
      distance: 120
    }
  });

  // Group items by location for route
  const itemsByLocation = task.items.reduce((acc, item) => {
    if (!acc[item.location]) {
      acc[item.location] = [];
    }
    acc[item.location].push(item);
    return acc;
  }, {} as Record<string, PickingItem[]>);

  const currentStop = task.route?.stops[currentStopIndex];
  const currentLocationItems = currentStop ? itemsByLocation[currentStop.location] || [] : [];
  const allItemsPicked = task.items.every(item => item.status === 'completed' || item.status === 'skipped');
  const totalItems = task.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPicked = task.items.reduce((sum, item) => sum + item.picked, 0);
  const progress = totalItems > 0 ? (totalPicked / totalItems) * 100 : 0;

  const handleScan = async (result: ScanResult) => {
    setShowScanner(false);
    
    // Find matching item at current location
    const matchingItem = currentLocationItems.find(
      item => item.product.sku === result.value || 
              item.product.id === result.value
    );

    if (matchingItem && matchingItem.picked < matchingItem.quantity) {
      // Update picked quantity
      const updatedItems = task.items.map(item =>
        item.id === matchingItem.id
          ? {
              ...item,
              picked: item.picked + 1,
              status: item.picked + 1 === item.quantity ? 'completed' as const : 'partial' as const
            }
          : item
      );

      setTask({ ...task, items: updatedItems });
    }
  };

  const handleSkipItem = (itemId: string) => {
    const updatedItems = task.items.map(item =>
      item.id === itemId ? { ...item, status: 'skipped' as const } : item
    );
    setTask({ ...task, items: updatedItems });
  };

  const handleNextLocation = () => {
    if (currentStopIndex < (task.route?.stops.length || 0) - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
      setActiveTab('route');
    }
  };

  const completeTaskMutation = useMutation({
    mutationFn: async (task: PickingTask) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...task, completedAt: new Date(), status: 'completed' as const };
    },
    onSuccess: (completedTask) => {
      queryClient.invalidateQueries({ queryKey: ['picking-tasks'] });
      onComplete?.(completedTask);
    }
  });

  const handleComplete = () => {
    completeTaskMutation.mutate(task);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Picking Task
            </span>
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority} priority
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Order #{task.orderId}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Progress Bar */}
          <div className="px-4 py-2 border-b">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{totalPicked} / {totalItems} items</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="route">
                <Navigation className="h-4 w-4 mr-2" />
                Route
              </TabsTrigger>
              <TabsTrigger value="scan">
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="summary">
                <CheckCircle className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="route" className="space-y-4">
                {/* Current Location */}
                {currentStop && (
                  <Card className="border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-lg">
                            Location {currentStop.location}
                          </span>
                        </div>
                        <Badge>
                          Stop {currentStopIndex + 1} of {task.route?.stops.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentLocationItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-3 border rounded-lg",
                            item.status === 'completed' && "bg-green-50 border-green-200",
                            item.status === 'skipped' && "bg-gray-50 border-gray-200"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.product.sku}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm">
                                  Qty: {item.picked} / {item.quantity}
                                </span>
                                {item.status === 'completed' && (
                                  <Badge variant="outline" className="text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complete
                                  </Badge>
                                )}
                                {item.status === 'skipped' && (
                                  <Badge variant="outline" className="text-gray-600">
                                    <SkipForward className="h-3 w-3 mr-1" />
                                    Skipped
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {item.status !== 'completed' && item.status !== 'skipped' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSkipItem(item.id)}
                              >
                                Skip
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {currentLocationItems.every(item => 
                        item.status === 'completed' || item.status === 'skipped'
                      ) && currentStopIndex < (task.route?.stops.length || 0) - 1 && (
                        <Button
                          onClick={handleNextLocation}
                          className="w-full"
                        >
                          Next Location
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Route Overview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Route Overview</h4>
                  {task.route?.stops.map((stop, index) => (
                    <div
                      key={stop.location}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded",
                        index === currentStopIndex && "bg-primary/10",
                        index < currentStopIndex && "opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        index === currentStopIndex ? "bg-primary text-primary-foreground" :
                        index < currentStopIndex ? "bg-green-600 text-white" :
                        "bg-gray-200"
                      )}>
                        {index < currentStopIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{stop.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {itemsByLocation[stop.location]?.length || 0} items
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Route Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{task.route?.estimatedTime} min</p>
                    <p className="text-xs text-muted-foreground">Est. time</p>
                  </div>
                  <div className="text-center">
                    <Navigation className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{task.route?.distance}m</p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                {showScanner ? (
                  <div className="space-y-4">
                    <BarcodeScanner
                      onScan={handleScan}
                      continuous={true}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowScanner(false)}
                      className="w-full"
                    >
                      Stop Scanning
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <Scan className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Scan items to confirm picking
                    </p>
                    <Button
                      size="lg"
                      onClick={() => setShowScanner(true)}
                      className="w-full"
                    >
                      <Scan className="h-5 w-5 mr-2" />
                      Start Scanning
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                {/* Task Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Picked</span>
                    <span className="font-medium text-green-600">{totalPicked}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Skipped</span>
                    <span className="font-medium text-gray-600">
                      {task.items.filter(i => i.status === 'skipped').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {Math.round((Date.now() - task.startedAt!.getTime()) / 60000)} min
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">All Items</h4>
                  {task.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                      <Badge
                        variant={
                          item.status === 'completed' ? 'default' :
                          item.status === 'skipped' ? 'secondary' :
                          'outline'
                        }
                      >
                        {item.picked}/{item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Complete Button */}
                {allItemsPicked ? (
                  <Button
                    onClick={handleComplete}
                    disabled={completeTaskMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {completeTaskMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Complete Task
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Complete all items before finishing the task
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
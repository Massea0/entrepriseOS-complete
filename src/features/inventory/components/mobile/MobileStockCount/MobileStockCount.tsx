import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ClipboardCheck, 
  Scan, 
  CheckCircle,
  AlertTriangle,
  MapPin,
  Package,
  Hash,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  MobileStockCountProps, 
  StockCountSession, 
  CountItem,
  CountDiscrepancy,
  ScanResult 
} from '../mobile.types';
import { BarcodeScanner } from '../BarcodeScanner';

export const MobileStockCount: React.FC<MobileStockCountProps> = ({
  session: initialSession,
  warehouseId,
  onComplete,
  className
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'items' | 'scan' | 'discrepancies'>('items');
  const [showScanner, setShowScanner] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [manualCount, setManualCount] = useState('');
  const [countNotes, setCountNotes] = useState('');
  const [session, setSession] = useState<StockCountSession>(initialSession || {
    id: `count-${Date.now()}`,
    type: 'cycle',
    warehouseId,
    assignedTo: 'current-user',
    items: [
      {
        id: 'count-1',
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
        location: 'A-01-02',
        expectedQuantity: 45,
        status: 'pending'
      },
      {
        id: 'count-2',
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
        location: 'B-02-05',
        expectedQuantity: 150,
        status: 'pending'
      }
    ],
    status: 'in-progress',
    scheduledDate: new Date(),
    startedAt: new Date(),
    discrepancies: []
  });

  const currentItem = session.items[currentItemIndex];
  const totalItems = session.items.length;
  const countedItems = session.items.filter(item => item.status !== 'pending').length;
  const progress = totalItems > 0 ? (countedItems / totalItems) * 100 : 0;

  const handleScan = async (result: ScanResult) => {
    setShowScanner(false);
    
    // Find matching item
    const matchingItemIndex = session.items.findIndex(
      item => item.product.sku === result.value || 
              item.product.id === result.value
    );

    if (matchingItemIndex !== -1) {
      setCurrentItemIndex(matchingItemIndex);
      setActiveTab('items');
    }
  };

  const handleCountSubmit = (itemId: string, countedQuantity: number) => {
    const item = session.items.find(i => i.id === itemId);
    if (!item) return;

    // Update item
    const updatedItems = session.items.map(i =>
      i.id === itemId
        ? {
            ...i,
            countedQuantity,
            status: 'counted' as const,
            countedAt: new Date(),
            countedBy: 'current-user'
          }
        : i
    );

    // Check for discrepancy
    let updatedDiscrepancies = [...session.discrepancies];
    if (countedQuantity !== item.expectedQuantity) {
      const variance = countedQuantity - item.expectedQuantity;
      const variancePercentage = (variance / item.expectedQuantity) * 100;
      
      const discrepancy: CountDiscrepancy = {
        productId: item.productId,
        location: item.location,
        expectedQuantity: item.expectedQuantity,
        countedQuantity,
        variance,
        variancePercentage,
        resolved: false,
        notes: countNotes
      };
      
      updatedDiscrepancies.push(discrepancy);
    }

    setSession({
      ...session,
      items: updatedItems,
      discrepancies: updatedDiscrepancies
    });

    // Reset form and move to next item
    setManualCount('');
    setCountNotes('');
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const handleRecount = (itemId: string) => {
    const updatedItems = session.items.map(item =>
      item.id === itemId
        ? { ...item, status: 'recounted' as const, countedQuantity: undefined }
        : item
    );
    
    setSession({ ...session, items: updatedItems });
  };

  const handleResolveDiscrepancy = (productId: string, resolution: 'accept' | 'recount' | 'investigate') => {
    const updatedDiscrepancies = session.discrepancies.map(d =>
      d.productId === productId
        ? { ...d, resolved: true, resolution }
        : d
    );
    
    setSession({ ...session, discrepancies: updatedDiscrepancies });
  };

  const completeSessionMutation = useMutation({
    mutationFn: async (session: StockCountSession) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...session, completedAt: new Date(), status: 'completed' as const };
    },
    onSuccess: (completedSession) => {
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
      onComplete?.(completedSession);
    }
  });

  const handleComplete = () => {
    completeSessionMutation.mutate(session);
  };

  const allItemsCounted = session.items.every(item => item.status !== 'pending');
  const hasUnresolvedDiscrepancies = session.discrepancies.some(d => !d.resolved);

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Stock Count
            </span>
            <Badge variant="outline">
              {session.type === 'cycle' ? 'Cycle Count' :
               session.type === 'full' ? 'Full Count' :
               'Spot Check'}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {session.zones ? `Zones: ${session.zones.join(', ')}` : 'All zones'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Progress Bar */}
          <div className="px-4 py-2 border-b">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{countedItems} / {totalItems} items</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="items">
                <Package className="h-4 w-4 mr-2" />
                Items
              </TabsTrigger>
              <TabsTrigger value="scan">
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="discrepancies">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Issues ({session.discrepancies.length})
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="items" className="space-y-4">
                {currentItem && (
                  <Card className={cn(
                    "border-2",
                    currentItem.status === 'counted' ? "border-green-500" :
                    currentItem.status === 'recounted' ? "border-yellow-500" :
                    "border-primary"
                  )}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{currentItem.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            SKU: {currentItem.product.sku}
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {currentItem.location}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Expected vs Counted */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Expected</p>
                          <p className="text-2xl font-bold">{currentItem.expectedQuantity}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Counted</p>
                          <p className="text-2xl font-bold">
                            {currentItem.countedQuantity ?? '-'}
                          </p>
                        </div>
                      </div>

                      {/* Count Input */}
                      {currentItem.status === 'pending' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Physical Count</Label>
                            <div className="flex gap-2">
                              <Hash className="h-4 w-4 text-muted-foreground mt-2.5" />
                              <Input
                                type="number"
                                placeholder="Enter count"
                                value={manualCount}
                                onChange={(e) => setManualCount(e.target.value)}
                                className="text-lg font-medium"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Notes (Optional)</Label>
                            <Textarea
                              placeholder="Any observations..."
                              value={countNotes}
                              onChange={(e) => setCountNotes(e.target.value)}
                              rows={2}
                            />
                          </div>

                          <Button
                            onClick={() => handleCountSubmit(currentItem.id, parseInt(manualCount) || 0)}
                            disabled={!manualCount}
                            className="w-full"
                          >
                            Submit Count
                          </Button>
                        </div>
                      )}

                      {/* Counted Status */}
                      {currentItem.status !== 'pending' && (
                        <div className="space-y-3">
                          <Alert className={cn(
                            currentItem.countedQuantity === currentItem.expectedQuantity
                              ? "border-green-500"
                              : "border-yellow-500"
                          )}>
                            <AlertDescription>
                              {currentItem.countedQuantity === currentItem.expectedQuantity ? (
                                <span className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Count matches expected quantity
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  Discrepancy detected: {Math.abs((currentItem.countedQuantity || 0) - currentItem.expectedQuantity)} units difference
                                </span>
                              )}
                            </AlertDescription>
                          </Alert>

                          <Button
                            variant="outline"
                            onClick={() => handleRecount(currentItem.id)}
                            className="w-full"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Recount Item
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
                    disabled={currentItemIndex === 0}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    {currentItemIndex + 1} of {totalItems}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentItemIndex(Math.min(totalItems - 1, currentItemIndex + 1))}
                    disabled={currentItemIndex === totalItems - 1}
                  >
                    Next
                  </Button>
                </div>

                {/* Quick Navigation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">All Items</h4>
                  <div className="space-y-1">
                    {session.items.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentItemIndex(index)}
                        className={cn(
                          "w-full text-left p-2 rounded-lg text-sm transition-colors",
                          index === currentItemIndex && "bg-primary/10",
                          item.status === 'counted' && "border-l-4 border-green-500",
                          item.status === 'recounted' && "border-l-4 border-yellow-500"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-xs text-muted-foreground">{item.location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                {showScanner ? (
                  <div className="space-y-4">
                    <BarcodeScanner
                      onScan={handleScan}
                      continuous={false}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowScanner(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <Scan className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Scan item to quickly navigate
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

              <TabsContent value="discrepancies" className="space-y-4">
                {session.discrepancies.length > 0 ? (
                  <div className="space-y-3">
                    {session.discrepancies.map((discrepancy, index) => {
                      const item = session.items.find(i => i.productId === discrepancy.productId);
                      return (
                        <Card key={index} className={cn(
                          "border",
                          !discrepancy.resolved && "border-yellow-500"
                        )}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{item?.product.name}</h4>
                              <Badge variant={discrepancy.resolved ? "outline" : "destructive"}>
                                {discrepancy.resolved ? "Resolved" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{discrepancy.location}</p>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <p className="text-muted-foreground">Expected</p>
                                <p className="font-medium">{discrepancy.expectedQuantity}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Counted</p>
                                <p className="font-medium">{discrepancy.countedQuantity}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Variance</p>
                                <p className={cn(
                                  "font-medium",
                                  discrepancy.variance > 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {discrepancy.variance > 0 ? '+' : ''}{discrepancy.variance}
                                  <span className="text-xs"> ({discrepancy.variancePercentage.toFixed(1)}%)</span>
                                </p>
                              </div>
                            </div>

                            {discrepancy.notes && (
                              <div className="p-2 bg-muted rounded text-sm">
                                <FileText className="h-3 w-3 inline mr-1" />
                                {discrepancy.notes}
                              </div>
                            )}

                            {!discrepancy.resolved && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveDiscrepancy(discrepancy.productId, 'accept')}
                                  className="flex-1"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveDiscrepancy(discrepancy.productId, 'recount')}
                                  className="flex-1"
                                >
                                  Recount
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveDiscrepancy(discrepancy.productId, 'investigate')}
                                  className="flex-1"
                                >
                                  Investigate
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-muted-foreground">No discrepancies found</p>
                  </div>
                )}

                {/* Complete Button */}
                <div className="pt-4 border-t">
                  {allItemsCounted ? (
                    hasUnresolvedDiscrepancies ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Please resolve all discrepancies before completing the count
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        disabled={completeSessionMutation.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {completeSessionMutation.isPending ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Complete Count
                          </>
                        )}
                      </Button>
                    )
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Complete counting all items before finishing
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
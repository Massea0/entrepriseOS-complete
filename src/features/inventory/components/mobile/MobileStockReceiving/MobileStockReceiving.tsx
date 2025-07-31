import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Scan, 
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Save,
  X,
  List,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MobileStockReceivingProps, ScanResult, ScannedItem, MobileSession } from '../mobile.types';
import { BarcodeScanner } from '../BarcodeScanner';
import { Product } from '@/features/inventory/types/inventory.types';

export const MobileStockReceiving: React.FC<MobileStockReceivingProps> = ({
  purchaseOrder,
  warehouseId,
  onComplete,
  className
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'scan' | 'items' | 'summary'>('scan');
  const [showScanner, setShowScanner] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ScannedItem> | null>(null);
  const [session, setSession] = useState<MobileSession>({
    id: `session-${Date.now()}`,
    type: 'receiving',
    warehouseId,
    userId: 'current-user',
    startedAt: new Date(),
    items: [],
    status: 'active'
  });

  // Mock product lookup
  const lookupProduct = async (barcode: string): Promise<Product | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock product data
    const mockProducts: Record<string, Product> = {
      '1234567890123': {
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
      '5901234123457': {
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
      }
    };
    
    return mockProducts[barcode] || null;
  };

  const handleScan = async (result: ScanResult) => {
    setShowScanner(false);
    
    // Look up product
    const product = await lookupProduct(result.value);
    
    if (product) {
      setCurrentItem({
        id: `item-${Date.now()}`,
        scanResult: result,
        product,
        quantity: 1,
        scannedAt: new Date(),
        scannedBy: 'current-user'
      });
    } else {
      // Product not found
      setCurrentItem({
        id: `item-${Date.now()}`,
        scanResult: result,
        quantity: 1,
        scannedAt: new Date(),
        scannedBy: 'current-user'
      });
    }
  };

  const handleAddItem = () => {
    if (currentItem && (currentItem.product || currentItem.scanResult)) {
      const newItem: ScannedItem = {
        id: currentItem.id!,
        scanResult: currentItem.scanResult!,
        product: currentItem.product,
        quantity: currentItem.quantity || 1,
        location: currentItem.location,
        notes: currentItem.notes,
        scannedAt: currentItem.scannedAt!,
        scannedBy: currentItem.scannedBy!
      };
      
      setSession({
        ...session,
        items: [...session.items, newItem]
      });
      
      setCurrentItem(null);
      setActiveTab('items');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSession({
      ...session,
      items: session.items.filter(item => item.id !== itemId)
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSession({
      ...session,
      items: session.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    });
  };

  const completeSessionMutation = useMutation({
    mutationFn: async (session: MobileSession) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...session, completedAt: new Date(), status: 'completed' as const };
    },
    onSuccess: (completedSession) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      onComplete?.(completedSession);
    }
  });

  const handleComplete = () => {
    if (session.items.length > 0) {
      completeSessionMutation.mutate(session);
    }
  };

  const totalItems = session.items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = new Set(session.items.map(item => item.product?.id || item.scanResult.value)).size;

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Receiving
            </span>
            {purchaseOrder && (
              <Badge variant="outline">PO #{purchaseOrder.orderNumber}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan">
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="items">
                <List className="h-4 w-4 mr-2" />
                Items ({session.items.length})
              </TabsTrigger>
              <TabsTrigger value="summary">
                <CheckCircle className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
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
                ) : currentItem ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Scanned Item Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          {currentItem.product ? (
                            <>
                              <p className="font-medium">{currentItem.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {currentItem.product.sku}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-yellow-600">Unknown Product</p>
                              <p className="text-sm font-mono">{currentItem.scanResult?.value}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div>
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setCurrentItem({
                              ...currentItem,
                              quantity: Math.max(1, (currentItem.quantity || 1) - 1)
                            })}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={currentItem.quantity || 1}
                            onChange={(e) => setCurrentItem({
                              ...currentItem,
                              quantity: parseInt(e.target.value) || 1
                            })}
                            className="text-center"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setCurrentItem({
                              ...currentItem,
                              quantity: (currentItem.quantity || 1) + 1
                            })}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Location Input */}
                      <div>
                        <Label>Location (Optional)</Label>
                        <div className="flex gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-2.5" />
                          <Input
                            placeholder="e.g., A-01-02"
                            value={currentItem.location || ''}
                            onChange={(e) => setCurrentItem({
                              ...currentItem,
                              location: e.target.value
                            })}
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <Label>Notes (Optional)</Label>
                        <Input
                          placeholder="Any special notes..."
                          value={currentItem.notes || ''}
                          onChange={(e) => setCurrentItem({
                            ...currentItem,
                            notes: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentItem(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddItem}
                        className="flex-1"
                      >
                        Add Item
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <Scan className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Scan items to add to receiving session
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

              <TabsContent value="items" className="space-y-4">
                {session.items.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {session.items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.product?.name || 'Unknown Product'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.product?.sku || item.scanResult.value}
                            </p>
                            {item.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('scan')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Items
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No items scanned yet</p>
                    <Button onClick={() => setActiveTab('scan')}>
                      Start Scanning
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="space-y-4">
                  {/* Session Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Items</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Unique Products</span>
                      <span className="font-medium">{uniqueProducts}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">
                        {Math.round((Date.now() - session.startedAt.getTime()) / 60000)} min
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {purchaseOrder && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Receiving Progress</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                  )}

                  {/* Complete Button */}
                  {session.items.length > 0 ? (
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
                          Complete Receiving
                        </>
                      )}
                    </Button>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Scan at least one item before completing the session
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
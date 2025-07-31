import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trash2, 
  Edit, 
  Archive, 
  CheckCircle,
  AlertCircle,
  Package,
  DollarSign,
  Tag,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { BulkActionsProps } from '../ProductCatalog.types';
import { Product } from '@/features/inventory/types/inventory.types';

type BulkAction = 'delete' | 'archive' | 'update-price' | 'update-stock' | 'update-category' | 'update-status';

interface BulkUpdateData {
  priceAdjustment?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  stockAdjustment?: {
    type: 'set' | 'increase' | 'decrease';
    value: number;
  };
  category?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedProducts, 
  onClose 
}) => {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<BulkAction>('delete');
  const [updateData, setUpdateData] = useState<BulkUpdateData>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const bulkActionMutation = useMutation({
    mutationFn: async () => {
      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (let i = 0; i < selectedProducts.length; i++) {
        setProgress(((i + 1) / selectedProducts.length) * 100);
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Mock processing based on action
          switch (action) {
            case 'delete':
              if (!confirmDelete) {
                throw new Error('Deletion not confirmed');
              }
              break;
            case 'update-price':
              if (!updateData.priceAdjustment) {
                throw new Error('Price adjustment not specified');
              }
              break;
            case 'update-stock':
              if (!updateData.stockAdjustment) {
                throw new Error('Stock adjustment not specified');
              }
              break;
            case 'update-category':
              if (!updateData.category) {
                throw new Error('Category not specified');
              }
              break;
            case 'update-status':
              if (!updateData.status) {
                throw new Error('Status not specified');
              }
              break;
          }
          
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Product ${selectedProducts[i]}: ${error instanceof Error ? error.message : 'Failed'}`);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      setResults(results);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (results.failed === 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  });

  const handleExecute = () => {
    if (action === 'delete' && !confirmDelete) {
      return;
    }
    
    bulkActionMutation.mutate();
  };

  const getActionIcon = () => {
    switch (action) {
      case 'delete': return <Trash2 className="h-5 w-5" />;
      case 'archive': return <Archive className="h-5 w-5" />;
      case 'update-price': return <DollarSign className="h-5 w-5" />;
      case 'update-stock': return <Package className="h-5 w-5" />;
      case 'update-category': return <Tag className="h-5 w-5" />;
      case 'update-status': return <Layers className="h-5 w-5" />;
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'delete': return 'Delete Products';
      case 'archive': return 'Archive Products';
      case 'update-price': return 'Update Prices';
      case 'update-stock': return 'Update Stock Levels';
      case 'update-category': return 'Update Category';
      case 'update-status': return 'Update Status';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getActionIcon()}
          <span>Bulk Actions - {selectedProducts.length} Products Selected</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Selection */}
        <div>
          <Label>Select Action</Label>
          <Select value={action} onValueChange={(value) => setAction(value as BulkAction)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delete">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Products
                </div>
              </SelectItem>
              <SelectItem value="archive">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archive Products
                </div>
              </SelectItem>
              <SelectItem value="update-price">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Update Prices
                </div>
              </SelectItem>
              <SelectItem value="update-stock">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Update Stock Levels
                </div>
              </SelectItem>
              <SelectItem value="update-category">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Update Category
                </div>
              </SelectItem>
              <SelectItem value="update-status">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Update Status
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action-specific Options */}
        <motion.div
          key={action}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {action === 'delete' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p>This action will permanently delete {selectedProducts.length} products.</p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="confirm-delete"
                      checked={confirmDelete}
                      onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
                    />
                    <label htmlFor="confirm-delete" className="text-sm font-medium cursor-pointer">
                      I understand this action cannot be undone
                    </label>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {action === 'archive' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Archived products will be hidden from the main catalog but can be restored later.
              </AlertDescription>
            </Alert>
          )}

          {action === 'update-price' && (
            <div className="space-y-4">
              <div>
                <Label>Adjustment Type</Label>
                <Select
                  value={updateData.priceAdjustment?.type || 'percentage'}
                  onValueChange={(value) => setUpdateData({
                    ...updateData,
                    priceAdjustment: {
                      type: value as 'fixed' | 'percentage',
                      value: updateData.priceAdjustment?.value || 0
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {updateData.priceAdjustment?.type === 'percentage' ? 'Percentage (%)' : 'Amount'}
                </Label>
                <Input
                  type="number"
                  placeholder={updateData.priceAdjustment?.type === 'percentage' ? "10" : "5.00"}
                  value={updateData.priceAdjustment?.value || ''}
                  onChange={(e) => setUpdateData({
                    ...updateData,
                    priceAdjustment: {
                      type: updateData.priceAdjustment?.type || 'percentage',
                      value: parseFloat(e.target.value) || 0
                    }
                  })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {updateData.priceAdjustment?.type === 'percentage' 
                    ? 'Use negative values for discounts'
                    : 'This amount will be added to all selected products'}
                </p>
              </div>
            </div>
          )}

          {action === 'update-stock' && (
            <div className="space-y-4">
              <div>
                <Label>Adjustment Type</Label>
                <Select
                  value={updateData.stockAdjustment?.type || 'set'}
                  onValueChange={(value) => setUpdateData({
                    ...updateData,
                    stockAdjustment: {
                      type: value as 'set' | 'increase' | 'decrease',
                      value: updateData.stockAdjustment?.value || 0
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to Value</SelectItem>
                    <SelectItem value="increase">Increase by</SelectItem>
                    <SelectItem value="decrease">Decrease by</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={updateData.stockAdjustment?.value || ''}
                  onChange={(e) => setUpdateData({
                    ...updateData,
                    stockAdjustment: {
                      type: updateData.stockAdjustment?.type || 'set',
                      value: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          )}

          {action === 'update-category' && (
            <div>
              <Label>New Category</Label>
              <Input
                placeholder="Enter category name"
                value={updateData.category || ''}
                onChange={(e) => setUpdateData({
                  ...updateData,
                  category: e.target.value
                })}
              />
            </div>
          )}

          {action === 'update-status' && (
            <div>
              <Label>New Status</Label>
              <Select
                value={updateData.status || 'active'}
                onValueChange={(value) => setUpdateData({
                  ...updateData,
                  status: value as 'active' | 'inactive' | 'discontinued'
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </motion.div>

        {/* Progress */}
        {bulkActionMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Results */}
        {results && (
          <Alert variant={results.failed === 0 ? 'default' : 'destructive'}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  Operation completed: {results.success} successful, {results.failed} failed
                </p>
                {results.errors.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={bulkActionMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'delete' ? 'destructive' : 'default'}
            onClick={handleExecute}
            disabled={
              bulkActionMutation.isPending || 
              (action === 'delete' && !confirmDelete) ||
              (action === 'update-price' && !updateData.priceAdjustment?.value) ||
              (action === 'update-stock' && updateData.stockAdjustment?.value === undefined) ||
              (action === 'update-category' && !updateData.category) ||
              (action === 'update-status' && !updateData.status)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Execute {getActionTitle()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
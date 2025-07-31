import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ThresholdManagerProps, AlertThreshold } from '../LowStockAlerts.types';
import { cn } from '@/lib/utils';

export const ThresholdManager: React.FC<ThresholdManagerProps> = ({ 
  thresholds = [], 
  onThresholdUpdate,
  onThresholdCreate,
  onThresholdDelete
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AlertThreshold>>({
    name: '',
    description: '',
    minStockPercentage: 20,
    reorderPointPercentage: 40,
    criticalDaysThreshold: 3,
    warningDaysThreshold: 7,
    enabled: true,
    priority: 1
  });

  // Mock initial thresholds if none provided
  const displayThresholds = thresholds.length > 0 ? thresholds : [
    {
      id: '1',
      name: 'Default Threshold',
      description: 'Standard threshold for all products',
      minStockPercentage: 20,
      reorderPointPercentage: 40,
      criticalDaysThreshold: 3,
      warningDaysThreshold: 7,
      enabled: true,
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Electronics Category',
      description: 'Special threshold for electronics with higher turnover',
      productCategory: 'Electronics',
      minStockPercentage: 30,
      reorderPointPercentage: 50,
      criticalDaysThreshold: 5,
      warningDaysThreshold: 10,
      enabled: true,
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const handleCreate = () => {
    if (formData.name && onThresholdCreate) {
      onThresholdCreate({
        name: formData.name,
        description: formData.description || '',
        productCategory: formData.productCategory,
        warehouseId: formData.warehouseId,
        minStockPercentage: formData.minStockPercentage || 20,
        reorderPointPercentage: formData.reorderPointPercentage || 40,
        criticalDaysThreshold: formData.criticalDaysThreshold || 3,
        warningDaysThreshold: formData.warningDaysThreshold || 7,
        enabled: formData.enabled !== false,
        priority: formData.priority || 1
      });
      setIsCreating(false);
      resetForm();
    }
  };

  const handleUpdate = (threshold: AlertThreshold) => {
    if (onThresholdUpdate) {
      onThresholdUpdate(threshold);
      setEditingId(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minStockPercentage: 20,
      reorderPointPercentage: 40,
      criticalDaysThreshold: 3,
      warningDaysThreshold: 7,
      enabled: true,
      priority: 1
    });
  };

  const startEdit = (threshold: AlertThreshold) => {
    setEditingId(threshold.id);
    setFormData(threshold);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Alert Thresholds</h3>
          <p className="text-sm text-muted-foreground">
            Configure when alerts should be triggered based on stock levels
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Threshold
        </Button>
      </div>

      {/* Create New Threshold */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Alert Threshold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., High-Value Products"
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority?.toString()}
                      onValueChange={(v) => setFormData({ ...formData, priority: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">High</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe when this threshold should apply"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Category (Optional)</Label>
                    <Input
                      value={formData.productCategory || ''}
                      onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                      placeholder="e.g., Electronics"
                    />
                  </div>
                  <div>
                    <Label>Warehouse (Optional)</Label>
                    <Select
                      value={formData.warehouseId || 'all'}
                      onValueChange={(v) => setFormData({ ...formData, warehouseId: v === 'all' ? undefined : v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        <SelectItem value="w1">Main Warehouse</SelectItem>
                        <SelectItem value="w2">Secondary Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Minimum Stock Percentage: {formData.minStockPercentage}%</Label>
                    <Slider
                      value={[formData.minStockPercentage || 20]}
                      onValueChange={(v) => setFormData({ ...formData, minStockPercentage: v[0] })}
                      min={5}
                      max={50}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Reorder Point Percentage: {formData.reorderPointPercentage}%</Label>
                    <Slider
                      value={[formData.reorderPointPercentage || 40]}
                      onValueChange={(v) => setFormData({ ...formData, reorderPointPercentage: v[0] })}
                      min={20}
                      max={80}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Critical Alert (Days)</Label>
                    <Input
                      type="number"
                      value={formData.criticalDaysThreshold}
                      onChange={(e) => setFormData({ ...formData, criticalDaysThreshold: parseInt(e.target.value) })}
                      min={1}
                      max={30}
                    />
                  </div>
                  <div>
                    <Label>Warning Alert (Days)</Label>
                    <Input
                      type="number"
                      value={formData.warningDaysThreshold}
                      onChange={(e) => setFormData({ ...formData, warningDaysThreshold: parseInt(e.target.value) })}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                    />
                    <Label>Enable this threshold</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Threshold
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Thresholds */}
      <div className="space-y-4">
        {displayThresholds.map((threshold) => (
          <Card key={threshold.id} className={cn(!threshold.enabled && "opacity-60")}>
            <CardContent className="p-6">
              {editingId === threshold.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority?.toString()}
                        onValueChange={(v) => setFormData({ ...formData, priority: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">High</SelectItem>
                          <SelectItem value="2">Medium</SelectItem>
                          <SelectItem value="3">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate({ ...threshold, ...formData } as AlertThreshold)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{threshold.name}</h4>
                      {!threshold.enabled && <Badge variant="outline">Disabled</Badge>}
                      {threshold.productCategory && (
                        <Badge variant="secondary">{threshold.productCategory}</Badge>
                      )}
                      {threshold.warehouseId && (
                        <Badge variant="secondary">Specific Warehouse</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{threshold.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span>Critical: {threshold.criticalDaysThreshold} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        <span>Warning: {threshold.warningDaysThreshold} days</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min Stock: </span>
                        <span>{threshold.minStockPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reorder: </span>
                        <span>{threshold.reorderPointPercentage}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(threshold)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onThresholdDelete?.(threshold.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
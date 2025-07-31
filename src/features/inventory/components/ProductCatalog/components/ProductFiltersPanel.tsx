import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Filter, 
  Package, 
  Tag, 
  DollarSign,
  Archive,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductFiltersPanelProps, ProductFilters } from '../ProductCatalog.types';

export const ProductFiltersPanel: React.FC<ProductFiltersPanelProps> = ({ 
  filters, 
  onFiltersChange,
  onClose,
  productStats
}) => {
  const handleReset = () => {
    onFiltersChange({
      search: '',
      category: undefined,
      status: undefined,
      trackingType: undefined,
      priceRange: undefined,
      stockStatus: undefined,
      supplier: undefined,
      hasLowStock: false,
      hasImages: undefined
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value && value.length > 0;
    if (key === 'hasLowStock') return value === true;
    if (key === 'priceRange') return value && (value.min > 0 || value.max < 10000);
    return value !== undefined;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 overflow-y-auto"
    >
      <Card className="h-full rounded-none border-0">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} active</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Category
            </Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                category: value === 'all' ? undefined : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                <SelectItem value="Books & Media">Books & Media</SelectItem>
                <SelectItem value="Toys & Games">Toys & Games</SelectItem>
                <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Status
            </Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                status: value === 'all' ? undefined : value as any
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tracking Type Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tracking Type
            </Label>
            <Select
              value={filters.trackingType || 'all'}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                trackingType: value === 'all' ? undefined : value as any
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="none">No tracking</SelectItem>
                <SelectItem value="lot">Lot tracking</SelectItem>
                <SelectItem value="serial">Serial tracking</SelectItem>
                <SelectItem value="both">Lot & Serial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Price Range Filter */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Range
            </Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      priceRange: {
                        min: parseFloat(e.target.value) || 0,
                        max: filters.priceRange?.max || 10000
                      }
                    })}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      priceRange: {
                        min: filters.priceRange?.min || 0,
                        max: parseFloat(e.target.value) || 10000
                      }
                    })}
                  />
                </div>
              </div>
              {filters.priceRange && (
                <div className="px-2">
                  <Slider
                    value={[filters.priceRange.min, filters.priceRange.max]}
                    min={0}
                    max={10000}
                    step={10}
                    onValueChange={(value) => onFiltersChange({
                      ...filters,
                      priceRange: {
                        min: value[0],
                        max: value[1]
                      }
                    })}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Stock Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock Status
            </Label>
            <Select
              value={filters.stockStatus || 'all'}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                stockStatus: value === 'all' ? undefined : value as any
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All stock levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stock levels</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="space-y-4">
            <Label>Additional Filters</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="low-stock" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Show only low stock items
              </Label>
              <Switch
                id="low-stock"
                checked={filters.hasLowStock}
                onCheckedChange={(checked) => onFiltersChange({
                  ...filters,
                  hasLowStock: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="has-images" className="flex items-center gap-2 cursor-pointer">
                Products with images only
              </Label>
              <Switch
                id="has-images"
                checked={filters.hasImages || false}
                onCheckedChange={(checked) => onFiltersChange({
                  ...filters,
                  hasImages: checked
                })}
              />
            </div>
          </div>

          <Separator />

          {/* Supplier Filter */}
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input
              placeholder="Filter by supplier name"
              value={filters.supplier || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                supplier: e.target.value || undefined
              })}
            />
          </div>

          {/* Statistics */}
          {productStats && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Filter Statistics</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Total Products:</span>
                    <span className="font-medium">{productStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filtered Results:</span>
                    <span className="font-medium">{productStats.filtered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Products:</span>
                    <span className="font-medium">{productStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock Items:</span>
                    <span className="font-medium text-orange-500">{productStats.lowStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Out of Stock:</span>
                    <span className="font-medium text-red-500">{productStats.outOfStock}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-background pt-4 space-y-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
              disabled={activeFiltersCount === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Filters
            </Button>
            <Button
              onClick={onClose}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
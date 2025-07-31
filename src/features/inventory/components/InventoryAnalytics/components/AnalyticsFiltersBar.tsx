import React, { useState } from 'react';
import { 
  Calendar, 
  Building2, 
  Tag, 
  Users,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { 
  AnalyticsFiltersBarProps, 
  DateRange as DateRangeType 
} from '../InventoryAnalytics.types';

export const AnalyticsFiltersBar: React.FC<AnalyticsFiltersBarProps> = ({
  filters,
  onFiltersChange,
  view,
  onViewChange
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.customDateRange ? {
      from: filters.customDateRange.from,
      to: filters.customDateRange.to
    } : undefined
  );

  const handleDateRangeChange = (range: DateRangeType) => {
    if (range === 'custom') {
      // Open date picker
      return;
    }
    
    onFiltersChange({
      ...filters,
      dateRange: range,
      customDateRange: undefined
    });
  };

  const handleCustomDateRange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        dateRange: 'custom',
        customDateRange: {
          from: range.from,
          to: range.to
        }
      });
    }
  };

  const getDateRangeLabel = () => {
    if (filters.dateRange === 'custom' && filters.customDateRange) {
      return `${format(filters.customDateRange.from, 'MMM d')} - ${format(filters.customDateRange.to, 'MMM d, yyyy')}`;
    }
    
    switch (filters.dateRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Select period';
    }
  };

  const activeFiltersCount = [
    filters.warehouseId,
    filters.categoryId,
    filters.supplierId
  ].filter(Boolean).length;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-[200px] justify-between"
              >
                {getDateRangeLabel()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 space-y-2">
                <Button
                  variant={filters.dateRange === '7d' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDateRangeChange('7d')}
                >
                  Last 7 days
                </Button>
                <Button
                  variant={filters.dateRange === '30d' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDateRangeChange('30d')}
                >
                  Last 30 days
                </Button>
                <Button
                  variant={filters.dateRange === '90d' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDateRangeChange('90d')}
                >
                  Last 90 days
                </Button>
                <Button
                  variant={filters.dateRange === '1y' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDateRangeChange('1y')}
                >
                  Last year
                </Button>
                <div className="border-t pt-2">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={handleCustomDateRange}
                    numberOfMonths={2}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Warehouse Filter */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.warehouseId || 'all'}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              warehouseId: value === 'all' ? undefined : value
            })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              <SelectItem value="wh-001">Main Warehouse</SelectItem>
              <SelectItem value="wh-002">Secondary Warehouse</SelectItem>
              <SelectItem value="wh-003">Distribution Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              categoryId: value === 'all' ? undefined : value
            })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="food">Food & Beverage</SelectItem>
              <SelectItem value="home">Home & Garden</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Supplier Filter */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.supplierId || 'all'}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              supplierId: value === 'all' ? undefined : value
            })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All suppliers</SelectItem>
              <SelectItem value="sup-001">TechCorp Inc.</SelectItem>
              <SelectItem value="sup-002">Fashion Wholesale</SelectItem>
              <SelectItem value="sup-003">Food Distributors</SelectItem>
              <SelectItem value="sup-004">Home Supplies Co.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Count */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </Badge>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({
              dateRange: filters.dateRange,
              customDateRange: filters.customDateRange
            })}
          >
            Clear filters
          </Button>
        )}
      </div>
    </Card>
  );
};
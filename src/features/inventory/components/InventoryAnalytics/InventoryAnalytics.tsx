import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  InventoryAnalyticsProps, 
  AnalyticsFilters, 
  AnalyticsView,
  DateRange 
} from './InventoryAnalytics.types';
import {
  AnalyticsOverview,
  ABCAnalysis,
  TurnoverAnalysis,
  DemandForecasting,
  InventoryTrends,
  AnalyticsFiltersBar
} from './components';

export const InventoryAnalytics: React.FC<InventoryAnalyticsProps> = ({ 
  className 
}) => {
  const [view, setView] = useState<AnalyticsView>('overview');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d'
  });

  // Query for analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['inventory-analytics', filters, view],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data based on view
      return {
        lastUpdated: new Date(),
        data: {} // View-specific data would be returned here
      };
    }
  });

  const handleExport = () => {
    // Export analytics data
    console.log('Exporting analytics data...', { view, filters });
  };

  const getViewIcon = (viewType: AnalyticsView) => {
    switch (viewType) {
      case 'overview':
        return <BarChart3 className="h-4 w-4" />;
      case 'abc':
        return <Package className="h-4 w-4" />;
      case 'turnover':
        return <RefreshCw className="h-4 w-4" />;
      case 'forecast':
        return <TrendingUp className="h-4 w-4" />;
      case 'trends':
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getViewTitle = (viewType: AnalyticsView) => {
    switch (viewType) {
      case 'overview':
        return 'Overview';
      case 'abc':
        return 'ABC Analysis';
      case 'turnover':
        return 'Inventory Turnover';
      case 'forecast':
        return 'Demand Forecasting';
      case 'trends':
        return 'Inventory Trends';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Analytics</h2>
          <p className="text-muted-foreground">
            Advanced analytics and insights for inventory optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* View Navigation */}
      <Card className="p-1">
        <div className="flex items-center gap-1">
          {(['overview', 'abc', 'turnover', 'forecast', 'trends'] as AnalyticsView[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(v)}
              className="flex-1"
            >
              {getViewIcon(v)}
              <span className="ml-2">{getViewTitle(v)}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Filters Bar */}
      <AnalyticsFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
      />

      {/* Analytics Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'overview' && (
            <AnalyticsOverview filters={filters} />
          )}
          {view === 'abc' && (
            <ABCAnalysis 
              filters={filters}
              onProductClick={(product) => console.log('Product clicked:', product)}
            />
          )}
          {view === 'turnover' && (
            <TurnoverAnalysis 
              filters={filters}
              onProductClick={(productId) => console.log('Product clicked:', productId)}
            />
          )}
          {view === 'forecast' && (
            <DemandForecasting 
              filters={filters}
              onProductClick={(productId) => console.log('Product clicked:', productId)}
            />
          )}
          {view === 'trends' && (
            <InventoryTrends filters={filters} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Last Updated */}
      {analyticsData && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {analyticsData.lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};
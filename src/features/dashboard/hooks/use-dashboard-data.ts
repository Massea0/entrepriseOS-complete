import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { useAuth } from '@/providers/supabase-auth-provider';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Hook pour les statistiques globales
export function useDashboardStats() {
  const { user } = useAuth();

  // Get company stats
  const { data: companyData } = useSupabaseQuery(
    ['dashboard', 'company', user?.id],
    {
      table: 'companies',
      select: '*',
      filters: { id: user?.user_metadata?.company_id },
      single: true,
      enabled: !!user,
    }
  );

  // Get employees count
  const { data: employees } = useSupabaseQuery(
    ['dashboard', 'employees', user?.id],
    {
      table: 'profiles',
      select: 'id',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: 'active'
      },
      enabled: !!user,
    }
  );

  // Get active projects
  const { data: projects } = useSupabaseQuery(
    ['dashboard', 'projects', user?.id],
    {
      table: 'projects',
      select: 'id, status, progress',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: 'active'
      },
      enabled: !!user,
    }
  );

  // Get pending tasks
  const { data: tasks } = useSupabaseQuery(
    ['dashboard', 'tasks', user?.id],
    {
      table: 'tasks',
      select: 'id, status',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: ['todo', 'in_progress']
      },
      enabled: !!user,
    }
  );

  // Get revenue (current month)
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const { data: revenue } = useSupabaseQuery(
    ['dashboard', 'revenue', user?.id],
    {
      table: 'invoices',
      select: 'total_amount',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: 'paid',
        issue_date: { op: 'gte', value: currentMonthStart.toISOString() },
        issue_date: { op: 'lte', value: currentMonthEnd.toISOString() }
      },
      enabled: !!user,
    }
  );

  // Calculate stats
  const totalRevenue = revenue?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const avgProjectProgress = projects?.reduce((sum, p) => sum + (p.progress || 0), 0) / (projects?.length || 1) || 0;

  return {
    stats: {
      employees: employees?.length || 0,
      activeProjects: projects?.length || 0,
      pendingTasks: tasks?.length || 0,
      monthlyRevenue: totalRevenue,
      projectProgress: Math.round(avgProjectProgress),
    },
    isLoading: !employees || !projects || !tasks || !revenue,
  };
}

// Hook pour les données de graphiques
export function useDashboardCharts() {
  const { user } = useAuth();

  // Revenue trend (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  }).reverse();

  const revenuePromises = months.map(month => 
    useSupabaseQuery(
      ['dashboard', 'revenue-trend', user?.id, month.label],
      {
        table: 'invoices',
        select: 'total_amount',
        filters: {
          company_id: user?.user_metadata?.company_id,
          status: 'paid',
          issue_date: { op: 'gte', value: month.start.toISOString() },
          issue_date: { op: 'lte', value: month.end.toISOString() }
        },
        enabled: !!user,
      }
    )
  );

  // Project status distribution
  const { data: projectsByStatus } = useSupabaseQuery(
    ['dashboard', 'projects-by-status', user?.id],
    {
      table: 'projects',
      select: 'status',
      filters: { company_id: user?.user_metadata?.company_id },
      enabled: !!user,
    }
  );

  // Task distribution by assignee
  const { data: tasksByAssignee } = useSupabaseQuery(
    ['dashboard', 'tasks-by-assignee', user?.id],
    {
      table: 'tasks',
      select: 'assignee_id, profiles(first_name, last_name)',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: ['todo', 'in_progress']
      },
      enabled: !!user,
    }
  );

  // Process data for charts
  const revenueData = months.map((month, i) => ({
    month: month.label,
    revenue: revenuePromises[i].data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
  }));

  const projectStatusData = projectsByStatus ? 
    Object.entries(
      projectsByStatus.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count })) : [];

  const taskAssigneeData = tasksByAssignee ?
    Object.entries(
      tasksByAssignee.reduce((acc, t) => {
        const name = t.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : 'Unassigned';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, tasks]) => ({ name, tasks }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5) : [];

  return {
    revenueData,
    projectStatusData,
    taskAssigneeData,
    isLoading: !projectsByStatus || !tasksByAssignee,
  };
}

// Hook pour les activités récentes
export function useRecentActivities(limit = 10) {
  const { user } = useAuth();

  const { data: activities, isLoading } = useSupabaseQuery(
    ['dashboard', 'activities', user?.id, limit],
    {
      table: 'audit_logs',
      select: '*, profiles(first_name, last_name, avatar_url)',
      filters: { company_id: user?.user_metadata?.company_id },
      orderBy: { column: 'created_at', ascending: false },
      limit,
      enabled: !!user,
    }
  );

  return {
    activities: activities?.map(activity => ({
      id: activity.id,
      user: activity.profiles ? {
        name: `${activity.profiles.first_name} ${activity.profiles.last_name}`,
        avatar: activity.profiles.avatar_url,
      } : null,
      action: activity.action,
      resourceType: activity.resource_type,
      resourceId: activity.resource_id,
      timestamp: activity.created_at,
    })) || [],
    isLoading,
  };
}

// Hook pour les alertes et notifications
export function useDashboardAlerts() {
  const { user } = useAuth();

  // Low stock alerts (if inventory module is enabled)
  const { data: lowStockAlerts } = useSupabaseQuery(
    ['dashboard', 'low-stock-alerts', user?.id],
    {
      table: 'stock_alerts',
      select: '*, products(name, sku)',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: 'active',
        severity: ['critical', 'warning']
      },
      limit: 5,
      enabled: !!user,
    }
  );

  // Overdue invoices
  const { data: overdueInvoices } = useSupabaseQuery(
    ['dashboard', 'overdue-invoices', user?.id],
    {
      table: 'invoices',
      select: 'id, invoice_number, client_name, total_amount, due_date',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: 'sent',
        due_date: { op: 'lte', value: new Date().toISOString() }
      },
      limit: 5,
      enabled: !!user,
    }
  );

  // Pending leave requests
  const { data: pendingLeaves } = useSupabaseQuery(
    ['dashboard', 'pending-leaves', user?.id],
    {
      table: 'leave_requests',
      select: '*, profiles(first_name, last_name), leave_types(name)',
      filters: { 
        company_id: user?.user_metadata?.company_id,
        status: 'pending'
      },
      limit: 5,
      enabled: !!user,
    }
  );

  return {
    alerts: [
      ...(lowStockAlerts?.map(alert => ({
        id: alert.id,
        type: 'stock' as const,
        severity: alert.severity,
        title: `Low stock: ${alert.products?.name}`,
        description: `SKU ${alert.products?.sku} is running low`,
      })) || []),
      ...(overdueInvoices?.map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        severity: 'warning' as const,
        title: `Overdue invoice #${invoice.invoice_number}`,
        description: `${invoice.client_name} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount)}`,
      })) || []),
      ...(pendingLeaves?.map(leave => ({
        id: leave.id,
        type: 'leave' as const,
        severity: 'info' as const,
        title: `Leave request from ${leave.profiles?.first_name} ${leave.profiles?.last_name}`,
        description: `${leave.leave_types?.name} - ${leave.days_requested} days`,
      })) || []),
    ],
    isLoading: !lowStockAlerts || !overdueInvoices || !pendingLeaves,
  };
}
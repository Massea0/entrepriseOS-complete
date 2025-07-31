import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/supabase-auth-provider';
import { supabase } from '@/lib/supabase';

// Hook pour les statistiques du dashboard
export function useDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      // Pour le mock, retourner des données statiques
      return {
        totalEmployees: 42,
        activeProjects: 8,
        revenue: 125000,
        totalInventory: 1250
      };
    },
    enabled: !!user,
  });
}

// Hook pour les graphiques du dashboard
export function useDashboardCharts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-charts', user?.id],
    queryFn: async () => {
      // Données mock pour les graphiques
      return {
        revenueData: [
          { month: 'Jan', revenue: 85000 },
          { month: 'Fév', revenue: 92000 },
          { month: 'Mar', revenue: 98000 },
          { month: 'Avr', revenue: 115000 },
          { month: 'Mai', revenue: 108000 },
          { month: 'Juin', revenue: 125000 },
        ],
        projectStatusData: [
          { status: 'En cours', count: 8 },
          { status: 'Terminé', count: 15 },
          { status: 'En attente', count: 3 },
        ],
        taskAssigneeData: [
          { name: 'Marie Manager', tasks: 12 },
          { name: 'Jean Employé', tasks: 8 },
          { name: 'Sophie RH', tasks: 6 },
          { name: 'Pierre Finance', tasks: 5 },
        ],
      };
    },
    enabled: !!user,
  });
}

// Hook pour les activités récentes
export function useRecentActivities(limit = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-activities', user?.id, limit],
    queryFn: async () => {
      // Données mock pour les activités
      const activities = [
        {
          id: '1',
          description: 'Nouveau projet créé : Site Web Client ABC',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          description: 'Facture #INV-2024-001 payée',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          description: 'Nouvel employé ajouté : Pierre Martin',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '4',
          description: 'Commande de stock effectuée',
          created_at: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: '5',
          description: 'Congé approuvé pour Marie Dupont',
          created_at: new Date(Date.now() - 14400000).toISOString(),
        },
      ];
      
      return activities.slice(0, limit);
    },
    enabled: !!user,
  });
}
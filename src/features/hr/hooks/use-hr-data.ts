import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { useAuth } from '@/providers/supabase-auth-provider';
import { toast } from 'sonner';

// Hook pour récupérer la liste des employés
export function useEmployees() {
  const { user } = useAuth();
  
  return useSupabaseQuery(['employees', user?.id], {
    queryFn: async (supabase) => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments(name),
          positions(title, level)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Hook pour créer un nouvel employé
export function useCreateEmployee() {
  return useSupabaseMutation({
    mutationFn: async ({ supabase, data }) => {
      const { data: employee, error } = await supabase
        .from('profiles')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return employee;
    },
    onSuccess: () => {
      toast.success('Employé créé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de l\'employé');
      console.error(error);
    },
  });
}

// Hook pour mettre à jour un employé
export function useUpdateEmployee() {
  return useSupabaseMutation({
    mutationFn: async ({ supabase, data: { id, ...updates } }) => {
      const { data: employee, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return employee;
    },
    onSuccess: () => {
      toast.success('Employé mis à jour avec succès');
    },
  });
}

// Hook pour les statistiques HR
export function useHRStats() {
  const { user } = useAuth();
  
  return useSupabaseQuery(['hr-stats', user?.id], {
    queryFn: async (supabase) => {
      // Total des employés
      const { count: totalEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Employés par département
      const { data: departmentStats } = await supabase
        .from('departments')
        .select(`
          name,
          profiles(count)
        `);

      // Congés en attente
      const { count: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Nouveaux employés ce mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      return {
        totalEmployees: totalEmployees || 0,
        departmentStats: departmentStats || [],
        pendingLeaves: pendingLeaves || 0,
        newEmployees: newEmployees || 0,
      };
    },
    enabled: !!user,
  });
}

// Hook pour les congés
export function useLeaveRequests(status?: string) {
  const { user } = useAuth();
  
  return useSupabaseQuery(['leave-requests', status, user?.id], {
    queryFn: async (supabase) => {
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          employee:profiles(first_name, last_name, email),
          leave_type:leave_types(name, color)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Hook pour approuver/rejeter un congé
export function useUpdateLeaveRequest() {
  const { user } = useAuth();
  
  return useSupabaseMutation({
    mutationFn: async ({ supabase, data: { id, status, rejection_reason } }) => {
      const updates: any = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };
      
      if (rejection_reason) {
        updates.rejection_reason = rejection_reason;
      }
      
      const { data: request, error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return request;
    },
    onSuccess: (data) => {
      const action = data.status === 'approved' ? 'approuvé' : 'rejeté';
      toast.success(`Congé ${action} avec succès`);
    },
  });
}

// Hook pour les départements
export function useDepartments() {
  const { user } = useAuth();
  
  return useSupabaseQuery(['departments', user?.id], {
    queryFn: async (supabase) => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Hook pour les postes
export function usePositions() {
  const { user } = useAuth();
  
  return useSupabaseQuery(['positions', user?.id], {
    queryFn: async (supabase) => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
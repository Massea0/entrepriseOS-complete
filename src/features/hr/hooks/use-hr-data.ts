import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { useAuth } from '@/providers/supabase-auth-provider';
import { toast } from 'sonner';

// Hook pour récupérer la liste des employés
export function useEmployees() {
  const { user } = useAuth();
  
  // Mock data pour la démo
  return {
    data: [
      {
        id: '1',
        email: 'marie.laurent@entreprise.fr',
        first_name: 'Marie',
        last_name: 'Laurent',
        full_name: 'Marie Laurent',
        phone: '+33 6 12 34 56 78',
        status: 'active',
        departments: { name: 'Développement' },
        positions: { title: 'Développeur Senior', level: 'Senior' },
        hire_date: '2022-03-15',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        email: 'jean.dupont@entreprise.fr',
        first_name: 'Jean',
        last_name: 'Dupont',
        full_name: 'Jean Dupont',
        phone: '+33 6 98 76 54 32',
        status: 'active',
        departments: { name: 'Commercial' },
        positions: { title: 'Chef de projet', level: 'Manager' },
        hire_date: '2021-09-01',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        email: 'sophie.chen@entreprise.fr',
        first_name: 'Sophie',
        last_name: 'Chen',
        full_name: 'Sophie Chen',
        phone: '+33 7 23 45 67 89',
        status: 'active',
        departments: { name: 'Design' },
        positions: { title: 'Designer UX', level: 'Senior' },
        hire_date: '2023-01-10',
        created_at: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  };
  
  // Code original commenté pour la démo
  /*
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
  */
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
  
  // Return mock data for demo - no backend API
  return {
    data: {
      totalEmployees: 42,
      departmentStats: [
        { name: 'Commercial', profiles: { count: 12 } },
        { name: 'Développement', profiles: { count: 8 } },
        { name: 'Finance', profiles: { count: 6 } },
        { name: 'RH', profiles: { count: 4 } },
        { name: 'Direction', profiles: { count: 3 } }
      ],
      pendingLeaves: 5,
      newEmployees: 3,
    },
    isLoading: false,
    error: null
  };
  
  // Original code commented for demo
  /*
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
  */
}

// Hook pour les congés
export function useLeaveRequests(status?: string) {
  const { user } = useAuth();
  
  // Mock data pour la démo
  const mockData = [
    {
      id: '1',
      employee_id: '1',
      employee: { 
        first_name: 'Marie', 
        last_name: 'Laurent', 
        email: 'marie.laurent@entreprise.fr' 
      },
      type: 'vacation',
      leave_type: { name: 'Congés payés', color: 'blue' },
      status: 'pending',
      start_date: '2025-02-01',
      end_date: '2025-02-15',
      reason: 'Vacances familiales',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      employee_id: '2',
      employee: { 
        first_name: 'Jean', 
        last_name: 'Dupont', 
        email: 'jean.dupont@entreprise.fr' 
      },
      type: 'sick',
      leave_type: { name: 'Arrêt maladie', color: 'red' },
      status: 'approved',
      start_date: '2025-01-10',
      end_date: '2025-01-12',
      reason: 'Grippe',
      approved_by: 'admin',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];
  
  const filteredData = status 
    ? mockData.filter(request => request.status === status)
    : mockData;
  
  return {
    data: filteredData,
    isLoading: false,
    error: null
  };
  
  // Code original commenté pour la démo
  /*
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
  */
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
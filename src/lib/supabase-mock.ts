// Mock Supabase client pour le développement local

// État global du mock
let mockUser: any = null;
let mockSession: any = null;

// Données mock pour les tables
const mockData: Record<string, any[]> = {
  companies: [
    {
      id: 'mock-company-id',
      name: 'EntrepriseOS Demo',
      domain: 'entrepriseos.com',
      created_at: new Date().toISOString(),
    }
  ],
  profiles: Object.entries(testUsers).map(([email, user], index) => ({
    id: `mock-user-${email.split('@')[0]}`,
    email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
    company_id: 'mock-company-id',
    onboarding_completed: true,
    status: 'active',
    created_at: new Date().toISOString(),
    department_id: `${(index % 5) + 1}`,
    position_id: `${(index % 5) + 1}`,
    hire_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
    phone: `+33 6 ${Math.floor(10000000 + Math.random() * 90000000)}`,
    address: {
      street: `${Math.floor(1 + Math.random() * 100)} rue de la Paix`,
      city: 'Paris',
      zip: '75001',
      country: 'France'
    }
  })),
  departments: [
    { id: '1', name: 'Direction', company_id: 'mock-company-id', manager_id: 'mock-user-admin', budget: 500000 },
    { id: '2', name: 'Ventes', company_id: 'mock-company-id', manager_id: 'mock-user-manager', budget: 300000 },
    { id: '3', name: 'Production', company_id: 'mock-company-id', manager_id: 'mock-user-manager', budget: 800000 },
    { id: '4', name: 'Ressources Humaines', company_id: 'mock-company-id', manager_id: 'mock-user-hr', budget: 200000 },
    { id: '5', name: 'Finance', company_id: 'mock-company-id', manager_id: 'mock-user-finance', budget: 250000 },
  ],
  positions: [
    { id: '1', title: 'Directeur Général', level: 'director', department_id: '1', salary_range: { min: 80000, max: 120000, currency: 'EUR' } },
    { id: '2', title: 'Manager Commercial', level: 'manager', department_id: '2', salary_range: { min: 50000, max: 70000, currency: 'EUR' } },
    { id: '3', title: 'Ingénieur Production', level: 'employee', department_id: '3', salary_range: { min: 35000, max: 50000, currency: 'EUR' } },
    { id: '4', title: 'Responsable RH', level: 'manager', department_id: '4', salary_range: { min: 45000, max: 60000, currency: 'EUR' } },
    { id: '5', title: 'Contrôleur de Gestion', level: 'manager', department_id: '5', salary_range: { min: 45000, max: 65000, currency: 'EUR' } },
  ],
  leave_requests: [
    {
      id: '1',
      employee_id: 'mock-user-employee',
      leave_type_id: '1',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      days_requested: 3,
      status: 'pending',
      reason: 'Vacances familiales',
      company_id: 'mock-company-id',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      employee_id: 'mock-user-demo',
      leave_type_id: '2',
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      days_requested: 1,
      status: 'pending',
      reason: 'Rendez-vous médical',
      company_id: 'mock-company-id',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      employee_id: 'mock-user-manager',
      leave_type_id: '1',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      days_requested: 5,
      status: 'approved',
      reason: 'Vacances été',
      approved_by: 'mock-user-admin',
      approved_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      company_id: 'mock-company-id',
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  leave_types: [
    { id: '1', name: 'Congés payés', color: '#3B82F6', company_id: 'mock-company-id', days_per_year: 25 },
    { id: '2', name: 'Congé maladie', color: '#EF4444', company_id: 'mock-company-id', days_per_year: null },
    { id: '3', name: 'RTT', color: '#10B981', company_id: 'mock-company-id', days_per_year: 10 },
    { id: '4', name: 'Congé parental', color: '#8B5CF6', company_id: 'mock-company-id', days_per_year: null },
  ],
  leave_balances: [
    { id: '1', employee_id: 'mock-user-employee', leave_type_id: '1', year: 2024, total_days: 25, used_days: 5 },
    { id: '2', employee_id: 'mock-user-employee', leave_type_id: '3', year: 2024, total_days: 10, used_days: 2 },
    { id: '3', employee_id: 'mock-user-manager', leave_type_id: '1', year: 2024, total_days: 25, used_days: 10 },
    { id: '4', employee_id: 'mock-user-demo', leave_type_id: '1', year: 2024, total_days: 25, used_days: 0 },
  ],
};

export const supabaseMock = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Base de données des utilisateurs test
      const testUsers: Record<string, { password: string; role: string; firstName: string; lastName: string }> = {
        'demo@entrepriseos.com': { password: 'DemoPass123!', role: 'employee', firstName: 'Demo', lastName: 'User' },
        'admin@entrepriseos.com': { password: 'AdminPass123!', role: 'admin', firstName: 'Admin', lastName: 'Système' },
        'manager@entrepriseos.com': { password: 'ManagerPass123!', role: 'manager', firstName: 'Marie', lastName: 'Manager' },
        'employee@entrepriseos.com': { password: 'EmployeePass123!', role: 'employee', firstName: 'Jean', lastName: 'Employé' },
        'hr@entrepriseos.com': { password: 'HRPass123!', role: 'hr_manager', firstName: 'Sophie', lastName: 'RH' },
        'finance@entrepriseos.com': { password: 'FinancePass123!', role: 'finance_manager', firstName: 'Pierre', lastName: 'Finance' },
      };

      const user = testUsers[email];
      if (user && user.password === password) {
        mockUser = {
          id: `mock-user-${email.split('@')[0]}`,
          email,
          role: 'authenticated',
          app_metadata: { role: user.role },
          user_metadata: { 
            first_name: user.firstName, 
            last_name: user.lastName,
            role: user.role 
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        mockSession = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: mockUser,
        };
        return {
          data: { user: mockUser, session: mockSession },
          error: null,
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: 'Email ou mot de passe incorrect' },
      };
    },
    
    signUp: async ({ email, password }: { email: string; password: string }) => {
      mockUser = {
        id: 'mock-new-user-id',
        email,
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };
      return {
        data: { user: mockUser, session: mockSession },
        error: null,
      };
    },
    
    signOut: async () => {
      mockUser = null;
      mockSession = null;
      return { error: null };
    },
    
    getSession: async () => {
      return {
        data: { session: mockSession },
        error: null,
      };
    },
    
    getUser: async () => {
      return {
        data: { user: mockUser },
        error: null,
      };
    },
    
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simuler un changement d'état initial
      setTimeout(() => {
        callback('INITIAL_SESSION', mockSession);
      }, 100);
      
      return {
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        },
      };
    },
    
    updateUser: async (data: any) => {
      if (mockUser) {
        mockUser = { ...mockUser, ...data };
      }
      return {
        data: { user: mockUser },
        error: null,
      };
    },
    
    resetPasswordForEmail: async (email: string) => {
      return { data: {}, error: null };
    },
  },
  
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({
          data: { 
            id: 'mock-id',
            onboarding_completed: true,
            company_id: 'mock-company-id',
          },
          error: null,
        }),
        limit: (n: number) => ({
          then: async () => ({
            data: [],
            error: null,
          }),
        }),
      }),
      limit: (n: number) => ({
        then: async () => ({
          data: [],
          error: null,
        }),
      }),
      then: async () => ({
        data: [],
        error: null,
      }),
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: async () => ({
          data: null,
          error: null,
        }),
      }),
    }),
    
    insert: (data: any) => ({
      then: async () => ({
        data: null,
        error: null,
      }),
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async () => ({
          data: null,
          error: null,
        }),
      }),
    }),
  }),
  
  channel: (name: string) => ({
    on: (event: string, filter: any, callback: Function) => ({
      subscribe: () => {},
    }),
  }),
  
  removeChannel: (channel: any) => {},
};
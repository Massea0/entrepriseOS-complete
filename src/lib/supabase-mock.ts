// Mock Supabase client pour le développement local

// État global du mock
let mockUser: any = null;
let mockSession: any = null;

// Base de données des utilisateurs test
const testUsers: Record<string, { password: string; role: string; firstName: string; lastName: string }> = {
  'demo@entrepriseos.com': { password: 'DemoPass123!', role: 'employee', firstName: 'Demo', lastName: 'User' },
  'admin@entrepriseos.com': { password: 'AdminPass123!', role: 'admin', firstName: 'Admin', lastName: 'Système' },
  'manager@entrepriseos.com': { password: 'ManagerPass123!', role: 'manager', firstName: 'Marie', lastName: 'Manager' },
  'employee@entrepriseos.com': { password: 'EmployeePass123!', role: 'employee', firstName: 'Jean', lastName: 'Employé' },
  'hr@entrepriseos.com': { password: 'HRPass123!', role: 'hr_manager', firstName: 'Sophie', lastName: 'RH' },
  'finance@entrepriseos.com': { password: 'FinancePass123!', role: 'finance_manager', firstName: 'Pierre', lastName: 'Finance' },
};

// Données mock pour les tables
const mockData: Record<string, any[]> = {
  companies: [
    {
      id: 'mock-company-id',
      name: 'EntrepriseOS Demo',
      domain: 'entrepriseos.com',
      industry: 'Technology',
      size: 'sme',
      logo_url: '/logo.png',
      settings: { theme: 'light', locale: 'fr' },
      billing_plan: 'premium',
      subscription_status: 'active',
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
  // CRM Data
  clients: [
    { id: 'client1', name: 'Tech Solutions SAS', email: 'contact@techsolutions.fr', phone: '+33 1 23 45 67 89', industry: 'Technology', status: 'active', company_id: 'mock-company-id' },
    { id: 'client2', name: 'Innovation Corp', email: 'info@innovation.fr', phone: '+33 1 98 76 54 32', industry: 'Consulting', status: 'active', company_id: 'mock-company-id' },
    { id: 'client3', name: 'Digital Agency', email: 'hello@digitalagency.fr', phone: '+33 1 11 22 33 44', industry: 'Marketing', status: 'prospect', company_id: 'mock-company-id' },
  ],
  opportunities: [
    { id: 'opp1', client_id: 'client1', name: 'Migration Cloud', value: 50000, stage: 'negotiation', probability: 70, close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'opp2', client_id: 'client2', name: 'Refonte SI', value: 120000, stage: 'proposal', probability: 40, close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'opp3', client_id: 'client3', name: 'Audit Digital', value: 25000, stage: 'qualification', probability: 20, close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
  ],
  // Projects Data
  projects: [
    { id: 'proj1', name: 'Refonte Site Web', status: 'active', progress: 75, start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), budget: 45000, spent_budget: 33750, manager_id: 'mock-user-manager', company_id: 'mock-company-id' },
    { id: 'proj2', name: 'App Mobile v2', status: 'planning', progress: 20, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), budget: 80000, spent_budget: 16000, manager_id: 'mock-user-manager', company_id: 'mock-company-id' },
    { id: 'proj3', name: 'Migration Infrastructure', status: 'completed', progress: 100, start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), budget: 120000, spent_budget: 115000, manager_id: 'mock-user-admin', company_id: 'mock-company-id' },
  ],
  tasks: [
    { id: 'task1', project_id: 'proj1', title: 'Design Homepage', status: 'done', priority: 'high', assignee_id: 'mock-user-employee', due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'task2', project_id: 'proj1', title: 'Intégration API', status: 'in_progress', priority: 'high', assignee_id: 'mock-user-manager', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'task3', project_id: 'proj2', title: 'Étude de marché', status: 'todo', priority: 'medium', assignee_id: 'mock-user-demo', due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'task4', project_id: 'proj1', title: 'Tests utilisateurs', status: 'todo', priority: 'medium', assignee_id: null, due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
  ],
  // Finance Data
  invoices: [
    { id: 'inv1', invoice_number: 'INV-2024-001', client_name: 'Tech Solutions SAS', total_amount: 5000, status: 'paid', issue_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'inv2', invoice_number: 'INV-2024-002', client_name: 'Innovation Corp', total_amount: 12500, status: 'sent', issue_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'inv3', invoice_number: 'INV-2024-003', client_name: 'Digital Agency', total_amount: 3200, status: 'draft', issue_date: new Date().toISOString(), due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
  ],
  devis: [
    { id: 'devis1', devis_number: 'DEV-2024-001', client_name: 'Startup Innovante', total_amount: 25000, status: 'sent', valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'devis2', devis_number: 'DEV-2024-002', client_name: 'Entreprise Locale', total_amount: 8500, status: 'accepted', valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
  ],
  // Inventory Data
  products: [
    { id: 'prod1', name: 'Laptop Pro 15"', sku: 'LPT-PRO-15', category: 'Electronics', price: 1299, stock_quantity: 45, min_stock: 10, company_id: 'mock-company-id' },
    { id: 'prod2', name: 'Souris Ergonomique', sku: 'MS-ERG-001', category: 'Accessories', price: 59, stock_quantity: 120, min_stock: 20, company_id: 'mock-company-id' },
    { id: 'prod3', name: 'Clavier Mécanique', sku: 'KB-MECH-001', category: 'Accessories', price: 129, stock_quantity: 8, min_stock: 15, company_id: 'mock-company-id' },
    { id: 'prod4', name: 'Écran 27" 4K', sku: 'MON-4K-27', category: 'Electronics', price: 599, stock_quantity: 22, min_stock: 5, company_id: 'mock-company-id' },
  ],
  warehouses: [
    { id: 'wh1', name: 'Entrepôt Principal', location: 'Paris', capacity: 10000, used_capacity: 6500, company_id: 'mock-company-id' },
    { id: 'wh2', name: 'Entrepôt Secondaire', location: 'Lyon', capacity: 5000, used_capacity: 2200, company_id: 'mock-company-id' },
    { id: 'wh3', name: 'Point de Stockage', location: 'Marseille', capacity: 2000, used_capacity: 1800, company_id: 'mock-company-id' },
  ],
  stock_movements: [
    { id: 'mov1', product_id: 'prod1', warehouse_id: 'wh1', type: 'in', quantity: 20, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Purchase Order #PO-001', company_id: 'mock-company-id' },
    { id: 'mov2', product_id: 'prod2', warehouse_id: 'wh1', type: 'out', quantity: 15, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Sales Order #SO-123', company_id: 'mock-company-id' },
    { id: 'mov3', product_id: 'prod3', warehouse_id: 'wh2', type: 'transfer', quantity: 10, date: new Date().toISOString(), reason: 'Transfer to WH1', company_id: 'mock-company-id' },
  ],
  purchase_orders: [
    { id: 'po1', order_number: 'PO-2024-001', supplier: 'Tech Supplier Inc', status: 'delivered', total_amount: 25990, order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
    { id: 'po2', order_number: 'PO-2024-002', supplier: 'Office Supplies Co', status: 'pending', total_amount: 3540, order_date: new Date().toISOString(), company_id: 'mock-company-id' },
  ],
  // AI Data
  ai_agents: [
    { id: 'ai1', name: 'Auto-Assignment Bot', type: 'auto_assign', status: 'active', configuration: { priority_threshold: 'high', max_assignments_per_day: 50 }, company_id: 'mock-company-id' },
    { id: 'ai2', name: 'Smart Notifications', type: 'notifications', status: 'active', configuration: { channels: ['email', 'in-app'], quiet_hours: '22:00-08:00' }, company_id: 'mock-company-id' },
    { id: 'ai3', name: 'Predictive Analytics', type: 'analytics', status: 'active', configuration: { models: ['sales_forecast', 'churn_prediction'] }, company_id: 'mock-company-id' },
  ],
  // Audit & Logs
  audit_logs: [
    { id: 'log1', action: 'login', resource_type: 'user', created_at: new Date().toISOString(), company_id: 'mock-company-id', user_id: 'mock-user-admin' },
    { id: 'log2', action: 'create', resource_type: 'project', resource_id: 'proj1', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id', user_id: 'mock-user-manager' },
    { id: 'log3', action: 'update', resource_type: 'invoice', resource_id: 'inv1', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id', user_id: 'mock-user-finance' },
  ],
  stock_alerts: [
    { id: 'alert1', product_id: 'prod3', type: 'low_stock', message: 'Stock faible: Clavier Mécanique (8/15)', created_at: new Date().toISOString(), company_id: 'mock-company-id' },
    { id: 'alert2', warehouse_id: 'wh3', type: 'capacity_warning', message: 'Capacité proche du maximum: Marseille (90%)', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), company_id: 'mock-company-id' },
  ],
};

export const supabaseMock = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Base de données des utilisateurs test
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
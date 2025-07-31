// Mock Supabase client pour le développement local

// État global du mock
let mockUser: any = null;
let mockSession: any = null;

export const supabaseMock = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Simuler une connexion réussie
      if (email === 'demo@entrepriseos.com' && password === 'DemoPass123!') {
        mockUser = {
          id: 'mock-user-id',
          email: 'demo@entrepriseos.com',
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
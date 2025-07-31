// Mock Supabase client pour le développement local
export const supabaseMock = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Simuler une connexion réussie
      if (email === 'demo@entrepriseos.com' && password === 'DemoPass123!') {
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: 'demo@entrepriseos.com',
              role: 'authenticated',
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
            },
          },
          error: null,
        };
      }
      return {
        data: null,
        error: { message: 'Email ou mot de passe incorrect' },
      };
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      // Simuler une inscription réussie
      return {
        data: {
          user: {
            id: 'mock-new-user-id',
            email,
            role: 'authenticated',
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      };
    },
    signOut: async () => {
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Simuler un changement d'état initial
      setTimeout(() => {
        callback('INITIAL_SESSION', null);
      }, 100);
      
      return {
        data: { subscription: { unsubscribe: () => {} } },
      };
    },
    getUser: async () => {
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: 'demo@entrepriseos.com',
            role: 'authenticated',
          },
        },
        error: null,
      };
    },
  },
  from: (table: string) => ({
    select: () => ({
      limit: () => ({
        data: [],
        error: null,
      }),
      eq: () => ({
        single: () => ({
          data: { onboarding_completed: true },
          error: null,
        }),
      }),
    }),
    update: () => ({
      eq: () => ({
        data: null,
        error: null,
      }),
    }),
  }),
};
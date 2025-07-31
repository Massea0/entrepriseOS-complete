import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supabaseMock } from './supabase-mock';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Utiliser le mock si les variables ne sont pas définies ou en cas d'erreur réseau
const USE_MOCK = !supabaseUrl || !supabaseAnonKey || import.meta.env.DEV;

if (USE_MOCK) {
  console.log('🔧 Mode développement : Utilisation du mock Supabase');
  console.log('📧 Comptes disponibles :');
  console.log('   • demo@entrepriseos.com / DemoPass123! (Employé)');
  console.log('   • admin@entrepriseos.com / AdminPass123! (Admin)');
  console.log('   • manager@entrepriseos.com / ManagerPass123! (Manager)');
  console.log('   • hr@entrepriseos.com / HRPass123! (RH)');
  console.log('   • finance@entrepriseos.com / FinancePass123! (Finance)');
}

export const supabase = USE_MOCK ? supabaseMock as any : createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-application-name': 'EntrepriseOS',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for auth
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Helper for RLS
export const getOrganizationId = async () => {
  const { user } = await getCurrentUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();
    
  return data?.organization_id;
};

// Real-time subscription helper
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: { column: string; value: string }
) => {
  const channel = supabase.channel(`${table}_changes`);
  
  if (filter) {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`,
      },
      callback
    );
  } else {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      callback
    );
  }
  
  channel.subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};
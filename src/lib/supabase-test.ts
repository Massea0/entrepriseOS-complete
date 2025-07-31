import { createClient } from '@supabase/supabase-js';

// Test de connexion directe
const supabaseUrl = 'https://kdwjbqhdpthbtqpphkid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkd2picWhkcHRoYnRxcHBoa2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDM4NTIsImV4cCI6MjA0ODExOTg1Mn0.xLlgNLXaT8zJTTqg5TqBLi_kEu7cg4i5ZX9X7XcX8ZI';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Test de connexion à Supabase...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test simple de connexion
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    return true;
  } catch (err) {
    console.error('❌ Erreur:', err);
    return false;
  }
};
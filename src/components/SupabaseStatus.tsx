import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export function SupabaseStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Vérifier les variables d'environnement
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      setDetails({
        url: url ? `${url.substring(0, 30)}...` : 'Non définie',
        key: key ? `${key.substring(0, 20)}...` : 'Non définie',
      });

      if (!url || !key) {
        setError('Variables d\'environnement manquantes');
        setStatus('error');
        return;
      }

      // Tester une requête simple
      const { data, error: testError } = await supabase
        .from('companies')
        .select('count')
        .limit(1);

      if (testError) {
        // Si la table n'existe pas, essayer avec profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (profileError) {
          setError(profileError.message);
          setStatus('error');
        } else {
          setStatus('connected');
        }
      } else {
        setStatus('connected');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setStatus('error');
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === 'connected' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
          Statut Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">État:</p>
          <p className={`text-sm ${
            status === 'connected' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'connected' && '✅ Connecté'}
            {status === 'error' && '❌ Erreur de connexion'}
          </p>
        </div>

        {details.url && (
          <div>
            <p className="text-sm font-medium">URL:</p>
            <p className="text-xs text-muted-foreground font-mono">{details.url}</p>
          </div>
        )}

        {details.key && (
          <div>
            <p className="text-sm font-medium">Clé publique:</p>
            <p className="text-xs text-muted-foreground font-mono">{details.key}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreur détectée
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={checkConnection}
          className="w-full text-sm py-2 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Réessayer
        </button>
      </CardContent>
    </Card>
  );
}
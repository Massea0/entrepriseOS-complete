import React from 'react';
import { SupabaseStatus } from '@/components/SupabaseStatus';

export default function TestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Page de Test</h1>
      
      <div className="space-y-6">
        <SupabaseStatus />
        
        <div className="p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Vérifiez que le serveur est lancé avec <code className="bg-background px-1 rounded">npm run dev</code></li>
            <li>Ouvrez http://localhost:3000 dans votre navigateur</li>
            <li>Le statut Supabase devrait s'afficher ci-dessus</li>
            <li>Si erreur, vérifiez votre fichier .env.local</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
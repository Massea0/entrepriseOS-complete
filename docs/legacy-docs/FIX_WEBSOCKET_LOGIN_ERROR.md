# 🔧 Fix: Erreur WebSocket et Connexion 500

## Problème Identifié

L'application générait une erreur 500 lors de la connexion avec le message :
```
AggregateError [ECONNREFUSED]: wss://localhost/v2
```

Cette erreur était causée par :
1. Le client Supabase qui tentait de se connecter à WebSocket Realtime même sans l'utiliser
2. L'utilisation de bcrypt au lieu de Supabase Auth pour la validation
3. Des incohérences dans les variables d'environnement

## Solutions Appliquées

### 1. Désactivation de WebSocket Realtime

Dans `server/db.ts` et `server/db-supabase.ts` :
```typescript
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: {
      params: {
        eventsPerSecond: 0  // Désactive les connexions WebSocket
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'enterprise-os/1.0'
      }
    }
  }
);
```

### 2. Migration vers Supabase Auth

Remplacement de la validation bcrypt par Supabase Auth dans `validateUser` :
```typescript
async validateUser(email: string, password: string): Promise<User | null> {
  try {
    // Utilise Supabase Auth pour la validation
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !data.user) {
      console.error("Auth error:", error);
      return null;
    }
    
    // Récupère le profil depuis la table profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    // Retourne les données utilisateur
    return {
      id: data.user.id,
      email: data.user.email!,
      password: '', // Ne pas exposer le mot de passe
      firstName: profile?.first_name || data.user.user_metadata?.first_name || '',
      lastName: profile?.last_name || data.user.user_metadata?.last_name || '',
      role: profile?.role || data.user.app_metadata?.role || 'client',
      isActive: profile?.is_active ?? data.user.app_metadata?.is_active ?? true,
      createdAt: new Date(data.user.created_at)
    } as User;
  } catch (error) {
    console.error("Validate user error:", error);
    return null;
  }
}
```

### 3. Harmonisation des Variables d'Environnement

Support de plusieurs formats de variables :
```typescript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.SUPABASE_URL;
```

## Comment Utiliser

1. **Récupérer les derniers changements** :
   ```bash
   git pull origin main
   ```

2. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

3. **Se connecter avec** :
   - Email : `admin@entreprise-os.com`
   - Mot de passe : `Admin123!@#`

## Résultat

✅ Plus d'erreur WebSocket  
✅ Connexion fonctionnelle avec Supabase Auth  
✅ Support des métadonnées utilisateur  
✅ Compatibilité avec les profils existants

## Notes

- L'ancienne table `users` n'est plus utilisée pour l'authentification
- Supabase Auth est maintenant la source de vérité pour les connexions
- Les profils sont synchronisés avec les métadonnées Auth
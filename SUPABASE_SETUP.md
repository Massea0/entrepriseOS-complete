# Configuration de Supabase pour Enterprise OS

## 🚀 Configuration rapide

### 1. Prérequis
- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Votre projet Supabase créé

### 2. Exécution des scripts SQL

1. **Connectez-vous à votre tableau de bord Supabase**
2. **Allez dans l'éditeur SQL** (icône SQL dans la barre latérale)
3. **Exécutez les scripts dans l'ordre suivant** :

#### Script 1 : Tables principales
```bash
# Copier et exécuter le contenu de :
scripts/supabase-init.sql
```

#### Script 2 : Trigger d'authentification
```bash
# Copier et exécuter le contenu de :
scripts/supabase-auth-trigger.sql
```

#### Script 3 : Créer un profil pour votre utilisateur existant
```sql
-- Remplacez l'email par votre email d'inscription
INSERT INTO public.profiles (id, email, first_name, last_name, status)
SELECT 
  id,
  email,
  'Admin',  -- Remplacez par votre prénom
  'User',   -- Remplacez par votre nom
  'active'
FROM auth.users
WHERE email = 'admin@entrepriseos.com'  -- Remplacez par votre email
ON CONFLICT (id) DO NOTHING;
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos informations Supabase :

```env
VITE_SUPABASE_URL=https://[VOTRE-PROJET].supabase.co
VITE_SUPABASE_ANON_KEY=[VOTRE-CLÉ-ANON]
```

Vous trouverez ces valeurs dans :
- **Tableau de bord Supabase** → **Settings** → **API**

### 4. Vérification

Après avoir exécuté tous les scripts :

1. **Rafraîchissez votre application**
2. **Les erreurs 400 devraient disparaître**
3. **Vous devriez voir les données s'afficher**

## 📊 Structure de la base de données

### Tables créées :
- `departments` - Départements de l'entreprise
- `positions` - Postes/titres
- `profiles` - Profils des employés (liés à auth.users)
- `leave_requests` - Demandes de congés
- `projects` - Projets
- `tasks` - Tâches

### Sécurité Row Level Security (RLS) :
- ✅ Lecture publique pour les départements et positions
- ✅ Les utilisateurs peuvent voir tous les profils
- ✅ Les utilisateurs peuvent modifier leur propre profil
- ✅ Les utilisateurs peuvent gérer leurs propres demandes de congés

## 🔧 Dépannage

### Erreur : "relation does not exist"
→ Assurez-vous d'avoir exécuté le script `supabase-init.sql`

### Erreur : "permission denied"
→ Vérifiez que RLS est activé et que les policies sont créées

### L'utilisateur n'a pas de profil
→ Exécutez le script SQL de la section 2.3 avec votre email

## 📝 Notes supplémentaires

- Les tables incluent des triggers pour `updated_at` automatique
- Des données de test (départements et positions) sont insérées par défaut
- Le trigger d'authentification créera automatiquement un profil pour les nouveaux utilisateurs
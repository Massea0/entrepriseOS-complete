# 🚀 Guide de Connexion Supabase

## 📋 État Actuel

- **Frontend**: En mode MOCK (USE_MOCK = true)
- **Migrations SQL**: Prêtes dans `/supabase/migrations/`
- **Migration principale**: `20250729_complete_migration_safe.sql`

## 🔧 Étape 1: Configuration des Variables d'Environnement

### 1.1 Créer le fichier `.env`

```bash
# À la racine du projet
cp .env.example .env
```

Si `.env.example` n'existe pas, créez `.env` avec:

```env
# Supabase Config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# App Config
VITE_APP_NAME=EntrepriseOS
VITE_APP_URL=http://localhost:3000
```

### 1.2 Obtenir les clés depuis Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Sélectionner votre projet
3. Settings → API
4. Copier:
   - `URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_KEY`

## 🗄️ Étape 2: Exécution des Migrations

### 2.1 Ordre des Migrations

**IMPORTANT**: Exécutez les migrations dans cet ordre:

1. **Migration principale** (obligatoire):
   ```sql
   -- Copier/coller le contenu de:
   supabase/migrations/20250729_complete_migration_safe.sql
   ```

2. **Modules spécifiques** (optionnel):
   - Inventory: `20240101000001_create_inventory_tables.sql`
   - HR: `20250116_hr_revolution.sql`
   - Audit: `20250123_create_audit_logs_table.sql`

### 2.2 Exécution dans Supabase

1. Aller dans **SQL Editor** sur Supabase
2. Créer un nouveau query
3. Copier/coller le contenu de `20250729_complete_migration_safe.sql`
4. Cliquer sur **Run**

### 2.3 Vérifier les Tables Créées

Après exécution, vérifiez dans **Table Editor**:
- ✅ `companies`
- ✅ `profiles`
- ✅ `employees`
- ✅ `departments`
- ✅ `projects`
- ✅ `tasks`
- ✅ `invoices`
- ✅ `quotes`

## 🔐 Étape 3: Configuration RLS (Row Level Security)

### 3.1 Activer RLS sur toutes les tables

```sql
-- Activer RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
```

### 3.2 Vérifier les Politiques

La migration `20250729_complete_migration_safe.sql` inclut déjà les politiques RLS. Vérifiez dans:
- Authentication → Policies

## 🚀 Étape 4: Activer Supabase dans le Frontend

### 4.1 Modifier `src/lib/supabase.ts`

```typescript
// Ligne 9 - Changer de:
const USE_MOCK = true;

// À:
const USE_MOCK = false;
```

### 4.2 Créer le Premier Utilisateur Admin

Dans **SQL Editor**:

```sql
-- Créer un utilisateur admin via Supabase Auth
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@entrepriseos.com',
  crypt('AdminPass123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object(
    'role', 'admin',
    'company_id', null
  )
);

-- Récupérer l'ID de l'utilisateur créé
-- Puis créer son profil
INSERT INTO profiles (id, first_name, last_name, role)
SELECT 
  id,
  'Admin',
  'User',
  'admin'
FROM auth.users 
WHERE email = 'admin@entrepriseos.com';
```

## ✅ Étape 5: Tester la Connexion

### 5.1 Redémarrer le serveur

```bash
npm run dev
```

### 5.2 Tester le Login

1. Ouvrir http://localhost:3000
2. Se connecter avec:
   - Email: `admin@entrepriseos.com`
   - Mot de passe: `AdminPass123!`

### 5.3 Vérifier la Console

Vous ne devriez plus voir:
- ❌ "Mode développement : Utilisation du mock Supabase"

Mais plutôt:
- ✅ Connexion réussie à Supabase

## 🐛 Dépannage

### Erreur: "Invalid API key"
→ Vérifiez vos clés dans `.env`

### Erreur: "relation does not exist"
→ Les migrations n'ont pas été exécutées correctement

### Erreur: "permission denied"
→ RLS est activé mais les politiques manquent

## 📊 Prochaines Étapes

1. **Migrer les données existantes** (si nécessaire)
2. **Créer des utilisateurs de test**
3. **Configurer les Edge Functions**
4. **Activer le Realtime**
5. **Configurer les webhooks**

## 🔗 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
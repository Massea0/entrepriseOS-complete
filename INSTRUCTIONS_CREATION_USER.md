# 📋 INSTRUCTIONS - CRÉATION UTILISATEUR ADMIN

## 🎯 Objectif
Supprimer tous les utilisateurs existants et créer un nouvel utilisateur admin avec des données de démonstration.

## 📝 Étapes à Suivre

### 1️⃣ Supprimer les Utilisateurs Existants

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw)
2. Aller dans **Authentication** → **Users**
3. Pour chaque utilisateur @entrepriseos.com :
   - Cliquer sur les 3 points ⋮
   - Sélectionner **Delete user**
   - Confirmer

### 2️⃣ Nettoyer les Données

1. Aller dans **SQL Editor**
2. Copier et exécuter ce SQL :

```sql
-- Nettoyer toutes les données existantes
DELETE FROM projects WHERE company_id IN (
  SELECT id FROM companies WHERE domain = 'demo.entrepriseos.com'
);
DELETE FROM profiles WHERE email = 'admin@entrepriseos.com';
DELETE FROM companies WHERE domain = 'demo.entrepriseos.com';

-- Créer la company
INSERT INTO companies (
  id,
  name,
  domain,
  industry,
  size,
  billing_plan,
  subscription_status,
  settings
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'EntrepriseOS Demo',
  'demo.entrepriseos.com',
  'Technology',
  'sme',
  'pro',
  'active',
  '{"theme": "light", "language": "fr"}'::jsonb
);
```

### 3️⃣ Créer le Nouvel Utilisateur

1. Dans **Authentication** → **Users**
2. Cliquer **Create User**
3. Remplir :
   - **Email**: `admin@entrepriseos.com`
   - **Password**: `AdminPass123!`
   - ✅ Cocher **Auto Confirm Email**
4. Cliquer **Create User**
5. **⚠️ IMPORTANT**: Copier l'ID de l'utilisateur qui apparaît

### 4️⃣ Créer le Profil

1. Retourner dans **SQL Editor**
2. Remplacer `VOTRE_USER_ID` par l'ID copié et exécuter :

```sql
INSERT INTO profiles (
  id,
  company_id,
  email,
  first_name,
  last_name,
  role,
  onboarding_completed,
  status
) VALUES (
  'VOTRE_USER_ID'::uuid, -- ⚠️ REMPLACER ICI
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'admin@entrepriseos.com',
  'Admin',
  'EntrepriseOS',
  'admin',
  true,
  'active'
);
```

### 5️⃣ Créer des Projets de Démo

Toujours avec l'ID utilisateur, exécuter :

```sql
INSERT INTO projects (
  company_id,
  name,
  description,
  status,
  priority,
  budget,
  progress,
  manager_id,
  tags
) VALUES 
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Migration Cloud AWS',
  'Migration complète de l''infrastructure vers AWS',
  'active',
  'high',
  75000,
  45,
  'VOTRE_USER_ID'::uuid, -- ⚠️ REMPLACER ICI
  ARRAY['cloud', 'aws', 'infrastructure']
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Développement App Mobile',
  'Application mobile pour les clients B2C',
  'planning',
  'medium',
  50000,
  20,
  'VOTRE_USER_ID'::uuid, -- ⚠️ REMPLACER ICI
  ARRAY['mobile', 'react-native', 'b2c']
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Refonte Site Web',
  'Nouveau site corporate avec CMS headless',
  'active',
  'high',
  35000,
  70,
  'VOTRE_USER_ID'::uuid, -- ⚠️ REMPLACER ICI
  ARRAY['web', 'cms', 'marketing']
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Audit Sécurité RGPD',
  'Audit complet et mise en conformité',
  'completed',
  'critical',
  25000,
  100,
  'VOTRE_USER_ID'::uuid, -- ⚠️ REMPLACER ICI
  ARRAY['sécurité', 'audit', 'rgpd']
);
```

### 6️⃣ Vérifier

Exécuter pour vérifier :

```sql
-- Vérifier le profil
SELECT * FROM profiles WHERE email = 'admin@entrepriseos.com';

-- Vérifier les projets
SELECT COUNT(*) as total_projets FROM projects 
WHERE company_id = 'c0000000-0000-0000-0000-000000000001'::uuid;
```

## ✅ Terminé !

Vous pouvez maintenant vous connecter :

- **URL**: http://localhost:3000
- **Email**: `admin@entrepriseos.com`
- **Password**: `AdminPass123!`

## 🚀 Résultat Attendu

Dans le module CRM (/crm), vous verrez :
- 4 projets affichés comme des "deals"
- Pipeline avec drag & drop fonctionnel
- Possibilité de créer/modifier/supprimer

## 🆘 En Cas de Problème

Si erreur "Permission denied" :
→ Vérifier que l'ID utilisateur est correct dans le profil

Si page blanche :
→ Ouvrir la console (F12) et vérifier les erreurs

Si pas de projets visibles :
→ Vérifier que le company_id est correct dans les projets
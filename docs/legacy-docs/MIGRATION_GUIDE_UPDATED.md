# 🚀 GUIDE DE MIGRATION ACTUALISÉ - SOLUTION COMPLÈTE

## ✅ NOUVELLE APPROCHE (Sans erreurs auth)

J'ai créé 3 migrations séparées pour éviter les problèmes de permissions :

### 📋 MIGRATIONS À EXÉCUTER DANS L'ORDRE :

1. **`20250729_complete_migration_no_auth_refs.sql`**
   - Crée toutes les tables SANS références directes à auth.users
   - Active RLS mais sans policies

2. **`20250729_sync_auth_users.sql`**
   - Ajoute le trigger pour synchroniser avec auth.users
   - À exécuter APRÈS création des tables

3. **`20250729_rls_policies.sql`**
   - Ajoute les policies RLS basiques
   - Utilise uniquement `auth.uid()` (pas de schéma auth)

## 🔧 INSTRUCTIONS ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : CRÉER LES TABLES

1. **Dans Supabase SQL Editor** :
   ```sql
   -- Copier-coller le contenu de :
   supabase/migrations/20250729_complete_migration_no_auth_refs.sql
   ```

2. **Exécuter** et vérifier que toutes les tables sont créées

### ÉTAPE 2 : AJOUTER LA SYNCHRONISATION AUTH

1. **Exécuter ensuite** :
   ```sql
   -- Copier-coller le contenu de :
   supabase/migrations/20250729_sync_auth_users.sql
   ```

### ÉTAPE 3 : AJOUTER LES POLICIES RLS

1. **Exécuter enfin** :
   ```sql
   -- Copier-coller le contenu de :
   supabase/migrations/20250729_rls_policies.sql
   ```

## ✅ VÉRIFICATION

Après les 3 migrations, vérifiez dans Table Editor :
- [ ] Toutes les tables sont créées
- [ ] RLS est activé (cadenas) sur chaque table
- [ ] Les policies sont visibles

## 🚀 MIGRATION DES DONNÉES

Une fois les tables créées :

```bash
# Ajouter dans .env
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Installer dépendances
npm install pg dotenv

# Lancer la migration
node scripts/migrate-neon-to-supabase.mjs
```

## 🎯 RÉSULTAT

Cette approche :
- ✅ Évite les erreurs de permissions sur le schéma auth
- ✅ Permet de synchroniser avec auth.users après coup
- ✅ Active RLS progressivement
- ✅ Reste flexible pour les évolutions futures

## 💡 NOTES IMPORTANTES

1. **IDs dans profiles** : L'ID correspond à l'ID de auth.users (même sans FK directe)
2. **user_id dans employees** : Référence soft vers auth.users
3. **Policies simples** : Pour commencer, lecture pour tous les authentifiés
4. **Évolution future** : Les policies complexes par rôle seront ajoutées plus tard

---

**Cette solution devrait fonctionner sans erreur de permissions !** 🚀
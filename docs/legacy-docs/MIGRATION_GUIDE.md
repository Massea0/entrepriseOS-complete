# 🚀 GUIDE DE MIGRATION NEON → SUPABASE

## 📋 PRÉREQUIS

### 1. **Dashboard Supabase**
- Connectez-vous à votre projet Supabase
- Récupérez la clé `service_role` dans Settings → API

### 2. **Variables d'environnement**
Ajoutez dans votre `.env` :
```bash
# Clé service pour bypass RLS
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

## 🔧 ÉTAPES DE MIGRATION

### ÉTAPE 1 : EXÉCUTER LA MIGRATION SQL

1. **Via le Dashboard Supabase** :
   - Allez dans SQL Editor
   - Copiez le contenu de `supabase/migrations/20250729_complete_migration.sql`
   - Exécutez la requête
   - ✅ Vous devriez voir toutes les tables créées

2. **Vérifier les tables** :
   - Allez dans Table Editor
   - Vérifiez que toutes les tables sont présentes
   - Vérifiez que RLS est activé (cadenas) sur chaque table

### ÉTAPE 2 : INSTALLER LES DÉPENDANCES

```bash
# Installer les packages nécessaires
npm install pg dotenv
```

### ÉTAPE 3 : EXÉCUTER LA MIGRATION DES DONNÉES

```bash
# Donner les permissions d'exécution
chmod +x scripts/migrate-neon-to-supabase.mjs

# Exécuter la migration
node scripts/migrate-neon-to-supabase.mjs
```

### ÉTAPE 4 : VÉRIFIER LA MIGRATION

```bash
# Vérifier l'état final
node scripts/check-supabase-state.mjs
```

## 🔄 EN CAS DE PROBLÈME

### Si la migration SQL échoue :
```sql
-- Nettoyer et recommencer
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Si la migration des données échoue :
- Vérifiez les logs d'erreur
- La migration peut être relancée (elle fait des upserts)
- Assurez-vous d'avoir la clé `service_role`

## ✅ CHECKLIST POST-MIGRATION

- [ ] Toutes les tables sont créées
- [ ] RLS est activé sur toutes les tables
- [ ] Les données sont migrées
- [ ] Les utilisateurs peuvent se connecter
- [ ] Les Edge Functions fonctionnent

## 🚦 PROCHAINES ÉTAPES

Une fois la migration terminée :

1. **Tester l'authentification**
2. **Adapter le frontend** (voir Phase 5 du TODO)
3. **Tester module par module**
4. **Supprimer les références à Neon**

---

**Note** : La migration prend environ 5-10 minutes selon la quantité de données.
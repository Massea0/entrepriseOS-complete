# 📋 INSTRUCTIONS POUR L'AGENT VS CODE - CONFIGURATION SUPABASE

## 🎯 OBJECTIF
Configurer complètement la base de données Supabase pour l'application Enterprise OS en utilisant ton MCP Supabase.

## ⚡ AVANTAGE
Tu as un **MCP Supabase** qui te permet d'exécuter directement les commandes SQL et de gérer la base de données. Utilise-le pour effectuer toutes les tâches ci-dessous.

## 📝 TÂCHES À EFFECTUER

### 1️⃣ CRÉATION DES TABLES PRINCIPALES

**Option A : Configuration minimale**
```sql
-- Script: scripts/supabase-init.sql
-- Copie et exécute TOUT le contenu de ce fichier
```

**Option B : Configuration complète (RECOMMANDÉ)**
```sql
-- Script: scripts/supabase-complete-schema.sql
-- Copie et exécute TOUT le contenu de ce fichier
-- Ce script crée TOUTES les tables pour TOUS les modules
```

Le schéma complet crée TOUTES les tables pour :
- **Module CORE** : departments, positions, profiles
- **Module HR** : leave_requests, attendance, payroll
- **Module PROJECTS** : projects, tasks, time_entries
- **Module CRM** : customers, contacts, deals
- **Module INVENTORY** : warehouses, inventory_products, stock_levels, stock_movements
- **Module FINANCE** : invoices, payments, expenses
- **Module SUPPORT** : tickets, ticket_messages
- **RLS** : Policies automatiques sur toutes les tables
- **Triggers** : updated_at automatique sur toutes les tables

### 2️⃣ CONFIGURATION DU TRIGGER D'AUTHENTIFICATION

Exécute le script SQL suivant :

```sql
-- Script: scripts/supabase-auth-trigger.sql
-- Copie et exécute TOUT le contenu de ce fichier
```

Ce script :
- Crée une fonction `handle_new_user()`
- Configure un trigger sur `auth.users`
- Génère automatiquement un profil lors de l'inscription

### 3️⃣ CRÉATION DU PROFIL ADMIN

Exécute ce script pour créer le profil de l'utilisateur actuel :

```sql
-- Script: scripts/supabase-quick-fix.sql
-- Copie et exécute TOUT le contenu de ce fichier
```

### 4️⃣ VÉRIFICATIONS À EFFECTUER

Après l'exécution des scripts, vérifie :

1. **Tables créées** :
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Politiques RLS actives** :
   ```sql
   SELECT tablename, policyname, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Profil admin créé** :
   ```sql
   SELECT id, email, first_name, last_name, status 
   FROM profiles 
   WHERE email = 'admin@entrepriseos.com';
   ```

4. **Données de test** :
   ```sql
   -- Vérifier les départements
   SELECT * FROM departments;
   
   -- Vérifier les positions
   SELECT * FROM positions;
   ```

### 5️⃣ TABLES ADDITIONNELLES À CRÉER

Si tu veux une base de données complète, crée aussi ces tables :

```sql
-- Table: inventory_products
CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address JSONB,
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  items JSONB,
  subtotal DECIMAL(12, 2),
  tax DECIMAL(12, 2),
  total DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies pour lecture publique (temporaire)
CREATE POLICY "Allow public read for inventory" ON inventory_products FOR SELECT USING (true);
CREATE POLICY "Allow public read for customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read for invoices" ON invoices FOR SELECT USING (true);
```

## 📊 RAPPORT ATTENDU

**IMPORTANT** : À la fin de TOUTES les opérations, je veux un **RAPPORT DÉTAILLÉ ET COMPLET** de tout ce qui a été fait.

### Format du rapport attendu :

### ✅ Tables créées
Liste toutes les tables créées avec leur nombre de colonnes :
```
- [ ] departments (X colonnes)
- [ ] positions (X colonnes)
- [ ] profiles (X colonnes)
- [ ] leave_requests (X colonnes)
- [ ] projects (X colonnes)
- [ ] tasks (X colonnes)
- [ ] inventory_products (X colonnes) - optionnel
- [ ] customers (X colonnes) - optionnel
- [ ] invoices (X colonnes) - optionnel
```

### ✅ Politiques RLS
Nombre de politiques créées par table :
```
- [ ] departments: X policies
- [ ] positions: X policies
- [ ] profiles: X policies
- [ ] leave_requests: X policies
- [ ] projects: X policies
- [ ] tasks: X policies
```

### ✅ Triggers et fonctions
```
- [ ] Fonction update_updated_at_column() créée
- [ ] X triggers créés sur les tables
- [ ] Trigger on_auth_user_created créé
```

### ✅ Données insérées
```
- [ ] X départements créés
- [ ] X positions créées
- [ ] Profil admin créé pour admin@entrepriseos.com
```

### ✅ Tests de vérification
```
- [ ] Test de lecture sur toutes les tables : OK/ERREUR
- [ ] Test RLS : OK/ERREUR
- [ ] Test du trigger auth : OK/ERREUR
```

### ⚠️ Erreurs rencontrées
Liste toute erreur rencontrée et comment elle a été résolue.

### 📌 Actions supplémentaires recommandées
Suggère toute amélioration ou configuration supplémentaire.

---

## 🚀 COMMANDES UTILES MCP SUPABASE

Rappel des commandes que tu peux utiliser avec ton MCP :

```bash
# Exécuter une requête SQL
supabase:query "SELECT * FROM tables;"

# Lister les tables
supabase:list-tables

# Décrire une table
supabase:describe-table "table_name"

# Vérifier les politiques RLS
supabase:list-policies "table_name"
```

## ⏱️ TEMPS ESTIMÉ
15-20 minutes pour tout configurer et vérifier.

## 🎯 RÉSULTAT FINAL
Une base de données Supabase complètement configurée et prête à l'emploi pour Enterprise OS.

---

**IMPORTANT** : Commence par le script `supabase-complete-schema.sql` si tu veux une configuration complète. Utilise ton MCP Supabase pour tout faire directement depuis VS Code.

## 📝 EXEMPLE DE RAPPORT FINAL ATTENDU

```markdown
# 📊 RAPPORT DE CONFIGURATION SUPABASE - ENTERPRISE OS

## ✅ RÉSUMÉ EXÉCUTIF
- ✅ Base de données configurée avec succès
- ✅ 21 tables créées au total
- ✅ 42 policies RLS configurées
- ✅ 21 triggers updated_at actifs
- ✅ Profil admin créé

## 📋 DÉTAIL DES ACTIONS

### Tables créées (21 au total)
✅ Module CORE (3 tables)
- departments (6 colonnes)
- positions (6 colonnes)
- profiles (15 colonnes)

✅ Module HR (3 tables)
- leave_requests (12 colonnes)
- attendance (9 colonnes)
- payroll (11 colonnes)

[... etc pour tous les modules ...]

### Policies RLS (42 au total)
✅ Toutes les tables ont une policy de lecture publique
✅ Policies spécifiques :
- profiles : 2 policies (read all, update own)
- leave_requests : 2 policies (view own, create own)

### Données insérées
✅ 5 départements créés
✅ 8 positions créées
✅ Profil admin créé pour admin@entrepriseos.com (ID: xxx-xxx-xxx)

### Tests effectués
✅ SELECT sur toutes les tables : OK
✅ Test RLS sur profiles : OK
✅ Test trigger auth : OK
✅ Test trigger updated_at : OK

## ⚠️ PROBLÈMES RENCONTRÉS
Aucun problème rencontré.

## 💡 RECOMMANDATIONS
1. Configurer des policies RLS plus restrictives en production
2. Ajouter des index sur les colonnes fréquemment recherchées
3. Configurer des backups automatiques

## 🎯 CONCLUSION
La base de données Supabase est maintenant complètement configurée et prête pour Enterprise OS.
Toutes les tables, policies et triggers sont en place.
```

**C'EST CE TYPE DE RAPPORT DÉTAILLÉ QUE J'ATTENDS À LA FIN !**

Bonne configuration ! 🚀
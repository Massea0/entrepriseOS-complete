# 🚀 DÉMARRAGE RAPIDE - SUPABASE CONNECTÉ !

## ✅ Statut Actuel
- **Supabase**: ✅ Connecté avec les vraies clés
- **Application**: 🟢 En cours d'exécution sur http://localhost:3000
- **CRM Service**: ✅ Adapté aux vraies tables

## 📋 3 Étapes pour Tester

### 1️⃣ Créer l'Utilisateur Admin (2 min)

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw)
2. Aller dans **Authentication** → **Users**
3. Cliquer **Create User**
   ```
   Email: admin@entrepriseos.com
   Password: AdminPass123!
   ```
4. Copier l'**User ID** généré

### 2️⃣ Configurer le Profil (1 min)

Dans **SQL Editor** de Supabase, exécuter:

```sql
-- 1. Créer la company
INSERT INTO companies (
  id, name, domain, industry, size, billing_plan
) VALUES (
  'b1234567-1234-1234-1234-123456789012',
  'Demo Company',
  'demo.entrepriseos.com',
  'Technology',
  'sme',
  'pro'
) ON CONFLICT (domain) DO NOTHING;

-- 2. Créer le profil (remplacer USER_ID)
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
  'COLLER_USER_ID_ICI', -- ⚠️ REMPLACER
  'b1234567-1234-1234-1234-123456789012',
  'admin@entrepriseos.com',
  'Admin',
  'User',
  'admin',
  true,
  'active'
) ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  role = EXCLUDED.role;
```

### 3️⃣ Se Connecter et Tester

1. Ouvrir http://localhost:3000
2. Se connecter:
   - Email: `admin@entrepriseos.com`
   - Password: `AdminPass123!`
3. Aller sur `/crm`
4. ✅ Vous verrez les projets comme des "deals" !

## 🎯 Ce qui Fonctionne

### Module CRM
- ✅ Liste des deals (= projets)
- ✅ Pipeline avec drag & drop
- ✅ Création de nouveaux deals
- ✅ Modification des deals
- ✅ Suppression

### Données Réelles
- Les "deals" sont stockés dans la table `projects`
- Les contacts utilisent la table `profiles`
- RLS sécurise tout automatiquement

## 🔥 Fonctionnalités IA Disponibles

```typescript
// Exemple: Analyse prédictive
const { data } = await supabase.functions.invoke('ai-business-analyzer', {
  body: { company_id: 'b1234567-1234-1234-1234-123456789012' }
})

// Exemple: Attribution automatique
const { data } = await supabase.functions.invoke('auto-assign-tasks', {
  body: { task_id: 'xxx' }
})
```

## ⚡ Prochaines Améliorations

1. **Finance**: Adapter pour `invoices` et `devis`
2. **HR**: Connecter `leave_requests`
3. **Projects**: Utiliser directement `projects` et `tasks`

## 🆘 Dépannage

**Erreur de connexion ?**
→ Vérifier que le profil a été créé avec le bon USER_ID

**Page blanche ?**
→ Ouvrir la console (F12) et vérifier les erreurs

**"Permission denied" ?**
→ Normal, RLS est actif. Vérifier que l'utilisateur a un `company_id`

---

**🎉 Votre application est maintenant connectée à une vraie base de données Supabase !**
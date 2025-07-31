# 🔧 Correction de l'erreur UUID

## ❌ Erreur
```
ERROR: 22P02: invalid input syntax for type uuid: "user-uuid-here"
```

## ✅ Solution

L'erreur vient du fait que `'user-uuid-here'` n'est pas un UUID valide. Un UUID doit ressembler à : `0c0e93e3-46ff-435c-916e-8b1c74dbe421`

### Option 1 : Utiliser un UUID existant

```sql
-- 1. Trouver un UUID d'utilisateur
SELECT id, email FROM auth.users LIMIT 5;

-- 2. Utiliser cet UUID dans la fonction
SELECT log_admin_action(
    'user.role_changed',
    'user',
    '0c0e93e3-46ff-435c-916e-8b1c74dbe421', -- Remplacez par un vrai UUID
    '{"old_role": "employee", "new_role": "manager"}'
);
```

### Option 2 : Chercher l'UUID par email

```sql
-- Tout en un seul query
WITH target_user AS (
    SELECT id FROM auth.users WHERE email = 'ddjily60@gmail.com'
)
SELECT log_admin_action(
    'user.password_reset',
    'user',
    (SELECT id FROM target_user),
    '{"reason": "requested_by_admin"}'
);
```

### Option 3 : Log sans utilisateur cible

```sql
-- Si vous n'avez pas besoin de cibler un utilisateur
SELECT log_admin_action(
    'system.settings_changed',
    NULL,  -- Pas de type de cible
    NULL,  -- Pas d'ID de cible
    '{"setting": "mfa_enabled", "value": true}'
);
```

### Option 4 : Tester avec un script

```bash
# Utilisez le script de test qui trouve automatiquement un UUID
node scripts/test-audit-logs.mjs
```

## 📝 Exemples de vrais UUIDs dans votre base

Basés sur vos utilisateurs existants :
- `0c0e93e3-46ff-435c-916e-8b1c74dbe421` (ddjily60@gmail.com)
- `05abd360-84e0-44a9-b708-1537ec50b6cc` (mdiouf@arcadis.tech)

## 🎯 Conseil

Toujours vérifier que l'UUID existe avant de l'utiliser :
```sql
-- Vérifier si un UUID existe
SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = '0c0e93e3-46ff-435c-916e-8b1c74dbe421');
```
# 🔧 Migration SQL pour Audit Logs - Guide Rapide

## ⚠️ Erreur corrigée

L'erreur `"profiles" is a view` est maintenant résolue. La migration ne crée plus de trigger sur la vue `profiles`.

## 📋 SQL à exécuter dans Supabase

Copiez et collez ce SQL dans votre dashboard Supabase (SQL Editor) :

```sql
-- Create audit_logs table for tracking administrative actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only super admins and admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- No one can modify audit logs (immutable)
CREATE POLICY "No one can modify audit logs" ON public.audit_logs
    FOR ALL
    USING (false);

-- Create function to log actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action VARCHAR,
    p_target_type VARCHAR DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        target_type,
        target_id,
        details
    ) VALUES (
        auth.uid(),
        p_action,
        p_target_type,
        p_target_id,
        p_details
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;
```

## ✅ Vérification

Après exécution, vérifiez que la table existe :

```sql
SELECT * FROM public.audit_logs LIMIT 1;
```

## 🎯 Utilisation

Les logs seront créés automatiquement par l'application lors des actions administratives.

Exemples d'utilisation :

```sql
-- Exemple 1 : Log d'un changement de rôle (remplacez l'UUID par un vrai)
SELECT log_admin_action(
    'user.role_changed', 
    'user', 
    '0c0e93e3-46ff-435c-916e-8b1c74dbe421', -- UUID réel d'un utilisateur
    '{"old_role": "employee", "new_role": "manager"}'
);

-- Exemple 2 : Log d'une action sans cible spécifique
SELECT log_admin_action(
    'security.settings_changed',
    NULL,
    NULL,
    '{"mfa_enabled": true, "password_expiry": 90}'
);

-- Exemple 3 : Trouver l'UUID d'un utilisateur par email
WITH user_info AS (
    SELECT id FROM auth.users WHERE email = 'ddjily60@gmail.com'
)
SELECT log_admin_action(
    'user.password_reset',
    'user',
    (SELECT id FROM user_info),
    '{"reason": "requested_by_admin"}'
);
```

## 📝 Notes

- Les logs sont **immuables** (ne peuvent pas être modifiés/supprimés)
- Seuls les admins peuvent les consulter
- Pas de trigger automatique car `profiles` est une vue dans Supabase
- Les logs sont créés par l'application via l'API
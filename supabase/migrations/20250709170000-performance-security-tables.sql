-- =====================================================
-- MIGRATION: Performance IA & Sécurité RGPD
-- Description: Tables pour optimisations, cache, conformité
-- Version: 1.0
-- =====================================================

-- Table pour les métriques de performance IA
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    model_id VARCHAR(255),
    operation VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL, -- en millisecondes
    input_size INTEGER NOT NULL, -- en bytes
    output_size INTEGER NOT NULL, -- en bytes
    cache_hit BOOLEAN DEFAULT FALSE,
    memory_usage FLOAT, -- pourcentage 0-100
    cpu_usage FLOAT, -- pourcentage 0-100
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour l'optimisation des modèles ML
CREATE TABLE IF NOT EXISTS ai_model_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(255) NOT NULL,
    model_name VARCHAR(255),
    model_type VARCHAR(100) NOT NULL, -- 'predictive', 'nlp', 'vision', 'recommendation'
    optimization_type VARCHAR(100) NOT NULL,
    original_size BIGINT, -- en bytes
    optimized_size BIGINT, -- en bytes
    compression_ratio FLOAT,
    accuracy_before FLOAT,
    accuracy_after FLOAT,
    latency_before INTEGER, -- en millisecondes
    latency_after INTEGER, -- en millisecondes
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'optimized', 'failed'
    optimization_config JSONB,
    optimized_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table pour les statistiques de cache
CREATE TABLE IF NOT EXISTS ai_cache_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hit_rate FLOAT,
    miss_rate FLOAT,
    total_requests INTEGER,
    total_hits INTEGER,
    total_misses INTEGER,
    average_response_time FLOAT,
    cache_size_bytes BIGINT,
    memory_usage_percent FLOAT,
    entries_count INTEGER,
    cleanup_events INTEGER DEFAULT 0
);

-- Table pour les nettoyages de cache
CREATE TABLE IF NOT EXISTS ai_cache_cleanups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy VARCHAR(100) NOT NULL, -- 'lru', 'expired', 'size-based'
    entries_before INTEGER,
    entries_after INTEGER,
    entries_removed INTEGER,
    memory_freed_bytes BIGINT,
    cleaned_at TIMESTAMPTZ DEFAULT NOW(),
    duration_ms INTEGER,
    triggered_by VARCHAR(100) -- 'automatic', 'manual', 'threshold'
);

-- =====================================================
-- TABLES RGPD & CONFORMITÉ
-- =====================================================

-- Table pour les enregistrements de consentement
CREATE TABLE IF NOT EXISTS gdpr_consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    consent_type VARCHAR(100) NOT NULL, -- 'data_processing', 'analytics', 'marketing', 'ai_training', 'third_party_sharing'
    granted BOOLEAN NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    version VARCHAR(50),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    legal_basis VARCHAR(100), -- 'consent', 'contract', 'legal_obligation', etc.
    metadata JSONB,
    
    -- Index pour recherches rapides
    UNIQUE(user_id, consent_type, timestamp)
);

-- Table pour les activités de traitement de données
CREATE TABLE IF NOT EXISTS gdpr_data_processing_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    activity_type VARCHAR(100) NOT NULL, -- 'ai_inference', 'data_analysis', 'profile_creation', 'recommendation', 'automation'
    data_types TEXT[] NOT NULL, -- types de données traitées
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    encrypted BOOLEAN DEFAULT FALSE,
    anonymized BOOLEAN DEFAULT FALSE,
    processor_name VARCHAR(255),
    third_country_transfer BOOLEAN DEFAULT FALSE,
    safeguards_applied TEXT[]
);

-- Table pour les demandes des personnes concernées
CREATE TABLE IF NOT EXISTS gdpr_data_subject_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type VARCHAR(100) NOT NULL, -- 'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
    description TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    response JSONB,
    documents TEXT[], -- URLs des documents générés
    assigned_to UUID REFERENCES auth.users(id),
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    deadline TIMESTAMPTZ, -- calculé automatiquement (30 jours par défaut)
    details JSONB
);

-- Table pour l'historique de chiffrement
CREATE TABLE IF NOT EXISTS gdpr_encryption_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation VARCHAR(50) NOT NULL, -- 'encrypt', 'decrypt', 'key_rotation'
    table_name VARCHAR(255),
    column_name VARCHAR(255),
    algorithm VARCHAR(100),
    key_id VARCHAR(255),
    old_key_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    duration_ms INTEGER
);

-- Table pour l'anonymisation
CREATE TABLE IF NOT EXISTS gdpr_anonymization_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_size INTEGER,
    anonymized_size INTEGER,
    rules_applied JSONB,
    mode VARCHAR(50), -- 'full', 'partial'
    preservation_ratio FLOAT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    table_affected VARCHAR(255),
    success BOOLEAN DEFAULT TRUE
);

-- Table pour l'audit trail RGPD
CREATE TABLE IF NOT EXISTS gdpr_audit_log (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    outcome VARCHAR(20) NOT NULL, -- 'success', 'failure'
    details JSONB,
    retention_days INTEGER DEFAULT 2555, -- 7 ans
    session_id VARCHAR(255),
    risk_level VARCHAR(20) DEFAULT 'low' -- 'low', 'medium', 'high'
);

-- Table pour les violations de données
CREATE TABLE IF NOT EXISTS gdpr_data_breaches (
    id VARCHAR(255) PRIMARY KEY,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    type VARCHAR(100), -- 'unauthorized_access', 'data_loss', 'system_compromise'
    description TEXT NOT NULL,
    affected_users_count INTEGER DEFAULT 0,
    affected_data_types TEXT[],
    detected_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    authority_notified_at TIMESTAMPTZ,
    users_notified_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'reported', -- 'reported', 'investigating', 'contained', 'resolved'
    containment_measures TEXT[],
    root_cause TEXT,
    prevention_measures TEXT[],
    cost_estimate DECIMAL(10,2),
    dpo_notified BOOLEAN DEFAULT FALSE,
    authority_response JSONB
);

-- Table pour les évaluations d'impact (EIVP/DPIA)
CREATE TABLE IF NOT EXISTS gdpr_privacy_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processing_activity JSONB NOT NULL,
    risk_factors JSONB,
    safeguards JSONB,
    risk_score INTEGER,
    risk_level VARCHAR(20), -- 'low', 'medium', 'high'
    recommendations TEXT[],
    conducted_at TIMESTAMPTZ DEFAULT NOW(),
    conducted_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'rejected'
    needs_authority_consultation BOOLEAN DEFAULT FALSE,
    next_review_date TIMESTAMPTZ
);

-- Table pour les configurations de sécurité
CREATE TABLE IF NOT EXISTS security_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component VARCHAR(100) NOT NULL, -- 'encryption', 'anonymization', 'cache', 'audit'
    configuration JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- INDEX ET OPTIMISATIONS
-- =====================================================

-- Index pour les métriques de performance
CREATE INDEX idx_ai_performance_metrics_timestamp ON ai_performance_metrics(timestamp DESC);
CREATE INDEX idx_ai_performance_metrics_model_id ON ai_performance_metrics(model_id);
CREATE INDEX idx_ai_performance_metrics_operation ON ai_performance_metrics(operation);
CREATE INDEX idx_ai_performance_metrics_cache_hit ON ai_performance_metrics(cache_hit);

-- Index pour les optimisations de modèles
CREATE INDEX idx_ai_model_optimizations_model_id ON ai_model_optimizations(model_id);
CREATE INDEX idx_ai_model_optimizations_type ON ai_model_optimizations(model_type);
CREATE INDEX idx_ai_model_optimizations_status ON ai_model_optimizations(status);
CREATE INDEX idx_ai_model_optimizations_date ON ai_model_optimizations(optimized_at DESC);

-- Index pour les consentements RGPD
CREATE INDEX idx_gdpr_consent_user_id ON gdpr_consent_records(user_id);
CREATE INDEX idx_gdpr_consent_type ON gdpr_consent_records(consent_type);
CREATE INDEX idx_gdpr_consent_timestamp ON gdpr_consent_records(timestamp DESC);
CREATE INDEX idx_gdpr_consent_expires ON gdpr_consent_records(expires_at);

-- Index pour les demandes des personnes concernées
CREATE INDEX idx_gdpr_requests_user_id ON gdpr_data_subject_requests(user_id);
CREATE INDEX idx_gdpr_requests_type ON gdpr_data_subject_requests(type);
CREATE INDEX idx_gdpr_requests_status ON gdpr_data_subject_requests(status);
CREATE INDEX idx_gdpr_requests_date ON gdpr_data_subject_requests(requested_at DESC);

-- Index pour l'audit trail
CREATE INDEX idx_gdpr_audit_user_id ON gdpr_audit_log(user_id);
CREATE INDEX idx_gdpr_audit_action ON gdpr_audit_log(action);
CREATE INDEX idx_gdpr_audit_timestamp ON gdpr_audit_log(timestamp DESC);
CREATE INDEX idx_gdpr_audit_outcome ON gdpr_audit_log(outcome);

-- Index pour les violations de données
CREATE INDEX idx_gdpr_breaches_severity ON gdpr_data_breaches(severity);
CREATE INDEX idx_gdpr_breaches_status ON gdpr_data_breaches(status);
CREATE INDEX idx_gdpr_breaches_detected ON gdpr_data_breaches(detected_at DESC);

-- =====================================================
-- TRIGGERS ET AUTOMATISATIONS
-- =====================================================

-- Trigger pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_configurations_updated_at
    BEFORE UPDATE ON security_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calculer automatiquement la deadline des demandes RGPD
CREATE OR REPLACE FUNCTION set_gdpr_request_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- Deadline de 30 jours pour les demandes d'accès, 1 mois pour les autres
    IF NEW.type = 'access' THEN
        NEW.deadline = NEW.requested_at + INTERVAL '30 days';
    ELSE
        NEW.deadline = NEW.requested_at + INTERVAL '1 month';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_gdpr_request_deadline_trigger
    BEFORE INSERT ON gdpr_data_subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_gdpr_request_deadline();

-- Trigger pour audit automatique des actions sensibles
CREATE OR REPLACE FUNCTION audit_sensitive_actions()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO gdpr_audit_log (
        id,
        user_id,
        action,
        resource,
        outcome,
        details
    ) VALUES (
        'audit_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 6),
        COALESCE(NEW.user_id, NEW.created_by),
        TG_OP,
        TG_TABLE_NAME,
        'success',
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'record_id', COALESCE(NEW.id, OLD.id)
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Appliquer l'audit automatique aux tables sensibles
CREATE TRIGGER audit_consent_records
    AFTER INSERT OR UPDATE OR DELETE ON gdpr_consent_records
    FOR EACH ROW
    EXECUTE FUNCTION audit_sensitive_actions();

CREATE TRIGGER audit_data_subject_requests
    AFTER INSERT OR UPDATE ON gdpr_data_subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION audit_sensitive_actions();

-- =====================================================
-- VUES POUR RAPPORTS ET ANALYTICS
-- =====================================================

-- Vue pour les métriques de performance agrégées
CREATE OR REPLACE VIEW v_performance_summary AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as total_requests,
    AVG(duration) as avg_duration,
    MIN(duration) as min_duration,
    MAX(duration) as max_duration,
    COUNT(*) FILTER (WHERE cache_hit = true) as cache_hits,
    COUNT(*) FILTER (WHERE cache_hit = false) as cache_misses,
    (COUNT(*) FILTER (WHERE cache_hit = true))::float / COUNT(*) * 100 as hit_rate,
    AVG(memory_usage) as avg_memory_usage,
    AVG(cpu_usage) as avg_cpu_usage
FROM ai_performance_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Vue pour le statut de conformité RGPD
CREATE OR REPLACE VIEW v_gdpr_compliance_status AS
SELECT 
    'consent_management' as category,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE granted = true AND (expires_at IS NULL OR expires_at > NOW())) as active_consents,
    COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW() + INTERVAL '30 days') as expiring_soon
FROM gdpr_consent_records
UNION ALL
SELECT 
    'data_subject_requests' as category,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '30 days') as completed_recent
FROM gdpr_data_subject_requests
UNION ALL
SELECT 
    'audit_trail' as category,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE outcome = 'success') as successful_actions,
    COUNT(*) FILTER (WHERE outcome = 'failure') as failed_actions
FROM gdpr_audit_log
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- Vue pour les alertes de sécurité
CREATE OR REPLACE VIEW v_security_alerts AS
SELECT 
    'expired_consents' as alert_type,
    'warning' as severity,
    COUNT(*) as count,
    'Consentements expirés nécessitant un renouvellement' as description
FROM gdpr_consent_records
WHERE expires_at <= NOW()
UNION ALL
SELECT 
    'pending_requests' as alert_type,
    CASE 
        WHEN COUNT(*) > 10 THEN 'high'
        WHEN COUNT(*) > 5 THEN 'medium'
        ELSE 'low'
    END as severity,
    COUNT(*) as count,
    'Demandes RGPD en attente de traitement' as description
FROM gdpr_data_subject_requests
WHERE status = 'pending' AND deadline <= NOW() + INTERVAL '7 days'
UNION ALL
SELECT 
    'high_latency' as alert_type,
    'medium' as severity,
    COUNT(*) as count,
    'Requêtes avec latence élevée détectées' as description
FROM ai_performance_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour' AND duration > 5000;

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour nettoyer les anciennes métriques
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les métriques de plus de 90 jours
    DELETE FROM ai_performance_metrics
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de l'opération de nettoyage
    INSERT INTO gdpr_audit_log (
        id,
        action,
        resource,
        outcome,
        details
    ) VALUES (
        'cleanup_' || extract(epoch from now()),
        'cleanup_old_metrics',
        'ai_performance_metrics',
        'success',
        jsonb_build_object('deleted_count', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Fonction pour calculer le score de conformité RGPD
CREATE OR REPLACE FUNCTION calculate_gdpr_compliance_score()
RETURNS FLOAT AS $$
DECLARE
    consent_score FLOAT;
    request_score FLOAT;
    audit_score FLOAT;
    total_score FLOAT;
BEGIN
    -- Score des consentements (40% du total)
    SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE granted = true AND (expires_at IS NULL OR expires_at > NOW())))::float / COUNT(*) * 40
    END INTO consent_score
    FROM gdpr_consent_records;
    
    -- Score des demandes traitées (35% du total)
    SELECT CASE 
        WHEN COUNT(*) = 0 THEN 35
        ELSE GREATEST(0, 35 - (COUNT(*) FILTER (WHERE status = 'pending' AND deadline < NOW()))::float / COUNT(*) * 35)
    END INTO request_score
    FROM gdpr_data_subject_requests;
    
    -- Score de l'audit trail (25% du total)
    SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE outcome = 'success'))::float / COUNT(*) * 25
    END INTO audit_score
    FROM gdpr_audit_log
    WHERE timestamp >= NOW() - INTERVAL '30 days';
    
    total_score = COALESCE(consent_score, 0) + COALESCE(request_score, 0) + COALESCE(audit_score, 0);
    
    RETURN LEAST(100, total_score);
END;
$$ language 'plpgsql';

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur les tables sensibles
ALTER TABLE gdpr_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique pour les consentements (utilisateur peut voir ses propres consentements)
CREATE POLICY gdpr_consent_policy ON gdpr_consent_records
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'dpo')
        )
    );

-- Politique pour les demandes RGPD
CREATE POLICY gdpr_requests_policy ON gdpr_data_subject_requests
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'dpo')
        )
    );

-- Politique pour l'audit trail (accès admin/dpo uniquement)
CREATE POLICY gdpr_audit_policy ON gdpr_audit_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'dpo', 'security')
        )
    );

-- =====================================================
-- DONNÉES INITIALES ET CONFIGURATION
-- =====================================================

-- Configuration par défaut pour le chiffrement
INSERT INTO security_configurations (component, configuration, enabled) VALUES
('encryption', '{
    "algorithm": "AES-256-GCM",
    "keyRotationDays": 90,
    "saltLength": 32,
    "iterations": 100000,
    "encryptedTables": ["users", "ai_data", "sensitive_logs"]
}', true),
('anonymization', '{
    "rules": [
        {"field": "email", "method": "pseudonymization", "parameters": {"algorithm": "sha256"}, "enabled": true},
        {"field": "ip_address", "method": "generalization", "parameters": {"keep_octets": 2}, "enabled": true},
        {"field": "age", "method": "generalization", "parameters": {"range": 5}, "enabled": true}
    ]
}', true),
('cache', '{
    "enabled": true,
    "ttl": 3600,
    "maxSize": 500,
    "compressionEnabled": true,
    "warmupEnabled": true
}', true);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE ai_performance_metrics IS 'Métriques de performance en temps réel pour les opérations IA';
COMMENT ON TABLE ai_model_optimizations IS 'Historique des optimisations de modèles ML';
COMMENT ON TABLE gdpr_consent_records IS 'Enregistrements de consentement RGPD avec versioning';
COMMENT ON TABLE gdpr_data_subject_requests IS 'Demandes des personnes concernées selon RGPD';
COMMENT ON TABLE gdpr_audit_log IS 'Journal d''audit pour la conformité RGPD';
COMMENT ON TABLE gdpr_data_breaches IS 'Enregistrement des violations de données';
COMMENT ON TABLE gdpr_privacy_assessments IS 'Évaluations d''impact sur la vie privée (EIVP/DPIA)';

COMMENT ON VIEW v_performance_summary IS 'Vue agrégée des métriques de performance par heure';
COMMENT ON VIEW v_gdpr_compliance_status IS 'Statut global de conformité RGPD';
COMMENT ON VIEW v_security_alerts IS 'Alertes de sécurité et conformité en temps réel';

COMMENT ON FUNCTION calculate_gdpr_compliance_score() IS 'Calcule un score de conformité RGPD basé sur les métriques clés';
COMMENT ON FUNCTION cleanup_old_metrics() IS 'Nettoie automatiquement les anciennes métriques de performance';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- Log de la migration
INSERT INTO gdpr_audit_log (
    id,
    action,
    resource,
    outcome,
    details
) VALUES (
    'migration_performance_security_' || extract(epoch from now()),
    'database_migration',
    'performance_security_tables',
    'success',
    jsonb_build_object(
        'migration', '20250709170000-performance-security-tables',
        'tables_created', 15,
        'views_created', 3,
        'functions_created', 2
    )
); 
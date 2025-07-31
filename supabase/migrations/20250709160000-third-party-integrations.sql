-- Migration pour les intégrations tierces
-- Tables: third_party_integrations, integration_events, notification_history

-- Table des intégrations tierces
CREATE TABLE IF NOT EXISTS third_party_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('slack', 'teams', 'whatsapp')),
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('connected', 'error', 'pending')),
  credentials TEXT NOT NULL, -- Encrypted JSON
  webhook_url TEXT,
  settings JSONB DEFAULT '{
    "notifications": true,
    "channels": [],
    "autoRespond": false,
    "filterKeywords": []
  }'::jsonb,
  stats JSONB DEFAULT '{
    "messagesSent": 0,
    "messagesReceived": 0,
    "errorRate": 0
  }'::jsonb,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index pour recherches rapides
  UNIQUE(type, name)
);

-- Index optimisés
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_type ON third_party_integrations(type);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_enabled ON third_party_integrations(enabled);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_status ON third_party_integrations(status);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_activity ON third_party_integrations(last_activity DESC);

-- Table des événements d'intégration
CREATE TABLE IF NOT EXISTS integration_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES third_party_integrations(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('slack', 'teams', 'whatsapp')),
  event_type VARCHAR(50) NOT NULL,
  direction VARCHAR(10) DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métadonnées pour le traçage
  user_id TEXT,
  channel_id TEXT,
  message_id TEXT
);

-- Index pour les événements
CREATE INDEX IF NOT EXISTS idx_integration_events_integration ON integration_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_platform ON integration_events(platform);
CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_timestamp ON integration_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_processed ON integration_events(processed);

-- Table de l'historique des notifications
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payload JSONB NOT NULL,
  results JSONB NOT NULL, -- Résultats par plateforme
  success_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métadonnées
  sender_id UUID,
  sender_type VARCHAR(20) DEFAULT 'system',
  tags TEXT[]
);

-- Index pour l'historique
CREATE INDEX IF NOT EXISTS idx_notification_history_timestamp ON notification_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_priority ON notification_history(priority);
CREATE INDEX IF NOT EXISTS idx_notification_history_success ON notification_history(success_count, total_count);

-- Table des templates de notification
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  platform VARCHAR(20) CHECK (platform IN ('slack', 'teams', 'whatsapp', 'all')),
  template_type VARCHAR(50) NOT NULL, -- alert, workflow, system, custom
  content JSONB NOT NULL, -- Template avec variables
  variables TEXT[], -- Variables disponibles
  enabled BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_platform ON notification_templates(platform);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_enabled ON notification_templates(enabled);

-- Table des webhooks entrants
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES third_party_integrations(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL UNIQUE,
  secret_token TEXT,
  enabled BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ,
  request_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_integration ON webhook_endpoints(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_enabled ON webhook_endpoints(enabled);

-- Table des configurations de routage
CREATE TABLE IF NOT EXISTS message_routing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_platform VARCHAR(20) NOT NULL,
  target_platforms TEXT[] NOT NULL,
  conditions JSONB, -- Conditions de routage
  transformations JSONB, -- Transformations du message
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour le routage
CREATE INDEX IF NOT EXISTS idx_message_routing_source ON message_routing(source_platform);
CREATE INDEX IF NOT EXISTS idx_message_routing_enabled ON message_routing(enabled);
CREATE INDEX IF NOT EXISTS idx_message_routing_priority ON message_routing(priority DESC);

-- Fonctions utilitaires

-- Function pour mettre à jour les stats d'intégration
CREATE OR REPLACE FUNCTION update_integration_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les statistiques après insertion d'événement
  UPDATE third_party_integrations 
  SET 
    stats = jsonb_set(
      stats,
      '{messagesSent}',
      to_jsonb((stats->>'messagesSent')::int + 
        CASE WHEN NEW.direction = 'outbound' THEN 1 ELSE 0 END)
    ),
    stats = jsonb_set(
      stats,
      '{messagesReceived}',
      to_jsonb((stats->>'messagesReceived')::int + 
        CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END)
    ),
    last_activity = NOW(),
    updated_at = NOW()
  WHERE id = NEW.integration_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les stats
DROP TRIGGER IF EXISTS trigger_update_integration_stats ON integration_events;
CREATE TRIGGER trigger_update_integration_stats
  AFTER INSERT ON integration_events
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_stats();

-- Function pour calculer le taux d'erreur
CREATE OR REPLACE FUNCTION calculate_error_rate(integration_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_events INTEGER;
  error_events INTEGER;
BEGIN
  -- Compter les événements des 24 dernières heures
  SELECT COUNT(*) INTO total_events
  FROM integration_events
  WHERE integration_id = integration_uuid
    AND timestamp >= NOW() - INTERVAL '24 hours';
  
  SELECT COUNT(*) INTO error_events
  FROM integration_events
  WHERE integration_id = integration_uuid
    AND timestamp >= NOW() - INTERVAL '24 hours'
    AND error_message IS NOT NULL;
  
  IF total_events = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((error_events::NUMERIC / total_events::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function pour nettoyer les anciens événements
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les événements de plus de 30 jours
  DELETE FROM integration_events
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Supprimer l'historique de notifications de plus de 90 jours
  DELETE FROM notification_history
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Vues pour les statistiques

-- Vue des stats par plateforme
CREATE OR REPLACE VIEW integration_platform_stats AS
SELECT 
  type as platform,
  COUNT(*) as total_integrations,
  COUNT(*) FILTER (WHERE enabled = true) as active_integrations,
  COUNT(*) FILTER (WHERE status = 'connected') as connected_integrations,
  AVG((stats->>'messagesSent')::int) as avg_messages_sent,
  AVG((stats->>'messagesReceived')::int) as avg_messages_received,
  AVG((stats->>'errorRate')::numeric) as avg_error_rate
FROM third_party_integrations
GROUP BY type;

-- Vue des événements récents
CREATE OR REPLACE VIEW recent_integration_events AS
SELECT 
  ie.*,
  tpi.name as integration_name,
  tpi.type as platform_type
FROM integration_events ie
JOIN third_party_integrations tpi ON ie.integration_id = tpi.id
WHERE ie.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY ie.timestamp DESC;

-- Vue des notifications échouées
CREATE OR REPLACE VIEW failed_notifications AS
SELECT 
  nh.*,
  (nh.total_count - nh.success_count) as failed_count,
  ROUND(((nh.total_count - nh.success_count)::NUMERIC / nh.total_count::NUMERIC) * 100, 2) as failure_rate
FROM notification_history nh
WHERE nh.success_count < nh.total_count
  AND nh.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY nh.timestamp DESC;

-- Données de test initiales
INSERT INTO notification_templates (name, description, platform, template_type, content, variables) VALUES
('system_alert', 'Alerte système générique', 'all', 'alert', 
 '{"title": "🚨 Alerte Système", "message": "Une alerte système a été déclenchée: {alert_type}", "priority": "high"}',
 ARRAY['alert_type', 'timestamp', 'severity']),

('workflow_complete', 'Notification de fin de workflow', 'all', 'workflow',
 '{"title": "✅ Workflow Terminé", "message": "Le workflow {workflow_name} s''est terminé avec succès", "priority": "medium"}',
 ARRAY['workflow_name', 'duration', 'status']),

('user_mention', 'Notification de mention utilisateur', 'slack', 'custom',
 '{"text": "<@{user_id}> Vous avez été mentionné dans {context}", "channel": "{channel}"}',
 ARRAY['user_id', 'context', 'channel']),

('task_assignment', 'Attribution de tâche', 'teams', 'workflow',
 '{"title": "📋 Nouvelle Tâche", "message": "Une tâche vous a été attribuée: {task_title}", "priority": "medium"}',
 ARRAY['task_title', 'assignee', 'due_date']),

('emergency_alert', 'Alerte d''urgence WhatsApp', 'whatsapp', 'alert',
 '{"message": "🚨 *URGENCE* 🚨\\n\\n{emergency_message}\\n\\nAction requise immédiatement.", "priority": "urgent"}',
 ARRAY['emergency_message', 'contact', 'escalation_level']);

-- Politiques de sécurité RLS
ALTER TABLE third_party_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_routing ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs authentifiés
CREATE POLICY "Users can view integrations" ON third_party_integrations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert integrations" ON third_party_integrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update integrations" ON third_party_integrations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour les événements
CREATE POLICY "Users can view events" ON integration_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert events" ON integration_events
  FOR INSERT WITH CHECK (true); -- Webhook access

-- Politique pour l'historique
CREATE POLICY "Users can view notification history" ON notification_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert notifications" ON notification_history
  FOR INSERT WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE third_party_integrations IS 'Configuration des intégrations avec les plateformes tierces (Slack, Teams, WhatsApp)';
COMMENT ON TABLE integration_events IS 'Historique des événements reçus et envoyés via les intégrations';
COMMENT ON TABLE notification_history IS 'Historique des notifications cross-platform envoyées';
COMMENT ON TABLE notification_templates IS 'Templates réutilisables pour les notifications';
COMMENT ON TABLE webhook_endpoints IS 'Endpoints webhook pour recevoir des événements externes';
COMMENT ON TABLE message_routing IS 'Configuration du routage automatique des messages entre plateformes';

-- Log de création
INSERT INTO public.schema_migrations (version, applied_at) 
VALUES ('20250709160000', NOW())
ON CONFLICT (version) DO NOTHING; 
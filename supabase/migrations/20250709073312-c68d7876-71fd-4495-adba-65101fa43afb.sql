-- Phase 6: Système de Workflow - Tables de base
-- Table principale des workflows
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('project', 'invoice', 'hr', 'support', 'notification')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_config JSONB NOT NULL DEFAULT '{}',
    actions_config JSONB NOT NULL DEFAULT '[]',
    conditions_config JSONB DEFAULT '{}',
    execution_count INTEGER DEFAULT 0,
    last_execution_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exécutions de workflows
CREATE TABLE public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    trigger_data JSONB DEFAULT '{}',
    execution_log JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    execution_time_ms INTEGER
);

-- Table des templates de workflows pré-configurés
CREATE TABLE public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    template_config JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_workflows_type_status ON workflows(workflow_type, status);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Trigger pour updated_at
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- Policies workflows
CREATE POLICY "Admins can manage all workflows" ON workflows
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can view workflows they created" ON workflows
    FOR SELECT USING (created_by = auth.uid());

-- Policies workflow_executions
CREATE POLICY "Admins can manage all workflow executions" ON workflow_executions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can view executions of their workflows" ON workflow_executions
    FOR SELECT USING (
        workflow_id IN (SELECT id FROM workflows WHERE created_by = auth.uid())
    );

-- Policies workflow_templates
CREATE POLICY "Everyone can view active templates" ON workflow_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON workflow_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Insérer quelques templates de base
INSERT INTO workflow_templates (name, description, category, template_config) VALUES
('Nouveau Projet - Notifications', 'Envoi automatique de notifications lors de la création d''un projet', 'project', '{
    "trigger": {"type": "entity_created", "entity": "projects"},
    "actions": [
        {"type": "send_notification", "recipients": ["admin"], "message": "Nouveau projet créé: {{project.name}}"},
        {"type": "send_email", "template": "project_created", "to": "{{project.client_email}}"}
    ]
}'),
('Facture Échue - Rappel', 'Rappel automatique pour les factures échues', 'invoice', '{
    "trigger": {"type": "schedule", "cron": "0 9 * * *"},
    "conditions": {"entity": "invoices", "filter": "due_date < NOW() AND status = ''pending''"},
    "actions": [
        {"type": "send_notification", "recipients": ["admin"], "message": "Facture échue: {{invoice.number}}"},
        {"type": "send_email", "template": "invoice_reminder", "to": "{{invoice.client_email}}"}
    ]
}'),
('Ticket Support - Escalade', 'Escalade automatique des tickets non traités', 'support', '{
    "trigger": {"type": "schedule", "cron": "0 */4 * * *"},
    "conditions": {"entity": "tickets", "filter": "created_at < NOW() - INTERVAL ''4 hours'' AND status = ''open''"},
    "actions": [
        {"type": "update_field", "entity": "tickets", "field": "priority", "value": "high"},
        {"type": "send_notification", "recipients": ["support_manager"], "message": "Ticket escaladé: {{ticket.number}}"}
    ]
}');
-- 001_create_quotes_contracts_tables.sql
-- Migration pour créer les tables du module Finance (Quotes & Contracts)

-- =====================================================
-- TABLE QUOTES (DEVIS)
-- =====================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Client Information
  client_id UUID REFERENCES companies(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  client_address JSONB,
  
  -- Status & Validity
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  valid_until DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Financial Details
  currency VARCHAR(3) DEFAULT 'EUR',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20,
  tax_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) GENERATED ALWAYS AS (
    CASE 
      WHEN discount_type = 'percentage' THEN subtotal * discount_value / 100
      WHEN discount_type = 'fixed' THEN discount_value
      ELSE 0
    END
  ) STORED,
  total_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100) - 
    CASE 
      WHEN discount_type = 'percentage' THEN subtotal * discount_value / 100
      WHEN discount_type = 'fixed' THEN discount_value
      ELSE 0
    END
  ) STORED,
  
  -- Content
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms_conditions TEXT,
  notes TEXT,
  
  -- AI Integration
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_suggestions JSONB,
  ai_score DECIMAL(3,2) CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_insights JSONB,
  
  -- Tracking
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  converted_to_invoice_id UUID REFERENCES invoices(id),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- TABLE CONTRACTS
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('employment', 'vendor', 'client', 'nda', 'partnership', 'service', 'lease', 'other')),
  category VARCHAR(100),
  tags TEXT[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated', 'renewed')),
  
  -- Parties
  client_id UUID REFERENCES companies(id),
  vendor_id UUID REFERENCES companies(id),
  third_parties JSONB DEFAULT '[]'::jsonb,
  
  -- Dates & Duration
  effective_date DATE NOT NULL,
  expiration_date DATE,
  duration_months INTEGER,
  auto_renewal BOOLEAN DEFAULT FALSE,
  renewal_notice_days INTEGER DEFAULT 30,
  renewal_terms JSONB,
  termination_notice_days INTEGER DEFAULT 30,
  
  -- Financial Terms
  contract_value DECIMAL(15,2),
  payment_schedule VARCHAR(50) CHECK (payment_schedule IN ('one_time', 'monthly', 'quarterly', 'annually', 'milestone', 'custom')),
  payment_terms JSONB,
  currency VARCHAR(3) DEFAULT 'EUR',
  late_fee_percentage DECIMAL(5,2),
  
  -- Contract Content
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  clauses JSONB DEFAULT '[]'::jsonb,
  special_terms JSONB,
  exclusions TEXT[],
  
  -- Attachments & Documents
  attachments JSONB DEFAULT '[]'::jsonb,
  related_documents UUID[],
  
  -- Signatures
  signatures JSONB DEFAULT '[]'::jsonb,
  signature_deadline DATE,
  fully_signed_date DATE,
  
  -- AI Analysis
  risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB,
  ai_recommendations JSONB,
  compliance_check JSONB,
  key_terms_extraction JSONB,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES contracts(id),
  is_amendment BOOLEAN DEFAULT FALSE,
  change_summary TEXT,
  
  -- Workflow
  approval_workflow JSONB,
  current_approver UUID REFERENCES profiles(id),
  approval_history JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  last_modified_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  terminated_by UUID REFERENCES profiles(id),
  termination_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  approved_at TIMESTAMP WITH TIME ZONE,
  terminated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE CONTRACT TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  
  -- Template Content
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  clauses_library JSONB DEFAULT '[]'::jsonb,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  requires_legal_review BOOLEAN DEFAULT FALSE,
  approval_required BOOLEAN DEFAULT TRUE,
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  average_completion_time INTEGER,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_quotes_company_status ON quotes(company_id, status);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

CREATE INDEX idx_contracts_company_status ON contracts(company_id, status);
CREATE INDEX idx_contracts_dates ON contracts(effective_date, expiration_date);
CREATE INDEX idx_contracts_type ON contracts(type);
CREATE INDEX idx_contracts_parties ON contracts(client_id, vendor_id);
CREATE INDEX idx_contracts_expiring ON contracts(expiration_date) WHERE status = 'active';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- Quotes RLS Policies
CREATE POLICY "Users can view their company quotes" ON quotes
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create quotes" ON quotes
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ) AND
    auth.uid() = created_by
  );

CREATE POLICY "Users can update their quotes" ON quotes
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ) AND
    status = 'draft'
  );

CREATE POLICY "Users can delete draft quotes" ON quotes
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ) AND
    status = 'draft' AND
    created_by = auth.uid()
  );

-- Contracts RLS Policies
CREATE POLICY "Users can view their contracts" ON contracts
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ) OR
    client_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ) OR
    vendor_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can create contracts" ON contracts
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update contracts" ON contracts
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    ) AND
    status IN ('draft', 'pending_review')
  );

-- Contract Templates RLS Policies
CREATE POLICY "Users can view their company templates" ON contract_templates
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ) OR
    company_id IS NULL -- Public templates
  );

CREATE POLICY "Managers can manage templates" ON contract_templates
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number = 'QT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('quote_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.contract_number = 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('contract_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS contract_number_seq START 1;

-- Apply triggers
CREATE TRIGGER generate_quote_number_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL)
  EXECUTE FUNCTION generate_quote_number();

CREATE TRIGGER generate_contract_number_trigger
  BEFORE INSERT ON contracts
  FOR EACH ROW
  WHEN (NEW.contract_number IS NULL)
  EXECUTE FUNCTION generate_contract_number();

-- Function to auto-expire quotes
CREATE OR REPLACE FUNCTION auto_expire_quotes()
RETURNS void AS $$
BEGIN
  UPDATE quotes
  SET status = 'expired'
  WHERE status IN ('sent', 'viewed')
    AND valid_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE contract_templates
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
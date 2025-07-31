-- =====================================================
-- MIGRATION COMPLÈTE ENTERPRISE OS
-- Date: 2025-07-29
-- Description: Migration complète de toutes les tables
-- depuis Neon vers Supabase avec RLS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin', 
  'manager',
  'employee',
  'client',
  'viewer'
);

-- Employment status
CREATE TYPE employment_status AS ENUM (
  'active',
  'inactive', 
  'on_leave',
  'terminated'
);

-- Task status
CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- Project status
CREATE TYPE project_status AS ENUM (
  'draft',
  'active',
  'completed',
  'cancelled',
  'on_hold'
);

-- Leave status
CREATE TYPE leave_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-- Invoice/Quote status
CREATE TYPE document_status AS ENUM (
  'draft',
  'sent',
  'pending',
  'paid',
  'overdue',
  'cancelled'
);

-- Priority levels
CREATE TYPE priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  siret VARCHAR(50),
  industry VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  avatar_url TEXT,
  role user_role DEFAULT 'employee',
  company_id UUID REFERENCES companies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id),
  parent_department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  level INTEGER,
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  employee_number VARCHAR(50) UNIQUE,
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  manager_id UUID REFERENCES employees(id),
  employment_status employment_status DEFAULT 'active',
  hire_date DATE,
  termination_date DATE,
  salary DECIMAL(10,2),
  skills JSONB,
  work_schedule JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BUSINESS TABLES
-- =====================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES companies(id),
  manager_id UUID REFERENCES profiles(id),
  status project_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  tags JSONB,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES companies(id),
  project_id UUID REFERENCES projects(id),
  status document_status DEFAULT 'draft',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  items JSONB NOT NULL,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes (Devis) table
CREATE TABLE IF NOT EXISTS devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_number VARCHAR(50) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES companies(id),
  status document_status DEFAULT 'draft',
  valid_until DATE,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  items JSONB NOT NULL,
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES companies(id),
  project_id UUID REFERENCES projects(id),
  status VARCHAR(50) DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'XOF',
  terms TEXT,
  file_url TEXT,
  signed_date DATE,
  signed_by JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HR TABLES
-- =====================================================

-- Leave types table
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  days_per_year INTEGER,
  company_id UUID REFERENCES companies(id),
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  entitled_days INTEGER DEFAULT 0,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (entitled_days - used_days) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- =====================================================
-- AI TABLES
-- =====================================================

-- AI Agents table
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  capabilities JSONB,
  configuration JSONB,
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agent Actions table
CREATE TABLE IF NOT EXISTS ai_agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id),
  action_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agent Memory table
CREATE TABLE IF NOT EXISTS ai_agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id),
  memory_type VARCHAR(100),
  key VARCHAR(255) NOT NULL,
  value JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, key)
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get user role
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'employee'
  )
$$ LANGUAGE SQL STABLE;

-- Function to get user company_id
CREATE OR REPLACE FUNCTION auth.company_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'company_id')::UUID,
    NULL
  )
$$ LANGUAGE SQL STABLE;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'super_admin'
$$ LANGUAGE SQL STABLE;

-- Function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.role() IN ('admin', 'super_admin')
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Add update triggers to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devis_updated_at BEFORE UPDATE ON devis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agent_memory_updated_at BEFORE UPDATE ON ai_agent_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

-- Companies indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Employees indexes
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(employment_status);

-- Projects indexes
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Tasks indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Invoices indexes
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Devis indexes
CREATE INDEX idx_devis_company_id ON devis(company_id);
CREATE INDEX idx_devis_client_id ON devis(client_id);
CREATE INDEX idx_devis_status ON devis(status);

-- Leave requests indexes
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- AI indexes
CREATE INDEX idx_ai_agent_actions_agent_id ON ai_agent_actions(agent_id);
CREATE INDEX idx_ai_agent_actions_status ON ai_agent_actions(status);
CREATE INDEX idx_ai_agent_memory_agent_id ON ai_agent_memory(agent_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_memory ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - COMPANIES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "companies_super_admin_all" ON companies
  FOR ALL USING (auth.is_super_admin());

-- Admin: Access to their company
CREATE POLICY "companies_admin_own" ON companies
  FOR ALL USING (
    auth.role() = 'admin' AND 
    id = auth.company_id()
  );

-- Other roles: Read their company only
CREATE POLICY "companies_users_read_own" ON companies
  FOR SELECT USING (
    auth.role() IN ('manager', 'employee', 'client') AND
    id = auth.company_id()
  );

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "profiles_super_admin_all" ON profiles
  FOR ALL USING (auth.is_super_admin());

-- Admin: Access to profiles in their company
CREATE POLICY "profiles_admin_company" ON profiles
  FOR ALL USING (
    auth.role() = 'admin' AND 
    company_id = auth.company_id()
  );

-- Users: Read/Update their own profile
CREATE POLICY "profiles_users_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_users_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Manager: Read profiles in their company
CREATE POLICY "profiles_manager_read_company" ON profiles
  FOR SELECT USING (
    auth.role() = 'manager' AND 
    company_id = auth.company_id()
  );

-- =====================================================
-- RLS POLICIES - PROJECTS
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "projects_super_admin_all" ON projects
  FOR ALL USING (auth.is_super_admin());

-- Admin: Full access to company projects
CREATE POLICY "projects_admin_company" ON projects
  FOR ALL USING (
    auth.role() = 'admin' AND 
    company_id = auth.company_id()
  );

-- Manager: Full access to their projects, read others
CREATE POLICY "projects_manager_own" ON projects
  FOR ALL USING (
    auth.role() = 'manager' AND 
    (manager_id = auth.uid() OR company_id = auth.company_id())
  );

-- Employee: Read projects they're assigned to
CREATE POLICY "projects_employee_assigned" ON projects
  FOR SELECT USING (
    auth.role() = 'employee' AND
    (EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.project_id = projects.id 
      AND tasks.assignee_id = auth.uid()
    ) OR company_id = auth.company_id())
  );

-- Client: Read their projects
CREATE POLICY "projects_client_own" ON projects
  FOR SELECT USING (
    auth.role() = 'client' AND
    client_id = auth.company_id()
  );

-- =====================================================
-- RLS POLICIES - TASKS
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "tasks_super_admin_all" ON tasks
  FOR ALL USING (auth.is_super_admin());

-- Admin: Full access to tasks in company projects
CREATE POLICY "tasks_admin_company" ON tasks
  FOR ALL USING (
    auth.role() = 'admin' AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.company_id = auth.company_id()
    )
  );

-- Manager: Full access to tasks they manage
CREATE POLICY "tasks_manager_team" ON tasks
  FOR ALL USING (
    auth.role() = 'manager' AND
    (assigned_by = auth.uid() OR 
     assignee_id IN (
       SELECT user_id FROM employees 
       WHERE manager_id = (
         SELECT id FROM employees WHERE user_id = auth.uid()
       )
     ))
  );

-- Employee: Full access to their tasks
CREATE POLICY "tasks_employee_own" ON tasks
  FOR ALL USING (
    auth.role() = 'employee' AND
    (assignee_id = auth.uid() OR assigned_by = auth.uid())
  );

-- =====================================================
-- RLS POLICIES - INVOICES/DEVIS
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "invoices_super_admin_all" ON invoices
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "devis_super_admin_all" ON devis
  FOR ALL USING (auth.is_super_admin());

-- Admin: Full access
CREATE POLICY "invoices_admin_all" ON invoices
  FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "devis_admin_all" ON devis
  FOR ALL USING (auth.role() = 'admin');

-- Client: Read their documents
CREATE POLICY "invoices_client_own" ON invoices
  FOR SELECT USING (
    auth.role() = 'client' AND
    client_id = auth.company_id()
  );

CREATE POLICY "devis_client_own" ON devis
  FOR SELECT USING (
    auth.role() = 'client' AND
    client_id = auth.company_id()
  );

-- =====================================================
-- RLS POLICIES - EMPLOYEES & HR
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "employees_super_admin_all" ON employees
  FOR ALL USING (auth.is_super_admin());

-- Admin: Full access to company employees
CREATE POLICY "employees_admin_company" ON employees
  FOR ALL USING (
    auth.role() = 'admin' AND 
    company_id = auth.company_id()
  );

-- Manager: Read their team
CREATE POLICY "employees_manager_team" ON employees
  FOR SELECT USING (
    auth.role() = 'manager' AND
    (user_id = auth.uid() OR manager_id = (
      SELECT id FROM employees WHERE user_id = auth.uid()
    ))
  );

-- Employee: Read own data
CREATE POLICY "employees_employee_own" ON employees
  FOR SELECT USING (
    auth.role() = 'employee' AND
    user_id = auth.uid()
  );

-- Leave requests policies
CREATE POLICY "leave_requests_super_admin_all" ON leave_requests
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "leave_requests_admin_all" ON leave_requests
  FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "leave_requests_manager_team" ON leave_requests
  FOR ALL USING (
    auth.role() = 'manager' AND
    employee_id IN (
      SELECT id FROM employees 
      WHERE manager_id = (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "leave_requests_employee_own" ON leave_requests
  FOR ALL USING (
    auth.role() = 'employee' AND
    employee_id = (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default leave types
INSERT INTO leave_types (name, days_per_year, company_id) VALUES
  ('Congés Payés', 30, NULL),
  ('Congé Maladie', 15, NULL),
  ('Congé Maternité', 90, NULL),
  ('Congé Paternité', 14, NULL),
  ('Congé Sans Solde', 0, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
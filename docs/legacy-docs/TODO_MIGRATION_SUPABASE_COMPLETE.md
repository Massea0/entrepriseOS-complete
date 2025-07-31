# 📋 TODO MIGRATION SUPABASE - PLAN COMPLET

## 🎯 OBJECTIF : Migration 100% Supabase avec 0 données mockées

## 📅 PHASE 1 : SETUP & PRÉPARATION (Jour 1-2)

### 1.1 Configuration Supabase
- [ ] Créer nouveau projet Supabase (ou utiliser existant)
- [ ] Configurer variables d'environnement
- [ ] Vérifier accès aux Edge Functions
- [ ] Configurer domaines autorisés

### 1.2 Backup & Audit
- [ ] Backup complet Neon DB
- [ ] Exporter schémas Drizzle
- [ ] Lister toutes les données existantes
- [ ] Documenter les différences de structure

### 1.3 Préparation Client Supabase
```typescript
// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 📅 PHASE 2 : MIGRATION SCHÉMA (Jour 3-5)

### 2.1 Tables Core
```sql
-- Users (intégré avec Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'employee',
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  siret TEXT,
  industry TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  company_id UUID REFERENCES companies(id),
  employee_number TEXT,
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  employment_status TEXT DEFAULT 'active',
  hire_date DATE,
  salary DECIMAL,
  manager_id UUID REFERENCES employees(id),
  skills JSONB,
  work_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Tables Business
```sql
-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id),
  manager_id UUID REFERENCES auth.users,
  status TEXT DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget DECIMAL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES auth.users,
  assigned_by UUID REFERENCES auth.users,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devis (Quotes) - DÉJÀ EXISTANT
-- Invoices - DÉJÀ EXISTANT
-- Contracts - À CRÉER SI MANQUANT
```

### 2.3 Tables RH
```sql
-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  manager_id UUID REFERENCES employees(id),
  parent_department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  level INTEGER,
  min_salary DECIMAL,
  max_salary DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Management
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  days_per_year INTEGER,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📅 PHASE 3 : CONFIGURATION SÉCURITÉ (Jour 6-7)

### 3.1 Rôles et Permissions

```sql
-- Enum pour les rôles
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'manager',
  'employee',
  'client',
  'viewer'
);

-- Fonction pour obtenir le rôle de l'utilisateur
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'employee'
  )
$$ LANGUAGE SQL;

-- Fonction pour obtenir la company_id
CREATE OR REPLACE FUNCTION auth.company_id()
RETURNS UUID AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'company_id')::UUID
$$ LANGUAGE SQL;
```

### 3.2 RLS Par Module et Rôle

#### **MODULE COMPANIES**
```sql
-- Super Admin : Tout voir
CREATE POLICY "super_admin_all" ON companies
  FOR ALL USING (auth.role() = 'super_admin');

-- Admin : Sa company uniquement
CREATE POLICY "admin_own_company" ON companies
  FOR ALL USING (
    auth.role() = 'admin' AND 
    id = auth.company_id()
  );

-- Manager/Employee/Client : Lecture seule de sa company
CREATE POLICY "users_read_own_company" ON companies
  FOR SELECT USING (
    auth.role() IN ('manager', 'employee', 'client') AND
    id = auth.company_id()
  );
```

#### **MODULE PROJECTS**
```sql
-- Super Admin : Tout
CREATE POLICY "super_admin_all_projects" ON projects
  FOR ALL USING (auth.role() = 'super_admin');

-- Admin : Tous les projets de sa company
CREATE POLICY "admin_company_projects" ON projects
  FOR ALL USING (
    auth.role() = 'admin' AND 
    company_id = auth.company_id()
  );

-- Manager : Ses projets + lecture des autres
CREATE POLICY "manager_own_projects" ON projects
  FOR ALL USING (
    auth.role() = 'manager' AND 
    (manager_id = auth.uid() OR company_id = auth.company_id())
  );

-- Employee : Projets où il est assigné
CREATE POLICY "employee_assigned_projects" ON projects
  FOR SELECT USING (
    auth.role() = 'employee' AND
    (id IN (
      SELECT DISTINCT project_id FROM tasks 
      WHERE assignee_id = auth.uid()
    ) OR company_id = auth.company_id())
  );

-- Client : Projets de sa company uniquement
CREATE POLICY "client_company_projects" ON projects
  FOR SELECT USING (
    auth.role() = 'client' AND
    company_id = auth.company_id()
  );
```

#### **MODULE TASKS**
```sql
-- Super Admin : Tout
CREATE POLICY "super_admin_all_tasks" ON tasks
  FOR ALL USING (auth.role() = 'super_admin');

-- Admin : Toutes les tâches des projets de sa company
CREATE POLICY "admin_company_tasks" ON tasks
  FOR ALL USING (
    auth.role() = 'admin' AND
    project_id IN (
      SELECT id FROM projects WHERE company_id = auth.company_id()
    )
  );

-- Manager : CRUD sur ses tâches + lecture équipe
CREATE POLICY "manager_team_tasks" ON tasks
  FOR ALL USING (
    auth.role() = 'manager' AND
    (assigned_by = auth.uid() OR 
     assignee_id IN (
       SELECT user_id FROM employees WHERE manager_id = auth.uid()
     ))
  );

-- Employee : Ses tâches uniquement
CREATE POLICY "employee_own_tasks" ON tasks
  FOR ALL USING (
    auth.role() = 'employee' AND
    (assignee_id = auth.uid() OR assigned_by = auth.uid())
  );
```

#### **MODULE INVOICES/DEVIS**
```sql
-- Super Admin : Tout
CREATE POLICY "super_admin_all_invoices" ON invoices
  FOR ALL USING (auth.role() = 'super_admin');

-- Admin : Toutes les factures
CREATE POLICY "admin_all_invoices" ON invoices
  FOR ALL USING (auth.role() = 'admin');

-- Client : Ses factures uniquement
CREATE POLICY "client_own_invoices" ON invoices
  FOR SELECT USING (
    auth.role() = 'client' AND
    company_id = auth.company_id()
  );

-- Manager/Employee : Aucun accès
CREATE POLICY "no_access_invoices" ON invoices
  FOR ALL USING (auth.role() NOT IN ('manager', 'employee'));
```

#### **MODULE RH**
```sql
-- Employees : Accès selon rôle
CREATE POLICY "hr_access_employees" ON employees
  FOR ALL USING (
    auth.role() = 'super_admin' OR
    (auth.role() = 'admin' AND company_id = auth.company_id()) OR
    (auth.role() = 'manager' AND (user_id = auth.uid() OR manager_id = auth.uid())) OR
    (auth.role() = 'employee' AND user_id = auth.uid())
  );

-- Leave Requests
CREATE POLICY "leave_requests_access" ON leave_requests
  FOR ALL USING (
    auth.role() = 'super_admin' OR
    (auth.role() = 'admin') OR
    (auth.role() = 'manager' AND employee_id IN (
      SELECT id FROM employees WHERE manager_id = auth.uid()
    )) OR
    (auth.role() = 'employee' AND employee_id = (
      SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1
    ))
  );
```

## 📅 PHASE 4 : MIGRATION DONNÉES (Jour 8)

### 4.1 Script de Migration
```javascript
// scripts/migrate-to-supabase.js
const { createClient } = require('@supabase/supabase-js')
const { Pool } = require('pg')

async function migrate() {
  // 1. Connect to Neon
  const neon = new Pool({ connectionString: process.env.NEON_DATABASE_URL })
  
  // 2. Connect to Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  
  // 3. Migrate Companies
  const companies = await neon.query('SELECT * FROM companies')
  for (const company of companies.rows) {
    await supabase.from('companies').upsert({
      id: company.id,
      name: company.name,
      // ... map fields
    })
  }
  
  // 4. Migrate Users to Auth
  const users = await neon.query('SELECT * FROM users')
  for (const user of users.rows) {
    // Create auth user
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        role: user.role,
        company_id: user.company_id
      }
    })
    
    // Create profile
    await supabase.from('profiles').insert({
      id: authUser.user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      company_id: user.company_id
    })
  }
  
  // 5. Continue with other tables...
}
```

## 📅 PHASE 5 : ADAPTATION CODE (Jour 9-12)

### 5.1 AuthContext
```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  role: string | null
  companyId: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setRole(session?.user?.user_metadata?.role ?? null)
      setCompanyId(session?.user?.user_metadata?.company_id ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setRole(session?.user?.user_metadata?.role ?? null)
        setCompanyId(session?.user?.user_metadata?.company_id ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, role, companyId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 5.2 Exemple: Page Projects
```typescript
// pages/Projects.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function Projects() {
  const { user, role } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          company:companies(name),
          manager:profiles!manager_id(first_name, last_name),
          tasks(count)
        `)
        .order('created_at', { ascending: false })

      // RLS s'occupe des permissions !
      const { data, error } = await query
      
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          manager_id: user?.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Refresh list
      loadProjects()
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  // ... reste du composant
}
```

### 5.3 Services IA en Edge Functions
```typescript
// supabase/functions/ai-voice-recognition/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sessionId, language, audioData } = await req.json()
    
    // Implémenter la reconnaissance vocale
    // Utiliser Google Cloud Speech, Azure, ou Whisper API
    
    const transcription = await processAudio(audioData, language)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        transcription,
        sessionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## 📅 PHASE 6 : TESTS & DÉPLOIEMENT (Jour 13-15)

### 6.1 Tests par Module
- [ ] **Auth** : Login, roles, permissions
- [ ] **Companies** : CRUD selon rôle
- [ ] **Projects** : Création, assignation, visibilité
- [ ] **Tasks** : Workflow complet
- [ ] **Invoices/Devis** : Génération, validation
- [ ] **HR** : Organigramme, congés
- [ ] **IA** : Voice, prédictions, alertes

### 6.2 Tests de Performance
- [ ] Charge 100 utilisateurs simultanés
- [ ] Temps de réponse < 200ms
- [ ] Optimisation des requêtes

### 6.3 Déploiement
- [ ] Migration données production
- [ ] Bascule DNS
- [ ] Monitoring actif
- [ ] Rollback plan

## 🎯 RÉSULTAT FINAL

### ✅ Ce que vous aurez :
1. **100% Supabase** - Aucune dépendance Neon
2. **0 données mockées** - Tout en base de données
3. **Sécurité RLS** - Par rôle et company
4. **Edge Functions IA** - Voice, prédictions, alertes
5. **Realtime** - Notifications, collaboration
6. **Performance** - <200ms temps de réponse

### 📊 Modules Complets :
- ✅ **Auth** : Multi-rôles avec permissions
- ✅ **Business** : Factures, devis, contrats
- ✅ **Projects** : Gestion complète avec tâches
- ✅ **HR** : Employés, congés, organigramme
- ✅ **IA** : Tous les services intégrés
- ✅ **Analytics** : Dashboards temps réel

### 🔒 Sécurité par Rôle :
- **Super Admin** : Accès total
- **Admin** : Toute la company
- **Manager** : Son équipe
- **Employee** : Ses données
- **Client** : Ses projets/factures
- **Viewer** : Lecture seule

---

*Ce plan garantit une migration complète vers Supabase avec toutes les fonctionnalités et aucune donnée mockée.*
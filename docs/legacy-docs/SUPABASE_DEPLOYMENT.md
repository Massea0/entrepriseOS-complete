# 🚀 GUIDE DE DÉPLOIEMENT SUPABASE

## 📋 PRÉREQUIS

1. **Supabase CLI installé**
```bash
npm install -g supabase
```

2. **Authentification Supabase**
```bash
supabase login
```

3. **Projet Supabase lié**
```bash
supabase link --project-ref qlqgyrfqiflnqknbtycw
```

## ⚡ EDGE FUNCTIONS

### 1. Déployer l'assignation automatique
```bash
supabase functions deploy auto-assign-project
```

### 2. Créer d'autres Edge Functions

**generate-invoice-pdf/index.ts**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb } from 'https://cdn.skypack.dev/pdf-lib@1.17.1'

serve(async (req) => {
  const { invoiceId } = await req.json()
  
  // Fetch invoice data
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, company:companies(*)')
    .eq('id', invoiceId)
    .single()
  
  // Generate PDF
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  
  // Add content...
  page.drawText(`FACTURE ${invoice.number}`, {
    x: 50,
    y: 750,
    size: 30,
    color: rgb(0, 0.53, 0.71),
  })
  
  const pdfBytes = await pdfDoc.save()
  
  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`
    }
  })
})
```

### 3. Déployer toutes les fonctions
```bash
# Déployer une par une
supabase functions deploy auto-assign-project
supabase functions deploy generate-invoice-pdf
supabase functions deploy ai-predictions
supabase functions deploy process-voice-command

# Ou toutes d'un coup
for func in auto-assign-project generate-invoice-pdf ai-predictions process-voice-command; do
  supabase functions deploy $func
done
```

## 🗄️ DATABASE

### 1. Vérifier les migrations
```bash
supabase db diff
```

### 2. Créer une nouvelle migration
```bash
supabase migration new add_missing_indexes
```

**supabase/migrations/[timestamp]_add_missing_indexes.sql**
```sql
-- Indexes for performance
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- Full text search
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('french', title || ' ' || COALESCE(description, '')));
```

### 3. Appliquer les migrations
```bash
supabase db push
```

## 📦 STORAGE

### 1. Créer les buckets
```sql
-- Dans le SQL Editor de Supabase
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', false),
  ('avatars', 'avatars', true),
  ('company-logos', 'company-logos', true);
```

### 2. Configurer les policies
```sql
-- Documents bucket - Private
CREATE POLICY "Users can upload their documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket - Public read
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');
```

## 🔐 ROW LEVEL SECURITY

### Vérifier RLS sur toutes les tables
```sql
-- Script de vérification
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Activé'
    ELSE '❌ Désactivé'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Activer RLS manquant
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
```

## 🌍 VARIABLES D'ENVIRONNEMENT

### 1. Secrets Edge Functions
```bash
# API Keys
supabase secrets set GEMINI_API_KEY=AIzaSyDK2aFPChQ_7pLy1J2IRQmhK_g4inUqWiU
supabase secrets set OPENAI_API_KEY=your-openai-key

# Autres services
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASS=your-app-password
```

### 2. Vérifier les secrets
```bash
supabase secrets list
```

## 📊 MONITORING

### 1. Activer les logs
```bash
# Logs en temps réel
supabase functions logs auto-assign-project --tail

# Logs des dernières 24h
supabase logs --since 24h
```

### 2. Métriques
Dans le dashboard Supabase :
- Database > Query Performance
- Functions > Invocations
- Auth > User Activity
- Storage > Bandwidth

## 🔄 CI/CD avec GitHub Actions

**.github/workflows/deploy-supabase.yml**
```yaml
name: Deploy to Supabase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Deploy Functions
        run: |
          supabase functions deploy auto-assign-project
          supabase functions deploy generate-invoice-pdf
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: qlqgyrfqiflnqknbtycw
```

## 🧪 TESTS DE PRODUCTION

### 1. Tester les Edge Functions
```bash
# Test local
curl -X POST https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/auto-assign-project \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test-project-id"}'
```

### 2. Vérifier les performances
```sql
-- Requêtes lentes
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 📝 CHECKLIST FINALE

- [ ] Toutes les Edge Functions déployées
- [ ] Migrations appliquées
- [ ] Indexes créés
- [ ] RLS activé sur toutes les tables
- [ ] Policies configurées
- [ ] Storage buckets créés
- [ ] Secrets configurés
- [ ] Monitoring activé
- [ ] Tests de production passés

## 🚨 ROLLBACK

Si problème en production :

```bash
# Rollback de fonction
supabase functions delete auto-assign-project
git checkout HEAD~1 -- supabase/functions/auto-assign-project
supabase functions deploy auto-assign-project

# Rollback de migration
supabase db reset --db-url $PRODUCTION_DB_URL
```

## 📞 SUPPORT

- Documentation : https://supabase.com/docs
- Status : https://status.supabase.com
- Discord : https://discord.supabase.com

---

**✅ Une fois tous les éléments déployés, votre application est prête pour la production sur Supabase !**
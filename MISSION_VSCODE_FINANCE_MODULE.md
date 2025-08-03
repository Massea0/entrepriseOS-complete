# 🤖 MISSION VS CODE - MODULE FINANCE ENTREPRISEOS

## 📋 CONTEXTE

Tu es l'agent VS Code qui va continuer le développement du module Finance. L'infrastructure backend est **100% déployée** sur Supabase avec 8 Edge Functions IA opérationnelles. Il faut maintenant créer l'interface React.

## 🗄️ ACCÈS BASE DE DONNÉES

### Option 1 : MCP Supabase (si configuré)
```typescript
// Si MCP fonctionne, tu peux demander directement :
"Montre-moi la structure de la table devis"
"Liste les Edge Functions déployées"
"Combien d'enregistrements dans contracts"
```

### Option 2 : Connexion directe Supabase
```typescript
// Utilise ces credentials depuis .env
VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Client Supabase dans src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
```

## 📊 TABLES DISPONIBLES

### 1. Table `devis` (quotes)
```sql
-- Colonnes principales
id: uuid
client_id: uuid
client_name: text
items: jsonb
total_amount: decimal
currency: text
status: text ('draft', 'sent', 'accepted', 'rejected')
valid_until: date

-- Colonnes IA
ai_insights: jsonb
calculated_margin: decimal
risk_score: integer
market_analysis: jsonb
```

### 2. Table `contract_templates`
```sql
id: uuid
name: text
template_type: text ('service', 'product', 'subscription')
sections: jsonb
variables: jsonb
compliance_level: text
ai_generated: boolean
```

### 3. Table `contracts`
```sql
id: uuid
template_id: uuid
client_id: uuid
content: text
status: text
amount: decimal
risk_analysis: jsonb
```

## 🤖 EDGE FUNCTIONS DISPONIBLES

### 1. ai-devis-generator
```typescript
// POST /functions/v1/ai-devis-generator
{
  clientData: { name, email, industry },
  requirements: string,
  estimatedBudget?: number
}
// Returns: { devis, aiInsights, suggestions }
```

### 2. contract-risk-analyzer
```typescript
// POST /functions/v1/contract-risk-analyzer
{
  contractId: string,
  analysisType: 'financial' | 'legal' | 'all'
}
// Returns: { riskScore, factors, recommendations }
```

### 3. pricing-optimizer
```typescript
// POST /functions/v1/pricing-optimizer
{
  productData: { name, cost, category },
  marketContext: { competitors, demand }
}
// Returns: { optimizedPrice, margin, justification }
```

### 4. contract-generator
```typescript
// POST /functions/v1/contract-generator
{
  templateId: string,
  variables: Record<string, any>
}
// Returns: { contractId, content, status }
```

### 5. market-intelligence
```typescript
// POST /functions/v1/market-intelligence
{
  sector: string,
  period: 'month' | 'quarter' | 'year'
}
// Returns: { trends, opportunities, threats }
```

### 6. legal-compliance-checker
```typescript
// POST /functions/v1/legal-compliance-checker
{
  documentContent: string,
  checkType: 'rgpd' | 'mentions' | 'all'
}
// Returns: { compliant, issues, suggestions }
```

### 7. client-communication-automation
```typescript
// POST /functions/v1/client-communication-automation
{
  clientId: string,
  template: 'devis_sent' | 'reminder' | 'followup',
  language: 'fr' | 'en'
}
// Returns: { messageId, content, scheduledAt }
```

### 8. business-analytics-engine
```typescript
// POST /functions/v1/business-analytics-engine
{
  dateRange: { start, end },
  metrics: string[],
  format: 'json' | 'pdf' | 'excel'
}
// Returns: { data, insights, exportUrl }
```

## 🎯 MISSION PRINCIPALE

### PHASE 1 : Services d'intégration (PRIORITÉ)

Créer dans `src/features/finance/services/` :

```typescript
// ai-devis.service.ts
import { supabase } from '@/lib/supabase'

export class AIDevisService {
  static async generateDevisWithAI(clientData: ClientData, requirements: string) {
    const { data, error } = await supabase.functions.invoke('ai-devis-generator', {
      body: { clientData, requirements }
    })
    
    if (error) throw error
    return data
  }
  
  static async optimizeDevis(devisId: string) {
    // Logic here
  }
}
```

Répéter pour les 8 Edge Functions.

### PHASE 2 : Composants UI

#### 2.1 DevisGeneratorAI.tsx
```typescript
// src/features/finance/components/devis/DevisGeneratorAI.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIDevisService } from '../../services/ai-devis.service'

export function DevisGeneratorAI() {
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const form = useForm<DevisFormData>()
  
  const generateWithAI = async (data: DevisFormData) => {
    setIsGenerating(true)
    try {
      const result = await AIDevisService.generateDevisWithAI(
        data.client,
        data.requirements
      )
      setAiSuggestions(result.suggestions)
      // Update form with AI suggestions
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-2">
        {/* Devis form here */}
      </Card>
      
      {/* AI Suggestions Panel */}
      <Card>
        <AIDevisSuggestions 
          suggestions={aiSuggestions}
          onApply={handleApplySuggestion}
        />
      </Card>
    </div>
  )
}
```

### PHASE 3 : State Management

```typescript
// src/features/finance/store/financeStore.ts
import { create } from 'zustand'

interface FinanceStore {
  // Devis
  devis: Devis[]
  devisLoading: boolean
  
  // Actions
  generateDevis: async (data) => {
    set({ devisLoading: true })
    const result = await AIDevisService.generateDevisWithAI(data)
    set({ devis: [...get().devis, result], devisLoading: false })
  }
}

export const useFinanceStore = create<FinanceStore>()
```

## 📏 RÈGLES À RESPECTER

### Code Standards
- **Composants** : Max 300 lignes
- **TypeScript** : Mode strict, pas de `any`
- **Imports** : Ordre standard (React → UI → Services → Types)
- **Performance** : useMemo, useCallback pour optimisation

### Architecture
```
src/features/finance/
├── components/
│   ├── devis/
│   ├── contracts/
│   ├── pricing/
│   └── analytics/
├── services/       # 8 services pour Edge Functions
├── hooks/          # Hooks custom
├── store/          # Zustand
└── types/          # Déjà créés
```

### UI/UX
- Utiliser les composants de `@/components/ui/`
- Design responsive mobile-first
- États de chargement avec Skeleton
- Gestion d'erreurs avec toast

## 🧪 TESTS À IMPLÉMENTER

```typescript
// Exemple de test pour un service
describe('AIDevisService', () => {
  it('should generate devis with AI', async () => {
    const result = await AIDevisService.generateDevisWithAI(mockClient, mockReqs)
    expect(result).toHaveProperty('devis')
    expect(result).toHaveProperty('aiInsights')
  })
})
```

## 📊 VÉRIFICATIONS BASE DE DONNÉES

### Requêtes utiles
```sql
-- Vérifier les devis existants
SELECT * FROM devis ORDER BY created_at DESC LIMIT 10;

-- Stats par statut
SELECT status, COUNT(*) FROM devis GROUP BY status;

-- Templates de contrats
SELECT * FROM contract_templates WHERE ai_generated = true;

-- Analyse des risques
SELECT id, risk_analysis->>'score' as risk_score 
FROM contracts 
WHERE risk_analysis IS NOT NULL;
```

## 🚀 ORDRE D'EXÉCUTION

1. **Services** (ai-devis.service.ts en premier)
2. **DevisGeneratorAI** composant principal
3. **AIDevisSuggestions** panneau de suggestions
4. **Store Zustand** pour l'état global
5. **Tests** pour chaque service
6. **FinanceAnalyticsDashboard** pour la valeur business

## ⚠️ POINTS D'ATTENTION

- Les Edge Functions retournent toujours `{ data, error }`
- Gérer les erreurs avec try/catch
- Utiliser React Query pour le cache (déjà configuré)
- Respecter les types TypeScript existants
- Limiter les appels API (rate limiting)

## 📝 DOCUMENTATION À METTRE À JOUR

Après chaque composant créé, mettre à jour :
- `src/features/finance/README.md`
- Tests unitaires
- Storybook (si configuré)

---

**🎯 OBJECTIF FINAL** : Interface utilisateur moderne qui exploite pleinement les 8 Edge Functions IA pour créer l'expérience Finance la plus avancée du marché.

**⏱️ Temps estimé** : 9-10 jours pour l'ensemble

**💡 Commence par les services, c'est la base de tout !**
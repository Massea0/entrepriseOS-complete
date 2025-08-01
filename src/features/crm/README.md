# Module CRM

## 📋 Vue d'ensemble

Le module CRM (Customer Relationship Management) permet de gérer les relations clients, les opportunités commerciales et le pipeline de vente.

## 🏗️ Architecture

```
src/features/crm/
├── components/          # Composants React
│   ├── SalesPipeline.tsx
│   ├── DealCard.tsx
│   ├── DealForm.tsx
│   └── PipelineStage.tsx
├── hooks/              # Hooks personnalisés
│   ├── usePipeline.ts
│   └── useDeals.ts
├── services/           # Services API
│   └── crm.service.ts
├── types/              # Types TypeScript
│   └── crm.types.ts
├── utils/              # Utilitaires
│   └── crm.utils.ts
├── mocks/              # Données de test
│   └── crm.mocks.ts
├── pages/              # Pages principales
│   └── CRMDashboard.tsx
└── index.ts            # Exports publics
```

## 🚀 Fonctionnalités

### Pipeline de vente
- Visualisation kanban des opportunités
- 6 étapes par défaut : Prospect → Qualifié → Proposition → Négociation → Gagné/Perdu
- Drag & drop pour déplacer les deals entre étapes
- Métriques en temps réel

### Gestion des deals
- Création et édition de deals
- Suivi de la valeur et probabilité
- Gestion des priorités (low, medium, high, critical)
- Tags et catégorisation
- Alertes pour les deals en retard

### Contacts et entreprises
- Base de contacts centralisée
- Association deals-contacts
- Score de lead
- Historique des interactions

## 📊 Types principaux

```typescript
// Deal - Opportunité commerciale
interface Deal {
  id: string
  name: string
  stage: DealStage
  value: Money
  probability: number
  priority: DealPriority
  contactId: string
  expectedCloseDate: string
  // ...
}

// Pipeline - Configuration du pipeline
interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}

// Contact - Contact client
interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: Company
  leadScore: number
  // ...
}
```

## 🛠️ Utilisation

### Composant SalesPipeline

```tsx
import { SalesPipeline } from '@/features/crm'

function CRMPage() {
  return (
    <SalesPipeline
      pipeline={pipeline}
      deals={deals}
      contacts={contacts}
      onCreateDeal={handleCreateDeal}
      onUpdateDeal={handleUpdateDeal}
    />
  )
}
```

### Hook usePipeline

```tsx
import { usePipeline } from '@/features/crm/hooks/usePipeline'

function MyComponent() {
  const {
    dealsByStage,
    pipelineMetrics,
    handleDealDrop,
    handleAddDeal
  } = usePipeline({ pipeline, deals, contacts })
  
  // Utiliser les données et méthodes
}
```

### Utilitaires CRM

```typescript
import { CRMUtils } from '@/features/crm/utils/crm.utils'

// Formater une devise
CRMUtils.formatCurrency(50000) // "50 000 €"

// Calculer l'âge d'un deal
CRMUtils.calculateDealAge(deal) // 15 (jours)

// Vérifier si un deal est en retard
CRMUtils.isDealOverdue(deal) // true/false
```

## 🎯 Bonnes pratiques

### 1. Séparation des responsabilités
- **Composants** : Présentation uniquement
- **Hooks** : Logique métier et état
- **Services** : Communication API
- **Utils** : Fonctions pures réutilisables

### 2. Types stricts
- Éviter `any`, utiliser des types appropriés
- Utiliser `Partial<T>` pour les mocks
- Documenter les interfaces complexes

### 3. Performance
- Mémoriser les calculs coûteux avec `useMemo`
- Utiliser `useCallback` pour les event handlers
- Éviter les re-renders inutiles

### 4. Composants modulaires
- Un fichier par composant
- Props typées avec interfaces
- Composants purs quand possible

## 🧪 Tests

```typescript
// Exemple de test pour CRMUtils
describe('CRMUtils', () => {
  it('should calculate win rate correctly', () => {
    const deals = [
      { stage: 'won' },
      { stage: 'lost' },
      { stage: 'won' }
    ]
    expect(CRMUtils.calculateWinRate(deals)).toBe(66.67)
  })
})
```

## 📈 Évolutions futures

- [ ] Intégration avec l'API Supabase
- [ ] Système de notifications temps réel
- [ ] Rapports et analytics avancés
- [ ] Import/export de données
- [ ] Automatisation du workflow
- [ ] Intégration email
- [ ] Prévisions de vente IA

## 🔧 Configuration

### Variables d'environnement
```env
VITE_CRM_API_URL=https://api.entrepriseos.com/crm
VITE_CRM_WEBHOOK_SECRET=your-webhook-secret
```

### Permissions requises
- `crm:read` - Lecture des données CRM
- `crm:write` - Création/modification
- `crm:delete` - Suppression
- `crm:admin` - Administration complète
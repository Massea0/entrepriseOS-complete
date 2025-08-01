# 📊 Module Finance

## 📋 Description

Le module Finance gère toute la partie financière de l'application :
- Gestion des factures
- Gestion des devis
- Suivi des paiements
- Gestion des dépenses
- Rapports financiers

## 🏗️ Architecture

```
finance/
├── components/          # Composants UI
│   ├── InvoiceList/    # Liste des factures
│   ├── InvoiceForm/    # Formulaire de création/édition
│   ├── InvoiceView/    # Vue détaillée d'une facture
│   └── FinanceMetrics/ # Métriques et KPIs
├── hooks/              # Hooks personnalisés
│   └── useInvoices.ts  # Logique des factures
├── services/           # Communication API
│   └── finance.service.ts
├── types/              # Types TypeScript
│   └── finance.types.ts
├── utils/              # Fonctions utilitaires
│   └── finance.utils.ts
├── constants/          # Constantes
│   └── finance.constants.ts
├── mocks/              # Données de test
│   └── finance.mocks.ts
├── pages/              # Pages principales
│   └── FinanceDashboard.tsx
└── index.ts            # Exports publics
```

## 🎯 Fonctionnalités

### Factures
- ✅ Création de factures
- ✅ Édition de factures brouillon
- ✅ Envoi de factures
- ✅ Suivi des paiements
- ✅ Génération de PDF
- ✅ Filtrage par statut
- ✅ Recherche

### Devis (À venir)
- Création de devis
- Conversion en facture
- Suivi de validité

### Paiements (À venir)
- Enregistrement des paiements
- Rapprochement bancaire
- Gestion des remboursements

## 🚀 Utilisation

### Import du module
```typescript
import { InvoiceManagement } from '@/features/finance'
```

### Composant principal
```tsx
<InvoiceManagement 
  contacts={contacts}
  products={products}
  taxRates={taxRates}
/>
```

### Hook useInvoices
```typescript
const {
  invoices,
  isLoading,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  markAsPaid,
  generatePDF
} = useInvoices()
```

## 📊 Types principaux

```typescript
interface Invoice {
  id: string
  number: string
  status: InvoiceStatus
  date: string
  dueDate: string
  contact?: Contact
  contactId: string
  items: LineItem[]
  subtotalAmount: Money
  taxAmount: Money
  totalAmount: Money
  paidAmount: Money
  remainingAmount: Money
  notes?: string
  terms?: string
}

interface LineItem {
  id: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  totalPrice: number
}

type InvoiceStatus = 
  | 'draft'      // Brouillon
  | 'sent'       // Envoyée
  | 'viewed'     // Vue par le client
  | 'paid'       // Payée
  | 'partial'    // Partiellement payée
  | 'overdue'    // En retard
  | 'cancelled'  // Annulée
```

## 🛠️ Configuration

### Variables d'environnement
```env
# Mode développement (utilise les mocks)
VITE_DEV=true
```

### Constantes personnalisables
```typescript
// finance.constants.ts
export const DEFAULT_INVOICE_CONFIG = {
  currency: 'EUR',
  taxRate: 20,
  paymentTerms: 30,
  numberPrefix: 'INV'
}
```

## 📈 Métriques

Le module affiche automatiquement :
- Montant total facturé
- Montant payé
- Montant en retard
- Taux de recouvrement

## 🧪 Tests

### Tests unitaires
```bash
npm test finance.utils
npm test useInvoices
```

### Tests d'intégration
```bash
npm test InvoiceManagement
```

## 🔄 Évolutions prévues

1. **Gestion des devis**
   - Création et édition
   - Templates de devis
   - Conversion en facture

2. **Paiements avancés**
   - Paiements partiels
   - Plans de paiement
   - Intégration Stripe/PayPal

3. **Rapports financiers**
   - Bilan
   - Compte de résultat
   - Flux de trésorerie

4. **Multi-devises**
   - Conversion automatique
   - Taux de change temps réel

5. **Automatisations**
   - Relances automatiques
   - Factures récurrentes
   - Notifications

## 📝 Notes de développement

### Refactoring récent
Le module a été refactorisé pour passer de 1028 lignes dans un seul fichier à une architecture modulaire :
- Composants découpés < 200 lignes
- Logique extraite dans des hooks
- Utils et constants externalisés
- Mocks pour le développement

### Points d'attention
- Les mocks sont utilisés en mode développement
- La génération PDF retourne un blob factice en dev
- L'API réelle n'est pas encore connectée

## 🤝 Contribution

Pour contribuer au module Finance :
1. Respecter la structure modulaire
2. Composants < 300 lignes
3. Types stricts (pas de `any`)
4. Tests pour toute nouvelle fonctionnalité
5. Documentation à jour
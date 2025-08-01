# 📋 Plan de Refactoring - Module Finance

## 🎯 Objectifs

1. **Réduire la taille du composant InvoiceManagement** (1028 lignes → ~250 lignes max)
2. **Créer une structure modulaire** conforme aux standards
3. **Extraire la logique dans des hooks**
4. **Séparer les sous-composants**
5. **Externaliser les utils et constants**

## 🏗️ Structure Cible

```
src/features/finance/
├── components/
│   ├── InvoiceManagement.tsx      # Orchestrateur principal (~250 lignes)
│   ├── InvoiceList/
│   │   ├── InvoiceList.tsx        # Liste des factures
│   │   ├── InvoiceFilters.tsx    # Filtres de recherche
│   │   └── InvoiceListItem.tsx   # Item de liste
│   ├── InvoiceForm/
│   │   ├── InvoiceForm.tsx        # Formulaire principal
│   │   ├── LineItemsEditor.tsx   # Éditeur de lignes
│   │   ├── ContactSelector.tsx   # Sélection contact
│   │   └── TaxCalculator.tsx     # Calcul des taxes
│   ├── InvoiceView/
│   │   ├── InvoiceView.tsx        # Vue détaillée
│   │   ├── InvoiceHeader.tsx     # En-tête facture
│   │   ├── InvoiceActions.tsx    # Actions (envoyer, imprimer...)
│   │   └── InvoicePreview.tsx    # Aperçu PDF
│   ├── QuoteManagement/
│   │   ├── QuoteList.tsx          # Liste des devis
│   │   ├── QuoteForm.tsx          # Formulaire devis
│   │   └── QuoteConversion.tsx   # Conversion devis → facture
│   └── FinanceMetrics/
│       ├── RevenueChart.tsx       # Graphique revenus
│       ├── OutstandingBalance.tsx # Soldes impayés
│       └── MetricCards.tsx        # KPI cards
├── hooks/
│   ├── useInvoices.ts             # CRUD factures
│   ├── useQuotes.ts               # CRUD devis
│   ├── useFinanceMetrics.ts       # Métriques
│   ├── useInvoiceForm.ts          # Logique formulaire
│   └── useTaxCalculations.ts      # Calculs taxes
├── utils/
│   ├── finance.utils.ts           # Formatters et helpers
│   ├── invoice.utils.ts           # Utils spécifiques factures
│   ├── tax.utils.ts               # Calculs taxes
│   └── pdf.utils.ts               # Génération PDF
├── services/
│   ├── finance.service.ts         # API principale
│   ├── invoice.service.ts         # Service factures
│   └── quote.service.ts           # Service devis
├── types/
│   └── finance.types.ts           # Types TypeScript
├── constants/
│   ├── finance.constants.ts       # Constantes générales
│   ├── invoice.constants.ts       # Status, templates...
│   └── tax.constants.ts           # Taux de taxe
├── mocks/
│   ├── invoices.mocks.ts          # Données test factures
│   └── quotes.mocks.ts            # Données test devis
├── context/
│   └── FinanceContext.tsx         # Context global finance
├── README.md                      # Documentation
└── index.ts                       # Exports publics
```

## 📝 Étapes de Refactoring

### Phase 1: Extraction des Utils et Constants
1. **Créer `finance.utils.ts`**
   - `formatCurrency()`
   - `formatDate()`
   - `calculateTotal()`
   - `calculateTax()`

2. **Créer `invoice.constants.ts`**
   - Status des factures
   - Templates par défaut
   - Messages d'erreur

### Phase 2: Création des Hooks
1. **`useInvoices.ts`**
   ```typescript
   export const useInvoices = () => {
     const { data, isLoading, error } = useQuery(...)
     const createMutation = useMutation(...)
     const updateMutation = useMutation(...)
     
     return {
       invoices: data || [],
       isLoading,
       createInvoice: createMutation.mutate,
       updateInvoice: updateMutation.mutate,
       // ...
     }
   }
   ```

2. **`useInvoiceForm.ts`**
   - Gestion état formulaire
   - Validation
   - Calculs automatiques

### Phase 3: Découpage des Composants

1. **InvoiceList** (~150 lignes)
   - Tableau des factures
   - Actions par ligne
   - Pagination

2. **InvoiceForm** (~200 lignes)
   - Formulaire modulaire
   - Sous-composants pour chaque section

3. **InvoiceView** (~150 lignes)
   - Affichage détaillé
   - Actions contextuelles

### Phase 4: Composant Principal
```typescript
// InvoiceManagement.tsx (~250 lignes)
export const InvoiceManagement = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  const {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice
  } = useInvoices()
  
  const handleCreate = () => setView('form')
  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setView('form')
  }
  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setView('view')
  }
  
  if (isLoading) return <InvoiceLoadingSkeleton />
  
  return (
    <div className="space-y-6">
      <FinanceMetrics />
      
      {view === 'list' && (
        <InvoiceList
          invoices={invoices}
          onView={handleView}
          onEdit={handleEdit}
          onCreate={handleCreate}
        />
      )}
      
      {view === 'form' && (
        <InvoiceForm
          invoice={selectedInvoice}
          onSave={(data) => {
            selectedInvoice 
              ? updateInvoice(data)
              : createInvoice(data)
            setView('list')
          }}
          onCancel={() => setView('list')}
        />
      )}
      
      {view === 'view' && selectedInvoice && (
        <InvoiceView
          invoice={selectedInvoice}
          onEdit={() => setView('form')}
          onBack={() => setView('list')}
        />
      )}
    </div>
  )
}
```

## 🔄 Migration des Données

### Mocks actuels → finance.mocks.ts
```typescript
// finance.mocks.ts
export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    number: 'INV-2024-001',
    // ...
  }
]

export const MOCK_QUOTES: Quote[] = [
  // ...
]
```

## 📊 Métriques de Succès

### Avant
- InvoiceManagement: 1028 lignes
- 0 hooks personnalisés
- 0 utils externes
- Tout dans un fichier

### Après (Objectif)
- Composant principal: ~250 lignes
- 5+ hooks réutilisables
- Utils testables séparément
- Structure modulaire claire

## 🧪 Plan de Tests

1. **Tests Unitaires**
   - Utils: 100% coverage
   - Hooks: 90% coverage
   - Composants: 80% coverage

2. **Tests d'Intégration**
   - Flow création facture
   - Flow édition
   - Flow conversion devis

## 📅 Timeline

- **Jour 1**: Utils et Constants
- **Jour 2**: Hooks
- **Jour 3**: Composants Liste et Filtres
- **Jour 4**: Composants Formulaire
- **Jour 5**: Composants Vue et Actions
- **Jour 6**: Tests et documentation

## ✅ Checklist

- [ ] Créer structure de dossiers
- [ ] Extraire utils
- [ ] Extraire constants
- [ ] Créer hooks
- [ ] Découper InvoiceList
- [ ] Découper InvoiceForm
- [ ] Découper InvoiceView
- [ ] Créer composants métriques
- [ ] Ajouter tests
- [ ] Documenter README.md
- [ ] Créer index.ts avec exports
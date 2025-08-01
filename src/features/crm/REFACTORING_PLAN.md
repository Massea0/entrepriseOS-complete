# Plan de Refactorisation du Module CRM

## 🎯 Objectifs
- Réduire la taille du fichier SalesPipeline.tsx (actuellement 1224 lignes)
- Améliorer la maintenabilité et testabilité
- Éliminer les dépendances circulaires
- Standardiser les patterns de code

## 📋 Tâches immédiates

### 1. Décomposer SalesPipeline.tsx
- [x] Extraire CRMUtils → `utils/crm.utils.ts`
- [x] Extraire les données mock → `mocks/crm.mocks.ts`
- [x] Extraire DealCard → `components/DealCard.tsx`
- [ ] Extraire PipelineStage → `components/PipelineStage.tsx`
- [ ] Extraire DealForm → `components/DealForm.tsx`
- [ ] Extraire PipelineMetrics → `components/PipelineMetrics.tsx`
- [ ] Nettoyer SalesPipeline.tsx pour qu'il ne contienne que la logique principale

### 2. Créer des hooks spécialisés
- [x] `usePipeline` - Gestion du pipeline et métriques
- [ ] `useDeals` - CRUD des deals avec Supabase
- [ ] `useDragAndDrop` - Logique de drag & drop
- [ ] `useCRMMetrics` - Calculs et analytics

### 3. Améliorer les types
```typescript
// Remplacer les 'any' par des types stricts
- deals: any[] → deals: Deal[]
- contact: any → contact: Contact | undefined

// Créer des types utilitaires
type DealWithContact = Deal & { contact: Contact }
type PipelineMetrics = { ... }
```

### 4. Optimiser les performances
- [ ] Mémoriser les composants lourds avec `React.memo`
- [ ] Utiliser `useCallback` pour tous les event handlers
- [ ] Implémenter la virtualisation pour les grandes listes
- [ ] Lazy loading des modals et formulaires

### 5. Ajouter la gestion d'état globale
```typescript
// Utiliser React Query pour le cache et sync
const { data: deals, isLoading } = useQuery({
  queryKey: ['deals', filters],
  queryFn: () => CRMService.getDeals(filters)
})

// Mutations optimistes
const updateDeal = useMutation({
  mutationFn: CRMService.updateDeal,
  onMutate: async (newDeal) => {
    // Mise à jour optimiste
  }
})
```

## 🏗️ Structure cible

```
src/features/crm/
├── components/
│   ├── deals/
│   │   ├── DealCard.tsx
│   │   ├── DealForm.tsx
│   │   └── DealDetails.tsx
│   ├── pipeline/
│   │   ├── PipelineStage.tsx
│   │   ├── PipelineHeader.tsx
│   │   └── PipelineMetrics.tsx
│   ├── contacts/
│   │   ├── ContactList.tsx
│   │   └── ContactCard.tsx
│   └── SalesPipeline.tsx (orchestrateur principal)
├── hooks/
│   ├── usePipeline.ts
│   ├── useDeals.ts
│   ├── useContacts.ts
│   └── useCRMMetrics.ts
├── services/
│   ├── crm.service.ts
│   └── crm.cache.ts
├── store/
│   └── crm.store.ts (Zustand/Redux)
├── utils/
│   ├── crm.utils.ts
│   ├── crm.validators.ts
│   └── crm.constants.ts
└── __tests__/
    ├── components/
    ├── hooks/
    └── utils/
```

## 🔧 Configurations recommandées

### ESLint rules
```json
{
  "rules": {
    "max-lines": ["error", 300],
    "max-lines-per-function": ["error", 50],
    "complexity": ["error", 10],
    "no-any": "error"
  }
}
```

### Imports alias
```typescript
// tsconfig.json
{
  "paths": {
    "@crm/*": ["src/features/crm/*"],
    "@crm/components": ["src/features/crm/components"],
    "@crm/hooks": ["src/features/crm/hooks"],
    "@crm/utils": ["src/features/crm/utils"]
  }
}
```

## 📊 Métriques de succès

- [ ] Aucun fichier > 300 lignes
- [ ] Couverture de tests > 80%
- [ ] Temps de build < 10s
- [ ] Bundle size du module < 100KB
- [ ] Score Lighthouse > 90

## 🚀 Quick wins

1. **Extraction immédiate** des composants restants
2. **Lazy loading** des modals avec `React.lazy`
3. **Debounce** sur les filtres et recherches
4. **Virtualisation** avec `react-window` pour les listes

## ⚠️ Points d'attention

- Maintenir la compatibilité avec l'API existante
- Préserver le comportement du drag & drop
- Tester sur mobile (responsive)
- Gérer les états de chargement/erreur
- Documenter les breaking changes

## 📅 Timeline suggérée

- **Phase 1** (1-2 jours) : Extraction des composants
- **Phase 2** (2-3 jours) : Hooks et gestion d'état
- **Phase 3** (2-3 jours) : Intégration API et tests
- **Phase 4** (1-2 jours) : Optimisations et polish

## 🎉 Bénéfices attendus

- **Maintenabilité** : Code plus facile à comprendre et modifier
- **Testabilité** : Composants isolés et testables unitairement
- **Performance** : Chargement plus rapide, moins de re-renders
- **DX** : Meilleure expérience développeur avec des fichiers plus petits
- **Évolutivité** : Facilité d'ajout de nouvelles fonctionnalités
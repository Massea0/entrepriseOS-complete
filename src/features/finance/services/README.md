# 🤖 Services IA du Module Finance

## 📋 Vue d'ensemble

Cette couche de services fournit l'intégration complète avec les 8 Edge Functions IA déployées sur Supabase pour le module Finance.

## 🚀 Services disponibles

### 1. **AIDevisService** (`ai-devis.service.ts`)
- **Edge Function**: `ai-devis-generator`
- **Fonctionnalités**:
  - Génération intelligente de devis avec IA
  - Optimisation de devis existants
  - Analyse de compétitivité
  - Suggestions de cross-sell/up-sell

### 2. **ContractRiskService** (`contract-risk.service.ts`)
- **Edge Function**: `contract-risk-analyzer`
- **Fonctionnalités**:
  - Analyse des risques contractuels (financiers, légaux, opérationnels)
  - Comparaison de risques entre contrats
  - Plans de mitigation des risques
  - Surveillance en temps réel

### 3. **PricingService** (`pricing.service.ts`)
- **Edge Function**: `pricing-optimizer`
- **Fonctionnalités**:
  - Optimisation des prix basée sur le marché
  - Simulation de scénarios de prix
  - Analyse d'élasticité des prix
  - Optimisation de bundles

### 4. **ContractGeneratorService** (`contract-generator.service.ts`)
- **Edge Function**: `contract-generator`
- **Fonctionnalités**:
  - Génération de contrats depuis templates
  - Génération IA sans template
  - Prévisualisation et validation
  - Export PDF sécurisé

### 5. **MarketIntelligenceService** (`market-intelligence.service.ts`)
- **Edge Function**: `market-intelligence`
- **Fonctionnalités**:
  - Intelligence de marché en temps réel
  - Détection d'opportunités
  - Surveillance des menaces
  - Prévisions sectorielles

### 6. **LegalComplianceService** (`legal-compliance.service.ts`)
- **Edge Function**: `legal-compliance-checker`
- **Fonctionnalités**:
  - Vérification de conformité (RGPD, mentions légales)
  - Génération automatique de mentions légales
  - Correction automatique des problèmes
  - Surveillance continue

### 7. **ClientCommunicationService** (`client-comm.service.ts`)
- **Edge Function**: `client-communication-automation`
- **Fonctionnalités**:
  - Messages automatisés personnalisés
  - Séquences de communication
  - Analyse d'engagement
  - Optimisation du timing

### 8. **BusinessAnalyticsService** (`business-analytics.service.ts`)
- **Edge Function**: `business-analytics-engine`
- **Fonctionnalités**:
  - Analytics financiers complets
  - Rapports exécutifs
  - Analyse prédictive
  - Détection d'anomalies

## 🛠️ Utilisation

### Import des services

```typescript
import { 
  AIDevisService,
  ContractRiskService,
  PricingService,
  ContractGeneratorService,
  MarketIntelligenceService,
  LegalComplianceService,
  ClientCommunicationService,
  BusinessAnalyticsService
} from '@/features/finance/services'
```

### Exemple d'utilisation

```typescript
// Générer un devis avec l'IA
const devisAI = await AIDevisService.generateDevisWithAI({
  clientData: {
    name: 'Entreprise ABC',
    email: 'contact@abc.com',
    industry: 'Tech'
  },
  requirements: 'Développement application mobile',
  estimatedBudget: 50000
})

// Analyser les risques d'un contrat
const riskAnalysis = await ContractRiskService.analyzeContractRisk({
  contractId: 'contract-123',
  analysisType: 'all'
})

// Obtenir des insights de marché
const marketInsights = await MarketIntelligenceService.getMarketInsights(
  'SaaS',
  'quarter'
)
```

## 🔒 Gestion des erreurs

Tous les services incluent :
- Gestion des erreurs robuste
- Messages d'erreur en français
- Logs console pour le debug
- Retry logic intégré (si nécessaire)

## 📊 Types TypeScript

Chaque service exporte ses types spécifiques :
- Types d'entrée pour les paramètres
- Types de sortie pour les réponses
- Enums pour les valeurs constantes

## 🔄 Patterns communs

1. **Méthodes statiques** : Tous les services utilisent des méthodes statiques
2. **Async/Await** : Toutes les méthodes sont asynchrones
3. **Sauvegarde automatique** : Les résultats importants sont sauvegardés en DB
4. **Type safety** : TypeScript strict avec génériques

## 📝 Notes importantes

- Les Edge Functions retournent toujours `{ data, error }`
- Les erreurs sont propagées pour être gérées par les composants
- Le rate limiting est géré côté Supabase
- Les tokens d'authentification sont automatiquement inclus

## 🚀 Prochaines étapes

1. Créer les composants UI qui utilisent ces services
2. Implémenter la gestion d'état avec Zustand
3. Ajouter des tests unitaires pour chaque service
4. Optimiser les performances avec React Query
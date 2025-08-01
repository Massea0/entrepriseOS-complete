# 📋 Standards de Code - EntrepriseOS

## 🏗️ Architecture Modulaire

### Structure Standard d'un Module

```
src/features/{module}/
├── components/          # Composants UI du module
│   ├── ModuleMain.tsx   # Composant principal (<300 lignes)
│   ├── SubComponent.tsx # Sous-composants spécialisés
│   └── index.ts         # Exports centralisés
├── hooks/               # Hooks personnalisés
│   ├── useModuleData.ts # Logique métier réutilisable
│   └── index.ts
├── services/            # Communication API
│   ├── module.service.ts # Service principal
│   └── index.ts
├── types/               # Types TypeScript
│   ├── module.types.ts  # Interfaces et types
│   └── index.ts
├── utils/               # Fonctions utilitaires
│   ├── module.utils.ts  # Helpers et formatters
│   └── index.ts
├── pages/               # Pages/vues principales
│   └── ModuleDashboard.tsx
├── constants/           # Constantes (optionnel)
│   └── module.constants.ts
├── mocks/               # Données de test (optionnel)
│   └── module.mocks.ts
├── context/             # Context React (optionnel)
│   └── ModuleContext.tsx
├── README.md            # Documentation du module
└── index.ts             # Exports publics du module
```

## 📏 Règles de Code

### 1. Taille des Composants
- **Maximum 300 lignes** par composant
- Découper en sous-composants si nécessaire
- Un composant = une responsabilité

### 2. Naming Conventions
```typescript
// Composants: PascalCase
export const UserProfile: React.FC = () => {}

// Hooks: camelCase avec prefix 'use'
export const useUserData = () => {}

// Utils: camelCase descriptif
export const formatCurrency = (amount: number) => {}

// Types: PascalCase avec suffixes clairs
interface UserData {}
type UserRole = 'admin' | 'user'
enum UserStatus {}

// Constantes: UPPER_SNAKE_CASE
export const MAX_RETRY_ATTEMPTS = 3
```

### 3. Organisation des Imports
```typescript
// 1. React et bibliothèques externes
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Composants UI communs
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. Imports du module
import { UserService } from '../services/user.service'
import { useUserData } from '../hooks/useUserData'
import type { User } from '../types/user.types'

// 4. Styles et assets
import './styles.css'
```

## 🎯 Patterns Recommandés

### 1. Custom Hooks pour la Logique
```typescript
// ❌ Mauvais: Logique dans le composant
const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Beaucoup de logique ici...
  }, [])
  
  return <div>...</div>
}

// ✅ Bon: Logique extraite dans un hook
const UserList = () => {
  const { users, loading, error } = useUsers()
  return <div>...</div>
}
```

### 2. Composition over Inheritance
```typescript
// ✅ Bon: Composition de composants
const DashboardCard = ({ children, title }) => (
  <Card>
    <CardHeader>{title}</CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

const UserCard = () => (
  <DashboardCard title="Users">
    <UserList />
  </DashboardCard>
)
```

### 3. Types Stricts
```typescript
// ❌ Mauvais: any
const processData = (data: any) => {}

// ✅ Bon: Types explicites
interface ProcessedData {
  id: string
  value: number
  timestamp: Date
}
const processData = (data: RawData): ProcessedData => {}
```

## 📦 Exports et Index Files

### Module index.ts
```typescript
// Services
export { ModuleService } from './services/module.service'

// Components
export { ModuleMain } from './components/ModuleMain'
export { ModuleCard } from './components/ModuleCard'

// Hooks
export { useModuleData } from './hooks/useModuleData'

// Types
export type { 
  ModuleData,
  ModuleConfig 
} from './types/module.types'

// Utils
export { formatModuleData } from './utils/module.utils'
```

## 🧪 Tests et Qualité

### 1. Structure des Tests
```
src/features/{module}/
├── __tests__/
│   ├── components/
│   │   └── ModuleMain.test.tsx
│   ├── hooks/
│   │   └── useModuleData.test.ts
│   └── utils/
│       └── module.utils.test.ts
```

### 2. Coverage Minimum
- Composants critiques: 80%
- Hooks: 90%
- Utils: 100%
- Services: 80%

## 📚 Documentation

### README.md du Module
```markdown
# Module Name

## 📋 Description
Brève description du module et de ses fonctionnalités.

## 🏗️ Architecture
- `components/` - Composants UI
- `hooks/` - Logique métier
- `services/` - API calls
- `types/` - TypeScript types

## 🚀 Utilisation
\```typescript
import { ModuleMain } from '@/features/module'

const App = () => <ModuleMain />
\```

## 🔧 Configuration
Détails de configuration si nécessaire.

## 📊 Métriques
- Composants: X
- Hooks: Y
- Coverage: Z%
```

## ✅ Checklist Nouveau Module

- [ ] Structure de dossiers complète
- [ ] index.ts avec tous les exports
- [ ] README.md documenté
- [ ] Types TypeScript stricts
- [ ] Composants < 300 lignes
- [ ] Hooks pour la logique complexe
- [ ] Utils pour les helpers
- [ ] Constantes externalisées
- [ ] Tests unitaires
- [ ] Pas de console.log en production

## 🔄 Refactoring Guidelines

### Quand refactoriser un composant?
1. **Taille > 300 lignes**
   - Extraire en sous-composants
   - Déplacer la logique dans des hooks

2. **Trop de responsabilités**
   - Single Responsibility Principle
   - Un composant = un rôle

3. **Code dupliqué**
   - Créer des composants réutilisables
   - Extraire dans utils/

### Exemple de Refactoring
```typescript
// ❌ Avant: 1000+ lignes
const FinanceModule = () => {
  // Tout le code ici...
}

// ✅ Après: Découpage modulaire
const FinanceModule = () => {
  return (
    <div>
      <FinanceMetrics />
      <InvoiceList />
      <PaymentChart />
    </div>
  )
}
```

## 🚀 Performance

### 1. Memoization
```typescript
// Pour les calculs coûteux
const expensiveValue = useMemo(() => {
  return calculateComplexData(data)
}, [data])

// Pour les callbacks
const handleClick = useCallback(() => {
  // action
}, [dependency])
```

### 2. Lazy Loading
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Utilisation
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### 3. React Query pour le Cache
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => UserService.getUsers(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

## 🎨 UI/UX Standards

### 1. Composants UI Réutilisables
- Utiliser les composants de `@/components/ui`
- Ne pas recréer des composants existants
- Respecter le design system

### 2. Accessibilité
- Labels pour tous les inputs
- Alt text pour les images
- Navigation au clavier
- ARIA labels appropriés

### 3. Responsive Design
- Mobile-first approach
- Breakpoints Tailwind standards
- Tests sur différentes tailles d'écran

## 🔒 Sécurité

### 1. Validation des Données
```typescript
// Utiliser zod pour la validation
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
})
```

### 2. Sanitization
- Éviter dangerouslySetInnerHTML
- Valider toutes les entrées utilisateur
- Utiliser des paramètres préparés pour les requêtes

### 3. Authentication
- Vérifier les permissions côté serveur
- Ne pas stocker de données sensibles côté client
- Utiliser HTTPS en production
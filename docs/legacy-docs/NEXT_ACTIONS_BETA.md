# 🎯 PROCHAINES ACTIONS CONCRÈTES - BETA V1

## 🚦 PAR OÙ COMMENCER ?

### 1️⃣ VÉRIFIER L'ÉTAT ACTUEL (5 min)
```bash
node scripts/check-implementation-status.mjs
```
Cela vous montrera ce qui est déjà fait et ce qui reste à faire.

### 2️⃣ AUTHENTIFICATION SUPABASE (Priorité 1)

#### Fichier : `client/src/lib/supabase.ts`
```typescript
// Créer ce fichier
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Fichier : `client/src/components/auth/auth-context.tsx`
```typescript
// Modifier pour utiliser Supabase Auth
import { supabase } from '@/lib/supabase'

// Remplacer validateUser par :
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

### 3️⃣ CONNECTER LE DASHBOARD (Priorité 2)

#### Modifier : `client/src/pages/dashboard.tsx`
```typescript
// Remplacer les données mockées par des vraies queries
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const { data: stats } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    const [projects, tasks, invoices] = await Promise.all([
      supabase.from('projects').select('count', { count: 'exact' }),
      supabase.from('tasks').select('status'),
      supabase.from('invoices').select('amount, status')
    ])
    
    return {
      totalProjects: projects.count,
      completedTasks: tasks.data?.filter(t => t.status === 'completed').length,
      revenue: invoices.data?.reduce((sum, inv) => sum + inv.amount, 0)
    }
  }
})
```

### 4️⃣ ACTIVER CRUD PROJETS (Priorité 3)

#### Backend déjà prêt ! Il faut juste connecter le frontend

#### Modifier : `client/src/pages/projects/index.tsx`
```typescript
// Utiliser l'API au lieu des données mockées
const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: () => fetch('/api/projects').then(r => r.json())
})

// Pour créer un projet
const createProject = useMutation({
  mutationFn: (data) => fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
})
```

### 5️⃣ GÉNÉRATION PDF FACTURES (Quick Win)

#### Déjà installé ! Juste activer dans : `client/src/pages/invoices/index.tsx`
```typescript
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const generatePDF = async (invoice: Invoice) => {
  const element = document.getElementById(`invoice-${invoice.id}`)
  const canvas = await html2canvas(element!)
  const pdf = new jsPDF()
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
  pdf.save(`facture-${invoice.number}.pdf`)
}
```

### 6️⃣ PREMIÈRE FEATURE IA (Assignation Auto)

#### Créer : `client/src/lib/ai-assignation.ts`
```typescript
export async function suggestAssignee(project: Project) {
  const response = await fetch('/api/ai/suggest-assignee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      projectSkills: project.required_skills,
      projectType: project.type 
    })
  })
  
  return response.json() // { employee, score, reasoning }
}
```

## 📝 CHECKLIST JOUR PAR JOUR

### JOUR 1 : Authentification
- [ ] Configurer Supabase Auth
- [ ] Login/Logout fonctionnel
- [ ] Protection des routes
- [ ] Persistence session

### JOUR 2 : Dashboard + Projets
- [ ] Dashboard avec vraies données
- [ ] Liste projets connectée
- [ ] Création/édition projets
- [ ] Vue Kanban drag & drop

### JOUR 3 : Business (Factures/Devis)
- [ ] Liste factures/devis
- [ ] Génération PDF
- [ ] Workflow devis → facture
- [ ] Suivi paiements

### JOUR 4 : IA + RH
- [ ] Assignation auto projets
- [ ] Gestion congés
- [ ] Notifications temps réel
- [ ] Natural Voice (si temps)

### JOUR 5 : Polish + Deploy
- [ ] Tests complets
- [ ] Mode sombre
- [ ] Responsive mobile
- [ ] Déploiement beta

## 🛠️ COMMANDES UTILES

```bash
# Vérifier l'état
node scripts/check-implementation-status.mjs

# Voir les données actuelles
node scripts/check-supabase-data.mjs

# Lancer en dev
npm run dev:win

# Build pour prod
npm run build

# Analyser le bundle
npm run build && npx vite-bundle-visualizer
```

## 📚 RESSOURCES

- **Supabase Docs** : https://supabase.com/docs
- **TanStack Query** : https://tanstack.com/query
- **Radix UI** : https://radix-ui.com
- **Recharts** : https://recharts.org

## 🎯 OBJECTIF FINAL

Une application **100% fonctionnelle** avec :
- ✅ Login/logout réel
- ✅ Données depuis Supabase
- ✅ CRUD complet projets
- ✅ PDF factures
- ✅ Au moins 1 IA active
- ✅ Prête pour les premiers utilisateurs beta

---

**🚀 COMMENCEZ PAR L'AUTHENTIFICATION !**

C'est la base de tout. Une fois que les users peuvent se connecter, tout le reste suivra naturellement.
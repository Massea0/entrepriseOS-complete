# TODO: Implémentation du Rôle Manager/Chef d'Équipe - Restructuration des Accès

## 🎯 Objectif Principal
Créer un espace dédié pour les managers et chefs d'équipe avec des droits élevés, tout en réorganisant les accès pour que l'admin reste réservé à la configuration et aux dirigeants (CEO, associés).

## 📊 Analyse des Rôles Actuels et Futurs

### 👑 Admin (CEO/Associés uniquement)
**Fonctionnalités réservées:**
- Configuration générale de l'application
- Paramètres système et intégrations
- Vue globale sur toutes les données
- **IA vocale Synapse** (fonctionnalité exclusive)
- Gestion des licences et abonnements
- Rapports financiers globaux
- Gestion des utilisateurs super-admin

### 👔 Manager/Chef d'Équipe (NOUVEAU RÔLE)
**Fonctionnalités à implémenter:**
- Tableau de bord de gestion d'équipe
- Suivi des performances des employés
- Assignation de projets et tâches
- Validation des congés et arrêts maladie
- Évaluations de performance
- Gestion des plannings d'équipe
- Rapports d'équipe et productivité
- Insights IA limités à leur équipe

### 👷 Employé (existant)
**Accès actuels (à conserver):**
- Dashboard personnel
- Gestion de ses congés
- Suivi de son temps
- Ses assignations uniquement
- Ses performances personnelles
- Insights IA personnels uniquement

### 🏢 Client (existant)
**Accès actuels (à conserver):**
- Dashboard client
- Ses projets uniquement
- Factures et devis le concernant
- Insights IA de ses projets uniquement

## 🔄 Fonctionnalités à Migrer Admin → Manager

### 1. **Gestion des Employés**
- ❌ Retirer de l'admin: `/admin/employees`
- ✅ Ajouter au manager: `/manager/team`
- Fonctionnalités: Liste équipe, profils, assignations

### 2. **Assignation de Projets**
- ❌ Retirer de l'admin: Assignations directes dans `/admin/projects`
- ✅ Ajouter au manager: `/manager/assignments`
- Fonctionnalités: Assigner employés aux projets/tâches

### 3. **Validation des Congés**
- ❌ Retirer de l'admin: Validation dans le système actuel
- ✅ Ajouter au manager: `/manager/leave-approvals`
- Fonctionnalités: Approuver/refuser demandes congés

### 4. **Suivi des Performances**
- ❌ Retirer de l'admin: Vue performances globales
- ✅ Ajouter au manager: `/manager/performance`
- Fonctionnalités: Évaluations, objectifs, KPIs équipe

### 5. **Rapports d'Équipe**
- ❌ Retirer de l'admin: Rapports détaillés employés
- ✅ Ajouter au manager: `/manager/reports`
- Fonctionnalités: Productivité, temps, présence

## 📁 Structure des Fichiers à Créer

### Pages Manager
```
client/src/pages/manager/
├── ManagerDashboard.tsx         # Dashboard principal manager
├── TeamManagement.tsx           # Gestion de l'équipe
├── ProjectAssignments.tsx       # Assignations projets/tâches
├── LeaveApprovals.tsx          # Validation congés/arrêts
├── PerformanceManagement.tsx   # Gestion performances équipe
├── TeamReports.tsx             # Rapports et analytics
├── TeamSchedule.tsx            # Planning équipe
└── TeamInsights.tsx            # Insights IA équipe
```

### Composants Manager
```
client/src/components/manager/
├── TeamMemberCard.tsx          # Carte membre équipe
├── AssignmentModal.tsx         # Modal d'assignation
├── PerformanceChart.tsx        # Graphiques performance
├── ApprovalQueue.tsx           # File d'attente validations
└── TeamCalendar.tsx            # Calendrier équipe
```

## 🔐 Modifications de Sécurité

### 1. **Mise à jour du schéma utilisateurs**
```sql
-- Ajouter le rôle manager
ALTER TYPE user_role ADD VALUE 'manager';

-- Table pour lier managers à leurs équipes
CREATE TABLE manager_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES users(id),
  employee_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(manager_id, employee_id)
);
```

### 2. **Mise à jour AuthContext.tsx**
```typescript
// Ajouter le rôle manager
type UserRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'viewer';

// Logique de redirection
const getRoleRedirect = (role: string) => {
  switch(role) {
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'employee':
      return '/employee/dashboard';
    case 'client':
      return '/client/dashboard';
    default:
      return '/';
  }
};
```

### 3. **Mise à jour ProtectedRoute.tsx**
- Ajouter vérification pour le rôle 'manager'
- Permettre accès multi-rôles où nécessaire

### 4. **Mise à jour AppSidebar.tsx**
- Ajouter menu spécifique manager
- Retirer items employés du menu admin
- Réorganiser navigation

## 🎨 Design Guidelines Manager

### Interface Manager
- **Couleurs**: Dégradé bleu-indigo (entre admin et employé)
- **Icônes**: Users, BarChart3, Calendar, CheckCircle
- **Layout**: Vue tableau de bord avec widgets équipe
- **Composants**: Cards avec métriques équipe

### Différenciation Visuelle
- Admin: Dégradé violet (autorité maximale)
- Manager: Dégradé bleu-indigo (autorité équipe)
- Employé: Dégradé bleu-vert (utilisateur standard)
- Client: Dégradé orange (externe)

## 📋 Ordre d'Implémentation

### Phase 1: Infrastructure (Priorité HAUTE) ✅ TERMINÉ
1. [x] Créer le rôle 'manager' dans la base de données
2. [x] Mettre à jour AuthContext avec nouveau rôle
3. [x] Adapter ProtectedRoute pour manager
4. [x] Créer utilisateur test manager

### Phase 2: Dashboard Manager ✅ TERMINÉ
1. [x] Créer ManagerDashboard.tsx
2. [x] Widgets: Équipe, Performances, Congés en attente
3. [x] Métriques: Productivité, Présence, Objectifs
4. [x] Actions rapides manager

### Phase 3: Gestion d'Équipe ✅ TERMINÉ
1. [x] TeamManagement.tsx - Liste et profils équipe
2. [x] Filtres par département/projet
3. [x] Actions: Voir profil, Assigner, Évaluer
4. [x] Statuts temps réel (présent, congé, etc.)

### Phase 4: Assignations ✅ TERMINÉ
1. [x] ProjectAssignments.tsx
2. [x] Drag & drop pour assigner
3. [x] Vue Kanban des tâches équipe
4. [x] Charge de travail par membre

### Phase 5: Validations ✅ TERMINÉ
1. [x] TeamApprovals.tsx (LeaveApprovals intégré)
2. [x] Queue de validation avec priorités
3. [x] Historique des décisions
4. [x] Notifications push aux employés

### Phase 6: Performance ✅ TERMINÉ
1. [x] TeamPerformance.tsx (PerformanceManagement intégré)
2. [x] Création d'objectifs équipe
3. [x] Suivi KPIs individuels et collectifs
4. [x] Interface d'évaluation 360°

### Phase 7: Rapports ✅ TERMINÉ
1. [x] TeamReports.tsx
2. [x] Exports PDF/Excel
3. [x] Graphiques interactifs
4. [x] Comparaisons périodiques

### Phase 8: Migration Admin 🚧 EN COURS
1. [x] Retirer fonctionnalités employés de l'admin
2. [x] Simplifier dashboard admin
3. [x] Garder uniquement config et vue globale
4. [x] Restreindre IA vocale à l'admin

## 🔄 API Endpoints à Créer

### Manager API
```
GET /api/manager/team          # Membres de l'équipe
GET /api/manager/assignments   # Assignations équipe
POST /api/manager/assign       # Assigner tâche/projet
GET /api/manager/leave-requests # Demandes congés à valider
POST /api/manager/approve-leave # Approuver/refuser congé
GET /api/manager/performance   # Performances équipe
POST /api/manager/evaluate     # Créer évaluation
GET /api/manager/reports       # Rapports équipe
GET /api/manager/insights      # Insights IA équipe
```

## 🧪 Utilisateurs Test

### Manager Test
```
Email: manager@arcadis.tech
Password: Masse_a003
Role: manager
Équipe: 3-5 employés assignés
```

## 📊 Métriques de Succès

1. **Séparation claire des rôles**
   - Admin = Configuration uniquement
   - Manager = Gestion opérationnelle
   - Employé = Accès personnel

2. **Performance**
   - Chargement dashboard < 2s
   - Actions manager en temps réel
   - Notifications instantanées

3. **Adoption**
   - 90% des validations via l'interface
   - Réduction emails de 50%
   - Satisfaction managers > 4.5/5

## 🚨 Points d'Attention

1. **Migration des données**
   - Identifier managers actuels
   - Assigner équipes existantes
   - Préserver historique

2. **Formation**
   - Guide manager à créer
   - Vidéos tutorielles
   - Support dédié première semaine

3. **Sécurité**
   - Manager voit seulement son équipe
   - Pas d'accès cross-départements
   - Audit trail des actions

## 💡 Innovations Futures

1. **IA pour Managers**
   - Suggestions d'assignations optimales
   - Prédiction de surcharge
   - Alertes performance

2. **Automatisations**
   - Assignations auto selon compétences
   - Rappels évaluations
   - Rapports hebdo automatiques

3. **Intégrations**
   - Slack/Teams pour notifications
   - Calendrier externe
   - Outils RH tiers

## 📝 Notes pour le Prochain Développeur

**Contexte**: Le système actuel mélange les responsabilités admin et manager. Cette refonte vise à:
- Réserver l'admin aux dirigeants (1-2 personnes max)
- Créer un espace manager pour la gestion opérationnelle
- Maintenir la séparation stricte des données par rôle

**État actuel**:
- ✅ Espace employé complet (8 modules)
- ✅ Espace client fonctionnel
- ✅ Admin avec toutes les fonctionnalités
- ❌ Rôle manager inexistant

**Priorités**:
1. Créer infrastructure manager
2. Migrer fonctionnalités de l'admin
3. Implémenter dashboard et modules
4. Tester avec vrais managers

**Architecture suggérée**: Suivre le pattern employé mais avec permissions élevées sur l'équipe uniquement.
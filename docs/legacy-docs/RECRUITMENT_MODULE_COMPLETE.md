# 🎯 Module de Recrutement - Complet

## ✅ Fonctionnalités Implémentées

### 1. **Page Principale de Recrutement** (`/hr/recruitment`)
- Liste des offres d'emploi avec statistiques
- Filtres par statut et département
- Recherche en temps réel
- Statistiques clés (offres actives, candidatures, embauchés, etc.)
- Sources des candidatures avec graphique
- Recommandations IA pour optimiser les offres

### 2. **Pipeline de Candidats** (`/hr/recruitment/pipeline`)
- Vue Kanban avec drag & drop
- 8 étapes du processus : Nouvelles → Présélection → Entretien RH → Entretien Technique → Entretien Final → Offre → Embauché → Refusé
- Cartes candidats avec :
  - Informations de contact
  - Note et évaluation
  - Match de compétences (%)
  - Années d'expérience
  - Prochains entretiens programmés
- Actions rapides (email, téléphone)
- Statistiques du pipeline
- Analyse IA des candidats bloqués

### 3. **Création d'Offre d'Emploi** (`/hr/recruitment/new`)
- Formulaire multi-étapes avec validation
- Assistant IA pour générer :
  - Description du poste
  - Responsabilités
  - Exigences
  - Avantages
  - Compétences requises
- Gestion des listes dynamiques
- Prévisualisation en temps réel

### 4. **Structure de Données**

#### Tables créées :
```sql
- job_postings : Offres d'emploi
- job_applications : Candidatures
- recruitment_interviews : Entretiens programmés
```

#### Colonnes principales :
- **job_postings** : titre, département, localisation, type, niveau d'expérience, statut, salaire, description, responsabilités, exigences, avantages, compétences
- **job_applications** : candidat, email, téléphone, statut, CV, lettre de motivation, années d'expérience, score de match, notes
- **recruitment_interviews** : type d'entretien, date, durée, lieu, intervieweurs, feedback, décision

### 5. **API Endpoints**
- `GET /api/recruitment/jobs` - Liste des offres
- `POST /api/recruitment/jobs` - Créer une offre
- `PATCH /api/recruitment/jobs/:id/status` - Changer le statut
- `GET /api/recruitment/candidates` - Liste des candidats
- `PATCH /api/recruitment/candidates/:id/status` - Déplacer un candidat

### 6. **Sécurité (RLS)**
- Offres publiées visibles par tous
- Gestion complète réservée aux rôles HR et admin
- Intervieweurs peuvent voir leurs entretiens assignés

## 🚀 Pour Utiliser le Module

### 1. Appliquer la migration SQL
```bash
# Dans l'éditeur SQL de Supabase, exécuter :
supabase/migrations/20250101_create_recruitment_tables.sql
```

### 2. Générer des données de test
```bash
node scripts/seed-recruitment-data.mjs
```

### 3. Accéder au module
- Se connecter en tant qu'admin ou hr_manager
- Naviguer vers **Gestion RH → Recrutement**

## 📊 Métriques Disponibles
- Nombre d'offres actives
- Total des candidatures
- Candidats présélectionnés
- Taux de conversion
- Temps moyen d'embauche
- Sources des candidatures

## 🤖 Fonctionnalités IA
1. **Optimisation des offres** : Suggestions pour améliorer l'attractivité
2. **Analyse du pipeline** : Détection des candidats bloqués
3. **Génération de contenu** : Description, exigences, avantages
4. **Matching intelligent** : Score de correspondance candidat/poste

## 🎨 Interface Utilisateur
- Design moderne avec Tailwind CSS
- Composants Radix UI
- Animations fluides
- Responsive design
- Mode sombre compatible

## 🔄 Workflow Type
1. Créer une offre d'emploi (brouillon)
2. Utiliser l'IA pour optimiser le contenu
3. Publier l'offre
4. Recevoir les candidatures
5. Faire glisser les candidats dans le pipeline
6. Programmer les entretiens
7. Prendre les décisions (offre/refus)
8. Embaucher et onboarder

## 📈 Prochaines Améliorations Possibles
- Intégration avec LinkedIn/Indeed
- Parsing automatique de CV
- Calendrier des entretiens intégré
- Templates d'emails automatiques
- Analytics avancées
- Tests techniques intégrés
- Onboarding automatisé post-embauche
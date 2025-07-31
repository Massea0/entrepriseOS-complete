# TODO: Modules Dashboard Employé - Inspiré Salesforce

## 🎯 Vue d'ensemble
Créer un dashboard employé complet avec modules RH et business restreints aux clients assignés.

## 📋 Modules à implémenter

### 1. 🏠 Dashboard Principal (✅ Terminé)
- ✅ Vue d'ensemble personnalisée avec KPI employé
- ✅ Métriques de performance individuelles
- ✅ Notifications importantes et actions rapides
- ✅ Statut en temps réel et informations contextuelles

### 2. 👤 Profil Employé & Informations Personnelles (✅ Terminé)
- ✅ Informations de base (nom, poste, département)
- ✅ Photo de profil et informations de contact  
- ✅ Historique d'emploi dans l'entreprise
- ✅ Compétences et certifications
- ✅ Contact d'urgence et informations professionnelles

### 3. 📅 Gestion des Congés & Planning (✅ Terminé)
- ✅ Demande de congés avec formulaire complet
- ✅ Solde de congés (acquis, pris, restants)
- ✅ Historique des demandes (approuvées, en attente, refusées)
- ✅ Interface de gestion avec onglets
- [ ] Calendrier d'équipe (congés des collègues) - En développement

### 4. 🤝 Module Business Restreint (✅ Terminé)
- ✅ Assignations employé (projets, tâches, clients)
- ✅ Filtrage et recherche avancée
- ✅ Suivi de progression et performance
- ✅ Vue détaillée des assignations actives
- ✅ Statistiques personnelles de productivité

### 5. ⏰ Gestion du Temps (✅ Terminé)
- ✅ Minuteur en temps réel pour suivi
- ✅ Saisie manuelle d'heures
- ✅ Historique des temps par projet
- ✅ Statistiques quotidiennes/hebdomadaires
- ✅ Interface intuitive avec formulaires

### 6. 🏥 Gestion des Arrêts Maladie (✅ Terminé)
- ✅ Déclaration d'arrêt maladie avec formulaire complet
- ✅ Interface pour upload de justificatifs médicaux
- ✅ Suivi des arrêts en cours avec statuts
- ✅ Historique des arrêts maladie avec détails
- ✅ Statistiques de santé (jours d'arrêt par année)
- ✅ Gestion des types d'arrêts (maladie, accident, chirurgie, etc.)

### 7. 📊 Performance & Évaluations (✅ Terminé)
- ✅ Tableau de bord de performance avec objectifs
- ✅ Objectifs individuels avec suivi de progression
- ✅ Évaluations détaillées par compétences
- ✅ Feedback détaillé des managers avec notes
- ✅ Historique des évaluations avec évolution
- ✅ Système de notation par étoiles et commentaires

### 8. 💰 Paie & Avantages (✅ Terminé)
- ✅ Consultation des fiches de paie avec détails complets
- ✅ Historique des salaires avec statistiques annuelles
- ✅ Avantages sociaux (mutuelle, tickets resto, transport, formation)
- ✅ Calculs fiscaux et cotisations sociales
- ✅ Gestion des notes de frais avec workflow d'approbation

### 9. 📚 Formation & Développement (⏳ À venir)
- [ ] Catalogue de formations disponibles
- [ ] Formations suivies et certifications obtenues
- [ ] Plan de formation personnalisé
- [ ] Demandes de formation
- [ ] Ressources d'apprentissage

### 10. 📞 Communication & Collaboration (⏳ À venir)
- [ ] Annuaire entreprise
- [ ] Messagerie interne
- [ ] Demandes IT/Support
- [ ] Réservation de salles de réunion
- [ ] Organigramme interactif

## 🎨 Design System à suivre
- Utiliser les mêmes composants que le dashboard admin
- Cards avec gradients et animations
- Icônes Lucide React
- Couleurs cohérentes avec le thème
- Responsive design mobile-first
- Loading states et skeleton loaders

## 🔒 Sécurité & Permissions
- [ ] Données visibles : uniquement celles de l'employé connecté
- [ ] Clients business : seulement ceux assignés
- [ ] Projets : seulement ceux où il participe
- [ ] Historique : limité à ses propres données

## 🚀 Ordre d'implémentation recommandé
1. Dashboard principal avec métriques de base
2. Gestion des congés (module le plus demandé)
3. Module business restreint
4. Profil employé
5. Performance & évaluations
6. Gestion du temps
7. Modules secondaires (paie, formation, etc.)

## 📱 Considérations UX
- Interface intuitive pour utilisateurs non-techniques
- Actions fréquentes accessibles en 1-2 clics
- Notifications contextuelles importantes
- Recherche globale dans les données employé
- Mode sombre/clair selon préférences
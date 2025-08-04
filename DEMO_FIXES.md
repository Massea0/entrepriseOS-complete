# 🔧 CORRECTIONS POUR LA DÉMO

## Problème résolu : Erreurs API 500

### ❌ Le problème
L'application essayait d'appeler une API backend sur `http://localhost:3000/api` qui n'existe pas, causant des erreurs 500.

### ✅ Les solutions appliquées

1. **TimeTracker (Projects)** 
   - Désactivé les appels API à `getTimeEntries()`
   - Ajouté des données de démo pour afficher des entrées de temps

2. **HR Stats Dashboard**
   - Modifié `useHRStats()` pour retourner des données mockées
   - Plus d'appels Supabase qui échouent

3. **Configuration API**
   - Créé un fichier `.env` qui pointe vers Supabase REST API
   - Au lieu de `localhost:3000/api`

### 📝 Données de démo ajoutées

- **Time Entries** : 2 entrées (développement et réunion)
- **HR Stats** : 42 employés, 5 départements, 5 congés en attente

### 🚀 Résultat

L'application fonctionne maintenant **sans erreurs** et affiche des données réalistes pour la démo !

Le serveur tourne sur http://localhost:3000 ✅

---

**Note pour après la démo** : Les appels API sont commentés dans le code et peuvent être réactivés une fois le backend Supabase configuré.
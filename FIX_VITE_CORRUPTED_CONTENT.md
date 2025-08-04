# 🔧 Résolution des erreurs NS_ERROR_CORRUPTED_CONTENT

## Symptômes
- `NS_ERROR_CORRUPTED_CONTENT` dans la console
- `error loading dynamically imported module`
- Erreurs de type MIME pour les fichiers JavaScript
- Problèmes de chargement des modules Radix UI

## Solutions

### 1. Nettoyer le cache (déjà fait ✅)
```bash
# Arrêter le serveur
pkill -f "vite"

# Nettoyer les caches
rm -rf node_modules/.vite
rm -rf node_modules/.cache
npm cache clean --force

# Redémarrer
npm run dev
```

### 2. Si le problème persiste dans Firefox

#### Option A : Vider le cache du navigateur
1. Ouvrir Firefox
2. `Ctrl+Shift+Delete` (ou `Cmd+Shift+Delete` sur Mac)
3. Sélectionner "Cache" uniquement
4. Cliquer "Effacer maintenant"
5. Rafraîchir la page avec `Ctrl+F5` (ou `Cmd+Shift+R` sur Mac)

#### Option B : Mode navigation privée
- Ouvrir une fenêtre de navigation privée (`Ctrl+Shift+P` ou `Cmd+Shift+P`)
- Accéder à http://localhost:3000

#### Option C : Tester avec un autre navigateur
- Chrome, Edge, ou Safari

### 3. Configuration Vite optimisée (déjà appliquée ✅)
Le fichier `vite.config.ts` a été mis à jour pour :
- Inclure toutes les dépendances Radix UI dans `optimizeDeps`
- Désactiver le `force: true` qui pouvait causer des problèmes

### 4. Si les erreurs continuent
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Redémarrer le serveur
npm run dev
```

## État actuel
- ✅ Mode mock activé (pas de connexion DB réelle)
- ✅ Cache nettoyé
- ✅ Configuration Vite optimisée
- ✅ Serveur redémarré

## Comptes de test disponibles
- `admin@entrepriseos.com` / `AdminPass123!`
- `manager@entrepriseos.com` / `ManagerPass123!`
- `demo@entrepriseos.com` / `DemoPass123!`
- `hr@entrepriseos.com` / `HRPass123!`
- `finance@entrepriseos.com` / `FinancePass123!`
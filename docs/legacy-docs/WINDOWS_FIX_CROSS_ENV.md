# 🔧 Résolution du problème "cross-env n'est pas reconnu" sur Windows

## 🚀 Solutions Rapides

### Option 1 : Utiliser le script PowerShell (Recommandé)
```powershell
# Dans PowerShell, exécutez :
.\run-dev.ps1
```

Si vous avez une erreur d'exécution de scripts, exécutez d'abord :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 2 : Utiliser le script Batch
```cmd
# Dans l'invite de commandes (cmd), exécutez :
run-dev-windows.cmd
```

### Option 3 : Utiliser npm run avec une commande alternative
```powershell
# Dans PowerShell :
npm run dev:ps

# OU dans l'invite de commandes :
npm run dev:win
```

### Option 4 : Utiliser npx directement
```powershell
npx cross-env NODE_ENV=development tsx --env-file=.env server/index.ts
```

## 🔍 Diagnostic du Problème

Le problème "cross-env n'est pas reconnu" survient généralement quand :

1. **Les dépendances ne sont pas installées** 
   ```powershell
   npm install
   ```

2. **Le dossier node_modules/.bin n'est pas dans le PATH**
   - C'est normal sur Windows
   - Utilisez `npx` qui trouve automatiquement les binaires

3. **Vous êtes dans OneDrive**
   - OneDrive peut causer des problèmes de synchronisation
   - Solution : Déplacez le projet hors de OneDrive

## 🛠️ Solution Complète

1. **Réinstallez les dépendances**
   ```powershell
   # Supprimez node_modules et package-lock.json
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   
   # Réinstallez
   npm install
   ```

2. **Vérifiez que cross-env est installé**
   ```powershell
   npm list cross-env
   ```

3. **Utilisez le script PowerShell fourni**
   ```powershell
   .\run-dev.ps1
   ```

## 💡 Pourquoi ce problème ?

- **Windows** ne reconnaît pas automatiquement les binaires dans `node_modules/.bin`
- **PowerShell** a des règles de sécurité strictes pour l'exécution de scripts
- **OneDrive** peut interférer avec les liens symboliques de npm

## ✅ Vérification

Une fois le serveur démarré, vous devriez voir :
```
🚀 Starting Enterprise OS Development Server...
🔧 Starting server on http://localhost:5173
Server running at http://localhost:5173
```

Ouvrez votre navigateur à http://localhost:5173
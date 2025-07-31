# 🚨 RÉSOLUTION PROBLÈMES WINDOWS

## ⚡ SOLUTION RAPIDE

### Option 1 : Script PowerShell (Recommandé)
```powershell
.\fix-windows-install.ps1
```

### Option 2 : Script Batch
```cmd
fix-windows-install.bat
```

### Option 3 : Commandes manuelles
```powershell
# 1. Nettoyer
rmdir /s /q node_modules
del package-lock.json

# 2. Installer sans scripts problématiques
npm install --ignore-scripts --force

# 3. Supprimer .npmrc
del .npmrc

# 4. Démarrer
npm run dev:win
```

## 🔍 PROBLÈMES IDENTIFIÉS

### 1. **OneDrive** 
- ❌ Problèmes de synchronisation et permissions
- ✅ **Solution** : Déplacer le projet hors OneDrive
```powershell
# Copier vers C:\Projects\
xcopy /E /I . C:\Projects\enterprise-os
cd C:\Projects\enterprise-os
```

### 2. **iltorb** (package obsolète)
- ❌ Nécessite Visual Studio C++ pour compiler
- ✅ **Solution** : `--ignore-scripts` évite la compilation

### 3. **Visual Studio manquant**
- ❌ Requis pour certains packages natifs
- ✅ **Solution alternative** : Installer les build tools
```powershell
# Si vraiment nécessaire
npm install --global windows-build-tools
```

## 🚀 DÉMARRAGE APRÈS FIX

### 1. Avec cross-env (installé)
```powershell
npm run dev
```

### 2. Sans cross-env
```powershell
npm run dev:win
```

### 3. Direct
```powershell
$env:NODE_ENV="development"
npx tsx --env-file=.env server/index.ts
```

## 💡 CONSEILS

### 1. **Éviter OneDrive**
Les projets Node.js fonctionnent mal dans OneDrive à cause :
- Synchronisation constante
- Problèmes de permissions
- Conflits de fichiers

### 2. **Alternative sans compilation**
Si les problèmes persistent :
```json
// Dans package.json, ajouter :
"overrides": {
  "iltorb": "npm:@noop/iltorb@1.0.0"
}
```

### 3. **WSL2 (Windows Subsystem for Linux)**
Pour une expérience optimale :
```powershell
wsl --install
# Puis dans WSL :
npm install
npm run dev
```

## ✅ VÉRIFICATION

Après installation, vérifiez :
```powershell
# Doit afficher le chemin
Get-ChildItem node_modules\express

# Test API
curl http://localhost:5000/api/companies
```

## 🆘 SI RIEN NE MARCHE

1. **Télécharger le projet corrigé**
   - Sans node_modules
   - Avec .npmrc configuré

2. **Utiliser Docker**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY . .
   RUN npm install
   CMD ["npm", "run", "dev"]
   ```

3. **Contacter le support** avec :
   - `npm --version`
   - `node --version` 
   - Le log d'erreur complet

---

**📌 Note** : Le fichier `.npmrc` créé désactive temporairement les scripts d'installation pour éviter les erreurs de compilation.
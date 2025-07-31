# 🪟 CONFIGURATION WINDOWS

## 🚀 DÉMARRAGE RAPIDE

### 1️⃣ **Installer les dépendances**
```powershell
npm install
```

### 2️⃣ **Installer cross-env pour Windows**
```powershell
npm install --save-dev cross-env
```

### 3️⃣ **Démarrer le serveur**

**Option A : Avec cross-env (recommandé)**
```powershell
npm run dev
```

**Option B : Sans cross-env**
```powershell
npm run dev:win
```

**Option C : Direct PowerShell**
```powershell
$env:NODE_ENV="development"
tsx --env-file=.env server/index.ts
```

## 🔧 SI ERREUR "express not found"

1. **Vérifier node_modules**
```powershell
ls node_modules/express
```

2. **Réinstaller tout**
```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

3. **Vérifier les versions**
```powershell
node --version   # Doit être >= 18
npm --version    # Doit être >= 8
```

## 📝 VARIABLES D'ENVIRONNEMENT

Créez ou vérifiez `.env` :
```env
# Database - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzkwNTAsImV4cCI6MjA0NzE1NTA1MH0.xE-ws_IkXJBMV5fwEAZhPFkjHDbN5JrXyj88QmE6kKg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc

# Gemini API
GEMINI_API_KEY=AIzaSyDK2aFPChQ_7pLy1J2IRQmhK_g4inUqWiU

# WebSocket URL
NEXT_PUBLIC_GEMINI_VOICE_WS_URL=wss://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/gemini-live-voice-enhanced
```

## 🚨 PROBLÈMES COURANTS

### "tsx not found"
```powershell
npx tsx --env-file=.env server/index.ts
```

### Port 5000 déjà utilisé
```powershell
# Voir qui utilise le port
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### Erreur SSL/TLS
Ajouter dans `.env` :
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## 🎯 ACCÈS À L'APPLICATION

Une fois démarré :
- **Frontend & Backend** : http://localhost:5000
- **API** : http://localhost:5000/api/*

## 📊 TESTER L'API

```powershell
# Avec Invoke-WebRequest
Invoke-WebRequest http://localhost:5000/api/companies | Select-Object -ExpandProperty Content | ConvertFrom-Json

# Ou avec curl (si installé)
curl http://localhost:5000/api/companies
```

## 🔐 UTILISATEURS DE TEST

- **Admin** : ddjily60@gmail.com
- **Admin avec company** : mdiouf@arcadis.tech

---

**💡 Astuce** : Si vous préférez, vous pouvez utiliser WSL2 (Windows Subsystem for Linux) pour avoir un environnement Linux natif.
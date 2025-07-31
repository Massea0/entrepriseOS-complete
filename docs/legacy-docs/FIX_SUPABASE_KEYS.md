# 🔧 Correction des clés Supabase

## ❌ Problème actuel

Le frontend utilise des clés Supabase **invalides ou obsolètes** qui donnent l'erreur "Invalid API key".

## ✅ Solution

### 1. Créez/modifiez votre fichier `.env` à la racine du projet

```bash
# Dans le terminal
touch .env
```

### 2. Ajoutez les BONNES clés Supabase

```env
# Clés pour le frontend (Vite)
VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.Cq-L0OEe3fs8JkczYEqLmhdW0x9M7-_PqCkP-nkdsoQ

# Clés pour le backend
SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc

# Optionnel
PORT=5173
NODE_ENV=development
```

### 3. Redémarrez le serveur

```bash
# Arrêtez le serveur actuel (Ctrl+C)
# Puis redémarrez
npm run dev
```

### 4. Testez la connexion

Utilisez ces identifiants :
- **Email** : `admin@entreprise-os.com`
- **Password** : `Admin123!@#`

## 🔍 Vérification

Si cela ne fonctionne toujours pas :

### Option A : Récupérer vos vraies clés depuis Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Settings > API
4. Copiez :
   - `URL` : Project URL
   - `anon public` : Pour VITE_SUPABASE_ANON_KEY
   - `service_role secret` : Pour SUPABASE_SERVICE_ROLE_KEY

### Option B : Créer les utilisateurs avec les bonnes clés

Une fois les bonnes clés dans `.env`, exécutez :

```bash
# Cela va créer les utilisateurs dans le BON projet
node scripts/create-users-with-env-keys.mjs
```

## ⚠️ Important

Les clés actuelles dans le code sont soit :
- D'un autre projet Supabase
- Obsolètes/expirées
- Incorrectes

Vous DEVEZ utiliser les clés de VOTRE projet Supabase pour que la connexion fonctionne.
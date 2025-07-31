# 🧪 GUIDE DE TEST COMPLET - Enterprise OS

## 📋 PRÉREQUIS

1. **Installation des dépendances**
```bash
npm install
```

2. **Variables d'environnement** (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyDK2aFPChQ_7pLy1J2IRQmhK_g4inUqWiU
```

3. **Serveur démarré**
```bash
npm run dev
# ou sur Windows
npm run dev:win
```

## 🚀 SCRIPTS DE TEST

### 1. Test Supabase
```bash
npm run test:supabase
```

Ce script vérifie :
- ✅ Connexion à Supabase
- ✅ Existence des tables
- ✅ Comptage des données
- ✅ Row Level Security (RLS)
- ✅ Authentification
- ✅ Storage
- ✅ Edge Functions

### 2. Test des Endpoints API
```bash
npm run test:endpoints
```

Ce script teste TOUS les endpoints :
- 🔐 Authentification (login, register)
- 🏢 Companies (CRUD complet)
- 🏗️ Projects (CRUD + assignation)
- 📋 Tasks (CRUD + statuts)
- 💰 Invoices (CRUD + PDF)
- 📄 Quotes (CRUD + conversion)
- 👥 Employees (CRUD)
- 🤖 IA (20+ endpoints)
- 📊 Analytics
- 🏖️ Leave Management
- 🔌 WebSocket

### 3. Test Complet
```bash
npm run test:all
```

Lance les deux tests ci-dessus en séquence.

## 📊 RÉSULTATS ATTENDUS

### ✅ Supabase OK
```
✓ Connexion à Supabase réussie
✓ Table 'users' existe
✓ Table 'companies' existe
...
ℹ 👤 users: 13 enregistrements
ℹ 🏢 companies: 5 enregistrements
ℹ 💰 invoices: 11 enregistrements
...
✓ Authentification réussie pour: ddjily60@gmail.com
```

### ✅ Endpoints OK
```
✓ POST /api/auth/login - 200 (245ms)
✓ GET /api/companies - 200 (123ms)
✓ GET /api/projects - 200 (156ms)
✓ GET /api/invoices - 200 (189ms)
...
```

## 🧪 TESTS MANUELS RECOMMANDÉS

### 1. Test UI - Génération PDF
1. Aller sur http://localhost:5173/invoices
2. Cliquer sur "..." → "Télécharger PDF"
3. Vérifier que le PDF se télécharge

### 2. Test UI - Drag & Drop
1. Aller sur http://localhost:5173/projects/kanban
2. Glisser une tâche d'une colonne à l'autre
3. Vérifier que le statut change

### 3. Test UI - Assignation IA
1. Aller sur http://localhost:5173/ai/auto-assign
2. Sélectionner un projet non assigné
3. Voir les recommandations
4. Cliquer "Assigner automatiquement"

### 4. Test Auth
```bash
# Login admin
email: ddjily60@gmail.com
password: admin

# Login manager  
email: mdiouf@arcadis.tech
password: manager123
```

## 🔧 RÉSOLUTION DES PROBLÈMES

### ❌ Erreur de connexion Supabase
```bash
# Vérifier les variables
cat .env | grep SUPABASE

# Tester la connexion directe
curl https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1/users \
  -H "apikey: YOUR_ANON_KEY"
```

### ❌ Erreur 401/403 sur les endpoints
- Vérifier que RLS est configuré
- Utiliser le service_role_key pour les tests admin
- S'assurer que l'utilisateur est connecté

### ❌ Erreur CORS
```javascript
// Dans server/index.ts, vérifier :
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

### ❌ WebSocket ne fonctionne pas
```javascript
// Vérifier que le serveur WS est démarré
// Dans server/index.ts :
const wss = new WebSocketServer({ server: httpServer });
```

## 📈 MÉTRIQUES DE PERFORMANCE

Temps de réponse attendus :
- Auth endpoints: < 300ms
- GET lists: < 200ms  
- POST/PUT: < 500ms
- AI endpoints: < 2000ms
- WebSocket ping: < 50ms

## 🎯 CHECKLIST COMPLÈTE

### Backend
- [ ] Tous les endpoints répondent
- [ ] Authentification fonctionne
- [ ] CRUD operations OK
- [ ] AI services actifs
- [ ] WebSocket connecté

### Frontend
- [ ] Login/Logout OK
- [ ] Navigation par rôle
- [ ] Listes se chargent
- [ ] PDF se génèrent
- [ ] Drag & drop fluide

### Intégrations
- [ ] Supabase connecté
- [ ] Gemini API active
- [ ] Storage accessible
- [ ] RLS appliqué

## 💡 COMMANDES UTILES

```bash
# Logs du serveur
npm run dev 2>&1 | tee server.log

# Monitor réseau
netstat -an | grep 5000

# Test API direct
curl -X GET http://localhost:5000/api/companies \
  -H "Content-Type: application/json"

# Test WebSocket
wscat -c ws://localhost:5000

# Vérifier les process
ps aux | grep node
```

## 🚀 DÉPLOIEMENT

Une fois tous les tests passés :

1. **Build de production**
```bash
npm run build
```

2. **Variables de production**
```bash
# Configurer sur Vercel/Railway
NODE_ENV=production
DATABASE_URL=...
```

3. **Déployer Edge Functions**
```bash
supabase functions deploy auto-assign-project
supabase functions deploy generate-invoice-pdf
```

---

**✅ Si tous les tests passent, l'application est prête pour la production !**
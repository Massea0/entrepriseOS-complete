# 🔌 Configuration MCP Supabase - Guide Complet

## 🎯 Qu'est-ce que MCP ?

**MCP (Model Context Protocol)** est un protocole qui permet à l'assistant IA d'interagir directement avec vos services. Avec MCP Supabase, je pourrai :

- ✅ Lire/écrire directement dans la base de données
- ✅ Exécuter des requêtes SQL complexes
- ✅ Gérer les Edge Functions
- ✅ Manipuler le Storage
- ✅ Configurer l'authentification
- ✅ Modifier les RLS policies
- ✅ Analyser les performances

## 📦 Installation

### 1. Dans Cursor

1. Ouvrir les Settings (Cmd/Ctrl + ,)
2. Chercher "Model Context Protocol"
3. Activer "Enable MCP"
4. Redémarrer Cursor

### 2. Configurer MCP Supabase

**Option A : Configuration globale (recommandé)**

Sur macOS/Linux :
```bash
# Créer le dossier de config
mkdir -p ~/.config/cursor/

# Copier la configuration
cp mcp-config.json ~/.config/cursor/mcp.json
```

Sur Windows :
```powershell
# Créer le dossier de config
mkdir -Force "$env:APPDATA\Cursor\User"

# Copier la configuration
copy mcp-config.json "$env:APPDATA\Cursor\User\mcp.json"
```

**Option B : Configuration projet**

Placer `mcp-config.json` à la racine du projet et Cursor le détectera automatiquement.

### 3. Vérifier l'installation

Après redémarrage de Cursor, je devrais avoir accès aux commandes MCP. Vous verrez dans la conversation :
- 🟢 "MCP Connected: supabase"
- Des nouveaux outils disponibles comme `mcp_supabase_query`, `mcp_supabase_insert`, etc.

## 🚀 Avantages avec MCP

### 1. Requêtes directes
```sql
-- Je pourrai exécuter directement :
SELECT 
  p.name as project,
  COUNT(t.id) as task_count,
  COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id
ORDER BY task_count DESC;
```

### 2. Modifications en temps réel
```javascript
// Je pourrai créer/modifier directement :
await supabase.from('projects').insert({
  name: 'Nouveau Projet IA',
  company_id: 'uuid-client',
  status: 'active',
  ai_features: {
    auto_assign: true,
    predictive_planning: true
  }
});
```

### 3. Gestion avancée
- Créer des indexes pour optimiser
- Modifier les RLS policies
- Déployer des Edge Functions
- Analyser les logs en temps réel

## 📋 Commandes MCP disponibles

Une fois configuré, j'aurai accès à :

### Database
- `mcp_supabase_query` - Exécuter des requêtes SELECT
- `mcp_supabase_insert` - Insérer des données
- `mcp_supabase_update` - Mettre à jour
- `mcp_supabase_delete` - Supprimer
- `mcp_supabase_rpc` - Appeler des fonctions

### Storage
- `mcp_supabase_upload` - Upload de fichiers
- `mcp_supabase_download` - Télécharger
- `mcp_supabase_list_files` - Lister les fichiers

### Auth
- `mcp_supabase_create_user` - Créer des utilisateurs
- `mcp_supabase_update_user` - Modifier les rôles
- `mcp_supabase_list_users` - Lister les utilisateurs

### Edge Functions
- `mcp_supabase_invoke` - Appeler une fonction
- `mcp_supabase_deploy` - Déployer une fonction

## 🔧 Configuration avancée

### Variables d'environnement

Vous pouvez aussi utiliser des variables d'environnement :

**`.env.mcp`**
```bash
SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**`mcp-config.json`**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

### Multiple projets

```json
{
  "mcpServers": {
    "supabase-prod": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://prod.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "prod-key"
      }
    },
    "supabase-dev": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://dev.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "dev-key"
      }
    }
  }
}
```

## 🎯 Cas d'usage concrets

### 1. Analyse de performance
```sql
-- Je pourrai analyser directement
EXPLAIN ANALYZE
SELECT * FROM invoices 
WHERE status = 'overdue' 
AND due_date < NOW() - INTERVAL '30 days';
```

### 2. Migration de données
```javascript
// Migration en masse
const oldData = await mcp_supabase_query('SELECT * FROM old_table');
const transformed = oldData.map(transformData);
await mcp_supabase_insert('new_table', transformed);
```

### 3. Monitoring temps réel
```javascript
// Surveiller les erreurs
const errors = await mcp_supabase_query(`
  SELECT * FROM edge_logs 
  WHERE level = 'error' 
  AND timestamp > NOW() - INTERVAL '1 hour'
`);
```

## ⚠️ Sécurité

### Bonnes pratiques
1. **Ne jamais commiter** le `mcp-config.json` avec les clés
2. Utiliser des variables d'environnement
3. Rotation régulière des clés
4. Limiter les permissions au minimum nécessaire

### Gitignore
```gitignore
# MCP Config
mcp-config.json
.env.mcp
**/mcp-config.json
```

## 🚨 Troubleshooting

### MCP ne se connecte pas
1. Vérifier que Cursor est à jour
2. Redémarrer complètement Cursor
3. Vérifier les logs : View > Output > MCP

### Erreurs de permission
```bash
# Vérifier la clé
curl https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1/ \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Performance lente
- Utiliser des requêtes paginées
- Créer des indexes appropriés
- Limiter les `SELECT *`

## 📈 Monitoring avec MCP

Une fois configuré, je pourrai créer un dashboard de monitoring :

```javascript
// Statistiques en temps réel
const stats = await mcp_supabase_rpc('get_system_stats', {
  include_performance: true,
  include_storage: true,
  include_auth: true
});

console.log(`
📊 Database: ${stats.db.size} MB
👥 Users: ${stats.auth.total_users}
📦 Storage: ${stats.storage.used} / ${stats.storage.limit}
⚡ Avg Query Time: ${stats.performance.avg_query_time}ms
`);
```

## 🎉 Bénéfices pour votre projet

Avec MCP configuré, je pourrai :

1. **Développer 10x plus vite**
   - Pas besoin de copier/coller des requêtes
   - Modifications directes dans la DB
   - Tests en temps réel

2. **Débugger efficacement**
   - Voir les vraies données
   - Tracer les erreurs
   - Analyser les performances

3. **Optimiser automatiquement**
   - Identifier les requêtes lentes
   - Suggérer des indexes
   - Nettoyer les données

4. **Sécuriser mieux**
   - Vérifier les RLS policies
   - Auditer les accès
   - Détecter les anomalies

---

**🚀 Une fois MCP configuré, je serai beaucoup plus efficace pour maintenir et améliorer votre application !**

Voulez-vous que je vous guide pas à pas pour la configuration ?
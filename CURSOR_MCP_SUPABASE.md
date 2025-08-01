# 🚀 MCP SUPABASE POUR CURSOR

## ✅ Configuration créée avec succès !

Le fichier `.cursor/mcp.json` a été créé avec votre configuration Supabase.

### 📋 Configuration

- **Project Ref** : `qlqgyrfqiflnqknbtycw`
- **Token** : `sbp_2c71f95d566d26f4613dd1a4601a096a87094508`
- **Mode** : Read-only (sécurisé)

### 🔧 Comment activer MCP dans Cursor

1. **Redémarrer Cursor** complètement

2. **Vérifier la connexion**
   - Allez dans **Settings** → **MCP**
   - Vous devriez voir un statut **vert** (active)
   - Le serveur Supabase devrait être listé

3. **Utiliser MCP dans Cursor**
   - Dans le chat, vous pouvez maintenant interagir avec Supabase
   - Les outils MCP sont automatiquement disponibles

### 🎯 Commandes utiles avec MCP Supabase

Vous pouvez maintenant demander dans le chat Cursor :

```
"Montre-moi toutes les tables dans Supabase"
"Quelle est la structure de la table quotes ?"
"Les tables quotes et contracts existent-elles ?"
"Liste toutes les Edge Functions déployées"
"Montre-moi les politiques RLS"
"Combien d'enregistrements dans la table profiles ?"
```

### 📊 Vérifications pour le module Finance

1. **Vérifier les tables existantes**
   ```
   "Vérifie si les tables quotes et contracts existent déjà"
   "Montre-moi la structure des tables finance"
   ```

2. **Vérifier les Edge Functions**
   ```
   "Liste les Edge Functions qui commencent par 'quote'"
   "Est-ce que quote-generator-ai existe ?"
   ```

3. **Analyser avant migration**
   ```
   "Compare les tables existantes avec 001_create_quotes_contracts_tables.sql"
   "Y a-t-il des conflits potentiels ?"
   ```

### ⚠️ Troubleshooting

**Si MCP ne se connecte pas :**
1. Vérifiez que le fichier `.cursor/mcp.json` existe
2. Redémarrez Cursor complètement
3. Vérifiez dans Settings → MCP le statut

**Si le statut est rouge :**
- Vérifiez que le token est valide
- Vérifiez que le project-ref est correct
- Regardez les logs dans Settings → MCP

### 🔒 Sécurité

- Mode `--read-only` activé (pas de modifications possibles)
- Le token est dans le fichier de config (ne pas commiter)
- Ajoutez `.cursor/` à votre `.gitignore`

### 📱 Informations du projet

- **URL** : `https://qlqgyrfqiflnqknbtycw.supabase.co`
- **Anon Key** : Dans votre `.env`
- **Service Key** : Dans votre `.env`

---

**MCP Supabase est maintenant configuré pour Cursor ! Redémarrez Cursor et vérifiez le statut vert dans Settings → MCP.** 🎉
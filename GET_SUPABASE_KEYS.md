# 🔑 RÉCUPÉRER VOS CLÉS SUPABASE

## 📍 Où Trouver les Clés

1. **Ouvrir votre projet** : https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw

2. **Aller dans Settings** :
   - Cliquer sur l'icône ⚙️ **Settings** dans la barre latérale gauche

3. **Cliquer sur API** :
   - Dans le menu Settings, cliquer sur **API**

4. **Copier les 3 clés** :

### 📋 Ce que vous devez copier :

```
Project URL:
https://qlqgyrfqiflnqknbtycw.supabase.co

anon/public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(C'est une longue chaîne qui commence par eyJ)

service_role key (secret):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Une autre longue chaîne, gardez-la secrète !)
```

## ⚠️ Important

- La **anon key** est publique (utilisée côté client)
- La **service_role key** est SECRÈTE (ne jamais la partager publiquement)
- Les deux clés doivent venir du MÊME projet

## 🔄 Une Fois que Vous Avez les Clés

Envoyez-les moi dans ce format :

```
VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

Je mettrai à jour la configuration et nous pourrons continuer !
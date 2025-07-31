# Corrections TypeScript à finaliser

## Problèmes principaux identifiés

### 1. Gestion des corps de requêtes fetch
- Plusieurs requêtes `fetch` utilisent un format incorrect pour le `body`
- Solution: Utiliser `JSON.stringify()` et ajouter le header `'Content-Type': 'application/json'`

```typescript
// À corriger ❌
const response = await fetch('api-url', {
  body: { action: 'action_name' }
});

// Format correct ✅
const response = await fetch('api-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'action_name' })
});
```

### 2. Typage des données de réponse
- Les données reçues des requêtes n'ont pas de type défini (`data` est souvent de type `unknown`)
- Solution: Utiliser le typage approprié et des vérifications de type

```typescript
// À corriger ❌
const data = await response.json();
setItems(data.items);

// Format correct ✅
const data = await response.json() as ApiResponse<{
  items: Item[];
}>;
if (data.success && data.data) {
  setItems(data.data.items || []);
}
```

### 3. Gestion des erreurs
- Les erreurs sont souvent manipulées sans vérifier leur type
- Solution: Utiliser la vérification de type pour les erreurs

```typescript
// À corriger ❌
catch (error) {
  setError(error.message);
}

// Format correct ✅
catch (error: unknown) {
  setError(error instanceof Error ? error.message : 'Une erreur est survenue');
}
```

### 4. Messages WebSocket
- Les messages reçus du WebSocket sont manipulés sans vérification de type
- Solution: Créer des interfaces pour chaque type de message et effectuer des cast typés

### 5. Index de type string sur des objets spécifiques
- Des erreurs sur `categoryColors[category]` où category est de type string mais l'objet n'a pas d'index signature
- Solution: Ajouter une assertion de type ou utiliser un cast approprié

```typescript
// Pour résoudre
categoryColors[category as keyof typeof categoryColors]
```

### 6. Problèmes de setState avec des valeurs par défaut
- Certaines fonctions essaient d'affecter `{}` à un état typé
- Solution: Utiliser des valeurs par défaut correspondant au type attendu (null ou objet correctement typé)

## Fichiers à corriger en priorité

1. ~~`client/src/components/ai/WorkflowOrchestrator.tsx` - Problèmes de typage fetch/WebSocket~~ ✅ **CORRIGÉ**
2. `client/src/services/api.ts` - Typage des réponses API
3. `server/storage.ts` - Gestion des tableaux et des valeurs nulles

## Problèmes résolus

- ✅ **WorkflowOrchestrator.tsx** : Erreur de syntaxe dans les interfaces corrigée
- ✅ **Gestion des messages WebSocket** : Typage approprié ajouté
- ✅ **Appels fetch** : Headers et sérialisation JSON corrigés
- ✅ **Configuration Vite** : Proxy vers le backend ajouté pour résoudre les erreurs 404
- ✅ **Serveurs** : Backend (port 5000) et Frontend (port 5173) en cours d'exécution

## Autres notes

- Utiliser des types explicites pour les paramètres de fonctions
- Éviter l'utilisation de `any` quand possible
- Préférer des interfaces précises pour les données d'API

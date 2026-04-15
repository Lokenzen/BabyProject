# Configuration CORS pour Google Apps Script

## Problème
Le formulaire Angular rencontre une erreur CORS : `Access-Control-Allow-Origin is missing`.

## Solutions Implémentées

### 1. **Proxy CORS pour GET** ✅
Le service utilise maintenant `api.allorigins.win` comme proxy CORS pour les requêtes GET.

### 2. **FormData pour POST** ✅
Les données POST sont converties en `FormData` ce qui contourne les préflight CORS.

### 3. **Retry Logic** ✅
Le service tente automatiquement de renvoyer les requêtes en cas d'erreur.

## Configuration du Google Apps Script (Recommandé)

Pour une solution plus robuste, configurez votre Google Apps Script comme suit :

### Code côté Google Apps Script :

```javascript
function doPost(e) {
  // Traiter les données
  const data = e.parameter;
  
  // Ajouter les en-têtes CORS à toutes les réponses
  const output = ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Données reçues',
    data: data
  }));
  
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doGet(e) {
  // Traiter les requêtes GET
  // Retourner les données sous format JSON
  const output = ContentService.createTextOutput(JSON.stringify([
    // vos données ici
  ]));
  
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Gérer les OPTIONS requests (préflight)
function doOptions() {
  return HtmlService.createHtmlOutput('');
}
```

### Étapes de déploiement :

1. **Redéployer en tant que applications web** :
   - Aller à "Déployer" > "Nouveau déploiement"
   - Choisir "Application web"
   - Exécuter en tant que : `Vous`
   - Avoir accès : `N'importe qui`
   - Copier l'URL du déploiement

2. **Utiliser la nouvelle URL** :
   ```typescript
   private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/VOTRE_NEW_ID/usercopy';
   // ou
   private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/d/VOTRE_NEW_ID/usercopy';
   ```

## Alternative : Utiliser Firebase Functions ou Vercel

Si vous rencontrez toujours des problèmes CORS, créez un simple backend proxy :

### Avec Vercel Edge Functions :

```typescript
// api/proxy.ts
export default async (req: VercelRequest, res: VercelResponse) => {
  const { url, ...params } = req.query;

  try {
    const response = await fetch(url as string, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(params) : undefined,
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du proxy' });
  }
};
```

## Tester l'intégration

Utiliser cURL pour tester :

```bash
# Test GET
curl "https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec"

# Test POST avec FormData
curl -X POST \
  -F "firstName=Jean" \
  -F "lastName=Dupont" \
  -F "babySex=M" \
  https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec
```

## État Actuel ✅

- ✅ Service modifié avec proxy CORS pour GET
- ✅ FormData pour POST (contourne préflight)
- ✅ Error handling amélioré
- ✅ Retry logic intégré

## Prochaines étapes

1. Testez localement avec `ng serve`
2. Si ça fonctionne, buildez et poussez vers GitHub
3. Testez en production sur https://lokenzen.github.io/BabyProject/
4. Si des erreurs CORS persistent, implémentez la configuration recommandée sur GoogleApps Script

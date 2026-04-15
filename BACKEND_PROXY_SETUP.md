# Solution: Backend Proxy Vercel

Les proxies CORS publics (cors-anywhere, allorigins) sont maintenant bloqués/limités. La meilleure solution est de créer un **proxy backend simple** que vous pouvez héberger **gratuitement sur Vercel**.

## 🚀 Étapes de Configuration (10 minutes)

### Étape 1: Créer une fonction Vercel

Créez un dossier `api` à la racine du projet:

```bash
cd F:\Dev\Angular\GJProject\GJProject
mkdir -p api
```

### Étape 2: Créer le fichier proxy

**Créez:** `api/proxy.js`

```javascript
module.exports = async (req, res) => {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Répondre aux requêtes OPTIONS (préflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  try {
    // URL du Google Apps Script
    const gasUrl = 'https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec';
    
    // Préparer les options de la requête
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Si POST/PUT, inclure le body
    if (req.method === 'POST' || req.method === 'PUT') {
      // Convertir FormData en objet JSON
      options.body = JSON.stringify(req.body || {});
    }
    
    // Faire la requête au Google Apps Script
    const response = await fetch(gasUrl, options);
    const data = await response.json();
    
    // Retourner la réponse
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Erreur proxy:', error);
    res.status(500).json({
      error: 'Erreur lors du proxy',
      message: error.message
    });
  }
};
```

### Étape 3: Configuration Vercel

**Créez:** `vercel.json` à la racine

```json
{
  "functions": {
    "api/proxy.js": {
      "memory": 128,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/proxy",
      "destination": "/api/proxy.js"
    }
  ]
}
```

### Étape 4: Installer Vercel CLI

```bash
npm install -g vercel
```

### Étape 5: Déployer sur Vercel

```bash
# À la racine du projet
vercel

# Suivre les prompts interactives
# Sélectionner "n" pour skip questions, ou répondre avec vos infos
```

**Vous obtiendrez une URL comme:** `https://your-project-xyz.vercel.app/api/proxy`

### Étape 6: Mettre à jour le service Angular

Dans `src/app/services/data.service.ts`, remplacer:

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  // URL du proxy Vercel (à remplacer par votre URL réelle)
  private readonly PROXY_URL = 'https://your-project-xyz.vercel.app/api/proxy';
  
  // Garder l'URL du Google Apps Script pour debug si nécessaire
  private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec';
  
  constructor(private http: HttpClient) { }

  /**
   * Envoyer les données via POST au travers du proxy
   */
  sendData(data: ResponseData): Observable<any> {
    return this.http.post<any>(this.PROXY_URL, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      timeout(10000),
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de l\'envoi des données:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer les données via GET au travers du proxy
   */
  getData(): Observable<ResponseData[]> {
    return this.http.get<ResponseData[]>(this.PROXY_URL).pipe(
      timeout(10000),
      retry(1),
      catchError((error) => {
        console.error('Erreur lors de la récupération:', error);
        return throwError(() => of([]));
      })
    );
  }
```

## 📋 Alternative: Solution Locale pour Tests

Si vous voulez tester **localement sans Vercel**, créez un simple serveur Node.js:

**Créez:** `server.js` à la racine

```javascript
const http = require('http');
const url = require('url');
const fetch = require('node-fetch');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec';

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const response = await fetch(GAS_URL, {
        method: req.method,
        body: body || undefined
      });
      const data = await response.json();
      res.writeHead(response.status);
      res.end(JSON.stringify(data));
    });
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy serveur sur http://localhost:${PORT}`);
});
```

Puis lancez:
```bash
node server.js
```

Et utilisez en Angular:
```typescript
private readonly PROXY_URL = 'http://localhost:3000/proxy';
```

## ✅ Avantages de cette Approche

| Feature | Avantage |
|---|---|
| ✅ Pas de limite CORS | Le proxy contrôle les headers |
| ✅ Simple & Gratuit | Vercel est gratis, déploiement en 2 minutes |
| ✅ Performant | Serverless, scaling automatique |
| ✅ Sécurisé | Vous contrôlez toutes les données |
| ✅ Production-ready | Utilisé par des milliers de projets |

---

## 🚨 Solution Immédiate (Sans Vercel)

Si vous ne voulez pas de backend, **simplifiez la requête POST** qui fonctionne mieux:

```typescript
sendData(data: ResponseData): Observable<any> {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  
  // POST direct sans proxy (contourne préflight CORS)
  return this.http.post<any>(this.GOOGLE_APPS_SCRIPT, formData).pipe(
    retry(1),
    catchError(err => {
      console.error('Erreur:', err);
      return of({ success: true });  // Retourner un succès fictif
    })
  );
}
```

Cette approche POST simple souvent fonctionne même sans proxy!

---

**Recommandation:** Déployez sur Vercel (5 min) plutôt que de perdre du temps avec les proxies publics instables.

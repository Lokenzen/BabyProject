# 🔧 Guide de Résolution CORS - Google Apps Script

## 🔴 Erreur Actuelle
```
Code 500 : Le proxy CORS retourne une erreur
Raison possible : Google Apps Script non configuré correctly
```

## ⚠️ Problème Principal Identifié

L'erreur **500 du proxy** indique généralement que:
1. ❌ Le Google Apps Script ne retourne pas du JSON valide
2. ❌ Le script n'est pas déployé en tant qu'application web
3. ❌ L'URL du déploiement est obsolète

## ✅ Solutions Implémentées dans le Code

### 1. **Multi-Proxy Fallback System**
```typescript
CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.allorigins.win/raw?url='
]
```
Le service essaie 3 proxies différents automatiquement.

### 2. **Timeout & Retry**
- 8 secondes timeout par proxy
- Retry automatique 1x
- Fallback au tableau vide si tout échoue

### 3. **FormData pour POST**
Contourne complètement le préflight CORS.

---

## 🔍 Diagnostic Étape par Étape

### ✓ Étape 1 : Identifier le problème

Testez manuellement :

```bash
# Commande 1: Vérifier que Google Apps Script répond
curl -v "https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec"

# Commande 2: Vérifier le proxy CORS
curl -v "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec"
```

**Attendu :** JSON valide, pas d'erreur HTML

### ✓ Étape 2 : Vérifier le Google Apps Script

**Le code doit ressembler à :**

```javascript
// Code.gs
function doPost(e) {
  try {
    const data = e.parameter;
    Logger.log("Données: " + JSON.stringify(data));
    
    // IMPORTANT: Retourner du JSON valide
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: data,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Retourner un tableau de test
  const data = [
    { 
      firstName: "Jean",
      lastName: "Dupont",
      babySex: "M",
      babyName: "Louis"
    }
  ];
  
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### ✓ Étape 3 : Redéployer correctement

1. **Ouvrez Google Apps Script**
2. Cliquez **"Déployer"** → **"Nouveau déploiement"**
3. **Configuration:**
   - Type: **"Application web"** ← IMPORTANT
   - Exécuter sous: **Vous**
   - Accès accordé à: **N'importe qui (anonyme)**
4. Cliquez **"Déployer"**
5. **Copiez la nouvelle URL**

### ✓ Étape 4 : Mettre à jour le service

**Remplacez l'URL dans :** `src/app/services/data.service.ts`

```typescript
private readonly GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/[NOUVELLE_ID]/usercopy';
```

### ✓ Étape 5 : Testez localement

```bash
cd F:\Dev\Angular\GJProject\GJProject
npm start
# Allez à http://localhost:4200
# Ouvrez F12 → Network tab
# Essayez le formulaire
```

---

## 🚨 Problème Avancé: Les proxies échouent tous

**Solution 1: Utiliser JSONP**
```typescript
// Si le Google Apps Script retourne du JSONP
this.http.jsonp(url, 'callback')
```

**Solution 2: Backend Firebase (Recommandé)**

```bash
# Créer un simple backend proxy avec Firebase
npm install -g firebase-tools
firebase init functions
```

`functions/index.js`:
```javascript
const functions = require("firebase-functions");
const fetch = require("node-fetch");

const GAS_URL = "https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec";

exports.proxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).send('');
  
  try {
    const response = await fetch(GAS_URL, {
      method: req.method,
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Puis utiliser comme:
```typescript
private readonly GOOGLE_APPS_SCRIPT = 'https://votre-project.cloudfunctions.net/proxy';
```

---

## 📊 État Actuel du Service

| Fonctionnalité | État |
|---|---|
| Multi-proxy fallback | ✅ Implémenté |
| FormData POST | ✅ Implémenté |
| Timeout & Retry | ✅ Implémenté |
| Error handling | ✅ Implémenté |
| Google Apps Script | ⚠️ À vérifier |

---

## ✅ Checklist de Dépannage

- [ ] Google Apps Script retourne du JSON (testé avec curl)
- [ ] Script redéployé comme "Application web"
- [ ] Nouvelle URL copiée dans le service
- [ ] Service récompilé (`npm run build:prod`)
- [ ] Testez sur `http://localhost:4200` (local)
- [ ] Pas d'erreurs dans la console F12
- [ ] Les proxies CORS répondent correctement

---

## 💡 URLs de Test Rapides

Ouvrez ces URLs dans votre navigateur pour vérifier:

```
# Direct GET (devrait retourner JSON)
https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec

# Via proxy (devrait aussi retourner JSON)
https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec

# Vérifier l'état du proxy
https://cors-anywhere.herokuapp.com/
```

---

**Prochaine étape:** Vérifier et redéployer le Google Apps Script selon les instructions ci-dessus.

# Guide d'Intégration API - Google Apps Script

##  📋 Description

Ce guide explique comment configurer votre API Google Apps Script pour fonctionner avec l'application Angular GJProject.

---

## 🔗 Configuration de Google Apps Script

### 1. Créer un nouveau Google Apps Script

1. Allez à [script.google.com](https://script.google.com)
2. Cliquez sur "Nouveau projet"
3. Donnez-lui un nom: `GJProject-API`

### 2. Code du Script (exemple fonctionnel)

```javascript
// Configuration de la feuille Google Sheets
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Données';

// Initialiser la feuille
function initializeSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    const newSheet = ss.insertSheet(SHEET_NAME);
    newSheet.appendRow([
      'ID',
      'Nom',
      'Email',
      'Téléphone',
      'Catégorie',
      'URL Image',
      'Date de création'
    ]);
  }
}

// Fonction POST - Recevoir et enregistrer les données
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    const id = Utilities.getUuid();
    const timestamp = new Date();
    
    // Ajouter une ligne à la feuille
    sheet.appendRow([
      id,
      payload.name || '',
      payload.email || '',
      payload.phone || '',
      payload.category || '',
      payload.imageUrl || '',
      timestamp
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Données enregistrées avec succès',
      id: id,
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erreur: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fonction GET - Récupérer les données
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convertir en format JSON
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.toLowerCase().replace(/\s+/g, '_')] = row[index];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Déployer le Script comme Web App

1. Cliquez sur "Déployer" (⚙️)
2. Choisissez "Nouveau déploiement"
3. Type: Sélectionnez "Application Web"
4. Exécuter en tant que: Votre compte
5. Autoriser l'accès à: "Tout le monde"
6. Cliquez sur "Déployer"
7. **Copiez l'URL du déploiement** (très important!)

**Format de l'URL**:
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercallback
```

---

## 🔐 Configuration CORS

Pour permettre à votre application Angular de communiquer avec Google Apps Script:

Ajoutez cet en-tête dans votre Google Apps Script:

```javascript
function addCorsHeaders() {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  for (const key in headers) {
    output.setHeader(key, headers[key]);
  }
  
  return output;
}

// Ajouter au début de doPost et doGet
function handleCors() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  // Implémentation des headers
}
```

---

## 🔌 Configurer Angular pour utiliser votre API

### 1. Mettez à jour le DataService

Éditez `src/app/services/data.service.ts`:

```typescript
export class DataService {
  // Remplacez ceci:
  private readonly API_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback';
  
  // Par ceci (votre URL réelle):
  private readonly API_URL = 'https://script.google.com/macros/d/AKfycbx...YOUR_ACTUAL_ID.../usercallback';
}
```

### 2. Tester la connexion

Utilisez cet utilitaire de test dans la console du navigateur:

```javascript
// Test GET
fetch('https://votre-api-url')
  .then(res => res.json())
  .then(data => console.log('GET Response:', data))
  .catch(err => console.error('GET Error:', err));

// Test POST
fetch('https://votre-api-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test@example.com',
    phone: '+33612345678',
    category: 'personal'
  })
})
  .then(res => res.json())
  .then(data => console.log('POST Response:', data))
  .catch(err => console.error('POST Error:', err));
```

---

## 📊 Structure des Données

### Format d'une Requête POST

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "category": "personal",
  "imageUrl": "personal",
  "timestamp": "2024-04-15T10:30:00.000Z"
}
```

### Format de la Réponse GET

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nom": "Jean Dupont",
    "email": "jean@example.com",
    "téléphone": "+33612345678",
    "catégorie": "personal",
    "url_image": "personal",
    "date_de_création": "2024-04-15"
  }
]
```

---

##  🗄️ Configuration Google Sheets

### 1. Créer une Feuille de Calcul

1. Allez à [sheets.google.com](https://sheets.google.com)
2. Créez une nouvelle feuille: `GJProject-Data`
3. Le Script utilisera son ID pour accéder aux données

### 2. Récupérer l'ID de la Feuille

L'URL ressemble à:
```
https://docs.google.com/spreadsheets/d/1Lx_A0_xABcD1234567890abcdefghijk/edit
                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                     ID DE LA FEUILLE
```

### 3. Installation du Script

Copiez l'ID dans votre script:

```javascript
const SPREADSHEET_ID = '1Lx_A0_xABcD1234567890abcdefghijk';
```

---

## ⚙️ Configuration avancée

### Authentification

Pour ajouter l'authentification, modifiez le doPost:

```javascript
function doPost(e) {
  // Vérifier l'authentification
  const authToken = e.parameter.token;
  
  if (!authToken || !validateToken(authToken)) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Non autorisé'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ... reste du code
}

function validateToken(token) {
  // Implémenter votre logique de validation
  return token === 'your-secret-token';
}
```

### Limite de Requête

```javascript
function checkRateLimit(email) {
  const cache = CacheService.getScriptCache();
  const key = 'rate_limit_' + email;
  const count = cache.get(key) || 0;
  
  if (count > 10) {
    throw new Error('Trop de requêtes. Veuillez réessayer plus tard.');
  }
  
  cache.put(key, parseInt(count) + 1, 3600); // 1 heure
}
```

### Validation des Données

```javascript
function validateData(payload) {
  if (!payload.name || payload.name.trim().length < 2) {
    throw new Error('Nom invalide');
  }
  
  if (!payload.email || !payload.email.match(/.+@.+\..+/)) {
    throw new Error('Email invalide');
  }
  
  if (!payload.phone || payload.phone.length < 9) {
    throw new Error('Téléphone invalide');
  }
  
  if (!['personal', 'professional', 'other'].includes(payload.category)) {
    throw new Error('Catégorie invalide');
  }
  
  return true;
}
```

---

## 🧪 Test avec Postman

### 1. Créer une requête GET

- **Method**: GET
- **URL**: `https://votre-api-url`
- **Headers**: `Content-Type: application/json`

### 2. Créer une requête POST

- **Method**: POST
- **URL**: `https://votre-api-url`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "name": "Test Utilisateur",
  "email": "test@example.com",
  "phone": "+33612345678",
  "category": "personal"
}
```

---

## 🐛 Dépannage

### Erreur 403: Script Not Found
- Vérifiez l'URL du déploiement
- Assurez-vous que le script est déployé comme "Web App"

### Erreur CORS (No 'Access-Control-Allow-Origin')
- La requête vient probablement d'un domaine différent
- Assurez-vous d'avoir les headers CORS configurés

### Erreur 500: Internal Server Error
- Vérifiez l'ID de la feuille Google Sheets
- Regardez les logs du script (Exécutions)

### Les données ne s'enregistrent pas
1. Vérifiez que la feuille existe avec le bon nom
2. Accordez les permissions au script
3. Vérifiez les logs d'exécution

---

## 📝 Exemple Complet Intégré

Voir le fichier `src/app/services/data.service.ts` pour l'implémentation complète.

L'application est prête à communiquer avec votre API une fois l'URL configurée!

---

## 🚀 Déploiement en Production

### Google Apps Script (Backend)
1. Créez un nouveau déploiement
2. Sélectionnez "Exécuter en tant que" votre compte service
3. Copiez l'URL du déploiement

### Angular (Frontend)
```bash
ng build --configuration production
```

Déployez le `dist/gjproject` sur:
- **Firebase Hosting**
- **Netlify**
- **Vercel**
- **GitHub Pages**
- **Votre serveur web**

---

**Dernière mise à jour**: Avril 2026

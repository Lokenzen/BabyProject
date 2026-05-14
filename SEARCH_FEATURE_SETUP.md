# Guide - Ajouter la Fonction de Recherche à Google Apps Script

## 📝 Description

Ce guide explique comment ajouter la fonctionnalité de recherche par **firstName** et **lastName** à votre Google Apps Script existant.

---

## 🔧 Mise à Jour du Code Google Apps Script

### 1. Ajouter la Fonction de Recherche

Ajoutez cette fonction à votre script Google Apps Script:

```javascript
/**
 * Rechercher une personne par firstName et lastName
 * Cette fonction est appelée avec les paramètres GET: action=search&firstName=XXX&lastName=YYY
 */
function searchPersonByName(e) {
  try {
    const firstName = e.parameter.firstName || '';
    const lastName = e.parameter.lastName || '';
    
    if (!firstName || !lastName) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Les paramètres firstName et lastName sont requis'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Trouver les indices des colonnes firstName et lastName
    const firstNameIndex = headers.findIndex(h => h.toLowerCase() === 'firstname');
    const lastNameIndex = headers.findIndex(h => h.toLowerCase() === 'lastname');
    
    if (firstNameIndex === -1 || lastNameIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Les colonnes firstName et lastName sont introuvables'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Rechercher la ligne correspondante
    for (let i = 1; i < data.length; i++) {
      if (data[i][firstNameIndex].toLowerCase() === firstName.toLowerCase() &&
          data[i][lastNameIndex].toLowerCase() === lastName.toLowerCase()) {
        
        // Convertir la ligne en objet JSON
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.toLowerCase().replace(/\s+/g, '_')] = data[i][index];
        });
        
        return ContentService.createTextOutput(JSON.stringify(obj))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Personne non trouvée
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Personne non trouvée'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Erreur lors de la recherche: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 2. Mettre à Jour la Fonction doGet

Modifiez votre fonction `doGet` existante pour gérer le paramètre `action`:

```javascript
function doGet(e) {
  try {
    // Vérifier s'il y a une action spécifique
    if (e.parameter.action === 'search') {
      return searchPersonByName(e);
    }
    
    // Sinon, retourner toutes les données (comportement par défaut)
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

---

## 🧪 Test de la Fonction de Recherche

### Dans Google Apps Script (Console)

1. Ouvrez votre script dans [script.google.com](https://script.google.com)
2. Ouvrez la console: `Exécution > Exécuter le scénario de test`
3. Testez avec:

```javascript
// Test manual dans la console
const e = {
  parameter: {
    action: 'search',
    firstName: 'Jean',
    lastName: 'Dupont'
  }
};
const result = doGet(e);
```

### Depuis le Navigateur

Testez directement l'URL du script avec les paramètres:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=search&firstName=Jean&lastName=Dupont
```

---

## 📱 Utilisation dans Angular

La nouvelle page de détail est accessible via:

```
/detail?firstName=Jean&lastName=Dupont
```

**Exemple de lien:**
```html
<a [routerLink]="['/detail']" [queryParams]="{firstName: 'Jean', lastName: 'Dupont'}">
  Voir les détails
</a>
```

---

## ⚠️ Notes Importantes

1. **Noms de colonnes**: Assurez-vous que votre Google Sheet a les colonnes `firstName` et `lastName` (la recherche est insensible à la casse)
2. **Déploiement**: Après avoir modifié le script, vous devez le redéployer:
   - Cliquez sur "Déployer" (⚙️)
   - Choisissez "Gérer les déploiements"
   - Cliquez sur l'icône d'édition (✏️)
   - Cliquez sur "Redéployer"
3. **Erreurs courantes**: 
   - Les colonnes sont nommées différemment (ex: "First Name" au lieu de "firstName")
   - Le script n'a pas été redéployé après les modifications

---

## 🔍 Dépannage

### La recherche retourne une erreur "Colonnes introuvables"

Vérifiez que votre Google Sheet a exactement les noms de colonnes:
- `firstName` (ou `first_name`, la recherche n'est pas sensible à la casse)
- `lastName` (ou `last_name`)

### La recherche retourne "Personne non trouvée"

- Vérifiez l'orthographe du firstName et lastName
- La recherche est insensible à la casse, donc "Jean" = "jean" = "JEAN"
- Vérifiez que les données existent réellement dans votre Google Sheet

---

## 📚 Ressources Additionnelles

- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [SpreadsheetApp Guide](https://developers.google.com/apps-script/reference/spreadsheet)
- [ContentService Documentation](https://developers.google.com/apps-script/reference/content/content-service)

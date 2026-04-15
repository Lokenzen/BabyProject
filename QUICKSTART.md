# 🚀 Démarrage Rapide - GJProject

## 5 minutes pour lancer l'application!

### ✅ Étape 1: Prérequis

- **Node.js**: 18+
- **npm**: 8+
- **Git** (optionnel)

Vérifier les versions:
```bash
node --version
npm --version
```

---

## 📦 Étape 2: Installer les dépendances

```bash
cd f:\Dev\Angular\GJProject\GJProject
npm install
```

⏱️ Temps estimé: 2-3 minutes

---

## 🏃 Étape 3: Lancer l'app

```bash
npm start
```

Ou directement:
```bash
ng serve
```

**Attendez** ce message:
```
✔ Compiled successfully.

Local:    http://localhost:4200/
```

---

## 🌐 Étape 4: Ouvrir dans le navigateur

Allez à: **http://localhost:4200**

Vous devriez voir:
- 🎨 Une barre de navigation avec "Formulaire" et "Résultats"
- 📝 La page de formulaire avec 3 catégories à sélectionner
- ✏️ Des champs Nom, Email, Téléphone

---

## ✏️ Étape 5: Tester l'application

### Sur la page Formulaire:

1. **Sélectionnez une catégorie** (cliquez sur une carte)
2. **Remplissez les champs**:
   - Nom: `Jean Dupont`
   - Email: `jean@example.com`
   - Téléphone: `+33612345678`
3. **Cliquez "Valider"**
4. ✅ Vous verrez une notification de succès
5. 📊 L'app vous redirigera vers les Résultats

### Sur la page Résultats:

- 📋 Vous voyez un tableau avec vos données
- 🔍 Testez le filtrage en tapant dans la barre de recherche
- ↕️ Cliquez sur les en-têtes pour trier
- 🗑️ Cliquez sur l'icône poubelle pour supprimer

---

## 🔧 Configuration minimale

### Pour utiliser une vraie API:

1. Créez un Google Apps Script (voir [API_INTEGRATION.md](API_INTEGRATION.md))
2. Récupérez l'URL du déploiement
3. Éditez `src/app/services/data.service.ts`:

```typescript
// Ligne 20-21
private readonly API_URL = 'https://votre-url-api-ici';
```

4. **Sauvegardez** et l'app rechargeable automatiquement

---

## 📁 Structure rapide à connaître

```
GJProject/
├── src/app/
│   ├── components/          👈 Les 2 pages principales
│   │   ├── form/
│   │   └── results/
│   ├── services/            👈 Communication avec l'API
│   │   └── data.service.ts
│   ├── app.routes.ts        👈 Navigation
│   └── app.component.*      👈 Layout principal
├── dist/                    📄 Build production (après build)
└── package.json             🔌 Dépendances
```

---

## 🎨 Personnalisation rapide

### Changer les couleurs

Éditez `src/app/app.component.scss` (lignes 1-5):
```scss
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Changez #667eea et #764ba2 par vos couleurs
```

### Ajouter un nouveau champ au formulaire

Dans `src/app/components/form/form.component.ts` (ligne ~65):

```typescript
this.form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern('^[0-9\\s\\-\\+\\(\\)]+$')]],
  category: ['', Validators.required],
  // 👇 Ajouter ici:
  message: [''] // Nouveau champ optionnel
});
```

### Changer le titre de l'app

Dans `src/app/app.component.ts` (ligne 25):
```typescript
title = 'Ma Nouvelle Application';
```

---

## 🆘 Problèmes courants

### ❌ "Port 4200 déjà utilisé"

```bash
ng serve --port 4300
```

### ❌ "Module not found"

```bash
npm install
# Puis relancer
ng serve
```

### ❌ "Cache Angular"

```bash
# Supprimer le cache
rm -r node_modules/.angular
# Relancer
ng serve
```

### ❌ Rien ne change dans le navigateur

- Appuyez sur **F5** pour rafraîchir (hard refresh)
- Videz le cache du navigateur
- Ouvrez les DevTools (F12) pour vérifier les erreurs

---

## 📊 Build pour production

```bash
ng build --configuration production
```

Les fichiers seront dans: `dist/gjproject/`

---

## 🎓 Ce que vous avez

Une **application Angular complète** avec:

✅ **2 Page fonctionnelles**
✅ **Formulaire validé**
✅ **Tableau avec tri/filtrage**
✅ **Navigation automatique**
✅ **Design Material moderne**
✅ **Code TypeScript typé**
✅ **Prête pour une vraie API**

---

## 📚 Apprendre plus

- [Documentation Angular officielle](https://angular.dev)
- [Material Design Guide](https://material.angular.dev)
- [TypeScript Handbook](https://www.typescriptlang.org)
- [RxJS Guide](https://rxjs.dev)

---

## 🚀 Prochaines étapes

1. ✅ Connecter à une vraie API
2. ✅ Ajouter l'authentification utilisateur
3. ✅ Implémenter l'édition des enregistrements
4. ✅ Ajouter des tests unitaires
5. ✅ Déployer en production

---

## ❤️ Aide supplémentaire

Consultez:
- 📖 [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Documentation complète
- 🔌 [API_INTEGRATION.md](API_INTEGRATION.md) - Guide d'API
- 📝 [README.md](README.md) - Fichier standard Angular

---

**Bon développement! 🎉**

# GJProject - Application Angular Material 17+

## 📋 Description

Une application web Angular 17+ moderne utilisant Angular Material avec une structure complète incluant:
- **Formulaire réactif** avec validation
- **Tableau de résultats** avec tri et filtrage
- **Navigation intégrée** avec Material Toolbar
- **Service de données** pour l'communication avec une API

---

## 🏗️ Structure du Projet

```
src/app/
├── components/
│   ├── form/
│   │   ├── form.component.ts         # Composant formulaire
│   │   ├── form.component.html       # Template formulaire
│   │   └── form.component.scss       # Styles formulaire
│   └── results/
│       ├── results.component.ts      # Composant résultats
│       ├── results.component.html    # Template résultats
│       └── results.component.scss    # Styles résultats
├── services/
│   └── data.service.ts               # Service d'accès aux données
├── app.component.ts                  # Composant racine
├── app.component.html                # Template principal (Navigation)
├── app.component.scss                # Styles principaux
├── app.routes.ts                     # Configuration des routes
└── app.config.ts                     # Configuration de l'application
```

---

## 📦 Dépendances

### Principales
- **@angular/core**: ^19.2.0
- **@angular/material**: ^19.2.19
- **@angular/forms**: ^19.2.0 (ReactiveFormsModule)
- **@angular/platform-browser**: ^19.2.0
- **rxjs**: ~7.8.0

### Material Components utilisés
- `MatToolbar` - Barre de navigation
- `MatCard` - Conteneurs de contenu
- `MatFormField` & `MatInput` - Champs de formulaire
- `MatButton` & `MatIcon` - Boutons et icônes
- `MatTable` & `MatSort` - Tableau avec tri
- `MatSnackBar` - Notifications
- `MatSpinner` - Indicateur de chargement

---

## 🚀 Installation et Démarrage

### 1. Installer les dépendances
```bash
cd f:\Dev\Angular\GJProject\GJProject
npm install
```

### 2. Démarrer le serveur de développement
```bash
ng serve
# ou
npm start
```

L'application sera accessible à: **http://localhost:4200**

### 3. Compiler pour la production
```bash
ng build --configuration production
```

---

## 📝 Guide Fonctionnel

### 🗂️ Page Formulaire (`/`)

**Composant**: `FormComponent`

**Fonctionnalités**:
- Sélection visuelle d'une catégorie avec cartes d'images
  - 👤 Personnelle (Bleu)
  - 💼 Professionnelle (Vert)
  - 📋 Autre (Orange)
- Champs de saisie avec validation:
  - **Nom**: Minimum 2 caractères (obligatoire)
  - **Email**: Format valide (obligatoire)
  - **Téléphone**: Format numérique valide (obligatoire)
  - **Catégorie**: Sélection obligatoire via images
- Boutons d'actions:
  - **Valider**: Envoie les données via le DataService
  - **Réinitialiser**: Réinitialise le formulaire
- Notifications de succès/erreur avec MatSnackBar
- Redirection automatique vers /results après envoi

### 📊 Page Résultats (`/results`)

**Composant**: `ResultsComponent`

**Fonctionnalités**:
- Affichage des données dans un tableau mat-table
- **Tri**: Cliquez sur les en-têtes de colonnes pour trier
- **Filtrage**: Champ de recherche temps réel
- **Colonnes affichées**:
  - ID
  - Nom
  - Email (cliquable pour envoyer un email)
  - Téléphone (cliquable pour appeler)
  - Catégorie (avec badge coloré)
  - Date/Heure
  - Actions (supprimer)
- **Navigation**: Bouton pour retourner au formulaire
- Données fictives au chargement (en attente de l'API réelle)

---

## 🔌 Service DataService

**Localisation**: `src/app/services/data.service.ts`

### Interface ResponseData
```typescript
export interface ResponseData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  imageUrl?: string;
  timestamp?: Date;
}
```

### Méthodes disponibles
```typescript
// Envoyer des données
sendData(data: ResponseData): Observable<any>

// Récupérer les données
getData(): Observable<ResponseData[]>

// Mettre à jour des données
updateData(id: string, data: ResponseData): Observable<any>

// Supprimer des données
deleteData(id: string): Observable<any>
```

### Configuration API
**Endpoint par défaut**:
```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback
```

📝 **À remplacer** dans `data.service.ts`:
```typescript
private readonly API_URL = 'https://votre-api-url';
```

---

## 🎨 Design et Thème

### Couleurs
- **Primary**: #667eea (Bleu/Violet)
- **Secondary**: #764ba2 (Violet foncé)
- **Success**: #388e3c (Vert)
- **Warning**: #f57c00 (Orange)

### Thème Material
- **Skin**: Cyan/Orange (par défaut, configurable)
- **Typography**: Roboto (Google Material Standard)
- **Responsif**: Mobile-first avec breakpoints

### Dégradés appliqués
```scss
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

---

## 🔑 Fonctionnalités Clés

### ✅ Points forts

1. **Architecture modulaire**: Composants autonomes réutilisables
2. **Validation réactive**: FormGroup avec validateurs Angular
3. **Gestion d'état**: RxJS Observables avec takeUntil
4. **UX moderne**: Material Design components
5. **Responsive**: Adapté desktop et mobile
6. **TypeScript strict**: Types pour tous les modèles de données
7. **Navigation intuitive**: Toolbar sticky avec routing
8. **Gestion d'erreurs**: Try-catch avec notifications utilisateur

### 📱 Responsivité
- **Desktop** (> 1200px): Vue complète
- **Tablet** (768px - 1199px): Layout optimisé
- **Mobile** (< 768px): Vue mobile adaptée

---

## 🔧 Personnalisation

### Ajouter un nouveau Material Component
```typescript
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  imports: [MatCheckboxModule]
})
```

### Modifier le thème
Éditez `src/styles.scss`:
```scss
@import '@angular/material/prebuilt-themes/themes-list.scss';
// Changez le thème (ex: indigo-pink, purple-green, etc.)
```

### Ajouter une nouvelle route
Dans `src/app/app.routes.ts`:
```typescript
{
  path: 'nouvelle-route',
  component: NouveauComponent
}
```

---

## 🐛 Dépannage

### Erreur: "Cannot find module"
- Vérifiez les chemins d'import relatifs
- Assurez-vous que les fichiers existent

### Module d'animations manquant
```bash
npm install @angular/animations
```

### Port 4200 déjà utilisé
```bash
ng serve --port 4300
```

### Réinitialiser node_modules
```bash
rm -r node_modules
npm install
```

---

##  👨‍💻 Développement

### Linter et Format
```bash
# Lint
ng lint

# Format (utiliser Prettier/ESLint)
npm run lint:fix
```

### Tests unitaires
```bash
ng test
```

### Build de production
```bash
ng build --configuration production --optimization
```

---

## 📚 Ressources utiles

- [Documentation Angular](https://angular.dev)
- [Material Design Components](https://material.angular.dev)
- [Angular Forms Documentation](https://angular.dev/guide/forms)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Notes Importantes

1. **API Google Apps Script**: Remplacez l'URL API par votre script Google Apps Script
2. **CORS**: Assurez-vous que votre backend accepte les requêtes CORS
3. **Authentification**: Le service est prêt pour l'ajout d'intercepteurs d'authentification
4. **Persistance**: Les données sont actuellement en mémoire, à lier avec une base de données

---

## 🎯 Prochaines Étapes Recommandées

- [ ] Configurer l'API réelle (Google Apps Script ou backend custom)
- [ ] Ajouter l'authentification utilisateur
- [ ] Implémenter la pagination côté serveur
- [ ] Ajouter des tests unitaires
- [ ] Mettre en place l'édition des données
- [ ] Ajouter une export des données (CSV/PDF)
- [ ] Configurer le déploiement (Firebase Hosting, Netlify, etc.)

---

## 📄 Licence

Ce projet est fourni à titre d'exemple éducatif.

---

**Créé le**: Avril 2026  
**Version Angular**: 19.2.0  
**Version Node**: 18+  
**Package Manager**: npm

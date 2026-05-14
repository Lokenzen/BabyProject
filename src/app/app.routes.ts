import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { ResultsComponent } from './components/results/results.component';
import { DetailComponent } from './components/detail/detail.component';

export const routes: Routes = [
  {
    path: '',
    component: FormComponent,
    data: { title: 'Formulaire' }
  },
  {
    path: 'results',
    component: ResultsComponent,
    data: { title: 'Résultats' }
  },
  {
    path: 'detail',
    component: DetailComponent,
    data: { title: 'Détails de la Personne' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

import { Route } from '@angular/router';
import { CompleteComponent } from './components/complete/complete.component';

export const ROUTES: Route[] = [
  {
    path: 'completeActivity',
    component: CompleteComponent,
  },
  {
    path: '',
    redirectTo: 'completeActivity',
    pathMatch: 'full',
  },
  {
    path: '*',
    redirectTo: 'completeActivity',
    pathMatch: 'full',
  },
];

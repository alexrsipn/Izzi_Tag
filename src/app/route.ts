import { Route } from '@angular/router';
import { CompleteComponent } from './components/complete/complete.component';
import { TagLayoutComponent } from './components/tag-layout/tag-layout.component';

export const ROUTES: Route[] = [
  {
    path: 'tag',
    component: TagLayoutComponent,
  },
  {
    path: '',
    redirectTo: 'tag',
    pathMatch: 'full',
  },
  {
    path: '*',
    redirectTo: 'tag',
    pathMatch: 'full',
  },
];

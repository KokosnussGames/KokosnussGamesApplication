import { Routes } from '@angular/router';
import { NonogramComponent } from './nonogram/nonogram.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'nonogram',
    pathMatch: 'full'
  },
  {
    path: 'nonogram',
    component: NonogramComponent
  }
];

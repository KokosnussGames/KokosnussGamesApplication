import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },
  { path: 'settings', children: [] },
  { path: 'sudoku', children: [] },
  { path: 'minesweeper', children: [] },
  { path: 'nonogramm', children: [] },
  { path: '**', redirectTo: '' },
];

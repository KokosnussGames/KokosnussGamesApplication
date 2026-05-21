import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },
  { path: 'settings', children: [] },
  { path: 'play/sudoku', children: [] },
  { path: 'play/minesweeper', children: [] },
  { path: 'play/nonogram', children: [] },
  { path: '**', redirectTo: '' },
];

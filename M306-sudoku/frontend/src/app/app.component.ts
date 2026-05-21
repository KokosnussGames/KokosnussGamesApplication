import { Component } from '@angular/core';
import { SudokuTableComponent } from './sudoku-table/sudoku-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SudokuTableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sudoku-frontend';
}

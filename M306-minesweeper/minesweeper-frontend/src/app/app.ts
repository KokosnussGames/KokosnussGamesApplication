import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { GameService } from './services/game.service';
import { Board, Cell } from './models/board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  board?: Board;
  error = '';

  constructor(
    private gameService: GameService,
    private changeDetector: ChangeDetectorRef
  ) {}

  newGame(): void {
    this.error = '';
    this.gameService.newGame().subscribe({
      next: board => this.setBoard(board),
      error: () => {
        this.error = 'Backend nicht erreichbar. Starte das Java-Backend auf Port 8080.';
        this.changeDetector.detectChanges();
      }
    });
  }

  reveal(x: number, y: number): void {
    if (!this.board || this.board.state !== 'RUNNING') {
      return;
    }

    this.gameService.reveal(x, y).subscribe(board => this.setBoard(board));
  }

  revealFromPointer(event: PointerEvent, x: number, y: number): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.reveal(x, y);
  }

  flag(event: MouseEvent, x: number, y: number): void {
    event.preventDefault();

    if (!this.board || this.board.state !== 'RUNNING') {
      return;
    }

    const cell = this.board.cells[y]?.[x];

    if (!cell || cell.revealed) {
      return;
    }

    cell.flagged = !cell.flagged;
    this.changeDetector.detectChanges();

    this.gameService.flag(x, y).subscribe(board => {
      const currentBoard = this.board;

      if (currentBoard) {
        board.cells.forEach((row, rowIndex) => {
          row.forEach((backendCell, columnIndex) => {
            const currentCell = currentBoard.cells[rowIndex]?.[columnIndex];

            if (currentCell && !backendCell.revealed) {
              backendCell.flagged = currentCell.flagged;
            }
          });
        });
      }

      this.setBoard(board);
    });
  }

  text(cell: Cell): string {
    if (!cell.revealed) {
      return cell.flagged ? 'F' : '';
    }

    if (cell.mine) {
      return '*';
    }

    return cell.adjacentMines > 0 ? String(cell.adjacentMines) : '';
  }

  stateText(state: Board['state']): string {
    switch (state) {
      case 'RUNNING':
        return 'Läuft';
      case 'WON':
        return 'Gewonnen';
      case 'LOST':
        return 'Game over';
    }
  }

  private setBoard(board: Board): void {
    this.board = board;
    this.changeDetector.detectChanges();
  }
}

import { Component, OnInit } from '@angular/core';
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
export class App implements OnInit {
  board?: Board;
  error = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.newGame();
  }

  newGame(): void {
    this.error = '';
    this.gameService.newGame().subscribe({
      next: board => this.board = board,
      error: () => this.error = 'Backend nicht erreichbar. Starte das Java-Backend auf Port 8080.'
    });
  }

  reveal(x: number, y: number): void {
    if (!this.board || this.board.state !== 'RUNNING') {
      return;
    }

    this.gameService.reveal(x, y).subscribe(board => this.board = board);
  }

  flag(event: MouseEvent, x: number, y: number): void {
    event.preventDefault();

    if (!this.board || this.board.state !== 'RUNNING') {
      return;
    }

    this.gameService.flag(x, y).subscribe(board => this.board = board);
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
}

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NonogramApiService } from '../services/nonogram-api.service';
import { NonogramPuzzle } from '../models/nonogram.model';

type LineStatus = 'neutral' | 'completed' | 'invalid';

@Component({
  selector: 'app-nonogram',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, FormsModule],
  templateUrl: './nonogram.component.html',
  styleUrl: './nonogram.component.scss'
})
export class NonogramComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('scrollbarTrack') scrollbarTrack?: ElementRef<HTMLDivElement>;

  puzzle?: NonogramPuzzle;
  puzzles: NonogramPuzzle[] = [];
  searchText = '';
  selectedPuzzleId = 1;
  grid: number[][] = [];
  message = '';
  gameSolved = false;
  solutionProblem = false;
  isDragging = false;
  dragMode: 0 | 1 | 2 = 1;
  scrollThumbHeight = 96;
  scrollThumbTop = 0;
  scrollThumbReady = false;
  private isDraggingScrollbar = false;
  private scrollbarDragStartY = 0;
  private scrollbarDragStartTop = 0;

  constructor(private nonogramApiService: NonogramApiService) {}

  ngOnInit(): void {
    this.loadPuzzles();
    this.loadPuzzle(1);
  }

  ngAfterViewInit(): void {
    this.queueScrollThumbUpdate();
  }

  loadPuzzles(): void {
    this.nonogramApiService.getPuzzles().subscribe({
      next: (puzzles) => {
        this.puzzles = puzzles;
      },
      error: () => {
        this.message = 'Could not load puzzle list.';
      }
    });
  }

  loadPuzzle(id: number): void {
    this.selectedPuzzleId = Number(id);

    this.nonogramApiService.getPuzzle(this.selectedPuzzleId).subscribe({
      next: (puzzle) => {
        this.puzzle = puzzle;
        this.grid = this.createEmptyGrid(puzzle.size);
        this.message = '';
        this.gameSolved = false;
        this.solutionProblem = false;
        this.queueScrollThumbUpdate();
      },
      error: () => {
        this.message = 'Could not load puzzle.';
      }
    });
  }

  get filteredPuzzles(): NonogramPuzzle[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.puzzles;
    }

    return this.puzzles.filter(puzzle =>
      puzzle.name.toLowerCase().includes(search) ||
      puzzle.id.toString().includes(search)
    );
  }

  toggleCell(row: number, col: number): void {
    if (this.gameSolved || this.isDragging) {
      return;
    }

    this.grid[row][col] = (this.grid[row][col] + 1) % 3;
    this.solutionProblem = false;
    this.message = '';

    this.checkSolvedAutomatically();
  }

  startDrag(event: MouseEvent, row: number, col: number): void {
    if (this.gameSolved) {
      return;
    }

    event.preventDefault();

    this.isDragging = true;

    if (event.shiftKey) {
      this.dragMode = 0;
    } else {
      this.dragMode = event.button === 2 ? 2 : 1;
    }

    this.setCell(row, col, this.dragMode);
  }

  dragOverCell(event: MouseEvent, row: number, col: number): void {
    if (!this.isDragging || this.gameSolved) {
      return;
    }

    event.preventDefault();

    this.setCell(row, col, this.dragMode);
  }

  stopDrag(): void {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.checkSolvedAutomatically();
  }

  updateScrollThumb(): void {
    const container = this.scrollContainer?.nativeElement;
    const track = this.scrollbarTrack?.nativeElement;

    if (!container || !track) {
      return;
    }

    const trackHeight = Math.max(track.clientHeight - 12, 0);
    const scrollableHeight = container.scrollHeight - container.clientHeight;
    const visibleRatio = container.clientHeight / container.scrollHeight;

    this.scrollThumbHeight = Math.min(Math.max(trackHeight * visibleRatio, 96), trackHeight);
    this.scrollThumbTop = scrollableHeight > 0
      ? (container.scrollTop / scrollableHeight) * (trackHeight - this.scrollThumbHeight)
      : 0;
    this.scrollThumbReady = true;
  }

  private queueScrollThumbUpdate(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.updateScrollThumb());
    });

    setTimeout(() => this.updateScrollThumb(), 300);
  }

  startScrollbarDrag(event: MouseEvent): void {
    const container = this.scrollContainer?.nativeElement;

    if (!container) {
      return;
    }

    event.preventDefault();
    this.isDraggingScrollbar = true;
    this.scrollbarDragStartY = event.clientY;
    this.scrollbarDragStartTop = container.scrollTop;
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  dragScrollbar(event: MouseEvent): void {
    const container = this.scrollContainer?.nativeElement;
    const track = this.scrollbarTrack?.nativeElement;

    if (!this.isDraggingScrollbar || !container || !track) {
      return;
    }

    event.preventDefault();

    const trackHeight = Math.max(track.clientHeight - 12, 0);
    const maxThumbTop = trackHeight - this.scrollThumbHeight;
    const scrollableHeight = container.scrollHeight - container.clientHeight;
    const dragDistance = event.clientY - this.scrollbarDragStartY;
    const scrollDistance = maxThumbTop > 0
      ? (dragDistance / maxThumbTop) * scrollableHeight
      : 0;

    container.scrollTop = this.scrollbarDragStartTop + scrollDistance;
    this.updateScrollThumb();
  }

  @HostListener('document:mouseup')
  stopScrollbarDrag(): void {
    if (!this.isDraggingScrollbar) {
      return;
    }

    this.isDraggingScrollbar = false;
    document.body.style.userSelect = '';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.queueScrollThumbUpdate();
  }

  private setCell(row: number, col: number, value: 0 | 1 | 2): void {
    if (this.grid[row][col] === value) {
      return;
    }

    this.grid[row][col] = value;
    this.solutionProblem = false;
    this.message = '';
  }

  resetPuzzle(): void {
    if (!this.puzzle) {
      return;
    }

    this.grid = this.createEmptyGrid(this.puzzle.size);
    this.message = '';
    this.gameSolved = false;
    this.solutionProblem = false;
  }

  getRowStatus(rowIndex: number): LineStatus {
    if (!this.puzzle) {
      return 'neutral';
    }

    return this.getLineStatus(
      this.grid[rowIndex],
      this.puzzle.rowClues[rowIndex]
    );
  }

  getColumnStatus(colIndex: number): LineStatus {
    if (!this.puzzle) {
      return 'neutral';
    }

    const column = this.grid.map(row => row[colIndex]);

    return this.getLineStatus(
      column,
      this.puzzle.columnClues[colIndex]
    );
  }

  private getLineStatus(line: number[], expectedClues: number[]): LineStatus {
    const currentClues = this.calculateLineClues(line);

    if (this.areCluesEqual(currentClues, expectedClues)) {
      return 'completed';
    }

    if (!this.canLineStillMatch(line, expectedClues)) {
      return 'invalid';
    }

    return 'neutral';
  }

  private checkSolvedAutomatically(): void {
    if (!this.puzzle) {
      return;
    }

    if (!this.areAllCluesCompleted()) {
      return;
    }

    this.nonogramApiService.checkSolution(this.puzzle.id, this.grid).subscribe({
      next: (response) => {
        if (response.solved) {
          this.gameSolved = true;
          this.message = 'Puzzle solved!';
        } else {
          this.solutionProblem = true;
          this.message = 'All clues look completed, but the solution is not correct.';
        }
      },
      error: () => {
        this.message = 'Could not check solution.';
      }
    });
  }

  private areAllCluesCompleted(): boolean {
    if (!this.puzzle) {
      return false;
    }

    for (let row = 0; row < this.puzzle.size; row++) {
      if (this.getRowStatus(row) !== 'completed') {
        return false;
      }
    }

    for (let col = 0; col < this.puzzle.size; col++) {
      if (this.getColumnStatus(col) !== 'completed') {
        return false;
      }
    }

    return true;
  }

  private calculateLineClues(line: number[]): number[] {
    const clues: number[] = [];
    let count = 0;

    for (const cell of line) {
      if (cell === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }

    if (count > 0) {
      clues.push(count);
    }

    return clues.length > 0 ? clues : [0];
  }

  private areCluesEqual(first: number[], second: number[]): boolean {
    if (first.length !== second.length) {
      return false;
    }

    return first.every((value, index) => value === second[index]);
  }

  private canLineStillMatch(line: number[], expectedClues: number[]): boolean {
    const normalizedClues = this.normalizeClues(expectedClues);
    const possibleSolutions = this.generatePossibleLines(line.length, normalizedClues);

    return possibleSolutions.some(possibleLine =>
      this.isCompatibleWithCurrentLine(line, possibleLine)
    );
  }

  private normalizeClues(clues: number[]): number[] {
    if (clues.length === 1 && clues[0] === 0) {
      return [];
    }

    return clues;
  }

  private generatePossibleLines(length: number, clues: number[]): number[][] {
    const results: number[][] = [];

    if (clues.length === 0) {
      results.push(Array.from({ length }, () => 0));
      return results;
    }

    const placeGroups = (
      clueIndex: number,
      startPosition: number,
      line: number[]
    ): void => {
      if (clueIndex === clues.length) {
        const completedLine = [...line];

        for (let i = 0; i < length; i++) {
          if (completedLine[i] !== 1) {
            completedLine[i] = 0;
          }
        }

        results.push(completedLine);
        return;
      }

      const groupLength = clues[clueIndex];
      const remainingGroups = clues.slice(clueIndex + 1);
      const minimumSpaceForRemainingGroups =
        remainingGroups.reduce((sum, clue) => sum + clue, 0) + remainingGroups.length;

      const latestStart = length - groupLength - minimumSpaceForRemainingGroups;

      for (let position = startPosition; position <= latestStart; position++) {
        const newLine = [...line];

        for (let i = startPosition; i < position; i++) {
          newLine[i] = 0;
        }

        for (let i = position; i < position + groupLength; i++) {
          newLine[i] = 1;
        }

        const nextStart = position + groupLength + 1;

        if (clueIndex < clues.length - 1 && position + groupLength < length) {
          newLine[position + groupLength] = 0;
        }

        placeGroups(clueIndex + 1, nextStart, newLine);
      }
    };

    placeGroups(0, 0, Array.from({ length }, () => 0));

    return results;
  }

  private isCompatibleWithCurrentLine(currentLine: number[], possibleSolution: number[]): boolean {
    return currentLine.every((cell, index) => {
      if (cell === 1) {
        return possibleSolution[index] === 1;
      }

      if (cell === 2) {
        return possibleSolution[index] === 0;
      }

      return true;
    });
  }

  private createEmptyGrid(size: number): number[][] {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 0)
    );
  }
}

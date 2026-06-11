import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: "app-sudoku-table",
  standalone: true,
  templateUrl: "./sudoku-table.component.html",
  styleUrls: ["./sudoku-table.component.css"]
})
export class SudokuTableComponent implements AfterViewInit {
  @ViewChild("sudokuTable", { static: true }) sudokuTableRef!: ElementRef<HTMLTableElement>;

  constructor(private readonly http: HttpClient) {}

  ngAfterViewInit(): void {
    this.normalizeCells();
  }

  generateNewField(): void {
    this.renderPuzzle(this.createPuzzle());
  }

  onTableKeydown(event: KeyboardEvent): void {
    const target = this.getEditableInput(event.target);
    if (target === null) {
      return;
    }

    const allowedKeys = ["Backspace", "Delete", "Tab", "Enter", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^[1-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onTableInput(event: Event): void {
    const target = this.getEditableInput(event.target);
    if (target === null) {
      return;
    }

    const currentValue = this.normalizeInputValue(target);
    const cell = target.closest("td[cell-index]");

    if (!(cell instanceof HTMLTableCellElement)) {
      return;
    }

    if (currentValue === "") {
      cell.classList.remove("incorrect-input");
      return;
    }

    const indexAttribute = cell.getAttribute("cell-index");
    if (indexAttribute === null) {
      return;
    }

    const cellIndex = Number.parseInt(indexAttribute, 10);
    const sudokuTable = this.buildSudokuTable(cellIndex);
    const payload = {
      val: Number.parseInt(currentValue, 10),
      index: cellIndex,
      sudokuTable
    };

    this.http.post<boolean>("/api/sudoku/move", payload).subscribe({
      next: (isAccepted: boolean) => {
        cell.classList.toggle("incorrect-input", !isAccepted);
      },
      error: () => {
        cell.classList.add("incorrect-input");
      }
    });
  }

  private buildSudokuTable(currentCellIndex: number): number[] {
    const sudokuTable = new Array<number>(81).fill(0);
    const cells = this.sudokuTableRef.nativeElement.querySelectorAll<HTMLTableCellElement>("td[cell-index]");

    cells.forEach((cell: HTMLTableCellElement) => {
      const indexAttribute = cell.getAttribute("cell-index");
      if (indexAttribute === null) {
        return;
      }

      const cellIndex = Number.parseInt(indexAttribute, 10);
      const cellValueText = this.getCellValue(cell);
      if (cellValueText === "" || cellIndex === currentCellIndex) {
        sudokuTable[cellIndex] = 0;
        return;
      }

      const parsedValue = Number.parseInt(cellValueText, 10);
      sudokuTable[cellIndex] = Number.isNaN(parsedValue) ? 0 : parsedValue;
    });

    return sudokuTable;
  }

  private createPuzzle(): number[] {
    const rows = this.shuffleSudokuGroups();
    const columns = this.shuffleSudokuGroups();
    const symbols = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const puzzle = new Array<number>(81);

    for (let row = 0; row < 9; row++) {
      for (let column = 0; column < 9; column++) {
        const baseValue = (rows[row] * 3 + Math.floor(rows[row] / 3) + columns[column]) % 9;
        puzzle[row * 9 + column] = symbols[baseValue];
      }
    }

    const cellsToClear = 46;
    this.shuffle([...Array(81).keys()])
      .slice(0, cellsToClear)
      .forEach((index: number) => {
        puzzle[index] = 0;
      });

    return puzzle;
  }

  private renderPuzzle(puzzle: number[]): void {
    const cells = this.sudokuTableRef.nativeElement.querySelectorAll<HTMLTableCellElement>("td[cell-index]");

    cells.forEach((cell: HTMLTableCellElement) => {
      const indexAttribute = cell.getAttribute("cell-index");
      if (indexAttribute === null) {
        return;
      }

      const cellIndex = Number.parseInt(indexAttribute, 10);
      const value = puzzle[cellIndex] ?? 0;

      cell.classList.remove("editable-cell", "fixed-cell", "incorrect-input");
      cell.removeAttribute("contenteditable");
      cell.textContent = "";

      if (value === 0) {
        this.addEditableInput(cell, cellIndex);
      } else {
        cell.classList.add("fixed-cell");
        cell.textContent = String(value);
      }
    });
  }

  private shuffleSudokuGroups(): number[] {
    return this.shuffle([0, 1, 2]).flatMap((group: number) =>
      this.shuffle([0, 1, 2]).map((index: number) => group * 3 + index)
    );
  }

  private shuffle<T>(values: T[]): T[] {
    const shuffled = [...values];

    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  private normalizeCells(): void {
    const cells = this.sudokuTableRef.nativeElement.querySelectorAll<HTMLTableCellElement>("td[cell-index]");

    cells.forEach((cell: HTMLTableCellElement) => {
      const indexAttribute = cell.getAttribute("cell-index");
      if (indexAttribute === null) {
        return;
      }

      const cellIndex = Number.parseInt(indexAttribute, 10);
      const value = this.getCellValue(cell);

      cell.classList.remove("editable-cell", "fixed-cell");
      cell.removeAttribute("contenteditable");
      cell.textContent = "";

      if (value === "") {
        this.addEditableInput(cell, cellIndex);
      } else {
        cell.classList.add("fixed-cell");
        cell.textContent = value;
      }
    });
  }

  private addEditableInput(cell: HTMLTableCellElement, cellIndex: number): void {
    const input = document.createElement("input");
    input.className = "sudoku-input";
    input.type = "number";
    input.min = "1";
    input.max = "9";
    input.step = "1";
    input.inputMode = "numeric";
    input.pattern = "[1-9]";
    input.autocomplete = "off";
    input.setAttribute("aria-label", `Sudoku Feld ${cellIndex + 1}`);

    cell.classList.add("editable-cell");
    cell.appendChild(input);
  }

  private getEditableInput(target: EventTarget | null): HTMLInputElement | null {
    if (target instanceof HTMLInputElement && target.classList.contains("sudoku-input")) {
      return target;
    }

    if (target instanceof Element) {
      const input = target.closest("input.sudoku-input");
      if (input instanceof HTMLInputElement) {
        return input;
      }
    }

    return null;
  }

  private getCellValue(cell: HTMLTableCellElement): string {
    const input = cell.querySelector<HTMLInputElement>("input.sudoku-input");
    if (input !== null) {
      return input.value.trim();
    }

    return (cell.textContent ?? "").trim();
  }

  private normalizeInputValue(input: HTMLInputElement): string {
    const digit = input.value.match(/[1-9]/)?.[0] ?? "";
    input.value = digit;
    return digit;
  }
}

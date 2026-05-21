import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: "app-sudoku-table",
  standalone: true,
  templateUrl: "./sudoku-table.component.html",
  styleUrls: ["./sudoku-table.component.css"]
})
export class SudokuTableComponent {
  @ViewChild("sudokuTable", { static: true }) sudokuTableRef!: ElementRef<HTMLTableElement>;
  private readonly emptyCellCaretMarker = "\u200B";

  constructor(private readonly http: HttpClient) {}

  generateNewField(): void {
    this.renderPuzzle(this.createPuzzle());
  }

  onEditableCellFocus(event: Event): void {
    const cell = this.getEditableCell(event.target);
    if (cell === null) {
      return;
    }

    this.prepareEmptyCellForCaret(cell);
  }

  onEditableCellBlur(event: Event): void {
    const cell = this.getEditableCell(event.target);
    if (cell === null || this.getCellValue(cell) !== "") {
      return;
    }

    cell.textContent = "";
  }

  onTableKeyup(event: KeyboardEvent): void {
    const target = this.getEditableCell(event.target);
    if (target === null) {
      return;
    }

    const currentValue = this.getCellValue(target);
    if (target.textContent?.includes(this.emptyCellCaretMarker) && currentValue !== "") {
      target.textContent = currentValue;
      this.moveCaretToEnd(target);
    }

    if (!/^[1-9]$/.test(currentValue)) {
      target.textContent = "";
      target.classList.remove("incorrect-input");
      this.prepareEmptyCellForCaret(target);
      return;
    }

    const indexAttribute = target.getAttribute("cell-index");
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
        target.classList.toggle("incorrect-input", !isAccepted);
      },
      error: () => {
        target.classList.add("incorrect-input");
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

      cell.classList.remove("incorrect-input");
      cell.textContent = value === 0 ? "" : String(value);

      if (value === 0) {
        cell.setAttribute("contenteditable", "true");
      } else {
        cell.removeAttribute("contenteditable");
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

  private getEditableCell(target: EventTarget | null): HTMLTableCellElement | null {
    if (target instanceof HTMLTableCellElement && target.isContentEditable) {
      return target;
    }

    if (target instanceof Element) {
      const cell = target.closest("td[contenteditable]");
      if (cell instanceof HTMLTableCellElement) {
        return cell;
      }
    }

    return null;
  }

  private getCellValue(cell: HTMLTableCellElement): string {
    return (cell.textContent ?? "").split(this.emptyCellCaretMarker).join("").trim();
  }

  private prepareEmptyCellForCaret(cell: HTMLTableCellElement): void {
    if (this.getCellValue(cell) !== "") {
      return;
    }

    cell.textContent = this.emptyCellCaretMarker;
    this.moveCaretToEnd(cell);
  }

  private moveCaretToEnd(cell: HTMLTableCellElement): void {
    const textNode = cell.firstChild;
    if (!(textNode instanceof Text)) {
      return;
    }

    const range = document.createRange();
    range.setStart(textNode, textNode.length);
    range.collapse(true);

    const selection = window.getSelection();
    if (selection === null) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }
}

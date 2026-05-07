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

  constructor(private readonly http: HttpClient) {}

  onTableKeyup(event: KeyboardEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLTableCellElement) || !target.isContentEditable) {
      return;
    }

    const currentValue = target.innerText.trim();
    if (!/^[1-9]$/.test(currentValue)) {
      target.innerText = "";
      target.classList.remove("incorrect-input");
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

    this.http.post<boolean>("http://localhost:8081/move", payload).subscribe({
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
      const cellValueText = cell.innerText.trim();
      if (cellValueText === "" || cellIndex === currentCellIndex) {
        sudokuTable[cellIndex] = 0;
        return;
      }

      const parsedValue = Number.parseInt(cellValueText, 10);
      sudokuTable[cellIndex] = Number.isNaN(parsedValue) ? 0 : parsedValue;
    });

    return sudokuTable;
  }
}

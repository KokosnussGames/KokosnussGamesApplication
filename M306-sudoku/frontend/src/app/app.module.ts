import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { SudokuTableComponent } from "./sudoku-table/sudoku-table.component";

@NgModule({
  declarations: [AppComponent, SudokuTableComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

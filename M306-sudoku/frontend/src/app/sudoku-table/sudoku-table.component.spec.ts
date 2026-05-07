import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SudokuTableComponent } from './sudoku-table.component';

describe('SudokuTableComponent', () => {
  let component: SudokuTableComponent;
  let fixture: ComponentFixture<SudokuTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SudokuTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SudokuTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

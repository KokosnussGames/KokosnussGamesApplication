import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { GameService } from './services/game.service';

const board = {
  width: 2,
  height: 2,
  mineCount: 1,
  state: 'RUNNING' as const,
  cells: [
    [
      { mine: false, revealed: false, flagged: false, adjacentMines: 1 },
      { mine: true, revealed: false, flagged: false, adjacentMines: 0 }
    ],
    [
      { mine: false, revealed: false, flagged: false, adjacentMines: 1 },
      { mine: false, revealed: false, flagged: false, adjacentMines: 1 }
    ]
  ]
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: GameService,
          useValue: {
            newGame: () => of(board),
            reveal: () => of(board),
            flag: () => of(board)
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the game board', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.new-game')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelectorAll('.cell').length).toBe(4);
  });
});

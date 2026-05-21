export interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
}

export interface Board {
  width: number;
  height: number;
  mineCount: number;
  cells: Cell[][];
  state: 'RUNNING' | 'WON' | 'LOST';
}

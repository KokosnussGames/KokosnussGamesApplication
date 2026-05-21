export interface NonogramPuzzle {
  id: number;
  name: string;
  size: number;
  rowClues: number[][];
  columnClues: number[][];
}

export interface CheckSolutionResponse {
  solved: boolean;
}

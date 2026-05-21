import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckSolutionResponse, NonogramPuzzle } from '../models/nonogram.model';

@Injectable({
  providedIn: 'root'
})
export class NonogramApiService {
  private readonly apiUrl = '/api/nonogram';

  constructor(private http: HttpClient) {}

  getPuzzles(): Observable<NonogramPuzzle[]> {
    return this.http.get<NonogramPuzzle[]>(`${this.apiUrl}/puzzles`);
  }

  getPuzzle(id: number): Observable<NonogramPuzzle> {
    return this.http.get<NonogramPuzzle>(`${this.apiUrl}/puzzles/${id}`);
  }

  checkSolution(id: number, grid: number[][]): Observable<CheckSolutionResponse> {
    return this.http.post<CheckSolutionResponse>(
      `${this.apiUrl}/puzzles/${id}/check`,
      { grid }
    );
  }
}

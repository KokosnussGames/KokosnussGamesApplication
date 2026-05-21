import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from '../models/board';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private api = '/api/minesweeper';

  constructor(private http: HttpClient) {}

  newGame(): Observable<Board> {
    return this.http.get<Board>(`${this.api}/new`);
  }

  reveal(x: number, y: number): Observable<Board> {
    return this.http.post<Board>(`${this.api}/reveal/${x}/${y}`, {});
  }

  getBoard(): Observable<Board> {
    return this.http.get<Board>(this.api);
  }

  flag(x: number, y: number) {
    return this.http.post<Board>(`${this.api}/flag/${x}/${y}`, {});
  }
}

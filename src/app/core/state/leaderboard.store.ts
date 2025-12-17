import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { LeaderboardApiService } from '../services/leaderboard-api.service';
import { LeaderboardWsService } from '../services/leaderboard-ws.service';
import { Portfolio } from '../models/leaderboard.models';

@Injectable({ providedIn: 'root' })
export class LeaderboardStore {
  private readonly portfolios$ = new BehaviorSubject<Portfolio[]>([]);

  readonly portfolios: Observable<Portfolio[]> = this.portfolios$.asObservable();

  constructor(
    private readonly api: LeaderboardApiService,
    private readonly ws: LeaderboardWsService
  ) {}

  init(): void {
    this.loadInitialData();
    this.handleWebSocket();
  }

  private loadInitialData(): void {
    this.api.getPortfolios()
      .pipe(catchError(() => of([] as Portfolio[])))
      .subscribe(portfolios => this.portfolios$.next(portfolios));
  }

  private handleWebSocket(): void {
    this.ws.stream()
      .pipe(catchError(() => of({ entries: [] } as any)))
      .subscribe(snapshot => {
        // Map LeaderboardSnapshot to Portfolio[] if needed
        // For now, keep existing portfolios
      });
  }
}

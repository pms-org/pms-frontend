import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/leaderboard.models';
import { ENDPOINTS, httpUrl } from '../config/endpoints';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardApiService {
  private readonly http = inject(HttpClient);

  getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(
      httpUrl(ENDPOINTS.leaderboard.baseHttp, ENDPOINTS.leaderboard.portfolios)
    );
  }
}

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

  getTopPerformers(top?: number): Observable<any> {
    const url = httpUrl(ENDPOINTS.leaderboard.baseHttp, ENDPOINTS.leaderboard.top);
    const options = { responseType: 'json' as const };
    return top ? 
      this.http.get(url, { ...options, params: { top: top.toString() } }) : 
      this.http.get(url, options);
  }

  getRankingsAround(portfolioId: string, range?: number): Observable<any> {
    const url = httpUrl(ENDPOINTS.leaderboard.baseHttp, ENDPOINTS.leaderboard.around);
    const params: Record<string, string> = { portfolioId };
    if (range) params['range'] = range.toString();
    return this.http.get(url, { params, responseType: 'json' as const });
  }
}

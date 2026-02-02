import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/leaderboard.models';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardApiService {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly baseUrl = this.runtimeConfig.leaderboard.baseHttp;

  getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/api/leaderboard/portfolios`);
  }

  getTopPerformers(top?: number): Observable<any> {
    const url = `${this.baseUrl}/api/leaderboard/top`;
    const options = { responseType: 'json' as const };
    return top
      ? this.http.get(url, { ...options, params: { top: top.toString() } })
      : this.http.get(url, options);
  }

  getRankingsAround(portfolioId: string, range?: number): Observable<any> {
    const url = `${this.baseUrl}/api/leaderboard/around`;
    const params: Record<string, string> = { portfolioId };
    if (range) params['range'] = range.toString();
    return this.http.get(url, { params, responseType: 'json' as const });
  }
}

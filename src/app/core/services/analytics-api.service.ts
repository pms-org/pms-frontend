import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalysisEntityDto, SectorMetricsDto, SymbolMetricsDto } from '../models/analytics.models';
import { RuntimeConfigService } from './runtime-config.service';
import { LoggerService } from './logger.service';

// Interface needed for Chart 3
export interface PortfolioValueHistoryDto {
  id: string;
  portfolioId: string;
  date: string;
  portfolioValue: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly baseUrl = this.runtimeConfig.analytics.baseHttp;

  getAnalysisAll(): Observable<AnalysisEntityDto[]> {
    return this.http.get<AnalysisEntityDto[]>(`${this.baseUrl}/api/analysis/all`);
  }

  getSectorOverall(): Observable<SectorMetricsDto[]> {
    return this.http.get<SectorMetricsDto[]>(`${this.baseUrl}/api/sectors/overall`);
  }

  triggerUnrealizedPnlCalc(): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/api/analytics/initial-unrealized-pnl`);
  }

  getPortfolioSectorAnalysis(portfolioId: string): Observable<SectorMetricsDto[]> {
    const url = `${this.baseUrl}/api/sectors/portfolio-wise/${portfolioId}`;
    this.logger.info('API Call: Portfolio sector analysis', { portfolioId, url });
    return this.http.get<SectorMetricsDto[]>(url);
  }

  getSectorDrilldown(sector: string): Observable<SymbolMetricsDto[]> {
    return this.http.get<SymbolMetricsDto[]>(`${this.baseUrl}/api/sectors/sector-wise/${sector}`);
  }

  getPortfolioSectorDrilldown(portfolioId: string, sector: string): Observable<SymbolMetricsDto[]> {
    return this.http.get<SymbolMetricsDto[]>(
      `${this.baseUrl}/api/sectors/portfolio-wise/${portfolioId}/sector-wise/${sector}`,
    );
  }

  // The Missing Method causing your error
  getPortfolioHistory(portfolioId: string): Observable<PortfolioValueHistoryDto[]> {
    return this.http.get<PortfolioValueHistoryDto[]>(
      `${this.baseUrl}/api/portfolio_value/history/${portfolioId}`,
    );
  }
}

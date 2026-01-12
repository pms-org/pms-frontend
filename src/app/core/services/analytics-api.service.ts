import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalysisEntityDto, SectorMetricsDto, SymbolMetricsDto } from '../models/analytics.models';
import { ENDPOINTS, httpUrl } from '../config/endpoints';
import { LoggerService } from './logger.service';

// ✅ Interface needed for Chart 3
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
  // Using empty string to force proxy usage
  private readonly baseUrl = ENDPOINTS.analytics.baseHttp; 

  getAnalysisAll(): Observable<AnalysisEntityDto[]> {
    return this.http.get<AnalysisEntityDto[]>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.analysisAll)
    );
  }

  getSectorOverall(): Observable<SectorMetricsDto[]> {
    return this.http.get<SectorMetricsDto[]>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.sectorOverall)
    );
  }

  triggerUnrealizedPnlCalc(): Observable<void> {
    return this.http.get<void>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.initialUnrealizedPnl)
    );
  }

  getPortfolioSectorAnalysis(portfolioId: string): Observable<SectorMetricsDto[]> {
    const url = httpUrl(this.baseUrl, ENDPOINTS.analytics.portfolioSector(portfolioId));
    this.logger.info('API Call: Portfolio sector analysis', { portfolioId, url });
    return this.http.get<SectorMetricsDto[]>(url);
  }

  getSectorDrilldown(sector: string): Observable<SymbolMetricsDto[]> {
    return this.http.get<SymbolMetricsDto[]>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.sectorDrilldown(sector))
    );
  }

  getPortfolioSectorDrilldown(portfolioId: string, sector: string): Observable<SymbolMetricsDto[]> {
    return this.http.get<SymbolMetricsDto[]>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.portfolioSectorDrilldown(portfolioId, sector))
    );
  }

  // ✅ The Missing Method causing your error
  getPortfolioHistory(portfolioId: string): Observable<PortfolioValueHistoryDto[]> {
    return this.http.get<PortfolioValueHistoryDto[]>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.portfolioHistory(portfolioId))
    );
  }
}
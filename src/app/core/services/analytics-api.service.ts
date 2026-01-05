import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalysisEntityDto, SectorMetricsDto, SymbolMetricsDto } from '../models/analytics.models';
import { ENDPOINTS, httpUrl } from '../config/endpoints';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);
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

  // ✅ The Manual Trigger
  triggerUnrealizedPnlCalc(): Observable<void> {
    return this.http.get<void>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.initialUnrealizedPnl)
    );
  }

  // --- Portfolio & Sector Drilldown ---

  getPortfolioSectorAnalysis(portfolioId: string): Observable<SectorMetricsDto[]> {
    return this.http.get<SectorMetricsDto[]>(
      httpUrl(this.baseUrl, ENDPOINTS.analytics.portfolioSector(portfolioId))
    );
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
}
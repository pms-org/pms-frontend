import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalysisEntityDto, SectorMetricsDto } from '../models/analytics.models';
import { ENDPOINTS, httpUrl } from '../config/endpoints';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);

  getAnalysisAll(): Observable<AnalysisEntityDto[]> {
    return this.http.get<AnalysisEntityDto[]>(
      httpUrl(ENDPOINTS.analytics.baseHttp, ENDPOINTS.analytics.analysisAll)
    );
  }

  getSectorOverall(): Observable<SectorMetricsDto[]> {
    return this.http.get<SectorMetricsDto[]>(
      httpUrl(ENDPOINTS.analytics.baseHttp, ENDPOINTS.analytics.sectorOverall)
    );
  }
}

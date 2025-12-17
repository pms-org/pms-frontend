import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricCard, PipelineStage, DLQError } from '../models/rttm.models';
import { ENDPOINTS, httpUrl } from '../config/endpoints';

@Injectable({
  providedIn: 'root'
})
export class RttmApiService {
  private readonly http = inject(HttpClient);

  getMetrics(): Observable<MetricCard[]> {
    return this.http.get<MetricCard[]>(
      httpUrl(ENDPOINTS.rttm.baseHttp, ENDPOINTS.rttm.metrics)
    );
  }

  getPipeline(): Observable<PipelineStage[]> {
    return this.http.get<PipelineStage[]>(
      httpUrl(ENDPOINTS.rttm.baseHttp, ENDPOINTS.rttm.pipeline)
    );
  }

  getDlq(): Observable<{ total: number; lastError: string; errors: DLQError[] }> {
    return this.http.get<{ total: number; lastError: string; errors: DLQError[] }>(
      httpUrl(ENDPOINTS.rttm.baseHttp, ENDPOINTS.rttm.dlq)
    );
  }
}

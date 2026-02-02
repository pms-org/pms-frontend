import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricCard, PipelineStage, DLQResponse, TelemetrySnapshot } from '../models/rttm.models';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable({
  providedIn: 'root',
})
export class RttmApiService {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  getMetrics(): Observable<MetricCard[]> {
    return this.http.get<MetricCard[]>(`${this.runtimeConfig.rttm.baseHttp}/api/rttm/metrics`);
  }

  getPipeline(): Observable<PipelineStage[]> {
    return this.http.get<PipelineStage[]>(`${this.runtimeConfig.rttm.baseHttp}/api/rttm/pipeline`);
  }

  getDlq(): Observable<DLQResponse> {
    return this.http.get<DLQResponse>(`${this.runtimeConfig.rttm.baseHttp}/api/rttm/dlq`);
  }

  getTelemetrySnapshot(): Observable<TelemetrySnapshot> {
    return this.http.get<TelemetrySnapshot>(
      `${this.runtimeConfig.rttm.baseHttp}/api/rttm/telemetry-snapshot`,
    );
  }
}

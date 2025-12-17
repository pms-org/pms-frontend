import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { RttmApiService } from '../services/rttm-api.service';
import { RttmWsMetricsService } from '../services/rttm-ws-metrics.service';
import { RttmWsPipelineService } from '../services/rttm-ws-pipeline.service';
import { RttmWsAlertsService } from '../services/rttm-ws-alerts.service';
import { MetricCard, PipelineStage, Alert, DLQError } from '../models/rttm.models';

interface RttmState {
  metrics: MetricCard[];
  pipeline: PipelineStage[];
  dlq: { total: number; lastError: string; errors: DLQError[] };
  alerts: Alert[];
  tpsTrend: number[];
  latencyMetrics: { label: string; value: number }[];
  kafkaLag: { partition: string; lag: number }[];
}

@Injectable({ providedIn: 'root' })
export class RttmStore {
  private readonly state$ = new BehaviorSubject<RttmState>({
    metrics: [],
    pipeline: [],
    dlq: { total: 0, lastError: '', errors: [] },
    alerts: [],
    tpsTrend: [],
    latencyMetrics: [],
    kafkaLag: []
  });

  readonly metrics$: Observable<MetricCard[]> = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.metrics)))
  );

  readonly pipeline$: Observable<PipelineStage[]> = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.pipeline)))
  );

  readonly dlq$ = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.dlq)))
  );

  readonly alerts$ = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.alerts)))
  );

  readonly tpsTrend$ = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.tpsTrend)))
  );

  readonly latencyMetrics$ = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.latencyMetrics)))
  );

  readonly kafkaLag$ = this.state$.pipe(
    (source) => new Observable(observer => source.subscribe(s => observer.next(s.kafkaLag)))
  );

  constructor(
    private readonly api: RttmApiService,
    private readonly metricsWs: RttmWsMetricsService,
    private readonly pipelineWs: RttmWsPipelineService,
    private readonly alertsWs: RttmWsAlertsService
  ) {}

  init(): void {
    this.loadInitialData();
    this.handleWebSockets();
  }

  private loadInitialData(): void {
    this.api.getMetrics()
      .pipe(catchError(() => of([] as MetricCard[])))
      .subscribe(metrics => this.updateState({ metrics }));

    this.api.getPipeline()
      .pipe(catchError(() => of([] as PipelineStage[])))
      .subscribe(pipeline => this.updateState({ pipeline }));

    this.api.getDlq()
      .pipe(catchError(() => of({ total: 0, lastError: '', errors: [] })))
      .subscribe(dlq => this.updateState({ dlq }));
  }

  private handleWebSockets(): void {
    this.metricsWs.stream()
      .pipe(catchError(() => of([] as MetricCard[])))
      .subscribe(metrics => this.updateState({ metrics }));

    this.pipelineWs.stream()
      .pipe(catchError(() => of([] as PipelineStage[])))
      .subscribe(pipeline => this.updateState({ pipeline }));

    this.alertsWs.stream()
      .pipe(catchError(() => of([] as Alert[])))
      .subscribe(alerts => this.updateState({ alerts }));
  }

  private updateState(partial: Partial<RttmState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}

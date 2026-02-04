import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RttmData,
  PipelineStage,
  DLQResponse,
  DLQError,
  MetricCard,
  TelemetrySnapshot,
} from '../../core/models/rttm.models';
import { MOCK_RTTM_DATA } from './mock-data';
import { RttmApiService } from '../../core/services/rttm-api.service';
import { RttmWsMetricsService } from '../../core/services/rttm-ws-metrics.service';
import { RttmWsPipelineService } from '../../core/services/rttm-ws-pipeline.service';
import { RttmWsTelemetryService } from '../../core/services/rttm-ws-telemetry.service';
import { RttmWsDlqService } from '../../core/services/rttm-ws-dlq.service';
import { RttmWsAlertsService } from '../../core/services/rttm-ws-alerts.service';
import { ConnectionStatusService } from '../../core/services/connection-status.service';
import { MetricCardsComponent } from './components/metric-cards.component';
import { PipelineFlowComponent } from './components/pipeline-flow.component';
import { ChartsComponent } from './components/charts.component';
import { DlqPanelComponent } from './components/dlq-panel.component';
import { AlertsPanelComponent } from './components/alerts-panel.component';
import { Summary24hComponent } from './components/summary-24h.component';
import { TradeSearchComponent } from './components/trade-search.component';

@Component({
  selector: 'app-rttm',
  standalone: true,
  imports: [
    CommonModule,
    MetricCardsComponent,
    PipelineFlowComponent,
    ChartsComponent,
    DlqPanelComponent,
    AlertsPanelComponent,
    Summary24hComponent,
    TradeSearchComponent,
  ],
  templateUrl: './rttm.page.html',
  styleUrls: ['./rttm.page.css'],
})
export class RttmPage implements OnInit, OnDestroy {
  private readonly rttmApi = inject(RttmApiService);
  private readonly metricsWs = inject(RttmWsMetricsService);
  private readonly pipelineWs = inject(RttmWsPipelineService);
  private readonly telemetryWs = inject(RttmWsTelemetryService);
  private readonly dlqWs = inject(RttmWsDlqService);
  private readonly alertsWs = inject(RttmWsAlertsService);
  private readonly connectionStatus = inject(ConnectionStatusService);

  data = signal<RttmData>(MOCK_RTTM_DATA);
  pipelineStages = signal<PipelineStage[]>([]);

  ngOnInit() {
    this.connectionStatus.setDisconnected();
    this.loadInitialData();
    this.connectWebSockets();
  }

  ngOnDestroy() {
    this.metricsWs.disconnect();
    this.pipelineWs.disconnect();
    this.telemetryWs.disconnect();
    this.dlqWs.disconnect();
    this.alertsWs.disconnect();
    this.connectionStatus.setDisconnected();
  }

  private loadInitialData() {
    this.loadPipelineData();
    this.loadMetricsData();
    this.loadDlqData();
    this.loadTelemetryData();
  }

  private connectWebSockets() {
    // Connect to metrics WebSocket after initial API load
    this.metricsWs.stream().subscribe({
      next: (metrics: MetricCard[]) => {
        this.connectionStatus.setWebSocketConnected();
        console.log('WebSocket metrics connected - switching to real-time updates');
        this.data.update((current) => ({ ...current, metrics }));
      },
      error: (error: any) => {
        console.error('WebSocket metrics error:', error);
        console.log('Falling back to API polling for metrics');
      },
    });

    // Connect to pipeline WebSocket after initial API load
    this.pipelineWs.stream().subscribe({
      next: (pipeline: PipelineStage[]) => {
        console.log('WebSocket pipeline connected - switching to real-time updates');
        this.pipelineStages.set(pipeline);
        this.data.update((current) => ({ ...current, pipeline }));
      },
      error: (error: any) => {
        console.error('WebSocket pipeline error:', error);
        console.log('Falling back to API polling for pipeline');
      },
    });

    // Connect to telemetry WebSocket
    this.telemetryWs.stream().subscribe({
      next: (message) => {
        switch (message.type) {
          case 'TPS_TREND':
            this.data.update(current => ({ ...current, tpsTrend: message.data }));
            break;
          case 'LATENCY_METRICS':
            this.data.update(current => ({ ...current, latencyMetrics: message.data }));
            break;
          case 'KAFKA_LAG':
            this.data.update(current => ({ ...current, kafkaLag: message.data }));
            break;
        }
      },
      error: (error) => {
        console.error('WebSocket telemetry error:', error);
      },
    });

    // Connect to DLQ WebSocket
    this.dlqWs.stream().subscribe({
      next: (dlqResponse: DLQResponse) => {
        const errors: DLQError[] = Object.entries(dlqResponse.byStage).map(([stage, count]) => ({
          stage,
          count,
        }));
        const now = Date.now();
        const timeAgo = Math.floor((now - (now - 6 * 60 * 1000)) / (60 * 1000));
        this.data.update((current) => ({
          ...current,
          dlq: {
            total: dlqResponse.total,
            lastError: `${timeAgo} min ago`,
            errors: errors,
          },
        }));
      },
      error: (error) => {
        console.error('WebSocket DLQ error:', error);
      },
    });

    // Connect to Alerts WebSocket
    this.alertsWs.stream().subscribe({
      next: (alerts) => {
        console.log('WebSocket alerts connected - switching to real-time updates');
        this.data.update((current) => ({ ...current, alerts }));
      },
      error: (error) => {
        console.error('WebSocket alerts error:', error);
      },
    });
  }

  private loadPipelineData() {
    this.rttmApi.getPipeline().subscribe({
      next: (stages) => {
        this.pipelineStages.set(stages);
        this.data.update((current) => ({
          ...current,
          pipeline: stages,
        }));
      },
      error: (error) => {
        console.error('Failed to load pipeline data:', error);
        // Use mock data as fallback
        this.data.update((current) => ({
          ...current,
          pipeline: MOCK_RTTM_DATA.pipeline,
        }));
      },
    });
  }

  private loadMetricsData() {
    this.rttmApi.getMetrics().subscribe({
      next: (metrics) => {
        this.connectionStatus.setApiConnected();
        this.data.update((current) => ({
          ...current,
          metrics: metrics,
        }));
      },
      error: (error) => {
        console.error('Failed to load metrics data:', error);
        // Use mock data as fallback
        this.data.update((current) => ({
          ...current,
          metrics: MOCK_RTTM_DATA.metrics,
        }));
      },
    });
  }

  private loadDlqData() {
    this.rttmApi.getDlq().subscribe({
      next: (dlqResponse) => {
        const errors: DLQError[] = Object.entries(dlqResponse.byStage).map(([stage, count]) => ({
          stage,
          count,
        }));

        const now = Date.now();
        const timeAgo = Math.floor((now - (now - 6 * 60 * 1000)) / (60 * 1000));

        this.data.update((current) => ({
          ...current,
          dlq: {
            total: dlqResponse.total,
            lastError: `${timeAgo} min ago`,
            errors: errors,
          },
        }));
      },
      error: (error) => {
        console.error('Failed to load DLQ data:', error);
        this.data.update((current) => ({
          ...current,
          dlq: MOCK_RTTM_DATA.dlq,
        }));
      },
    });
  }

  private loadTelemetryData() {
    this.rttmApi.getTelemetrySnapshot().subscribe({
      next: (telemetry: TelemetrySnapshot) => {
        this.data.update((current) => ({
          ...current,
          tpsTrend: telemetry.tpsTrend,
          latencyMetrics: telemetry.latencyMetrics,
          kafkaLag: telemetry.kafkaLag,
        }));
      },
      error: (error) => {
        console.error('Failed to load telemetry data:', error);
        this.data.update((current) => ({
          ...current,
          tpsTrend: MOCK_RTTM_DATA.tpsTrend,
          latencyMetrics: MOCK_RTTM_DATA.latencyMetrics,
          kafkaLag: MOCK_RTTM_DATA.kafkaLag,
        }));
      },
    });
  }
}

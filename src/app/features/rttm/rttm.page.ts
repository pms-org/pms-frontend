import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RttmData,
  PipelineStage,
  DLQResponse,
  DLQError,
  MetricCard,
} from '../../core/models/rttm.models';
import { MOCK_RTTM_DATA } from './mock-data';
import { RttmApiService } from '../../core/services/rttm-api.service';
import { RttmWsMetricsService } from '../../core/services/rttm-ws-metrics.service';
import { RttmWsPipelineService } from '../../core/services/rttm-ws-pipeline.service';
import { MetricCardsComponent } from './components/metric-cards.component';
import { PipelineFlowComponent } from './components/pipeline-flow.component';
import { ChartsComponent } from './components/charts.component';
import { DlqPanelComponent } from './components/dlq-panel.component';
import { AlertsPanelComponent } from './components/alerts-panel.component';

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
  ],
  templateUrl: './rttm.page.html',
  styleUrls: ['./rttm.page.css'],
})
export class RttmPage implements OnInit, OnDestroy {
  private readonly rttmApi = inject(RttmApiService);
  private readonly metricsWs = inject(RttmWsMetricsService);
  private readonly pipelineWs = inject(RttmWsPipelineService);

  data = signal<RttmData>(MOCK_RTTM_DATA);
  pipelineStages = signal<PipelineStage[]>([]);

  ngOnInit() {
    this.loadInitialData();
    this.connectWebSockets();
  }

  ngOnDestroy() {
    // WebSocket connections will be automatically closed
  }

  private loadInitialData() {
    this.loadPipelineData();
    this.loadMetricsData();
    this.loadDlqData();
  }

  private connectWebSockets() {
    // Connect to metrics WebSocket after initial API load
    this.metricsWs.stream().subscribe({
      next: (metrics: MetricCard[]) => {
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
        this.data.update((current) => ({
          ...current,
          metrics: metrics,
        }));
      },
      error: (error) => {
        console.error('Failed to load metrics data:', error);
        // TODO: CHANGE THIS :> Use mock data as fallback
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
}

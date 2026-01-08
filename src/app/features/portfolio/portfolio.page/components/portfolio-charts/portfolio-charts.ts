import { Component, input, output, AfterViewInit, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PortfolioSectorSlice } from '../../../../../core/models/portfolio-ui.models';
import { PnlTrendPoint } from '../../../../../core/models/ui.models';
// import { PortfolioSectorSlice } from '../../../../../../core/models/portfolio-ui.models';
// import { PnlTrendPoint } from '../../../../../../core/models/ui.models';

Chart.register(...registerables);

@Component({
  selector: 'app-portfolio-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-charts.html'
})
export class PortfolioChartsComponent implements AfterViewInit, OnDestroy {
  sectors = input<PortfolioSectorSlice[]>([]);
  liveTrend = input<PnlTrendPoint[]>([]); // Chart 2
  historyTrend = input<PnlTrendPoint[]>([]); // Chart 3

  sectorClicked = output<string>();

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('liveCanvas') liveCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('historyCanvas') historyCanvas!: ElementRef<HTMLCanvasElement>;

  private donut?: Chart;
  private liveChart?: Chart;
  private historyChart?: Chart;
  private ready = false;

  constructor() {
    effect(() => this.syncDonut(this.sectors()));
    effect(() => this.syncLiveChart(this.liveTrend()));
    effect(() => this.syncHistoryChart(this.historyTrend()));
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.syncDonut(this.sectors());
    this.syncLiveChart(this.liveTrend());
    this.syncHistoryChart(this.historyTrend());
  }

  ngOnDestroy(): void {
    this.donut?.destroy();
    this.liveChart?.destroy();
    this.historyChart?.destroy();
  }

  // --- Chart 1: Donut ---
  private syncDonut(sectors: PortfolioSectorSlice[]) {
    if (!this.ready || !this.donutCanvas) return;
    if (!this.donut) {
      this.donut = new Chart(this.donutCanvas.nativeElement, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], borderWidth: 0 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          onClick: (_evt, els) => {
            if (els.length) this.sectorClicked.emit(this.donut?.data.labels?.[els[0].index] as string);
          }
        }
      });
    }
    this.donut.data.labels = sectors.map(s => s.sector);
    this.donut.data.datasets[0].data = sectors.map(s => s.pct);
    this.donut.update();
  }

  // --- Chart 2: Live PnL Trend ---
  private syncLiveChart(trend: PnlTrendPoint[]) {
    if (!this.ready || !this.liveCanvas) return;
    if (!this.liveChart) {
      this.liveChart = new Chart(this.liveCanvas.nativeElement, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Real-Time PnL', data: [], borderColor: '#10b981', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
    this.liveChart.data.labels = trend.map(t => t.label);
    this.liveChart.data.datasets[0].data = trend.map(t => t.value);
    this.liveChart.update('none'); // 'none' for smoother animation
  }

  // --- Chart 3: 30-Day History ---
  private syncHistoryChart(trend: PnlTrendPoint[]) {
    if (!this.ready || !this.historyCanvas) return;
    if (!this.historyChart) {
      this.historyChart = new Chart(this.historyCanvas.nativeElement, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Portfolio Value', data: [], borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
    this.historyChart.data.labels = trend.map(t => t.label);
    this.historyChart.data.datasets[0].data = trend.map(t => t.value);
    this.historyChart.update();
  }
}
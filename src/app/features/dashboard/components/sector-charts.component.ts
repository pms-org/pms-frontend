import {
  Component,
  input,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectorExposure, PnlTrendPoint } from '../../../core/models/ui.models';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-sector-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sector-charts.component.html',
  styleUrls: ['./sector-charts.component.css']
})
export class SectorChartsComponent implements AfterViewInit, OnDestroy {
  sectorExposure = input<SectorExposure[]>([]);
  pnlTrend = input<PnlTrendPoint[]>([]);

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  private donutChart?: Chart;
  private lineChart?: Chart;
  private viewReady = false;

  topSector = '';
  lowestSector = '';

  constructor() {
    effect(() => this.syncSectorCharts(this.sectorExposure()));
    effect(() => this.syncTrendChart(this.pnlTrend()));
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.syncSectorCharts(this.sectorExposure());
    this.syncTrendChart(this.pnlTrend());
  }

  ngOnDestroy() {
    this.donutChart?.destroy();
    this.lineChart?.destroy();
  }

  private syncSectorCharts(sectors: SectorExposure[]) {
    this.setSectorBadges(sectors);
    if (!this.viewReady) {
      return;
    }

    if (!this.donutChart) {
      this.initDonutChart(sectors);
      return;
    }

    this.donutChart.data.labels = sectors.map((s) => s.sector);
    (this.donutChart.data.datasets[0].data as number[]) = sectors.map((s) => s.pct);
    this.donutChart.update();
  }

  private syncTrendChart(trend: PnlTrendPoint[]) {
    if (!this.viewReady) {
      return;
    }

    if (!this.lineChart) {
      this.initLineChart(trend);
      return;
    }

    this.lineChart.data.labels = trend.map((p) => p.label);
    (this.lineChart.data.datasets[0].data as number[]) = trend.map((p) => p.value);
    this.lineChart.update();
  }

  private initDonutChart(sectors: SectorExposure[]) {
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: sectors.map((s) => s.sector),
        datasets: [
          {
            data: sectors.map((s) => s.pct),
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    };
    this.donutChart = new Chart(this.donutCanvas.nativeElement, config);
  }

  private initLineChart(trend: PnlTrendPoint[]) {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: trend.map((p) => p.label),
        datasets: [
          {
            label: 'PnL',
            data: trend.map((p) => p.value),
            borderWidth: 2,
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#9ca3af' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#9ca3af' }
          }
        }
      }
    };
    this.lineChart = new Chart(this.lineCanvas.nativeElement, config);
  }

  private setSectorBadges(sectors: SectorExposure[]) {
    if (sectors.length > 0) {
      const sorted = [...sectors].sort((a, b) => b.pct - a.pct);
      this.topSector = sorted[0].sector;
      this.lowestSector = sorted[sorted.length - 1].sector;
    } else {
      this.topSector = '';
      this.lowestSector = '';
    }
  }
}

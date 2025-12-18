import { Component, input, output, AfterViewInit, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PortfolioSectorSlice } from '../../../../../core/models/portfolio-ui.models';
import { PnlTrendPoint } from '../../../../../core/models/ui.models';

Chart.register(...registerables);
@Component({
  selector: 'app-portfolio-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-charts.html'
})
export class PortfolioChartsComponent implements AfterViewInit, OnDestroy {
  sectors = input<PortfolioSectorSlice[]>([]);
  pnlTrend = input<PnlTrendPoint[]>([]);

  // ✅ NEW: emit sector name on donut click
  sectorClicked = output<string>();

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  private donut?: Chart;
  private line?: Chart;
  private ready = false;

  constructor() {
    effect(() => this.syncDonut(this.sectors()));
    effect(() => this.syncLine(this.pnlTrend()));
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.syncDonut(this.sectors());
    this.syncLine(this.pnlTrend());
  }

  ngOnDestroy(): void {
    this.donut?.destroy();
    this.line?.destroy();
  }

  private syncDonut(sectors: PortfolioSectorSlice[]) {
    if (!this.ready) return;

    if (!this.donut) {
      const cfg: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: sectors.map(s => s.sector),
          datasets: [{ data: sectors.map(s => s.pct), borderWidth: 0 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },

          // ✅ pointer cursor on hover
          onHover: (evt, elements) => {
            const canvas = (evt?.native?.target as HTMLCanvasElement) ?? this.donutCanvas?.nativeElement;
            if (!canvas) return;
            canvas.style.cursor = elements?.length ? 'pointer' : 'default';
          },

          // ✅ open modal on click
          onClick: (_evt, elements) => {
            if (!elements?.length) return;
            const idx = elements[0].index;
            const sector = (this.donut?.data.labels?.[idx] as string) ?? '';
            if (sector) this.sectorClicked.emit(sector);
          }
        }
      };

      this.donut = new Chart(this.donutCanvas.nativeElement, cfg);
      return;
    }

    this.donut.data.labels = sectors.map(s => s.sector);
    (this.donut.data.datasets[0].data as number[]) = sectors.map(s => s.pct);
    this.donut.update();
  }

  private syncLine(trend: PnlTrendPoint[]) {
    if (!this.ready) return;

    if (!this.line) {
      const cfg: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: trend.map(t => t.label),
          datasets: [{ label: 'PnL', data: trend.map(t => t.value), borderWidth: 2, tension: 0.35, fill: false }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      };
      this.line = new Chart(this.lineCanvas.nativeElement, cfg);
      return;
    }

    this.line.data.labels = trend.map(t => t.label);
    (this.line.data.datasets[0].data as number[]) = trend.map(t => t.value);
    this.line.update();
  }
}

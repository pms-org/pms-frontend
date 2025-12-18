import { Component, input, AfterViewInit, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PortfolioSectorSlice } from '../../../../../core/models/portfolio-ui.models';

Chart.register(...registerables);

@Component({
  selector: 'app-portfolio-sector-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-sector-chart.html'
})
export class PortfolioSectorChartComponent implements AfterViewInit, OnDestroy {
  sectors = input<PortfolioSectorSlice[]>([]);

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private ready = false;

  constructor() {
    effect(() => this.sync(this.sectors()));
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.sync(this.sectors());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private sync(sectors: PortfolioSectorSlice[]) {
    if (!this.ready) return;

    if (!this.chart) {
      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: sectors.map(s => s.sector),
          datasets: [{ data: sectors.map(s => s.pct), borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      };
      this.chart = new Chart(this.canvas.nativeElement, config);
      return;
    }

    this.chart.data.labels = sectors.map(s => s.sector);
    (this.chart.data.datasets[0].data as number[]) = sectors.map(s => s.pct);
    this.chart.update();
  }
}

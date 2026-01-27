import { Component, input, output, AfterViewInit, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';

Chart.register(...registerables);

export interface SectorSymbolRow {
  symbol: string;
  percentage: number;
  holdings: number;
  totalInvested: number;
  realisedPnl: number;
}

@Component({
  selector: 'app-sector-modal',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './sector-modal.html'
})
export class SectorModalComponent implements AfterViewInit, OnDestroy {
  sectorName = input<string>('');
  rows = input<SectorSymbolRow[]>([]);
  closed = output<void>();

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private ready = false;

  constructor() {
    effect(() => this.sync(this.rows()));
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.sync(this.rows());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  close(): void {
    this.closed.emit();
  }

  private sync(rows: SectorSymbolRow[]) {
    if (!this.ready || !this.canvas) return;

    const labels = rows.map(r => r.symbol);
    const values = rows.map(r => r.holdings);

    if (!this.chart) {
      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      };
      this.chart = new Chart(this.canvas.nativeElement, config);
      return;
    }

    this.chart.data.labels = labels;
    (this.chart.data.datasets[0].data as number[]) = values;
    this.chart.update();
  }
}

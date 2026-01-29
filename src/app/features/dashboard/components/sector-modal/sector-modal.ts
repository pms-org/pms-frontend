import { Component, input, output, AfterViewInit, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  exportPDF(): void {
    const doc = new jsPDF();
    const sector = this.sectorName();
    const rows = this.rows();

    doc.setFontSize(18);
    doc.text(`Sector Breakdown - ${sector}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Symbol', '%', 'Holdings', 'Total Invested', 'Realized PnL']],
      body: rows.map(r => [
        r.symbol,
        `${r.percentage.toFixed(1)}%`,
        r.holdings.toString(),
        `$${r.totalInvested.toLocaleString()}`,
        `$${r.realisedPnl.toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`sector-breakdown-${sector}-${Date.now()}.pdf`);
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

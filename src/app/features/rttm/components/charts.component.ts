import { Component, input, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements AfterViewInit {
  tpsTrend = input<number[]>([]);
  latencyMetrics = input<{ label: string; value: number }[]>([]);
  kafkaLag = input<{ partition: string; lag: number }[]>([]);

  @ViewChild('tpsCanvas') tpsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('latencyCanvas') latencyCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('kafkaCanvas') kafkaCanvas!: ElementRef<HTMLCanvasElement>;

  private tpsChart?: Chart;
  private latencyChart?: Chart;
  private kafkaChart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => this.updateTpsChart(this.tpsTrend()));
    effect(() => this.updateLatencyChart(this.latencyMetrics()));
    effect(() => this.updateKafkaChart(this.kafkaLag()));
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.updateTpsChart(this.tpsTrend());
    this.updateLatencyChart(this.latencyMetrics());
    this.updateKafkaChart(this.kafkaLag());
  }

  private updateTpsChart(data: number[]) {
    if (!this.viewReady || !data) return;

    if (!this.tpsChart) {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: data.map((_, i) => `T${i + 1}`),
          datasets: [{
            data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
          }
        }
      };
      this.tpsChart = new Chart(this.tpsCanvas.nativeElement, config);
    } else {
      this.tpsChart.data.labels = data.map((_, i) => `T${i + 1}`);
      (this.tpsChart.data.datasets[0].data as number[]) = data;
      this.tpsChart.update();
    }
  }

  private updateLatencyChart(data: { label: string; value: number }[]) {
    if (!this.viewReady || !data) return;

    if (!this.latencyChart) {
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            data: data.map(d => d.value),
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
          }
        }
      };
      this.latencyChart = new Chart(this.latencyCanvas.nativeElement, config);
    } else {
      this.latencyChart.data.labels = data.map(d => d.label);
      (this.latencyChart.data.datasets[0].data as number[]) = data.map(d => d.value);
      this.latencyChart.update();
    }
  }

  private updateKafkaChart(data: { partition: string; lag: number }[]) {
    if (!this.viewReady || !data) return;

    if (!this.kafkaChart) {
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: data.map(d => d.partition),
          datasets: [{
            data: data.map(d => d.lag),
            backgroundColor: '#8b5cf6',
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
          }
        }
      };
      this.kafkaChart = new Chart(this.kafkaCanvas.nativeElement, config);
    } else {
      this.kafkaChart.data.labels = data.map(d => d.partition);
      (this.kafkaChart.data.datasets[0].data as number[]) = data.map(d => d.lag);
      this.kafkaChart.update();
    }
  }
}

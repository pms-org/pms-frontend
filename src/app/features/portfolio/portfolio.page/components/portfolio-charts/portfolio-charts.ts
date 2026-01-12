import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
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
export class PortfolioChartsComponent implements AfterViewInit, OnDestroy, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  
  @Input() sectors: PortfolioSectorSlice[] = [];
  @Input() liveTrend: PnlTrendPoint[] = [];
  @Input() historyTrend: PnlTrendPoint[] = [];

  @Output() sectorClicked = new EventEmitter<string>();

  @ViewChild('sectorCanvas') sectorCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('liveCanvas') liveCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('historyCanvas') historyCanvasRef!: ElementRef<HTMLCanvasElement>;

  private donut?: Chart;
  private liveChart?: Chart;
  private historyChart?: Chart;
  private ready = false;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 Chart component OnChanges:', changes);
    console.log('🔄 Component ready state:', this.ready);
    console.log('🔄 Current data lengths:', {
      sectors: this.sectors?.length || 0,
      liveTrend: this.liveTrend?.length || 0,
      historyTrend: this.historyTrend?.length || 0
    });
    
    // Always try to update charts when data changes, even if not ready yet
    if (changes['sectors'] && this.sectors && this.sectors.length > 0) {
      console.log('🍩 Queuing donut chart update with', this.sectors.length, 'sectors');
      setTimeout(() => this.syncDonut(this.sectors), this.ready ? 0 : 200);
    }
    if (changes['liveTrend'] && this.liveTrend && this.liveTrend.length > 0) {
      console.log('📈 Queuing live chart update with', this.liveTrend.length, 'points');
      setTimeout(() => this.syncLiveChart(this.liveTrend), this.ready ? 0 : 200);
    }
    if (changes['historyTrend'] && this.historyTrend && this.historyTrend.length > 0) {
      console.log('📉 Queuing history chart update with', this.historyTrend.length, 'points');
      setTimeout(() => this.syncHistoryChart(this.historyTrend), this.ready ? 0 : 200);
    }
  }

  ngAfterViewInit(): void {
    console.log('📊 Chart component AfterViewInit - Canvas elements:', {
      sector: !!this.sectorCanvasRef?.nativeElement,
      live: !!this.liveCanvasRef?.nativeElement,
      history: !!this.historyCanvasRef?.nativeElement
    });
    
    this.ready = true;
    console.log('📊 Chart component ready. Current data:', {
      sectors: this.sectors.length,
      liveTrend: this.liveTrend.length,
      historyTrend: this.historyTrend.length
    });
    
    // Ensure DOM is fully rendered before creating charts
    setTimeout(() => {
      this.initializeCharts();
    }, 150);
  }

  private initializeCharts(): void {
    console.log('🎯 Initializing charts...');
    
    if (this.sectors.length > 0) {
      console.log('🍩 Initial donut sync with', this.sectors.length, 'sectors');
      this.syncDonut(this.sectors);
    }
    if (this.liveTrend.length > 0) {
      console.log('📈 Initial live sync with', this.liveTrend.length, 'points');
      this.syncLiveChart(this.liveTrend);
    }
    if (this.historyTrend.length > 0) {
      console.log('📉 Initial history sync with', this.historyTrend.length, 'points');
      this.syncHistoryChart(this.historyTrend);
    }
  }

  ngOnDestroy(): void {
    this.donut?.destroy();
    this.liveChart?.destroy();
    this.historyChart?.destroy();
  }

  // Public method to manually trigger chart updates
  public forceChartUpdate(): void {
    console.log('🔄 Force chart update called');
    setTimeout(() => {
      if (this.sectors.length > 0) {
        console.log('🍩 Force updating donut with', this.sectors.length, 'sectors');
        this.syncDonut(this.sectors);
      }
      if (this.liveTrend.length > 0) {
        console.log('📈 Force updating live with', this.liveTrend.length, 'points');
        this.syncLiveChart(this.liveTrend);
      }
      if (this.historyTrend.length > 0) {
        console.log('📉 Force updating history with', this.historyTrend.length, 'points');
        this.syncHistoryChart(this.historyTrend);
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private syncDonut(sectors: PortfolioSectorSlice[]) {
    console.log('🍩 syncDonut called with:', sectors);
    const canvas = this.sectorCanvasRef?.nativeElement;
    
    if (!canvas) {
      console.error('❌ Donut canvas not found');
      return;
    }
    
    if (sectors.length === 0) {
      console.log('⚠️ No sectors data available');
      return;
    }
    
    console.log('🍩 Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    if (!this.donut) {
      console.log('🍩 Creating new donut chart');
      this.donut = new Chart(canvas, {
        type: 'doughnut',
        data: { 
          labels: [], 
          datasets: [{ 
            data: [], 
            borderWidth: 2,
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
              '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
            ]
          }] 
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.parsed}%`
              }
            }
          },
          onClick: (_evt, els) => {
            if (els.length) {
              const index = els[0].index;
              const label = this.donut?.data.labels?.[index] as string;
              if (label) this.sectorClicked.emit(label);
            }
          }
        }
      });
    }
    
    this.donut.data.labels = sectors.map(s => s.sector);
    this.donut.data.datasets[0].data = sectors.map(s => s.pct);
    console.log('🍩 Donut chart updated with labels:', this.donut.data.labels, 'data:', this.donut.data.datasets[0].data);
    this.donut.resize();
    this.donut.update('active');
  }

  private syncLiveChart(trend: PnlTrendPoint[]) {
    console.log('📈 syncLiveChart called with:', trend.length, 'points');
    const canvas = this.liveCanvasRef?.nativeElement;
    
    if (!canvas) {
      console.error('❌ Live canvas not found');
      return;
    }
    
    if (trend.length === 0) {
      console.log('⚠️ No live trend data available');
      return;
    }
    
    if (!this.liveChart) {
      console.log('📈 Creating new live chart');
      this.liveChart = new Chart(canvas, {
        type: 'line',
        data: { 
          labels: [], 
          datasets: [{ 
            label: 'Real-Time PnL', 
            data: [], 
            borderColor: '#10b981', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { legend: { display: false } },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#9ca3af' }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#9ca3af' }
            }
          }
        }
      });
    }
    
    this.liveChart.data.labels = trend.map(t => t.label);
    this.liveChart.data.datasets[0].data = trend.map(t => t.value);
    console.log('📈 Live chart updated with', trend.length, 'data points');
    this.liveChart.resize();
    this.liveChart.update('none');
  }

  private syncHistoryChart(trend: PnlTrendPoint[]) {
    console.log('📉 syncHistoryChart called with:', trend.length, 'points');
    const canvas = this.historyCanvasRef?.nativeElement;
    
    if (!canvas) {
      console.error('❌ History canvas not found');
      return;
    }
    
    if (trend.length === 0) {
      console.log('⚠️ No history trend data available');
      return;
    }
    
    if (!this.historyChart) {
      console.log('📉 Creating new history chart');
      this.historyChart = new Chart(canvas, {
        type: 'line',
        data: { 
          labels: [], 
          datasets: [{ 
            label: 'Portfolio Value', 
            data: [], 
            borderColor: '#3b82f6', 
            fill: true, 
            backgroundColor: 'rgba(59,130,246,0.1)',
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 4
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { legend: { display: false } },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#9ca3af' }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#9ca3af' }
            }
          }
        }
      });
    }
    
    this.historyChart.data.labels = trend.map(t => t.label);
    this.historyChart.data.datasets[0].data = trend.map(t => t.value);
    console.log('📉 History chart updated with', trend.length, 'data points');
    this.historyChart.resize();
    this.historyChart.update();
  }
}
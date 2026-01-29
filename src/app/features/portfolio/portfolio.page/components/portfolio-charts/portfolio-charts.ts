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
  @Input() dataSource: 'websocket' | 'api' | 'none' = 'none';

  @Output() sectorClicked = new EventEmitter<string>();

  @ViewChild('sectorCanvas') sectorCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('liveCanvas') liveCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('historyCanvas') historyCanvasRef!: ElementRef<HTMLCanvasElement>;

  private donut?: Chart;
  private liveChart?: Chart;
  private historyChart?: Chart;
  private viewReady = false;
  private chartsInitialized = { donut: false, live: false, history: false };

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 ngOnChanges triggered:', changes);
    
    if (changes['sectors']) {
      console.log('🍩 Sectors input changed:', {
        currentValue: changes['sectors'].currentValue,
        previousValue: changes['sectors'].previousValue,
        sectorsLength: this.sectors?.length || 0
      });
      if (this.sectors?.length > 0) {
        console.log('📊 Chart initialization state:', {
          viewReady: this.viewReady,
          chartsInitialized: this.chartsInitialized.donut,
          canvasExists: !!this.sectorCanvasRef?.nativeElement
        });
        if (this.viewReady && this.chartsInitialized.donut) {
          this.syncDonut(this.sectors);
        } else {
          this.initializeChartIfReady('donut');
        }
      }
    }
    
    if (changes['liveTrend']) {
      console.log('📈 Live trend changed:', this.liveTrend?.length || 0, 'points', this.liveTrend);
      if (this.viewReady) {
        this.syncLiveChart(this.liveTrend);
      }
    }
    
    if (changes['historyTrend'] && this.historyTrend?.length > 0) {
      console.log('📉 History trend changed:', this.historyTrend.length, 'points');
      if (this.viewReady && this.chartsInitialized.history) {
        this.syncHistoryChart(this.historyTrend);
      } else {
        this.initializeChartIfReady('history');
      }
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    console.log('🔧 View initialized, sectors available:', this.sectors?.length || 0);
    console.log('🔧 Live trend available:', this.liveTrend?.length || 0);
    console.log('🔧 History trend available:', this.historyTrend?.length || 0);
    
    // Try to initialize any charts that have data ready
    this.initializeChartIfReady('donut');
    this.initializeChartIfReady('live');
    this.initializeChartIfReady('history');
    
    // Force check after a short delay to handle timing issues
    setTimeout(() => {
      console.log('⏰ Delayed check - sectors:', this.sectors?.length || 0, 'live:', this.liveTrend?.length || 0);
      if (this.sectors?.length > 0 && !this.chartsInitialized.donut) {
        console.log('🔄 Force initializing donut chart');
        this.initializeChartIfReady('donut');
      }
      if (this.liveTrend?.length > 0 && !this.liveChart) {
        console.log('🔄 Force initializing live chart');
        this.syncLiveChart(this.liveTrend);
      }
    }, 100);
  }

  private initializeChartIfReady(type: 'donut' | 'live' | 'history'): void {
    console.log(`🔍 Checking ${type} chart:`, {
      viewReady: this.viewReady,
      alreadyInitialized: this.chartsInitialized[type],
      hasData: this.hasDataForChart(type)
    });
    
    if (!this.viewReady || this.chartsInitialized[type]) return;
    
    const hasData = this.hasDataForChart(type);
    if (!hasData) return;
    
    console.log(`✅ Initializing ${type} chart`);
    this.chartsInitialized[type] = true;
    this.createChart(type);
  }
  
  private hasDataForChart(type: 'donut' | 'live' | 'history'): boolean {
    const result = {
      donut: this.sectors?.length > 0,
      live: this.liveTrend?.length > 0,
      history: this.historyTrend?.length > 0
    }[type];
    
    console.log(`📊 hasDataForChart(${type}):`, {
      result,
      sectorsLength: this.sectors?.length || 0,
      liveTrendLength: this.liveTrend?.length || 0,
      historyTrendLength: this.historyTrend?.length || 0
    });
    
    return result;
  }
  
  private createChart(type: 'donut' | 'live' | 'history'): void {
    switch (type) {
      case 'donut': this.syncDonut(this.sectors); break;
      case 'live': this.syncLiveChart(this.liveTrend); break;
      case 'history': this.syncHistoryChart(this.historyTrend); break;
    }
  }

  ngOnDestroy(): void {
    this.donut?.destroy();
    this.liveChart?.destroy();
    this.historyChart?.destroy();
  }

  public forceChartUpdate(): void {
    console.log('🔄 forceChartUpdate called, current data:', {
      sectors: this.sectors?.length || 0,
      liveTrend: this.liveTrend?.length || 0,
      historyTrend: this.historyTrend?.length || 0
    });
    
    // Reset initialization flags to allow re-creation
    this.chartsInitialized = { donut: false, live: false, history: false };
    
    this.initializeChartIfReady('donut');
    this.initializeChartIfReady('live');
    this.initializeChartIfReady('history');
  }

  onSectorClick(sector: string): void {
    console.log('🎯 Sector clicked:', sector);
    this.sectorClicked.emit(sector);
  }

  private syncDonut(sectors: PortfolioSectorSlice[]) {
    const canvas = this.sectorCanvasRef?.nativeElement;
    console.log('🍩 syncDonut called:', { canvas: !!canvas, sectorsLength: sectors.length, sectors });
    
    if (!canvas) {
      console.error('❌ Canvas not found for sector chart');
      return;
    }
    
    if (sectors.length === 0) {
      console.warn('⚠️ No sector data to display');
      return;
    }
    
    this.donut?.destroy();
    
    console.log('🎨 Creating doughnut chart with data:', {
      labels: sectors.map(s => s.sector),
      data: sectors.map(s => s.pct)
    });
    
    this.donut = new Chart(canvas, {
      type: 'doughnut',
      data: { 
        labels: sectors.map(s => s.sector), 
        datasets: [{ 
          data: sectors.map(s => s.pct), 
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        }] 
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const sector = sectors[index].sector;
            console.log('🎯 Chart clicked, sector:', sector);
            this.onSectorClick(sector);
          }
        }
      }
    });
    
    console.log('✅ Doughnut chart created successfully');
  }

  private syncLiveChart(trend: PnlTrendPoint[]) {
    const canvas = this.liveCanvasRef?.nativeElement;
    console.log('📈 syncLiveChart called:', { canvas: !!canvas, trendLength: trend?.length || 0, dataSource: this.dataSource });
    
    if (!canvas) {
      console.warn('⚠️ Live chart canvas not available');
      return;
    }
    
    if (!trend || trend.length === 0) {
      console.log('📈 No trend data yet, waiting...');
      return;
    }
    
    // Determine color based on data source
    const colors = {
      websocket: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      api: { border: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
      none: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
    };
    const color = colors[this.dataSource];
    
    if (!this.liveChart) {
      console.log('✨ Creating new live PnL chart with', trend.length, 'points, source:', this.dataSource);
      this.liveChart = new Chart(canvas, {
        type: 'line',
        data: { 
          labels: trend.map(t => t.label), 
          datasets: [{ 
            label: 'Real-Time PnL', 
            data: trend.map(t => t.value), 
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.4,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          animation: { duration: 300 },
          plugins: { 
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => `PnL: $${context.parsed.y?.toFixed(2) ?? '0.00'}`
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { 
                color: '#9ca3af',
                callback: (value) => `$${Number(value).toFixed(0)}`
              }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { 
                color: '#9ca3af', 
                maxRotation: 45, 
                minRotation: 45,
                maxTicksLimit: 10
              }
            }
          }
        }
      });
      console.log('✅ Live chart created successfully');
    } else {
      console.log('🔄 Updating live chart with', trend.length, 'points, source:', this.dataSource);
      this.liveChart.data.labels = trend.map(t => t.label);
      this.liveChart.data.datasets[0].data = trend.map(t => t.value);
      this.liveChart.data.datasets[0].borderColor = color.border;
      this.liveChart.data.datasets[0].backgroundColor = color.bg;
      this.liveChart.update('active');
      console.log('✅ Live chart updated');
    }
  }

  private syncHistoryChart(trend: PnlTrendPoint[]) {
    const canvas = this.historyCanvasRef?.nativeElement;
    console.log('📉 syncHistoryChart called:', { canvas: !!canvas, trendLength: trend.length });
    
    if (!canvas || trend.length === 0) return;
    
    if (!this.historyChart) {
      console.log('✨ Creating new history chart');
      this.historyChart = new Chart(canvas, {
        type: 'line',
        data: { 
          labels: trend.map(t => t.label), 
          datasets: [{ 
            label: 'Portfolio Value', 
            data: trend.map(t => t.value), 
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
              ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }
            }
          }
        }
      });
    } else {
      console.log('🔄 Updating existing history chart with', trend.length, 'points');
      this.historyChart.data.labels = trend.map(t => t.label);
      this.historyChart.data.datasets[0].data = trend.map(t => t.value);
      this.historyChart.update('none');
    }
  }
}
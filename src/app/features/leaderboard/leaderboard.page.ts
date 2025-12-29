import { Component, signal, ViewChild, ElementRef, AfterViewInit, effect, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardTableComponent } from './components/leaderboard-table.component';
import { Portfolio } from '../../core/models/leaderboard.models';
import { LeaderboardApiService } from '../../core/services/leaderboard-api.service';
import { LeaderboardWsService } from '../../core/services/leaderboard-ws.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

type SortOption = 'rank' | 'compositeScore' | 'avgReturn';
type EndpointOption = 'all' | 'top' | 'around';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaderboardTableComponent],
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.css']
})
export class LeaderboardPage implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  private leaderboardApi = inject(LeaderboardApiService);
  private leaderboardWs = inject(LeaderboardWsService);
  private wsSubscription?: Subscription;

  portfolios = signal<Portfolio[]>([]);
  filteredPortfolios = signal<Portfolio[]>([]);
  selectedPortfolio = signal<Portfolio | null>(null);
  
  searchTerm = signal('');
  sortBy = signal<SortOption>('rank');
  endpointOption = signal<EndpointOption>('all');
  
  // User input fields
  topValue = signal(3);
  portfolioId = signal('b8ee55ff-2222-4e53-b0c9-555599775533');
  range = signal(1);

  private trendChart?: Chart;
  private donutChart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      const portfolio = this.selectedPortfolio();
      if (portfolio && this.viewReady) {
        this.updateCharts(portfolio);
      }
    });
  }

  ngOnInit() {
    console.log('LeaderboardPage initialized');
    console.log('Current endpoint option:', this.endpointOption());
    
    // Test WebSocket server availability first
    this.leaderboardWs.isServerAvailable().then((available: boolean) => {
      console.log('WebSocket server available:', available);
      this.loadData();
    });
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    const portfolio = this.selectedPortfolio();
    if (portfolio) {
      this.updateCharts(portfolio);
    }
  }



  onEndpointChange(option: EndpointOption) {
    this.wsSubscription?.unsubscribe();
    this.endpointOption.set(option);
    this.loadData();
  }

  onTopValueChange(value: number) {
    this.topValue.set(value);
    if (this.endpointOption() === 'top') {
      this.loadData();
    }
  }

  onPortfolioIdChange(id: string) {
    this.portfolioId.set(id);
    if (this.endpointOption() === 'around') {
      this.loadData();
    }
  }

  onRangeChange(range: number) {
    this.range.set(range);
    if (this.endpointOption() === 'around') {
      this.loadData();
    }
  }

  private loadData() {
    const option = this.endpointOption();
    console.log('Loading data for option:', option);
    
    if (option === 'all') {
      // Try WebSocket first, fallback to HTTP API
      this.wsSubscription = this.leaderboardWs.stream().subscribe({
        next: data => {
          console.log('WebSocket data:', data);
          this.handleWsResponse(data);
        },
        error: err => {
          console.error('WebSocket error, falling back to HTTP API:', err);
          // Fallback to HTTP API instead of mock data
          this.leaderboardApi.getTopPerformers().subscribe({
            next: data => {
              console.log('Fallback HTTP data:', data);
              this.handleApiResponse(data);
            },
            error: httpErr => {
              console.error('HTTP API also failed:', httpErr);
              this.handleMockData();
            }
          });
        }
      });
    } else if (option === 'top') {
      // Use HTTP API for top performers
      const topValue = this.topValue();
      this.leaderboardApi.getTopPerformers(topValue).subscribe({
        next: data => {
          console.log('Top performers data:', data);
          this.handleApiResponse(data);
        },
        error: err => {
          console.error('Error loading top performers:', err);
          this.handleMockData();
        }
      });
    } else if (option === 'around') {
      // Use HTTP API for around portfolio
      const portfolioId = this.portfolioId();
      const range = this.range();
      this.leaderboardApi.getRankingsAround(portfolioId, range).subscribe({
        next: data => {
          console.log('Around data:', data);
          this.handleApiResponse(data);
        },
        error: err => {
          console.error('Error loading around data:', err);
          this.handleMockData();
        }
      });
    }
  }

  private handleMockData() {
    // Create mock data when API fails
    const mockPortfolios: Portfolio[] = [
      {
        rank: 1,
        portfolioId: 'mock-1',
        compositeScore: 251.3,
        avgReturn: 1.44,
        sharpe: '4.07',
        sortino: '2.86',
        updatedAt: new Date().toISOString()
      },
      {
        rank: 2,
        portfolioId: 'mock-2',
        compositeScore: 215.8,
        avgReturn: 1.41,
        sharpe: '4.77',
        sortino: '0.11',
        updatedAt: new Date().toISOString()
      }
    ];
    
    this.portfolios.set(mockPortfolios);
    this.applyFilters();
    if (mockPortfolios.length > 0) this.selectedPortfolio.set(mockPortfolios[0]);
  }

  private handleApiResponse(data: any) {
    console.log('Raw API response:', data);
    // Convert API response to Portfolio format
    const portfolios: Portfolio[] = data.top?.map((item: any) => ({
      rank: item.rank,
      portfolioId: item.portfolioId,
      compositeScore: item.compositeScore,
      avgReturn: parseFloat(item.avgReturn),
      sharpe: item.sharpe,
      sortino: item.sortino,
      updatedAt: item.updatedAt
    })) || [];
    
    console.log('Converted portfolios:', portfolios);
    this.portfolios.set(portfolios);
    this.applyFilters();
    if (portfolios.length > 0) this.selectedPortfolio.set(portfolios[0]);
  }

  private handleWsResponse(data: any) {
    console.log('Raw WebSocket response:', data);
    // Handle different possible data structures
    let entriesArray: any[] = [];
    
    if (Array.isArray(data)) {
      entriesArray = data;
    } else if (data.top && Array.isArray(data.top)) {
      entriesArray = data.top;
    } else if (data.entries && Array.isArray(data.entries)) {
      entriesArray = data.entries;
    } else if (data.portfolios && Array.isArray(data.portfolios)) {
      entriesArray = data.portfolios;
    } else {
      console.warn('WebSocket data is not in expected format:', data);
      return;
    }
    
    const portfolios: Portfolio[] = entriesArray.map((item: any) => ({
      rank: item.rank,
      portfolioId: item.portfolioId,
      name: item.portfolioName,
      compositeScore: item.compositeScore || 0,
      avgReturn: parseFloat(item.pnl || item.avgReturn || 0),
      sharpe: item.sharpe || 'N/A',
      sortino: item.sortino || 'N/A',
      updatedAt: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString()
    }));
    
    console.log('Converted portfolios from WS:', portfolios);
    this.portfolios.set(portfolios);
    this.applyFilters();
    if (portfolios.length > 0 && !this.selectedPortfolio()) {
      this.selectedPortfolio.set(portfolios[0]);
    }
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onSortChange(sort: SortOption) {
    this.sortBy.set(sort);
    this.applyFilters();
  }



  onSelectPortfolio(portfolio: Portfolio) {
    this.selectedPortfolio.set(portfolio);
  }

  private applyFilters() {
    let result = [...this.portfolios()];

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      result = result.filter(p => p.portfolioId.toLowerCase().includes(term));
    }

    const sortKey = this.sortBy();
    result.sort((a, b) => {
      if (sortKey === 'rank') return a.rank - b.rank;
      if (sortKey === 'compositeScore') return (b.compositeScore || 0) - (a.compositeScore || 0);
      return (b.avgReturn || 0) - (a.avgReturn || 0);
    });

    this.filteredPortfolios.set(result);
  }

  private updateCharts(portfolio: Portfolio) {
    if (portfolio.pnlTrend) this.updateTrendChart(portfolio.pnlTrend);
    if (portfolio.sectorExposure) this.updateDonutChart(portfolio.sectorExposure);
  }

  private updateTrendChart(trend: number[]) {
    if (!this.trendChart) {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: trend.map((_, i) => `T${i + 1}`),
          datasets: [{
            data: trend,
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
          aspectRatio: 3,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
          }
        }
      };
      this.trendChart = new Chart(this.trendCanvas.nativeElement, config);
    } else {
      this.trendChart.data.labels = trend.map((_, i) => `T${i + 1}`);
      (this.trendChart.data.datasets[0].data as number[]) = trend;
      this.trendChart.update();
    }
  }

  private updateDonutChart(sectors: { sector: string; percentage: number }[]) {
    if (!this.donutChart) {
      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: sectors.map(s => s.sector),
          datasets: [{
            data: sectors.map(s => s.percentage),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } }
        }
      };
      this.donutChart = new Chart(this.donutCanvas.nativeElement, config);
    } else {
      this.donutChart.data.labels = sectors.map(s => s.sector);
      (this.donutChart.data.datasets[0].data as number[]) = sectors.map(s => s.percentage);
      this.donutChart.update();
    }
  }
}

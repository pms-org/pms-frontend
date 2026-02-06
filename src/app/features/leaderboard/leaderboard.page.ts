import { Component, signal, ViewChild, ElementRef, AfterViewInit, effect, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LeaderboardTableComponent } from './components/leaderboard-table.component';
import { Portfolio } from '../../core/models/leaderboard.models';
import { LeaderboardApiService } from '../../core/services/leaderboard-api.service';
import { LeaderboardWsService } from '../../core/services/leaderboard-ws.service';
import { ConnectionStatusService } from '../../core/services/connection-status.service';
import { PortfolioApiService } from '../../core/services/portfolio-api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription, forkJoin } from 'rxjs';

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
  @ViewChild('sharpeCanvas') sharpeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sortinoCanvas') sortinoCanvas!: ElementRef<HTMLCanvasElement>;

  private leaderboardApi = inject(LeaderboardApiService);
  private leaderboardWs = inject(LeaderboardWsService);
  private connectionStatus = inject(ConnectionStatusService);
  private portfolioApi = inject(PortfolioApiService);
  private http = inject(HttpClient);
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

  private sharpeChart?: Chart;
  private sortinoChart?: Chart;
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
    this.connectionStatus.setDisconnected();
    this.loadData();
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
    this.leaderboardWs.disconnect();
    this.connectionStatus.setDisconnected();
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
    this.leaderboardWs.disconnect();
    this.connectionStatus.setDisconnected();
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
    
    if (option === 'all') {
      // Try WebSocket first, fallback to HTTP API
      this.wsSubscription = this.leaderboardWs.stream().subscribe({
        next: data => {
          this.connectionStatus.setWebSocketConnected();
          this.handleWsResponse(data);
        },
        error: err => {
          this.connectionStatus.setApiConnected();
          this.leaderboardApi.getTopPerformers().subscribe({
            next: data => {
              this.handleApiResponse(data);
            },
            error: httpErr => {
              this.handleMockData();
            }
          });
        }
      });
    } else {
      this.connectionStatus.setApiConnected();
      if (option === 'top') {
        // Use HTTP API for top performers
        const topValue = this.topValue();
        this.leaderboardApi.getTopPerformers(topValue).subscribe({
          next: data => {
            this.handleApiResponse(data);
          },
          error: err => {
            this.handleMockData();
          }
        });
      } else if (option === 'around') {
        // Use HTTP API for around portfolio
        const portfolioId = this.portfolioId();
        const range = this.range();
        this.leaderboardApi.getRankingsAround(portfolioId, range).subscribe({
          next: data => {
            this.handleApiResponse(data);
          },
          error: err => {
            if (err.status === 500 || err.status === 404) {
              alert('Portfolio not found in leaderboard or invalid portfolio ID. Please check the ID and try again.');
            }
            this.portfolios.set([]);
            this.filteredPortfolios.set([]);
          }
        });
      }
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
    const portfolios: Portfolio[] = data.top?.map((item: any) => ({
      rank: item.rank,
      portfolioId: item.portfolioId,
      compositeScore: item.compositeScore,
      avgReturn: parseFloat(item.avgReturn),
      sharpe: item.sharpe,
      sortino: item.sortino,
      updatedAt: item.updatedAt
    })) || [];
    
    // Fetch portfolio names
    this.portfolioApi.getAllPortfolios().subscribe({
      next: investors => {
        const portfoliosWithNames = portfolios.map(p => {
          const investor = investors.find(inv => inv.portfolioId === p.portfolioId);
          return { ...p, name: investor?.name };
        });
        this.portfolios.set(portfoliosWithNames);
        this.applyFilters();
        if (portfoliosWithNames.length > 0) this.selectedPortfolio.set(portfoliosWithNames[0]);
      },
      error: err => {
        this.portfolios.set(portfolios);
        this.applyFilters();
        if (portfolios.length > 0) this.selectedPortfolio.set(portfolios[0]);
      }
    });
  }

  private handleWsResponse(data: any) {
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
      return;
    }
    
    const currentPortfolios = this.portfolios();
    
    // Sort by composite score to calculate new ranks
    entriesArray.sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0));
    
    const portfolios: Portfolio[] = entriesArray.map((item: any, index: number) => {
      const existing = currentPortfolios.find(p => p.portfolioId === item.portfolioId);
      const newScore = item.compositeScore || 0;
      const prevScore = existing?.compositeScore;
      const newRank = index + 1;
      
      let direction: 'up' | 'down' | 'none' = existing?.scoreDirection || 'none';
      if (prevScore !== undefined && newScore !== prevScore) {
        direction = newScore > prevScore ? 'up' : 'down';
      }
      
      return {
        rank: newRank,
        prevRank: existing?.rank,
        portfolioId: item.portfolioId,
        name: existing?.name || item.portfolioName,
        compositeScore: newScore,
        prevCompositeScore: prevScore,
        scoreDirection: direction,
        showArrow: direction !== 'none',
        avgReturn: parseFloat(item.pnl || item.avgReturn || 0),
        sharpe: item.sharpe || 'N/A',
        sortino: item.sortino || 'N/A',
        updatedAt: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString()
      };
    });
    
    // Fetch names for portfolios that don't have them
    const portfoliosWithoutNames = portfolios.filter(p => !p.name);
    if (portfoliosWithoutNames.length > 0) {
      this.portfolioApi.getAllPortfolios().subscribe({
        next: investors => {
          const portfoliosWithNames = portfolios.map(p => {
            if (p.name) return p;
            const investor = investors.find(inv => inv.portfolioId === p.portfolioId);
            return { ...p, name: investor?.name };
          });
          this.portfolios.set(portfoliosWithNames);
          this.applyFilters();
          if (portfoliosWithNames.length > 0 && !this.selectedPortfolio()) {
            this.selectedPortfolio.set(portfoliosWithNames[0]);
          }
        },
        error: err => {
          this.portfolios.set(portfolios);
          this.applyFilters();
          if (portfolios.length > 0 && !this.selectedPortfolio()) {
            this.selectedPortfolio.set(portfolios[0]);
          }
        }
      });
    } else {
      this.portfolios.set(portfolios);
      this.applyFilters();
      if (portfolios.length > 0 && !this.selectedPortfolio()) {
        this.selectedPortfolio.set(portfolios[0]);
      }
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
    this.updateSharpeChart(portfolio);
    this.updateSortinoChart(portfolio);
  }

  private updateSharpeChart(portfolio: Portfolio) {
    if (!this.sharpeCanvas?.nativeElement) return;
    
    // Generate dynamic data based on portfolio's sharpe ratio
    const currentSharpe = parseFloat(portfolio.sharpe || '2.0');
    const portfolioSharpe = this.generateTrendData(currentSharpe, 7);
    const overallSharpe = this.generateTrendData(2.2, 7); // Overall PMS baseline
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    const portfolioColor = currentSharpe >= 0 ? '#10b981' : '#ef4444';
    const overallColor = '#22c55e';

    if (!this.sharpeChart) {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: `${portfolio.portfolioId} Sharpe`,
              data: portfolioSharpe,
              borderColor: portfolioColor,
              backgroundColor: `${portfolioColor}20`,
              borderWidth: 2,
              tension: 0.4,
              fill: false
            },
            {
              label: 'Overall PMS',
              data: overallSharpe,
              borderColor: overallColor,
              backgroundColor: `${overallColor}20`,
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 3,
          plugins: { 
            legend: { 
              display: true,
              labels: { color: '#9ca3af' }
            } 
          },
          scales: {
            y: { 
              grid: { color: 'rgba(255,255,255,0.1)' }, 
              ticks: { color: '#9ca3af' }
            },
            x: { 
              grid: { display: false }, 
              ticks: { color: '#9ca3af' }
            }
          }
        }
      };
      this.sharpeChart = new Chart(this.sharpeCanvas.nativeElement, config);
    } else {
      this.sharpeChart.data.datasets[0].label = `${portfolio.portfolioId} Sharpe`;
      this.sharpeChart.data.datasets[0].borderColor = portfolioColor;
      this.sharpeChart.data.datasets[0].backgroundColor = `${portfolioColor}20`;
      (this.sharpeChart.data.datasets[0].data as number[]) = portfolioSharpe;
      (this.sharpeChart.data.datasets[1].data as number[]) = overallSharpe;
      this.sharpeChart.update();
    }
  }

  private updateSortinoChart(portfolio: Portfolio) {
    if (!this.sortinoCanvas?.nativeElement) return;
    
    // Generate dynamic data based on portfolio's sortino ratio
    const currentSortino = parseFloat(portfolio.sortino || '1.5');
    const portfolioSortino = this.generateTrendData(currentSortino, 7);
    const overallSortino = this.generateTrendData(1.8, 7); // Overall PMS baseline
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    const portfolioColor = currentSortino >= 0 ? '#10b981' : '#ef4444';
    const overallColor = '#22c55e';

    if (!this.sortinoChart) {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: `${portfolio.portfolioId} Sortino`,
              data: portfolioSortino,
              borderColor: portfolioColor,
              backgroundColor: `${portfolioColor}20`,
              borderWidth: 2,
              tension: 0.4,
              fill: false
            },
            {
              label: 'Overall PMS',
              data: overallSortino,
              borderColor: overallColor,
              backgroundColor: `${overallColor}20`,
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 3,
          plugins: { 
            legend: { 
              display: true,
              labels: { color: '#9ca3af' }
            } 
          },
          scales: {
            y: { 
              grid: { color: 'rgba(255,255,255,0.1)' }, 
              ticks: { color: '#9ca3af' }
            },
            x: { 
              grid: { display: false }, 
              ticks: { color: '#9ca3af' }
            }
          }
        }
      };
      this.sortinoChart = new Chart(this.sortinoCanvas.nativeElement, config);
    } else {
      this.sortinoChart.data.datasets[0].label = `${portfolio.portfolioId} Sortino`;
      this.sortinoChart.data.datasets[0].borderColor = portfolioColor;
      this.sortinoChart.data.datasets[0].backgroundColor = `${portfolioColor}20`;
      (this.sortinoChart.data.datasets[0].data as number[]) = portfolioSortino;
      (this.sortinoChart.data.datasets[1].data as number[]) = overallSortino;
      this.sortinoChart.update();
    }
  }

  private generateTrendData(currentValue: number, points: number): number[] {
    const data: number[] = [];
    const variation = currentValue * 0.15; // 15% variation
    
    for (let i = 0; i < points; i++) {
      const randomVariation = (Math.random() - 0.5) * variation;
      const trendValue = currentValue + randomVariation;
      data.push(Math.max(0, trendValue)); // Ensure non-negative values
    }
    
    // Ensure the last value is close to the current value
    data[points - 1] = currentValue;
    return data;
  }
}

import { Component, signal, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardTableComponent } from './components/leaderboard-table.component';
import { Portfolio } from '../../core/models/leaderboard.models';
import { MOCK_PORTFOLIOS } from './mock-data';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaderboardTableComponent],
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.css']
})
export class LeaderboardPage implements AfterViewInit {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  portfolios = signal<Portfolio[]>(MOCK_PORTFOLIOS);
  filteredPortfolios = signal<Portfolio[]>(MOCK_PORTFOLIOS);
  selectedPortfolio = signal<Portfolio | null>(MOCK_PORTFOLIOS[0]);
  
  searchTerm = signal('');
  sortBy = signal<'rank' | 'dailyPnl' | 'totalValue'>('rank');
  sectorFilter = signal('All');

  sectors = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'];

  private trendChart?: Chart;
  private donutChart?: Chart;
  private viewReady = false;

  constructor() {
    this.applyFilters();
    effect(() => {
      const portfolio = this.selectedPortfolio();
      if (portfolio && this.viewReady) {
        this.updateCharts(portfolio);
      }
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    const portfolio = this.selectedPortfolio();
    if (portfolio) {
      this.updateCharts(portfolio);
    }
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onSortChange(sort: 'rank' | 'dailyPnl' | 'totalValue') {
    this.sortBy.set(sort);
    this.applyFilters();
  }

  onSectorChange(sector: string) {
    this.sectorFilter.set(sector);
    this.applyFilters();
  }

  onSelectPortfolio(portfolio: Portfolio) {
    this.selectedPortfolio.set(portfolio);
  }

  private applyFilters() {
    let result = [...this.portfolios()];

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }

    if (this.sectorFilter() !== 'All') {
      result = result.filter(p => p.topSector === this.sectorFilter());
    }

    const sortKey = this.sortBy();
    result.sort((a, b) => {
      if (sortKey === 'rank') return a.rank - b.rank;
      if (sortKey === 'dailyPnl') return b.dailyPnl - a.dailyPnl;
      return b.totalValue - a.totalValue;
    });

    this.filteredPortfolios.set(result);
  }

  private updateCharts(portfolio: Portfolio) {
    this.updateTrendChart(portfolio.pnlTrend);
    this.updateDonutChart(portfolio.sectorExposure);
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

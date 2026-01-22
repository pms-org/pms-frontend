import { Component, input, output, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '../../../core/models/leaderboard.models';
import { ConnectionStatusService } from '../../../core/services/connection-status.service';

type SortOption = 'rank' | 'compositeScore' | 'avgReturn';
type EndpointOption = 'all' | 'top' | 'around';

@Component({
  selector: 'app-leaderboard-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard-table.component.html',
  styleUrls: ['./leaderboard-table.component.css']
})
export class LeaderboardTableComponent implements OnInit, OnDestroy {
  private connectionStatus = inject(ConnectionStatusService);
  
  portfolios = input<Portfolio[]>([]);
  selectedId = input<string>('');
  searchTerm = input<string>('');
  sortBy = input<SortOption>('rank');
  endpointOption = input<EndpointOption>('all');
  topValue = input<number>(3);
  portfolioId = input<string>('');
  range = input<number>(1);

  search = output<string>();
  sortChange = output<SortOption>();
  selectPortfolio = output<Portfolio>();
  endpointChange = output<EndpointOption>();
  topValueChange = output<number>();
  portfolioIdChange = output<string>();
  rangeChange = output<number>();

  lastUpdated = signal<string>('');
  private intervalId?: number;

  ngOnInit() {
    this.updateTime();
    this.intervalId = window.setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private updateTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    this.lastUpdated.set(`${hh}:${mm}:${ss}`);
  }

  getStatusColor(): string {
    const status = this.connectionStatus.status();
    if (status === 'websocket') return 'bg-green-500';
    if (status === 'api') return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getRankClass(portfolio: Portfolio): string {
    if (!portfolio.prevRank) return '';
    if (portfolio.rank < portfolio.prevRank) return 'rank-up';
    if (portfolio.rank > portfolio.prevRank) return 'rank-down';
    return '';
  }

  trackByPortfolioId(index: number, portfolio: Portfolio): string {
    return portfolio.portfolioId;
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-500 text-gray-900';
    if (rank === 2) return 'bg-gray-400 text-gray-900';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-gray-700 text-gray-300';
  }
}

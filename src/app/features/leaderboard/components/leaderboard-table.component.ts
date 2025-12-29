import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '../../../core/models/leaderboard.models';

type SortOption = 'rank' | 'compositeScore' | 'avgReturn';
type EndpointOption = 'all' | 'top' | 'around';

@Component({
  selector: 'app-leaderboard-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard-table.component.html',
  styleUrls: ['./leaderboard-table.component.css']
})
export class LeaderboardTableComponent {
  portfolios = input<Portfolio[]>([]);
  selectedId = input<string>('');
  searchTerm = input<string>('');
  sortBy = input<SortOption>('rank');
  sectorFilter = input<string>('All');
  sectors = input<string[]>([]);
  endpointOption = input<EndpointOption>('all');

  search = output<string>();
  sortChange = output<SortOption>();
  sectorChange = output<string>();
  selectPortfolio = output<Portfolio>();
  endpointChange = output<EndpointOption>();

  getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-500 text-gray-900';
    if (rank === 2) return 'bg-gray-400 text-gray-900';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-gray-700 text-gray-300';
  }
}

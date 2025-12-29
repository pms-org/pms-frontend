import { Component, input, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioOverviewRow } from '../../../core/models/ui.models';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'app-portfolio-table',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './portfolio-table.component.html',
  styleUrls: ['./portfolio-table.component.css']
})
export class PortfolioTableComponent {
  private readonly router = inject(Router);
  portfolios = input<PortfolioOverviewRow[]>([]);
  private previousData = new Map<string, PortfolioOverviewRow>();
  blinkingRows = signal(new Set<string>());

  constructor() {
    effect(() => {
      const current = this.portfolios();
      const changedIds = new Set<string>();
      
      current.forEach(portfolio => {
        const prev = this.previousData.get(portfolio.portfolioId);
        if (prev && this.hasChanged(prev, portfolio)) {
          changedIds.add(portfolio.portfolioId);
        }
        this.previousData.set(portfolio.portfolioId, { ...portfolio });
      });
      
      if (changedIds.size > 0) {
        this.blinkingRows.set(changedIds);
        setTimeout(() => this.blinkingRows.set(new Set()), 2000);
      }
    });
  }

  private hasChanged(prev: PortfolioOverviewRow, current: PortfolioOverviewRow): boolean {
    return prev.unrealisedPnl !== current.unrealisedPnl || 
           prev.realisedPnl !== current.realisedPnl ||
           prev.totalInvestment !== current.totalInvestment ||
           prev.holdings !== current.holdings;
  }

  isBlinking(portfolioId: string): boolean {
    return this.blinkingRows().has(portfolioId);
  }

  goToPortfolio(portfolioId: string) {
    this.router.navigate(['/portfolio', portfolioId]);
  }
}

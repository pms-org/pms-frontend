import { Component, input, inject } from '@angular/core';
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

  goToPortfolio(portfolioId: string) {
    this.router.navigate(['/portfolio', portfolioId]);
  }
}

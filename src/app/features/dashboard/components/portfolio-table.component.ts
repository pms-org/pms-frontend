import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  portfolios = input<PortfolioOverviewRow[]>([]);
}
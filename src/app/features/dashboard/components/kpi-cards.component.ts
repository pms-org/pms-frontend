import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.css']
})
export class KpiCardsComponent {
  totalPortfolios = input<number>(0);
  totalValue = input<number>(0);
  avgDailyPnlPct = input<number>(0);
  totalStocks = input<number>(0);
}
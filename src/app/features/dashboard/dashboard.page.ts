import { Component } from '@angular/core';
import { KpiCardsComponent } from './components/kpi-cards.component';
import { PortfolioTableComponent } from './components/portfolio-table.component';
import { MoversPanelComponent } from './components/movers-panel.component';
import { SectorChartsComponent } from './components/sector-charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    KpiCardsComponent,
    PortfolioTableComponent,
    MoversPanelComponent,
    SectorChartsComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css']
})
export class DashboardPage {
  // Mock data - will be replaced with store data later
  totalPortfolios = 12;
  totalValue = 2450000;
  avgDailyPnlPct = 2.34;
  totalStocks = 87;

  portfolios = [
    {
      portfolioId: '1',
      portfolioName: 'Tech Growth',
      totalValue: 850000,
      dailyPnlPct: 3.2,
      stocksHeld: 25,
      topSector: 'Technology',
      lastUpdatedLabel: '2 mins ago'
    },
    {
      portfolioId: '2',
      portfolioName: 'Value Stocks',
      totalValue: 620000,
      dailyPnlPct: -1.5,
      stocksHeld: 18,
      topSector: 'Finance',
      lastUpdatedLabel: '5 mins ago'
    }
  ];

  topGainers = [
    { symbol: 'AAPL', pct: 5.2 },
    { symbol: 'MSFT', pct: 4.8 },
    { symbol: 'GOOGL', pct: 3.9 },
    { symbol: 'NVDA', pct: 3.5 },
    { symbol: 'TSLA', pct: 2.8 }
  ];

  topLosers = [
    { symbol: 'META', pct: -3.2 },
    { symbol: 'AMZN', pct: -2.8 },
    { symbol: 'NFLX', pct: -2.1 },
    { symbol: 'AMD', pct: -1.9 },
    { symbol: 'INTC', pct: -1.5 }
  ];

  sectorExposure = [
    { sector: 'Technology', pct: 35 },
    { sector: 'Finance', pct: 25 },
    { sector: 'Healthcare', pct: 20 },
    { sector: 'Energy', pct: 12 },
    { sector: 'Consumer', pct: 8 }
  ];

  pnlTrend = [
    { label: 'Mon', value: 12000 },
    { label: 'Tue', value: 19000 },
    { label: 'Wed', value: 15000 },
    { label: 'Thu', value: 25000 },
    { label: 'Fri', value: 22000 },
    { label: 'Sat', value: 30000 }
  ];
}
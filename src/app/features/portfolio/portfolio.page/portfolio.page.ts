import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MOCK_PORTFOLIO_TREND } from '../../../core/mock/pms.mock-data';
import { MOCK_PORTFOLIO_SECTOR_BREAKDOWN } from '../../../core/mock/portfolio-sector-breakdown.mock-data';
import { buildPortfolioKpis, MOCK_PORTFOLIO_SYMBOLS, buildPortfolioSector } from '../../../core/mock/portfolio.mock-data';
import { PortfolioKpis, PortfolioSymbolRow, PortfolioSectorSlice } from '../../../core/models/portfolio-ui.models';
import { PnlTrendPoint } from '../../../core/models/ui.models';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { SectorModalComponent, SectorSymbolRow } from '../../dashboard/components/sector-modal/sector-modal';
import { PortfolioChartsComponent } from './components/portfolio-charts/portfolio-charts';


@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [CommonModule, MoneyPipe, PortfolioChartsComponent, SectorModalComponent],
  templateUrl: './portfolio.page.html'
})
export class PortfolioPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  portfolioId = '';

  // KPI + table + charts
  kpis!: PortfolioKpis;
  rows: PortfolioSymbolRow[] = [];
  sectors: PortfolioSectorSlice[] = [];
  trend: PnlTrendPoint[] = [];

  // ✅ Modal state (portfolio sector drilldown)
  sectorModalOpen = false;
  selectedSector = '';
  sectorRows: SectorSymbolRow[] = [];

  ngOnInit(): void {
    this.portfolioId = this.route.snapshot.paramMap.get('portfolioId') ?? 'p1';

    // Dummy data (for visuals now)
    this.kpis = buildPortfolioKpis(this.portfolioId);
    this.rows = MOCK_PORTFOLIO_SYMBOLS[this.portfolioId] ?? [];
    this.sectors = buildPortfolioSector(this.portfolioId);
    this.trend = MOCK_PORTFOLIO_TREND[this.portfolioId] ?? [];
  }

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  // ✅ Click donut sector -> open modal
  openSectorModal(sector: string): void {
    this.selectedSector = sector;

    const portfolioMap = MOCK_PORTFOLIO_SECTOR_BREAKDOWN[this.portfolioId] ?? {};
    const rows = portfolioMap[sector] ?? [];

    // SectorModal expects: { symbol, percentage, holdings, totalInvested, realisedPnl }
    this.sectorRows = rows.map((r) => ({
      symbol: r.symbol,
      percentage: r.percentage,
      holdings: r.holdings,
      totalInvested: r.totalInvested,
      realisedPnl: r.realisedPnl
    }));

    this.sectorModalOpen = true;
  }

  closeSectorModal(): void {
    this.sectorModalOpen = false;
    this.selectedSector = '';
    this.sectorRows = [];
  }
}

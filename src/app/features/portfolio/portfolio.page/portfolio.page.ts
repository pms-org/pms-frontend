import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PmsStore } from '../../../core/state/pms.store';
import { AnalyticsApiService } from '../../../core/services/analytics-api.service';
import { PortfolioKpis, PortfolioSymbolRow, PortfolioSectorSlice } from '../../../core/models/portfolio-ui.models';
import { PnlTrendPoint } from '../../../core/models/ui.models';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { PortfolioChartsComponent } from './components/portfolio-charts/portfolio-charts';
import { SectorModalComponent, SectorSymbolRow } from '../../dashboard/components/sector-modal/sector-modal';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [CommonModule, MoneyPipe, PortfolioChartsComponent, SectorModalComponent],
  templateUrl: './portfolio.page.html'
})
export class PortfolioPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PmsStore);
  private readonly api = inject(AnalyticsApiService);

  portfolioId = '';
  private sub = new Subscription();

  // Data for View
  kpis: PortfolioKpis = { portfolioId: '', totalInvestment: 0, unrealisedPnl: 0, realisedPnl: 0 };
  rows: PortfolioSymbolRow[] = [];
  sectors: PortfolioSectorSlice[] = [];
  trend: PnlTrendPoint[] = []; // Empty for now as requested

  // Modal State
  sectorModalOpen = false;
  selectedSector = '';
  sectorRows: SectorSymbolRow[] = [];

  ngOnInit(): void {
    this.portfolioId = this.route.snapshot.paramMap.get('portfolioId') ?? '';

    if (!this.portfolioId) {
      this.back();
      return;
    }

    // 1. Subscribe to Store for Live Positions & KPIs (Real Data)
    this.sub.add(
      this.store.selectPortfolio(this.portfolioId).subscribe((data) => {
        this.kpis = data.kpis;
        
        // Map Store Entities to UI Rows
        this.rows = data.positions.map(p => ({
          symbol: p.id.symbol,
          holdings: p.holdings,
          totalInvestment: p.totalInvested,
          realisedPnl: p.realizedPnl,
          unrealisedPnl: 0 // Will connect when per-symbol PnL is available in store
        }));
      })
    );

    // 2. Fetch Sector Breakdown (API)
    this.sub.add(
      this.api.getPortfolioSectorAnalysis(this.portfolioId).subscribe({
        next: (sectors) => {
          this.sectors = sectors.map(s => ({
            sector: s.sector,
            pct: s.percentage ?? 0
          }));
        },
        error: (e) => console.error('Sector load failed', e)
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  openSectorModal(sector: string): void {
    this.selectedSector = sector;
    
    // Fetch detailed breakdown from API
    this.api.getPortfolioSectorDrilldown(this.portfolioId, sector).subscribe(data => {
      this.sectorRows = data.map(d => ({
        symbol: d.symbol,
        percentage: d.percentage ?? 0,
        holdings: d.holdings,
        totalInvested: d.totalInvested,
        realisedPnl: d.realizedPnl
      }));
      this.sectorModalOpen = true;
    });
  }
  
  closeSectorModal(): void {
    this.sectorModalOpen = false;
  }
}
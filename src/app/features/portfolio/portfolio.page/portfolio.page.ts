// import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subscription } from 'rxjs';

// import { PmsStore } from '../../../core/state/pms.store';
// import { AnalyticsApiService } from '../../../core/services/analytics-api.service';
// import { PortfolioKpis, PortfolioSymbolRow, PortfolioSectorSlice } from '../../../core/models/portfolio-ui.models';
// import { PnlTrendPoint } from '../../../core/models/ui.models';
// import { MoneyPipe } from '../../../shared/pipes/money.pipe';
// import { PortfolioChartsComponent } from './components/portfolio-charts/portfolio-charts';
// import { SectorModalComponent, SectorSymbolRow } from '../../dashboard/components/sector-modal/sector-modal';

// @Component({
//   selector: 'app-portfolio-page',
//   standalone: true,
//   imports: [CommonModule, MoneyPipe, PortfolioChartsComponent, SectorModalComponent],
//   templateUrl: './portfolio.page.html'
// })
// export class PortfolioPage implements OnInit, OnDestroy {
//   private readonly route = inject(ActivatedRoute);
//   private readonly router = inject(Router);
//   private readonly store = inject(PmsStore);
//   private readonly api = inject(AnalyticsApiService);

//   portfolioId = '';
//   private sub = new Subscription();

//   kpis: PortfolioKpis = { portfolioId: '', totalInvestment: 0, unrealisedPnl: 0, realisedPnl: 0 };
//   rows: PortfolioSymbolRow[] = [];
  
//   // Charts Data
//   sectors: PortfolioSectorSlice[] = [];
//   livePnlTrend: PnlTrendPoint[] = []; // Chart 2: Live Socket Updates
//   historyTrend: PnlTrendPoint[] = []; // Chart 3: 30-day History

//   // Modal State
//   sectorModalOpen = false;
//   selectedSector = '';
//   sectorRows: SectorSymbolRow[] = [];

//   ngOnInit(): void {
//     this.portfolioId = this.route.snapshot.paramMap.get('portfolioId') ?? '';
//     if (!this.portfolioId) { this.back(); return; }

//     // 1. Subscribe to Store (Live Positions & PnL)
//     this.sub.add(
//       this.store.selectPortfolio(this.portfolioId).subscribe((data) => {
//         this.kpis = data.kpis;
        
//         // ✅ Update Live Trend Chart
//         this.updateLiveTrend(data.unrealisedDetails.overall);

//         // ✅ Map Rows with Per-Symbol PnL
//         this.rows = data.positions.map(p => {
//           const symbol = p.id.symbol;
//           // Look up PnL in the bySymbol map, default to 0 if missing
//           const pnl = data.unrealisedDetails.bySymbol[symbol] ?? 0;
          
//           return {
//             symbol: symbol,
//             holdings: p.holdings,
//             totalInvestment: p.totalInvested,
//             realisedPnl: p.realizedPnl,
//             unrealisedPnl: pnl 
//           };
//         });
//       })
//     );

//     // 2. Fetch Sector Composition
//     this.sub.add(
//       this.api.getPortfolioSectorAnalysis(this.portfolioId).subscribe({
//         next: (sectors) => {
//           this.sectors = sectors.map(s => ({ sector: s.sector, pct: s.percentage ?? 0 }));
//         },
//         error: (e) => console.error('Sector load failed', e)
//       })
//     );

//     // 3. Fetch 30-Day History (Chart 3)
//     this.sub.add(
//       this.api.getPortfolioHistory(this.portfolioId).subscribe({
//         next: (history) => {
//           // Sort by date ascending for the chart
//           this.historyTrend = history
//             .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
//             .map(h => ({
//               label: h.date, // e.g. "2024-01-01"
//               value: h.portfolioValue
//             }));
//         },
//         error: (e) => console.error('History load failed', e)
//       })
//     );
//   }

//   ngOnDestroy(): void {
//     this.sub.unsubscribe();
//   }

//   // ✅ Accumulates live socket points for the "Minute Way" chart
//   private updateLiveTrend(currentValue: number) {
//     const now = new Date();
//     const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
//     // Add new point
//     const newPoint = { label, value: currentValue };
    
//     // Keep last 20 points so the chart moves
//     this.livePnlTrend = [...this.livePnlTrend, newPoint].slice(-20); 
//   }

//   back(): void { this.router.navigate(['/dashboard']); }

//   openSectorModal(sector: string): void {
//     this.selectedSector = sector;
//     this.api.getPortfolioSectorDrilldown(this.portfolioId, sector).subscribe(data => {
//       this.sectorRows = data.map(d => ({
//         symbol: d.symbol,
//         percentage: d.percentage ?? 0,
//         holdings: d.holdings,
//         totalInvested: d.totalInvested,
//         realisedPnl: d.realizedPnl
//       }));
//       this.sectorModalOpen = true;
//     });
//   }
  
//   closeSectorModal(): void { this.sectorModalOpen = false; }
// }





import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PmsStore } from '../../../core/state/pms.store';
import { AnalyticsApiService, PortfolioValueHistoryDto } from '../../../core/services/analytics-api.service';
import { PortfolioKpis, PortfolioSymbolRow, PortfolioSectorSlice } from '../../../core/models/portfolio-ui.models';
import { PnlTrendPoint } from '../../../core/models/ui.models';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { PortfolioChartsComponent } from './components/portfolio-charts/portfolio-charts';
import { SectorModalComponent, SectorSymbolRow } from '../../dashboard/components/sector-modal/sector-modal';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [CommonModule, MoneyPipe, PortfolioChartsComponent, SectorModalComponent],
  templateUrl: './portfolio.page.html',
  styleUrl: './portfolio.page.css'
})
export class PortfolioPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PmsStore);
  private readonly api = inject(AnalyticsApiService);

  @ViewChild(PortfolioChartsComponent) chartsComponent!: PortfolioChartsComponent;

  portfolioId = '';
  private sub = new Subscription();
  private lastPnlValue = 0;

  kpis: PortfolioKpis = { portfolioId: '', totalInvestment: 0, unrealisedPnl: 0, realisedPnl: 0 };
  rows: PortfolioSymbolRow[] = [];
  
  sectors: PortfolioSectorSlice[] = [];
  livePnlTrend: PnlTrendPoint[] = []; 
  historyTrend: PnlTrendPoint[] = [];

  sectorModalOpen = false;
  selectedSector = '';
  sectorRows: SectorSymbolRow[] = [];

  ngOnInit(): void {
    this.portfolioId = this.route.snapshot.paramMap.get('portfolioId') ?? '';
    if (!this.portfolioId) { this.back(); return; }

    console.log('🚀 Portfolio page initializing for:', this.portfolioId);

    // Load all data in parallel and wait for completion
    this.loadAllData();
  }

  private loadAllData(): void {
    // 1. Live Data from Store
    this.sub.add(
      this.store.selectPortfolio(this.portfolioId).subscribe((data) => {
        console.log('📊 Store data received:', data);
        this.kpis = data.kpis;
        this.lastPnlValue = data.unrealisedDetails.overall;
        
        // Update Chart 2 - always add new point for live trend
        this.updateLiveTrend(data.unrealisedDetails.overall);

        // Update Table with per-symbol PnL
        this.rows = data.positions.map(p => {
          const symbol = p.id.symbol;
          const pnl = data.unrealisedDetails.bySymbol[symbol] ?? 0;
          return {
            symbol: symbol,
            holdings: p.holdings,
            totalInvestment: p.totalInvested,
            realisedPnl: p.realizedPnl,
            unrealisedPnl: pnl 
          };
        });
      })
    );

    // 2. Sector Composition
    console.log('📊 Loading sector data for portfolio:', this.portfolioId);
    this.sub.add(
      this.api.getPortfolioSectorAnalysis(this.portfolioId).subscribe({
        next: (sectors) => {
          console.log('✅ Sector API Response:', sectors);
          this.sectors = sectors.map(s => ({ sector: s.sector, pct: s.percentage ?? 0 }));
          console.log('📊 Processed sectors for chart:', this.sectors);
          
          // Force chart update after data is set
          setTimeout(() => {
            console.log('🔄 Triggering chart update with sectors:', this.sectors);
            if (this.chartsComponent) {
              // Directly set the data on the component
              this.chartsComponent.sectors = this.sectors;
              this.chartsComponent.forceChartUpdate();
            }
          }, 50);
        },
        error: (e: any) => console.error('❌ Sector load failed', e)
      })
    );

    // 3. History
    console.log('📊 Loading history data for portfolio:', this.portfolioId);
    this.sub.add(
      this.api.getPortfolioHistory(this.portfolioId).subscribe({
        next: (history: PortfolioValueHistoryDto[]) => {
          console.log('✅ History API Response:', history.length, 'items');
          const uniqueByDate = history.reduce((acc, item) => {
            const existing = acc.find(x => x.date === item.date);
            if (!existing || new Date(item.createdAt) > new Date(existing.createdAt)) {
              acc = acc.filter(x => x.date !== item.date);
              acc.push(item);
            }
            return acc;
          }, [] as PortfolioValueHistoryDto[]);
          
          this.historyTrend = uniqueByDate
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(h => ({
              label: h.date,
              value: h.portfolioValue
            }));
          console.log('📊 Processed history for chart:', this.historyTrend.length, 'points');
          
          // Force history chart update
          setTimeout(() => {
            if (this.chartsComponent) {
              this.chartsComponent.historyTrend = this.historyTrend;
              this.chartsComponent.forceChartUpdate();
            }
          }, 50);
        },
        error: (e: any) => console.error('❌ History load failed', e)
      })
    );

    // Remove the simulation interval - rely on real WebSocket data
    // The store subscription will fire every time WebSocket data arrives
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private updateLiveTrend(currentValue: number) {
    const now = new Date();
    const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newPoint = { label, value: currentValue };
    
    // Always add new point for live updates (WebSocket data changes)
    this.livePnlTrend = [...this.livePnlTrend, newPoint].slice(-20);
    
    console.log('📈 Live trend updated:', this.livePnlTrend.length, 'points, latest:', currentValue);
    
    // Force chart update with new live data
    setTimeout(() => {
      if (this.chartsComponent) {
        this.chartsComponent.liveTrend = this.livePnlTrend;
        this.chartsComponent.forceChartUpdate();
      }
    }, 50);
  }

  back(): void { this.router.navigate(['/dashboard']); }

  openSectorModal(sector: string): void {
    this.selectedSector = sector;
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
  
  closeSectorModal(): void { this.sectorModalOpen = false; }
}
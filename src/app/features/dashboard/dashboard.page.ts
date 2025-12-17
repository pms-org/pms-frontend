import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { KpiCardsComponent } from './components/kpi-cards.component';
import { PortfolioTableComponent } from './components/portfolio-table.component';
import { MoversPanelComponent } from './components/movers-panel.component';
import { SectorChartsComponent } from './components/sector-charts.component';

import { PmsStore } from '../../core/state/pms.store';
import { DashboardKpis, MoversView, PortfolioOverviewRow, PnlTrendPoint, SectorExposure } from '../../core/models/ui.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardsComponent, PortfolioTableComponent, MoversPanelComponent, SectorChartsComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css']
})
export class DashboardPage implements OnInit {
  private readonly store = inject(PmsStore);

  readonly dashboardRows$: Observable<PortfolioOverviewRow[]> = this.store.dashboardRows$;
  readonly kpis$: Observable<DashboardKpis> = this.store.kpis$;
  readonly movers$: Observable<MoversView> = this.store.movers$;
  readonly sectorExposure$: Observable<SectorExposure[]> = this.store.sectorExposure$;
  readonly pnlTrend$: Observable<PnlTrendPoint[]> = this.store.pnlTrend$;

  ngOnInit(): void {
    this.store.init();
  }
}

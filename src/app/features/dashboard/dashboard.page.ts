import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import { KpiCardsComponent } from './components/kpi-cards.component';
import { PortfolioTableComponent } from './components/portfolio-table.component';
import { MoversPanelComponent } from './components/movers-panel.component';
import { SectorChartsComponent } from './components/sector-charts.component';

import { PmsStore } from '../../core/state/pms.store';
import { AnalyticsApiService } from '../../core/services/analytics-api.service';
import { AnalyticsStompService } from '../../core/services/analytics-stomp.service';
import { ConnectionStatusService } from '../../core/services/connection-status.service';

import {
  DashboardKpis,
  MoversView,
  PortfolioOverviewRow,
  PnlTrendPoint,
  SectorExposure,
} from '../../core/models/ui.models';

import { SectorModalComponent, SectorSymbolRow } from './components/sector-modal/sector-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    PortfolioTableComponent,
    MoversPanelComponent,
    SectorChartsComponent,
    SectorModalComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly store = inject(PmsStore);
  private readonly api = inject(AnalyticsApiService);
  private readonly stomp = inject(AnalyticsStompService);
  private readonly connectionStatus = inject(ConnectionStatusService);

  readonly dashboardRows$: Observable<PortfolioOverviewRow[]> = this.store.dashboardRows$;
  readonly kpis$: Observable<DashboardKpis> = this.store.kpis$;
  readonly movers$: Observable<MoversView> = this.store.movers$;
  readonly sectorExposure$: Observable<SectorExposure[]> = this.store.sectorExposure$;
  readonly pnlTrend$: Observable<PnlTrendPoint[]> = this.store.pnlTrend$;

  // modal state
  sectorModalOpen = false;
  selectedSector = '';
  sectorRows: SectorSymbolRow[] = [];

  private modalSub?: Subscription;

  ngOnInit(): void {
    this.connectionStatus.setDisconnected();
    this.connectionStatus.setApiConnected();
    this.store.init();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.store.destroy();
    this.modalSub?.unsubscribe();
    this.stomp.disconnect();
  }

  openSectorModal(sector: string) {
    this.selectedSector = sector;
    
    // REAL API CALL (Replaces MOCK_SECTOR_BREAKDOWN)
    this.modalSub = this.api.getSectorDrilldown(sector).subscribe({
      next: (data) => {
        // Map Backend DTO to UI Model
        this.sectorRows = data.map((d) => ({
          symbol: d.symbol,
          percentage: d.percentage,
          holdings: d.holdings,
          totalInvested: d.totalInvested,
          realisedPnl: d.realizedPnl, // Note spelling: Backend 'z' -> UI 's' if needed
        }));
        
        this.sectorModalOpen = true;
      },
      error: (err) => {
        console.error('Failed to load sector data', err);
        // Optional: Handle error (e.g. show toast)
      }
    });
  }

  closeSectorModal() {
    this.sectorModalOpen = false;
    this.selectedSector = '';
    this.sectorRows = [];
  }

  private connectWebSocket(): void {
    this.stomp.connected$.subscribe(connected => {
      if (connected) {
        this.connectionStatus.setWebSocketConnected();
      }
    });
    this.stomp.connect();
  }
}
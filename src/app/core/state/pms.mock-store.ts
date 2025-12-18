import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  MOCK_PORTFOLIOS,
  MOCK_KPIS,
  MOCK_MOVERS,
  MOCK_SECTOR_EXPOSURE,
  MOCK_PNL_TREND
} from '../mock/pms.mock-data';

import {
  PortfolioOverviewRow,
  DashboardKpis,
  MoversView,
  SectorExposure,
  PnlTrendPoint
} from '../models/ui.models';

@Injectable({ providedIn: 'root' })
export class PmsMockStore {
  readonly dashboardRows$: Observable<PortfolioOverviewRow[]> = of(MOCK_PORTFOLIOS);
  readonly kpis$: Observable<DashboardKpis> = of(MOCK_KPIS);
  readonly movers$: Observable<MoversView> = of(MOCK_MOVERS);
  readonly sectorExposure$: Observable<SectorExposure[]> = of(MOCK_SECTOR_EXPOSURE);
  readonly pnlTrend$: Observable<PnlTrendPoint[]> = of(MOCK_PNL_TREND);

  init(): void {
    // No-op (matches real store signature)
  }
}

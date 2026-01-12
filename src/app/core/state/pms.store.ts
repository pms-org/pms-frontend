// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, Subject, filter, map, take, takeUntil } from 'rxjs';

// import { AnalyticsApiService } from '../services/analytics-api.service';
// import { AnalyticsStompService } from '../services/analytics-stomp.service';
// import { LeaderboardWsService } from '../services/leaderboard-ws.service';

// import {
//   AnalysisEntityDto,
//   SectorMetricsDto,
//   UnrealisedPnlWsDto,
// } from '../models/analytics.models';
// import { LeaderboardEntry } from '../models/leaderboard.models';
// import {
//   DashboardKpis,
//   MoversView,
//   PortfolioOverviewRow,
//   PnlTrendPoint,
//   SectorExposure,
// } from '../models/ui.models';
// import { PortfolioKpis } from '../models/portfolio-ui.models';

// interface PmsState {
//   positions: Record<string, AnalysisEntityDto>;
//   unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>;
//   sectors: SectorMetricsDto[];
//   leaderboard: LeaderboardEntry[];
// }

// const MAX_TREND_POINTS = 30;
// @Injectable({ providedIn: 'root' })
// export class PmsStore {
//   private readonly state$ = new BehaviorSubject<PmsState>({
//     positions: {},
//     unrealised: {},
//     sectors: [],
//     leaderboard: [],
//   });

//   private readonly destroy$ = new Subject<void>();
//   private readonly pnlTrendSubject = new BehaviorSubject<PnlTrendPoint[]>([]);
//   readonly pnlTrend$ = this.pnlTrendSubject.asObservable();

//   readonly dashboardRows$: Observable<PortfolioOverviewRow[]> = this.state$.pipe(
//     map((state) => this.buildDashboardRows(state))
//   );

//   readonly kpis$: Observable<DashboardKpis> = this.dashboardRows$.pipe(
//     map((rows) => this.buildKpis(rows))
//   );

//   readonly movers$: Observable<MoversView> = this.state$.pipe(
//     map((state) => this.buildMovers(state.unrealised))
//   );

//   readonly sectorExposure$: Observable<SectorExposure[]> = this.state$.pipe(
//     map((state) => state.sectors.map((s) => ({ sector: s.sector, pct: s.percentage ?? 0 })))
//   );

//   constructor(
//     private readonly api: AnalyticsApiService,
//     private readonly analyticsWs: AnalyticsStompService,
//     private readonly leaderboardWs: LeaderboardWsService
//   ) {}

//   init(): void {
//     // 1. Connect WS
//     this.handleAnalyticsStomp();
//     this.handleLeaderboardSocket();

//     // 2. Load Static REST Data
//     this.loadStaticData();

//     // ✅ 3. WAIT for Socket, THEN Trigger PnL
//     this.analyticsWs.connected$
//       .pipe(
//         filter((connected) => connected === true),
//         take(1) // Execute only once per session init
//       )
//       .subscribe(() => {
//         console.log('🚀 Socket Ready: Triggering Initial PnL Calculation...');
//         this.api.triggerUnrealizedPnlCalc().subscribe({
//           next: () => console.log('✅ Trigger Sent'),
//           error: (e) => console.error('❌ Trigger Failed', e),
//         });
//       });
//   }

//   destroy(): void {
//     this.destroy$.next();
//     this.analyticsWs.disconnect();
//   }

//   // ✅ Selector for Portfolio Page (Real Data)
//   // selectPortfolio(portfolioId: string): Observable<{
//   //   positions: AnalysisEntityDto[];
//   //   kpis: PortfolioKpis;
//   // }> {
//   //   return this.state$.pipe(
//   //     map((state) => {
//   //       const positions = Object.values(state.positions).filter(
//   //         (p) => p.id?.portfolioId === portfolioId
//   //       );

//   //       const totalInvestment = positions.reduce((sum, p) => sum + (p.totalInvested || 0), 0);
//   //       const realisedPnl = positions.reduce((sum, p) => sum + (p.realizedPnl || 0), 0);

//   //       const uData = state.unrealised[portfolioId];
//   //       const unrealisedPnl = uData ? uData.overall : 0;

//   //       return {
//   //         positions,
//   //         kpis: {
//   //           portfolioId,
//   //           totalInvestment,
//   //           realisedPnl,
//   //           unrealisedPnl,
//   //         },
//   //       };
//   //     })
//   //   );
//   // }

//   private loadStaticData(): void {
//     this.api
//       .getAnalysisAll()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((positions) => {
//         const map: Record<string, AnalysisEntityDto> = {};
//         positions.forEach((p) => {
//           if (p.id?.portfolioId && p.id?.symbol) {
//             const key = this.positionKey(p.id.portfolioId, p.id.symbol);
//             map[key] = p;
//           }
//         });
//         this.setState({ positions: map });
//       });

//     this.api
//       .getSectorOverall()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((sectors) => {
//         this.setState({ sectors });
//       });
//   }

//   private handleAnalyticsStomp(): void {
//     this.analyticsWs.connect();

//     this.analyticsWs.positionUpdate$
//       .pipe(
//         filter((msg): msg is AnalysisEntityDto => msg !== null),
//         takeUntil(this.destroy$)
//       )
//       .subscribe((msg) => this.upsertPosition(msg));

//     this.analyticsWs.unrealised$
//       .pipe(
//         filter((msg): msg is UnrealisedPnlWsDto => msg !== null),
//         takeUntil(this.destroy$)
//       )
//       .subscribe((msg) => this.upsertUnrealised(msg));
//   }

//   private handleLeaderboardSocket(): void {
//     this.leaderboardWs
//       .stream()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((snapshot: any) => this.setState({ leaderboard: snapshot.entries ?? [] }));
//   }

//   private upsertPosition(position: AnalysisEntityDto): void {
//     const pid = position.id?.portfolioId;
//     const sym = position.id?.symbol;
//     if (!pid || !sym) return;

//     this.updateState((state) => {
//       const positions = { ...state.positions };
//       positions[this.positionKey(pid, sym)] = position;
//       return { ...state, positions };
//     });
//   }

//   private upsertUnrealised(payload: UnrealisedPnlWsDto): void {
//     const pid = payload.portfolio_id;
//     if (!pid) return;

//     const overall = Number(payload.overallUnrealised_Pnl ?? 0);
//     const bySymbol = payload.symbol ?? {};
//     const ts = new Date().toISOString();

//     this.updateState((state) => {
//       const unrealised = { ...state.unrealised, [pid]: { overall, bySymbol, ts } };
//       this.recordPnlTrend(unrealised);
//       return { ...state, unrealised };
//     });
//   }

//   private buildDashboardRows(state: PmsState): PortfolioOverviewRow[] {
//     const rows = new Map<string, PortfolioOverviewRow>();

//     const ensureRow = (portfolioId: string): PortfolioOverviewRow => {
//       if (!rows.has(portfolioId)) {
//         rows.set(portfolioId, {
//           portfolioId,
//           investorName: `Investor ${portfolioId.slice(0, 6).toUpperCase()}`,
//           holdings: 0,
//           totalInvestment: 0,
//           unrealisedPnl: 0,
//           realisedPnl: 0,
//           lastUpdatedLabel: '—',
//         });
//       }
//       return rows.get(portfolioId)!;
//     };

//     Object.values(state.positions).forEach((p) => {
//       const pid = p.id?.portfolioId;
//       if (!pid) return;
//       const row = ensureRow(pid);

//       row.holdings += Number(p.holdings ?? 0);
//       row.totalInvestment += Number(p.totalInvested ?? 0);
//       row.realisedPnl += Number(p.realizedPnl ?? 0);
//     });

//     Object.entries(state.unrealised).forEach(([pid, u]) => {
//       const row = ensureRow(pid);
//       row.unrealisedPnl = Number(u.overall ?? 0);
//       row.lastUpdatedLabel = this.formatTimestamp(u.ts);
//     });

//     return Array.from(rows.values()).sort((a, b) => a.portfolioId.localeCompare(b.portfolioId));
//   }

//   private buildKpis(rows: PortfolioOverviewRow[]): DashboardKpis {
//     const totalPortfolios = rows.length;
//     const totalInvestment = rows.reduce((sum, r) => sum + r.totalInvestment, 0);
//     const avgUnrealisedPnl = totalPortfolios
//       ? rows.reduce((sum, r) => sum + r.unrealisedPnl, 0) / totalPortfolios
//       : 0;
//     const totalStocks = rows.reduce((sum, r) => sum + r.holdings, 0);

//     return { totalPortfolios, totalInvestment, avgUnrealisedPnl, totalStocks };
//   }

//   private buildMovers(
//     unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>
//   ): MoversView {
//     const symbolTotals: Record<string, number> = {};

//     Object.values(unrealised).forEach((u) => {
//       Object.entries(u.bySymbol ?? {}).forEach(([sym, pnl]) => {
//         symbolTotals[sym] = (symbolTotals[sym] ?? 0) + Number(pnl ?? 0);
//       });
//     });

//     const all = Object.entries(symbolTotals)
//       .map(([symbol, pct]) => ({ symbol, pct }))
//       .sort((a, b) => b.pct - a.pct);

//     const topGainers = all.filter((x) => x.pct >= 0).slice(0, 5);
//     const topLosers = all
//       .filter((x) => x.pct < 0)
//       .sort((a, b) => a.pct - b.pct)
//       .slice(0, 5);

//     return { topGainers, topLosers };
//   }

//   private recordPnlTrend(
//     unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>
//   ): void {
//     const total = Object.values(unrealised).reduce((sum, u) => sum + Number(u.overall ?? 0), 0);
//     const now = new Date();
//     const label = now.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });

//     const next = [...this.pnlTrendSubject.value, { label, value: total }];
//     this.pnlTrendSubject.next(next.slice(-MAX_TREND_POINTS));
//   }

//   private positionKey(portfolioId: string, symbol: string): string {
//     return `${portfolioId}|${symbol}`.toUpperCase();
//   }

//   private setState(partial: Partial<PmsState>): void {
//     this.state$.next({ ...this.state$.value, ...partial });
//   }

//   private updateState(updater: (state: PmsState) => PmsState): void {
//     this.state$.next(updater(this.state$.value));
//   }

//   private formatTimestamp(ts: string): string {
//     const d = new Date(ts);
//     return isNaN(d.getTime())
//       ? 'Live'
//       : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
//   }
  
//   // ✅ Updated Selector: Returns per-symbol PnL and full unrealised object
//   selectPortfolio(portfolioId: string): Observable<{
//     positions: AnalysisEntityDto[];
//     kpis: PortfolioKpis;
//     unrealisedDetails: {
//       overall: number;
//       bySymbol: Record<string, number>;
//     };
//   }> {
//     return this.state$.pipe(
//       map((state) => {
//         const positions = Object.values(state.positions).filter(
//           (p) => p.id?.portfolioId === portfolioId
//         );

//         const totalInvestment = positions.reduce((sum, p) => sum + (p.totalInvested || 0), 0);
//         const realisedPnl = positions.reduce((sum, p) => sum + (p.realizedPnl || 0), 0);

//         // Get full unrealised data
//         const uData = state.unrealised[portfolioId];
//         const overall = uData ? uData.overall : 0;
//         const bySymbol = uData ? uData.bySymbol : {};

//         return {
//           positions,
//           kpis: {
//             portfolioId,
//             totalInvestment,
//             realisedPnl,
//             unrealisedPnl: overall,
//           },
//           unrealisedDetails: { overall, bySymbol },
//         };
//       })
//     );
//   }
// }


import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  take,
  takeUntil,
} from 'rxjs';

import { AnalyticsApiService } from '../services/analytics-api.service';
import { AnalyticsStompService } from '../services/analytics-stomp.service';
import { LeaderboardWsService } from '../services/leaderboard-ws.service';
import { LoggerService } from '../services/logger.service';

import {
  AnalysisEntityDto,
  SectorMetricsDto,
  UnrealisedPnlWsDto,
} from '../models/analytics.models';
import { LeaderboardEntry } from '../models/leaderboard.models';
import {
  DashboardKpis,
  MoversView,
  PortfolioOverviewRow,
  PnlTrendPoint,
  SectorExposure,
} from '../models/ui.models';
import { PortfolioKpis } from '../models/portfolio-ui.models';

interface PmsState {
  positions: Record<string, AnalysisEntityDto>;
  unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>;
  sectors: SectorMetricsDto[];
  leaderboard: LeaderboardEntry[];
}

const MAX_TREND_POINTS = 30;

@Injectable({ providedIn: 'root' })
export class PmsStore {
  private readonly logger = inject(LoggerService);
  private readonly state$ = new BehaviorSubject<PmsState>({
    positions: {},
    unrealised: {},
    sectors: [],
    leaderboard: [],
  });

  private readonly destroy$ = new Subject<void>();
  private readonly pnlTrendSubject = new BehaviorSubject<PnlTrendPoint[]>([]);
  readonly pnlTrend$ = this.pnlTrendSubject.asObservable();

  readonly dashboardRows$: Observable<PortfolioOverviewRow[]> = this.state$.pipe(
    map((state) => this.buildDashboardRows(state))
  );

  readonly kpis$: Observable<DashboardKpis> = this.dashboardRows$.pipe(
    map((rows) => this.buildKpis(rows))
  );

  readonly movers$: Observable<MoversView> = this.state$.pipe(
    map((state) => this.buildMovers(state.unrealised))
  );

  readonly sectorExposure$: Observable<SectorExposure[]> = this.state$.pipe(
    map((state) => {
      const mapped = state.sectors.map((s) => ({ sector: s.sector, pct: s.percentage ?? 0 }));
      this.logger.debug('Sector exposure data', mapped);
      return mapped;
    })
  );

  constructor(
    private readonly api: AnalyticsApiService,
    private readonly analyticsWs: AnalyticsStompService,
    private readonly leaderboardWs: LeaderboardWsService
  ) {}

  init(): void {
    this.handleAnalyticsStomp();
    this.handleLeaderboardSocket();
    this.loadStaticData();

    // 3. Wait for Socket -> Trigger PnL
    this.analyticsWs.connected$
      .pipe(
        filter((connected) => connected === true),
        take(1)
      )
      .subscribe(() => {
        this.logger.info('Socket Ready - WebSocket connection established');
        // Note: Trigger endpoint not available on this analytics service
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.analyticsWs.disconnect();
  }

  // ✅ Correctly implemented once
  selectPortfolio(portfolioId: string): Observable<{
    positions: AnalysisEntityDto[];
    kpis: PortfolioKpis;
    unrealisedDetails: { 
      overall: number; 
      bySymbol: Record<string, number> 
    };
  }> {
    return this.state$.pipe(
      map((state) => {
        const positions = Object.values(state.positions).filter(
          (p) => p.id?.portfolioId === portfolioId
        );

        const totalInvestment = positions.reduce((sum, p) => sum + (p.totalInvested || 0), 0);
        const realisedPnl = positions.reduce((sum, p) => sum + (p.realizedPnl || 0), 0);
        
        const uData = state.unrealised[portfolioId];
        const overall = uData ? uData.overall : 0;
        const bySymbol = uData ? uData.bySymbol : {};

        return {
          positions,
          kpis: {
            portfolioId,
            totalInvestment,
            realisedPnl,
            unrealisedPnl: overall
          },
          unrealisedDetails: { overall, bySymbol }
        };
      })
    );
  }

  private loadStaticData(): void {
    this.api.getAnalysisAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (positions) => {
        this.logger.info('Loaded positions', { count: positions.length });
        const map: Record<string, AnalysisEntityDto> = {};
        positions.forEach(p => {
          if (p.id?.portfolioId && p.id?.symbol) {
             const key = this.positionKey(p.id.portfolioId, p.id.symbol);
             map[key] = p;
          }
        });
        this.setState({ positions: map });
      },
      error: (err) => this.logger.warn('Positions not available', err)
    });

    this.api.getSectorOverall().pipe(takeUntil(this.destroy$)).subscribe({
      next: (sectors) => {
        this.logger.info('Loaded sector data', { count: sectors.length });
        this.setState({ sectors });
      },
      error: (err) => this.logger.warn('Sector data not available', err)
    });
  }

  private handleAnalyticsStomp(): void {
    this.analyticsWs.connect();

    this.analyticsWs.positionUpdate$
      .pipe(
        filter((msg): msg is AnalysisEntityDto => msg !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((msg) => this.upsertPosition(msg));

    // ✅ Listen for List of Unrealized PnL
    this.analyticsWs.unrealised$
      .pipe(
        filter((msg): msg is UnrealisedPnlWsDto[] => msg !== null && msg.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe((msgs) => this.upsertUnrealised(msgs));
  }

  private handleLeaderboardSocket(): void {
    this.leaderboardWs.stream()
      .pipe(takeUntil(this.destroy$))
      .subscribe((snapshot: any) => this.setState({ leaderboard: snapshot.entries ?? [] }));
  }

  private upsertPosition(position: AnalysisEntityDto): void {
    const pid = position.id?.portfolioId;
    const sym = position.id?.symbol;
    if (!pid || !sym) return;

    this.updateState((state) => {
      const positions = { ...state.positions };
      positions[this.positionKey(pid, sym)] = position;
      return { ...state, positions };
    });
  }

  // ✅ Handles List of Updates
  private upsertUnrealised(payloads: UnrealisedPnlWsDto[]): void {
    const ts = new Date().toISOString();

    this.updateState((state) => {
      const unrealised = { ...state.unrealised };

      payloads.forEach(payload => {
        const pid = payload.portfolio_id;
        if (!pid) return;

        const overall = Number(payload.overallUnrealised_Pnl ?? 0);
        const bySymbol = payload.symbol ?? {};
        
        unrealised[pid] = { overall, bySymbol, ts };
      });

      this.recordPnlTrend(unrealised); 
      return { ...state, unrealised };
    });
  }

  private buildDashboardRows(state: PmsState): PortfolioOverviewRow[] {
    const rows = new Map<string, PortfolioOverviewRow>();

    const ensureRow = (portfolioId: string): PortfolioOverviewRow => {
      if (!rows.has(portfolioId)) {
        rows.set(portfolioId, {
          portfolioId,
          investorName: `Investor ${portfolioId.slice(0, 6).toUpperCase()}`,
          holdings: 0,
          totalInvestment: 0,
          unrealisedPnl: 0,
          realisedPnl: 0,
          lastUpdatedLabel: '—',
        });
      }
      return rows.get(portfolioId)!;
    };

    Object.values(state.positions).forEach((p) => {
      const pid = p.id?.portfolioId;
      if (!pid) return;
      const row = ensureRow(pid);
      row.holdings += Number(p.holdings ?? 0);
      row.totalInvestment += Number(p.totalInvested ?? 0);
      row.realisedPnl += Number(p.realizedPnl ?? 0);
    });

    Object.entries(state.unrealised).forEach(([pid, u]) => {
      const row = ensureRow(pid);
      row.unrealisedPnl = Number(u.overall ?? 0);
      row.lastUpdatedLabel = this.formatTimestamp(u.ts);
    });

    return Array.from(rows.values()).sort((a, b) => a.portfolioId.localeCompare(b.portfolioId));
  }

  private buildKpis(rows: PortfolioOverviewRow[]): DashboardKpis {
    const totalPortfolios = rows.length;
    const totalInvestment = rows.reduce((sum, r) => sum + r.totalInvestment, 0);
    const avgUnrealisedPnl = totalPortfolios ? rows.reduce((sum, r) => sum + r.unrealisedPnl, 0) / totalPortfolios : 0;
    const totalStocks = rows.reduce((sum, r) => sum + r.holdings, 0);
    return { totalPortfolios, totalInvestment, avgUnrealisedPnl, totalStocks };
  }

  private buildMovers(unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>): MoversView {
    const symbolTotals: Record<string, number> = {};
    Object.values(unrealised).forEach((u) => {
      Object.entries(u.bySymbol ?? {}).forEach(([sym, pnl]) => {
        symbolTotals[sym] = (symbolTotals[sym] ?? 0) + Number(pnl ?? 0);
      });
    });
    const all = Object.entries(symbolTotals).map(([symbol, pct]) => ({ symbol, pct })).sort((a, b) => b.pct - a.pct);
    return { topGainers: all.filter((x) => x.pct >= 0).slice(0, 5), topLosers: all.filter((x) => x.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 5) };
  }

  private recordPnlTrend(unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>): void {
    const total = Object.values(unrealised).reduce((sum, u) => sum + Number(u.overall ?? 0), 0);
    const now = new Date();
    const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const next = [...this.pnlTrendSubject.value, { label, value: total }];
    this.pnlTrendSubject.next(next.slice(-MAX_TREND_POINTS));
  }

  private positionKey(portfolioId: string, symbol: string): string {
    return `${portfolioId}|${symbol}`.toUpperCase();
  }

  private setState(partial: Partial<PmsState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  private updateState(updater: (state: PmsState) => PmsState): void {
    this.state$.next(updater(this.state$.value));
  }

  private formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 'Live' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
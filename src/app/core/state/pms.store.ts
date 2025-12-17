import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, asyncScheduler, catchError, map, of, throttleTime } from 'rxjs';

import { AnalyticsApiService } from '../services/analytics-api.service';
import { AnalyticsWsHoldingsService } from '../services/analytics-ws-holdings.service';
import { AnalyticsWsUnrealisedService } from '../services/analytics-ws-unrealised.service';
import { LeaderboardWsService } from '../services/leaderboard-ws.service';

import { AnalysisEntityDto, SectorMetricsDto, UnrealisedPnlWsDto } from '../models/analytics.models';
import { LeaderboardEntry } from '../models/leaderboard.models';
import { DashboardKpis, MoversView, PortfolioOverviewRow, PnlTrendPoint, SectorExposure } from '../models/ui.models';

interface PmsState {
  // key: `${portfolioId}|${symbol}`
  positions: Record<string, AnalysisEntityDto>;
  // key: portfolioId
  unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>;
  sectors: SectorMetricsDto[];
  leaderboard: LeaderboardEntry[];
}

const MAX_TREND_POINTS = 30;

@Injectable({ providedIn: 'root' })
export class PmsStore {
  private readonly state$ = new BehaviorSubject<PmsState>({
    positions: {},
    unrealised: {},
    sectors: [],
    leaderboard: []
  });

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
    map((state) => state.sectors.map((s) => ({ sector: s.sector, pct: s.percentage ?? 0 })))
  );

  constructor(
    private readonly api: AnalyticsApiService,
    private readonly positionsWs: AnalyticsWsHoldingsService,
    private readonly unrealisedWs: AnalyticsWsUnrealisedService,
    private readonly leaderboardWs: LeaderboardWsService
  ) {}

  // Call from dashboard init (so it reliably runs)
  init(): void {
    this.loadInitialData();
    this.handlePositionSocket();
    this.handleUnrealisedSocket();
    this.handleLeaderboardSocket();
  }

  private loadInitialData(): void {
    this.api.getAnalysisAll()
      .pipe(catchError((e) => {
        console.error('getAnalysisAll failed', e);
        return of([] as AnalysisEntityDto[]);
      }))
      .subscribe((positions) => {
        const map = positions.reduce<Record<string, AnalysisEntityDto>>((acc, p) => {
          const pid = p.id?.portfolioId;
          const sym = p.id?.symbol;
          if (!pid || !sym) return acc;

          const key = this.positionKey(pid, sym);
          acc[key] = {
            ...p,
            holdings: Number(p.holdings ?? 0),
            totalInvested: Number(p.totalInvested ?? 0),
            realizedPnl: Number(p.realizedPnl ?? 0)
          };
          return acc;
        }, {});
        this.setState({ positions: map });
      });

    this.api.getSectorOverall()
      .pipe(catchError((e) => {
        console.error('getSectorOverall failed', e);
        return of([] as SectorMetricsDto[]);
      }))
      .subscribe((sectors) => this.setState({ sectors }));
  }

  private handlePositionSocket(): void {
    this.positionsWs.stream()
      .pipe(throttleTime(250, asyncScheduler, { leading: true, trailing: true }))
      .subscribe((msg) => this.upsertPosition(msg));
  }

  private handleUnrealisedSocket(): void {
    this.unrealisedWs.stream()
      .subscribe((msg) => this.upsertUnrealised(msg));
  }

  private handleLeaderboardSocket(): void {
    // Keep it running even if not used on dashboard yet
    this.leaderboardWs.stream()
      .pipe(catchError((e) => {
        console.error('leaderboard WS failed', e);
        return of({ entries: [] } as any);
      }))
      .subscribe((snapshot: any) => this.setState({ leaderboard: snapshot.entries ?? [] }));
  }

  private upsertPosition(position: AnalysisEntityDto): void {
    const pid = position.id?.portfolioId;
    const sym = position.id?.symbol;
    if (!pid || !sym) return;

    const normalized: AnalysisEntityDto = {
      ...position,
      holdings: Number(position.holdings ?? 0),
      totalInvested: Number(position.totalInvested ?? 0),
      realizedPnl: Number(position.realizedPnl ?? 0)
    };

    this.updateState((state) => {
      const positions = { ...state.positions };
      positions[this.positionKey(pid, sym)] = normalized;
      return { ...state, positions };
    });
  }

  private upsertUnrealised(payload: UnrealisedPnlWsDto): void {
    const pid = payload.portfolio_id;
    if (!pid) return;

    const overall = Number(payload.overallUnrealised_Pnl ?? 0);
    const bySymbol = payload.symbol ?? {};
    const ts = new Date().toISOString();

    this.updateState((state) => {
      const unrealised = { ...state.unrealised, [pid]: { overall, bySymbol, ts } };
      const nextState = { ...state, unrealised };
      this.recordPnlTrend(unrealised);
      return nextState;
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
          lastUpdatedLabel: '—'
        });
      }
      return rows.get(portfolioId)!;
    };

    // Aggregate positions (holdings/investment/realised)
    Object.values(state.positions).forEach((p) => {
      const pid = p.id?.portfolioId;
      if (!pid) return;
      const row = ensureRow(pid);

      row.holdings += Number(p.holdings ?? 0);
      row.totalInvestment += Number(p.totalInvested ?? 0);
      row.realisedPnl += Number(p.realizedPnl ?? 0);
    });

    // Apply unrealised snapshot
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
    const avgUnrealisedPnl = totalPortfolios
      ? rows.reduce((sum, r) => sum + r.unrealisedPnl, 0) / totalPortfolios
      : 0;
    const totalStocks = rows.reduce((sum, r) => sum + r.holdings, 0);

    return { totalPortfolios, totalInvestment, avgUnrealisedPnl, totalStocks };
  }

  private buildMovers(
    unrealised: Record<string, { overall: number; bySymbol: Record<string, number>; ts: string }>
  ): MoversView {
    const symbolTotals: Record<string, number> = {};

    Object.values(unrealised).forEach((u) => {
      Object.entries(u.bySymbol ?? {}).forEach(([sym, pnl]) => {
        symbolTotals[sym] = (symbolTotals[sym] ?? 0) + Number(pnl ?? 0);
      });
    });

    const all = Object.entries(symbolTotals)
      .map(([symbol, pct]) => ({ symbol, pct }))
      .sort((a, b) => b.pct - a.pct);

    const topGainers = all.filter(x => x.pct >= 0).slice(0, 5);
    const topLosers = all.filter(x => x.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 5);

    return { topGainers, topLosers };
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

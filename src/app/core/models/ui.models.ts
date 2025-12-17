export interface DashboardKpis {
  totalPortfolios: number;
  totalInvestment: number;
  avgUnrealisedPnl: number;
  totalStocks: number;
}

export interface PortfolioOverviewRow {
  portfolioId: string;
  investorName: string;

  holdings: number;          // total shares across symbols
  totalInvestment: number;   // sum(totalInvested) across symbols
  unrealisedPnl: number;     // overallUnrealised_Pnl
  realisedPnl: number;       // sum(realizedPnl)

  lastUpdatedLabel: string;
}

export interface MoverRow {
  symbol: string;
  pct: number; // NOTE: this is value right now, rename later if you want
}

export interface MoversView {
  topGainers: MoverRow[];
  topLosers: MoverRow[];
}

export interface SectorExposure {
  sector: string;
  pct: number;
}

export interface PnlTrendPoint {
  label: string;
  value: number;
}

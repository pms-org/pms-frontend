export interface UIState {
  // UI model definitions
}

export interface PortfolioOverviewRow {
  portfolioId: string;
  portfolioName: string;
  totalValue: number;
  dailyPnlPct: number;
  stocksHeld: number;
  topSector: string;
  lastUpdatedLabel: string;
}

export interface MoverRow {
  symbol: string;
  pct: number;
}

export interface SectorExposure {
  sector: string;
  pct: number;
}

export interface PnlTrendPoint {
  label: string;
  value: number;
}
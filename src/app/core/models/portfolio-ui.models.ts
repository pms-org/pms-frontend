export interface PortfolioKpis {
  portfolioId: string;
  totalInvestment: number;
  unrealisedPnl: number;
  realisedPnl: number;
}

export interface PortfolioSymbolRow {
  symbol: string;
  holdings: number;
  totalInvestment: number;
  unrealisedPnl: number;
  realisedPnl: number;
}

export interface PortfolioSectorSlice {
  sector: string;
  pct: number;
}

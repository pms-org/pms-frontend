import { PortfolioSymbolRow, PortfolioSectorSlice, PortfolioKpis } from '../models/portfolio-ui.models';

export const MOCK_PORTFOLIO_SYMBOLS: Record<string, PortfolioSymbolRow[]> = {
  p1: [
    { symbol: 'AAPL', holdings: 120, totalInvestment: 3200000, unrealisedPnl: 85000, realisedPnl: 12000 },
    { symbol: 'NVDA', holdings: 60, totalInvestment: 4100000, unrealisedPnl: 160000, realisedPnl: 42000 },
    { symbol: 'MSFT', holdings: 90, totalInvestment: 2500000, unrealisedPnl: 40000, realisedPnl: 18000 },
    { symbol: 'XOM', holdings: 40, totalInvestment: 2650000, unrealisedPnl: 0, realisedPnl: 48000 }
  ],
  p2: [
    { symbol: 'JPM', holdings: 70, totalInvestment: 2600000, unrealisedPnl: 24000, realisedPnl: 12000 },
    { symbol: 'BAC', holdings: 80, totalInvestment: 1900000, unrealisedPnl: 18000, realisedPnl: 9000 },
    { symbol: 'UNH', holdings: 20, totalInvestment: 4420000, unrealisedPnl: 124000, realisedPnl: 77000 }
  ],
  p3: [
    { symbol: 'NFLX', holdings: 30, totalInvestment: 1100000, unrealisedPnl: -28000, realisedPnl: 0 },
    { symbol: 'TSLA', holdings: 25, totalInvestment: 2100000, unrealisedPnl: 98000, realisedPnl: 21000 },
    { symbol: 'AMD', holdings: 65, totalInvestment: 3800000, unrealisedPnl: 150000, realisedPnl: 60000 },
    { symbol: 'ORCL', holdings: 40, totalInvestment: 2200000, unrealisedPnl: 69000, realisedPnl: 18000 }
  ],
  p4: [
    { symbol: 'XOM', holdings: 90, totalInvestment: 3720000, unrealisedPnl: -94000, realisedPnl: 45000 },
    { symbol: 'CVX', holdings: 50, totalInvestment: 3000000, unrealisedPnl: 12000, realisedPnl: 0 }
  ]
};

export const MOCK_SYMBOL_TO_SECTOR: Record<string, string> = {
  AAPL: 'Technology',
  NVDA: 'Technology',
  MSFT: 'Technology',
  ORCL: 'Technology',
  AMD: 'Technology',
  TSLA: 'Consumer',
  NFLX: 'Consumer',
  XOM: 'Energy',
  CVX: 'Energy',
  JPM: 'Finance',
  BAC: 'Finance',
  UNH: 'Healthcare'
};

export function buildPortfolioKpis(portfolioId: string): PortfolioKpis {
  const rows = MOCK_PORTFOLIO_SYMBOLS[portfolioId] ?? [];
  const totalInvestment = rows.reduce((s, r) => s + r.totalInvestment, 0);
  const unrealisedPnl = rows.reduce((s, r) => s + r.unrealisedPnl, 0);
  const realisedPnl = rows.reduce((s, r) => s + r.realisedPnl, 0);
  return { portfolioId, totalInvestment, unrealisedPnl, realisedPnl };
}

export function buildPortfolioSector(portfolioId: string): PortfolioSectorSlice[] {
  const rows = MOCK_PORTFOLIO_SYMBOLS[portfolioId] ?? [];
  const sectorTotals: Record<string, number> = {};
  const total = rows.reduce((s, r) => s + r.totalInvestment, 0) || 1;

  for (const r of rows) {
    const sector = MOCK_SYMBOL_TO_SECTOR[r.symbol] ?? 'Other';
    sectorTotals[sector] = (sectorTotals[sector] ?? 0) + r.totalInvestment;
  }

  return Object.entries(sectorTotals)
    .map(([sector, invested]) => ({ sector, pct: Math.round((invested / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

export interface PortfolioSectorSymbolRow {
  symbol: string;
  percentage: number;     // % within THIS sector for THIS portfolio
  holdings: number;
  totalInvested: number;
  realisedPnl: number;
  unrealisedPnl: number;  // optional but useful
}

/**
 * portfolioId -> sector -> rows
 */
export const MOCK_PORTFOLIO_SECTOR_BREAKDOWN: Record<
  string,
  Record<string, PortfolioSectorSymbolRow[]>
> = {
  p1: {
    Technology: [
      { symbol: 'NVDA', percentage: 44.0, holdings: 60,  totalInvested: 4100000, realisedPnl: 42000, unrealisedPnl: 160000 },
      { symbol: 'AAPL', percentage: 34.0, holdings: 120, totalInvested: 3200000, realisedPnl: 12000, unrealisedPnl: 85000 },
      { symbol: 'MSFT', percentage: 22.0, holdings: 90,  totalInvested: 2500000, realisedPnl: 18000, unrealisedPnl: 40000 }
    ],
    Energy: [
      { symbol: 'XOM', percentage: 100.0, holdings: 40, totalInvested: 2650000, realisedPnl: 48000, unrealisedPnl: 0 }
    ]
  },

  p2: {
    Finance: [
      { symbol: 'JPM', percentage: 58.0, holdings: 70, totalInvested: 2600000, realisedPnl: 12000, unrealisedPnl: 24000 },
      { symbol: 'BAC', percentage: 42.0, holdings: 80, totalInvested: 1900000, realisedPnl: 9000,  unrealisedPnl: 18000 }
    ],
    Healthcare: [
      { symbol: 'UNH', percentage: 100.0, holdings: 20, totalInvested: 4420000, realisedPnl: 77000, unrealisedPnl: 124000 }
    ]
  },

  p3: {
    Technology: [
      { symbol: 'AMD',  percentage: 63.0, holdings: 65, totalInvested: 3800000, realisedPnl: 60000, unrealisedPnl: 150000 },
      { symbol: 'ORCL', percentage: 37.0, holdings: 40, totalInvested: 2200000, realisedPnl: 18000, unrealisedPnl: 69000 }
    ],
    Consumer: [
      { symbol: 'TSLA', percentage: 66.0, holdings: 25, totalInvested: 2100000, realisedPnl: 21000, unrealisedPnl: 98000 },
      { symbol: 'NFLX', percentage: 34.0, holdings: 30, totalInvested: 1100000, realisedPnl: 0,     unrealisedPnl: -28000 }
    ]
  },

  p4: {
    Energy: [
      { symbol: 'XOM', percentage: 55.0, holdings: 90, totalInvested: 3720000, realisedPnl: 45000, unrealisedPnl: -94000 },
      { symbol: 'CVX', percentage: 45.0, holdings: 50, totalInvested: 3000000, realisedPnl: 0,     unrealisedPnl: 12000 }
    ]
  }
};

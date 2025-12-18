import {
  PortfolioOverviewRow,
  DashboardKpis,
  MoversView,
  SectorExposure,
  PnlTrendPoint
} from '../models/ui.models';

/* ---------------- DASHBOARD TABLE ---------------- */

export const MOCK_PORTFOLIOS: PortfolioOverviewRow[] = [
  {
    portfolioId: 'p1',
    investorName: 'Growth Alpha Fund',
    holdings: 47,
    totalInvestment: 12_450_000,
    unrealisedPnl: 285_000,
    realisedPnl: 120_000,
    lastUpdatedLabel: '2 mins ago'
  },
  {
    portfolioId: 'p2',
    investorName: 'Value Momentum',
    holdings: 32,
    totalInvestment: 8_920_000,
    unrealisedPnl: 166_000,
    realisedPnl: 98_000,
    lastUpdatedLabel: '1 min ago'
  },
  {
    portfolioId: 'p3',
    investorName: 'Tech Innovators',
    holdings: 28,
    totalInvestment: 15_680_000,
    unrealisedPnl: 489_000,
    realisedPnl: 210_000,
    lastUpdatedLabel: '3 mins ago'
  },
  {
    portfolioId: 'p4',
    investorName: 'Energy Sector Play',
    holdings: 18,
    totalInvestment: 6_720_000,
    unrealisedPnl: -94_000,
    realisedPnl: 45_000,
    lastUpdatedLabel: '5 mins ago'
  }
];

/* ---------------- KPI CARDS ---------------- */

export const MOCK_KPIS: DashboardKpis = {
  totalPortfolios: 4,
  totalInvestment: 43_770_000,
  avgUnrealisedPnl: 211_500,
  totalStocks: 125
};

/* ---------------- TOP GAINERS / LOSERS ---------------- */

export const MOCK_MOVERS: MoversView = {
  topGainers: [
    { symbol: 'NVDA', pct: 5.67 },
    { symbol: 'TSLA', pct: 4.23 },
    { symbol: 'AMD', pct: 3.89 },
    { symbol: 'AAPL', pct: 2.45 },
    { symbol: 'MSFT', pct: 2.12 }
  ],
  topLosers: [
    { symbol: 'XOM', pct: -2.34 },
    { symbol: 'NFLX', pct: -1.98 },
    { symbol: 'META', pct: -1.42 },
    { symbol: 'INTC', pct: -1.11 },
    { symbol: 'ORCL', pct: -0.85 }
  ]
};

/* ---------------- SECTOR EXPOSURE ---------------- */

export const MOCK_SECTOR_EXPOSURE: SectorExposure[] = [
  { sector: 'Technology', pct: 42 },
  { sector: 'Finance', pct: 21 },
  { sector: 'Energy', pct: 14 },
  { sector: 'Healthcare', pct: 13 },
  { sector: 'Consumer', pct: 10 }
];

/* ---------------- PnL TREND ---------------- */

export const MOCK_PNL_TREND: PnlTrendPoint[] = [
  { label: '10:00', value: 180_000 },
  { label: '10:05', value: 195_000 },
  { label: '10:10', value: 210_000 },
  { label: '10:15', value: 205_000 },
  { label: '10:20', value: 220_000 },
  { label: '10:25', value: 235_000 }
];

export const MOCK_PORTFOLIO_TREND: Record<string, PnlTrendPoint[]> = {
  p1: [
    { label: 'Mon', value: 12000 },
    { label: 'Tue', value: 19000 },
    { label: 'Wed', value: 15000 },
    { label: 'Thu', value: 25000 },
    { label: 'Fri', value: 22000 }
  ],
  p2: [
    { label: 'Mon', value: 8000 },
    { label: 'Tue', value: 11000 },
    { label: 'Wed', value: 9000 },
    { label: 'Thu', value: 14000 },
    { label: 'Fri', value: 13000 }
  ],
  p3: [
    { label: 'Mon', value: 16000 },
    { label: 'Tue', value: 14000 },
    { label: 'Wed', value: 21000 },
    { label: 'Thu', value: 18000 },
    { label: 'Fri', value: 26000 }
  ],
  p4: [
    { label: 'Mon', value: -2000 },
    { label: 'Tue', value: 1000 },
    { label: 'Wed', value: -1500 },
    { label: 'Thu', value: 3000 },
    { label: 'Fri', value: -500 }
  ]
};

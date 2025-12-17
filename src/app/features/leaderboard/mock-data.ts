import { Portfolio } from '../../core/models/leaderboard.models';

export const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    rank: 1,
    portfolioId: 'p1',
    name: 'Alpha Growth Fund',
    dailyPnl: 3.45,
    totalValue: 25680000,
    stocks: 42,
    topSector: 'Technology',
    sectorExposure: [
      { sector: 'Technology', percentage: 45 },
      { sector: 'Finance', percentage: 25 },
      { sector: 'Healthcare', percentage: 20 },
      { sector: 'Energy', percentage: 10 }
    ],
    pnlTrend: [2.1, 2.3, 2.8, 3.0, 3.2, 3.45]
  },
  {
    rank: 2,
    portfolioId: 'p2',
    name: 'Quantum Capital',
    dailyPnl: 2.87,
    totalValue: 18950000,
    stocks: 35,
    topSector: 'Finance',
    sectorExposure: [
      { sector: 'Finance', percentage: 40 },
      { sector: 'Technology', percentage: 30 },
      { sector: 'Healthcare', percentage: 20 },
      { sector: 'Consumer', percentage: 10 }
    ],
    pnlTrend: [1.8, 2.0, 2.2, 2.5, 2.7, 2.87]
  },
  {
    rank: 3,
    portfolioId: 'p3',
    name: 'Velocity Ventures',
    dailyPnl: 2.34,
    totalValue: 22100000,
    stocks: 38,
    topSector: 'Technology',
    sectorExposure: [
      { sector: 'Technology', percentage: 50 },
      { sector: 'Consumer', percentage: 25 },
      { sector: 'Healthcare', percentage: 15 },
      { sector: 'Energy', percentage: 10 }
    ],
    pnlTrend: [1.5, 1.7, 1.9, 2.1, 2.2, 2.34]
  },
  {
    rank: 4,
    portfolioId: 'p4',
    name: 'Horizon Equity',
    dailyPnl: 1.92,
    totalValue: 15680000,
    stocks: 28,
    topSector: 'Healthcare',
    sectorExposure: [
      { sector: 'Healthcare', percentage: 45 },
      { sector: 'Technology', percentage: 30 },
      { sector: 'Finance', percentage: 15 },
      { sector: 'Consumer', percentage: 10 }
    ],
    pnlTrend: [1.2, 1.4, 1.6, 1.7, 1.8, 1.92]
  },
  {
    rank: 5,
    portfolioId: 'p5',
    name: 'Nexus Portfolio',
    dailyPnl: 1.56,
    totalValue: 19200000,
    stocks: 45,
    topSector: 'Energy',
    sectorExposure: [
      { sector: 'Energy', percentage: 40 },
      { sector: 'Finance', percentage: 30 },
      { sector: 'Technology', percentage: 20 },
      { sector: 'Consumer', percentage: 10 }
    ],
    pnlTrend: [0.9, 1.1, 1.3, 1.4, 1.5, 1.56]
  },
  {
    rank: 6,
    portfolioId: 'p6',
    name: 'Pinnacle Investments',
    dailyPnl: 0.98,
    totalValue: 12450000,
    stocks: 32,
    topSector: 'Consumer',
    sectorExposure: [
      { sector: 'Consumer', percentage: 45 },
      { sector: 'Technology', percentage: 25 },
      { sector: 'Healthcare', percentage: 20 },
      { sector: 'Finance', percentage: 10 }
    ],
    pnlTrend: [0.5, 0.6, 0.7, 0.8, 0.9, 0.98]
  },
  {
    rank: 7,
    portfolioId: 'p7',
    name: 'Meridian Fund',
    dailyPnl: -0.45,
    totalValue: 14800000,
    stocks: 29,
    topSector: 'Finance',
    sectorExposure: [
      { sector: 'Finance', percentage: 50 },
      { sector: 'Energy', percentage: 25 },
      { sector: 'Technology', percentage: 15 },
      { sector: 'Healthcare', percentage: 10 }
    ],
    pnlTrend: [0.2, 0.1, -0.1, -0.2, -0.3, -0.45]
  },
  {
    rank: 8,
    portfolioId: 'p8',
    name: 'Apex Holdings',
    dailyPnl: -1.23,
    totalValue: 11200000,
    stocks: 25,
    topSector: 'Technology',
    sectorExposure: [
      { sector: 'Technology', percentage: 40 },
      { sector: 'Consumer', percentage: 30 },
      { sector: 'Finance', percentage: 20 },
      { sector: 'Healthcare', percentage: 10 }
    ],
    pnlTrend: [-0.5, -0.7, -0.9, -1.0, -1.1, -1.23]
  }
];

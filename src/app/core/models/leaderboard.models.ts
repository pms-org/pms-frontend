export interface LeaderboardEntry {
  portfolioId: string;
  portfolioName: string;
  pnl: number;
  rank: number;
}

export interface LeaderboardSnapshot {
  generatedAt: string;
  entries: LeaderboardEntry[];
}

export interface Portfolio {
  rank: number;
  portfolioId: string;
  name?: string;
  compositeScore?: number;
  prevCompositeScore?: number;
  scoreDirection?: 'up' | 'down' | 'none';
  prevRank?: number;
  showArrow?: boolean;
  avgReturn?: number;
  sharpe?: string;
  sortino?: string;
  updatedAt?: string;
  // Chart data
  sharpeHistory?: number[];
  sortinoHistory?: number[];
  overallSharpeHistory?: number[];
  overallSortinoHistory?: number[];
  // Legacy fields for backward compatibility
  dailyPnl?: number;
  totalValue?: number;
  stocks?: number;
  topSector?: string;
  sectorExposure?: SectorBreakdown[];
  pnlTrend?: number[];
}

export interface SectorBreakdown {
  sector: string;
  percentage: number;
}

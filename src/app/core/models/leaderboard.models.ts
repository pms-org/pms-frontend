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
  name: string;
  dailyPnl: number;
  totalValue: number;
  stocks: number;
  topSector: string;
  sectorExposure: SectorBreakdown[];
  pnlTrend: number[];
}

export interface SectorBreakdown {
  sector: string;
  percentage: number;
}

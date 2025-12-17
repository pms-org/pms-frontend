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

export interface AnalysisKeyDto {
  portfolioId: string; // UUID
  symbol: string;
}

export interface AnalysisEntityDto {
  id: AnalysisKeyDto;
  holdings: number;
  totalInvested: number;
  realizedPnl: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectorMetricsDto {
  sector: string;
  percentage: number;
  totalHoldings?: number;
  totalInvested?: number;
  realizedPnl?: number;
}

export interface UnrealisedPnlWsDto {
  symbol: Record<string, number>;          // per-symbol unrealised
  overallUnrealised_Pnl: number;           // note underscore
  portfolio_id: string;                    // note underscore
}

// Add this to your existing analytics.models.ts
export interface SymbolMetricsDto {
  symbol: string;
  percentage: number;
  holdings: number;
  totalInvested: number;
  realizedPnl: number;
}
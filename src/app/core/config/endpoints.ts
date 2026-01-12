export const ENDPOINTS = {
  analytics: {
    // Backend HTTP/Ws base (override in environment.*.ts)
    baseHttp: 'http://localhost:8082',
    baseWs: 'ws://localhost:8082',

    // REST
    analysisAll: '/api/analytics/analysis',            // GET List<AnalysisEntityDto>
    sectorOverall: '/api/analytics/sectors/overall',  // GET List<SectorMetricsDto>
    initialUnrealizedPnl: '/api/analytics/unrealized-pnl/trigger', // GET trigger calc
    portfolioSector: (portfolioId: string) => `/api/analytics/portfolios/${portfolioId}/sectors`, // GET List<SectorMetricsDto>
    sectorDrilldown: (sector: string) => `/api/analytics/sectors/${sector}/symbols`, // GET List<SymbolMetricsDto>
    portfolioSectorDrilldown: (portfolioId: string, sector: string) => `/api/analytics/portfolios/${portfolioId}/sectors/${sector}/symbols`, // GET List<SymbolMetricsDto>
    portfolioHistory: (portfolioId: string) => `/api/analytics/portfolios/${portfolioId}/history`, // GET List<PortfolioValueHistoryDto>

    // WS
    wsEndpoint: '/ws',
    topicPositions: '/topic/position-update',
    topicUnrealised: '/topic/unrealized-pnl',
  },

  leaderboard: {
    baseHttp: 'http://localhost:8000',
    baseWs: 'ws://localhost:8000',

    // REST
    portfolios: '/api/leaderboard/portfolios', // GET List<Portfolio>
    top: '/api/leaderboard/top', // GET top performers
    around: '/api/leaderboard/around', // GET rankings around portfolio

    // WS
    wsSnapshots: '/ws/leaderboard', // emits LeaderboardSnapshot
    wsTop: '/ws/leaderboard/top', // emits top performers updates
    wsAround: '/ws/leaderboard/around', // emits around portfolio updates
  },

  rttm: {
    baseHttp: 'http://localhost:8085',
    baseWs: 'ws://localhost:8085',

    // REST
    metrics: '/api/rttm/metrics', // GET MetricCard[]
    pipeline: '/api/rttm/pipeline', // GET PipelineStage[]
    dlq: '/api/rttm/dlq', // GET DLQ data

    // WS
    wsMetrics: '/ws/rttm/metrics', // emits real-time metrics
    wsPipeline: '/ws/rttm/pipeline', // emits pipeline updates
    wsAlerts: '/ws/rttm/alerts', // emits Alert[]
  },
};

export const httpUrl = (base: string, path: string) => `${base}${path}`;
export const wsUrl = (base: string, path: string) =>
  // ensure ws:// or wss:// is preserved when concatenating
  `${base}${path}`;

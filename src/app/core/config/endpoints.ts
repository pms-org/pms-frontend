export const ENDPOINTS = {
  analytics: {
    // Backend IP
    // baseHttp: 'http://18.118.149.115:8082',
    baseHttp: '',

    // REST Data Endpoints
    analysisAll: '/api/analysis/all',
    sectorOverall: '/api/sectors/overall',
    // ✅ The Trigger Endpoint (Returns void, result comes via WS)
    initialUnrealizedPnl: '/api/unrealized',

    // Portfolio & Sector Specifics
    portfolioSector: (id: string) => `/api/sectors/portfolio-wise/${id}`,
    portfolioHistory: (id: string) => `/api/portfolio_value/history/${id}`,
    sectorDrilldown: (sector: string) => `/api/sectors/sector-wise/${sector}`,
    portfolioSectorDrilldown: (id: string, sector: string) => `/api/sectors/portfolio-wise/${id}/sector-wise/${sector}`,

    // WS
    wsEndpoint: '/ws',
    topicPositions: '/topic/position-update',
    topicUnrealised: '/topic/unrealized-pnl',
  },

  leaderboard: {
    baseHttp: '',
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
    baseHttp: '',
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
export const wsUrl = (base: string, path: string) => `${base}${path}`;

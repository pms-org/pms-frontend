export const ENDPOINTS = {
  analytics: {
    // Backend HTTP/Ws base (override in environment.*.ts)
    baseHttp: 'http://18.118.149.115:8082',
    baseWs: 'ws://18.118.149.115:8082',

    // REST
    analysisAll: '/api/analytics/analysis',            // GET List<AnalysisEntityDto>
    sectorOverall: '/api/analytics/sectors/overall',  // GET List<SectorMetricsDto>

    // WS
    wsEndpoint: '/ws',
    topicPositions: '/topic/position-update',
    topicUnrealised: '/topic/unrealized-pnl',
  },

  leaderboard: {
    baseHttp: 'http://localhost:4200',
    baseWs: 'ws://localhost:4200',

    // REST
    portfolios: '/api/leaderboard/portfolios', // GET List<Portfolio>
    top: '/api/leaderboard/top', // GET top performers
    around: '/api/leaderboard/around', // GET rankings around portfolio

    // WS
    wsSnapshots: '/ws/updates', // emits LeaderboardSnapshot
    wsTop: '/ws/leaderboard/top', // emits top performers updates
    wsAround: '/ws/leaderboard/around', // emits around portfolio updates
  },

  rttm: {
    baseHttp: 'http://localhost:4200',
    baseWs: 'ws://localhost:4200',

    // REST
    metrics: '/api/rttm/metrics', // GET MetricCard[]
    pipeline: '/api/rttm/pipeline', // GET PipelineStage[]
    dlq: '/api/rttm/dlq', // GET DLQ data

    // WS
    wsMetrics: '/ws/rttm/metrics', // emits real-time metrics
    wsPipeline: '/ws/rttm/pipeline', // emits pipeline updates
    wsAlerts: '/ws/rttm/alerts', // emits Alert[]
    wsDlq: '/ws/rttm/dlq',    // emits DLQResponse[]
  },
};

export const httpUrl = (base: string, path: string) => `${base}${path}`;
export const wsUrl = (base: string, path: string) =>
  // ensure ws:// or wss:// is preserved when concatenating
  `${base}${path}`;

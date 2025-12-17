export const ENDPOINTS = {
  analytics: {
    baseHttp: 'http://localhost:8082',
    baseWs: 'ws://localhost:8082',

    // REST
    analysisAll: '/api/analytics/analysis',            // GET List<AnalysisEntityDto>
    sectorOverall: '/api/analytics/sectors/overall',  // GET List<SectorMetricsDto>

    // WS
    wsPositions: '/ws/positions',   // emits AnalysisEntityDto
    wsUnrealised: '/ws/unrealised'  // emits UnrealisedPnlWsDto
  },

  leaderboard: {
    baseHttp: 'http://localhost:8083',
    baseWs: 'ws://localhost:8083',

    // REST
    portfolios: '/api/leaderboard/portfolios',  // GET List<Portfolio>

    // WS
    wsSnapshots: '/ws/leaderboard'  // emits LeaderboardSnapshot
  },

  rttm: {
    baseHttp: 'http://localhost:8084',
    baseWs: 'ws://localhost:8084',

    // REST
    metrics: '/api/rttm/metrics',        // GET MetricCard[]
    pipeline: '/api/rttm/pipeline',      // GET PipelineStage[]
    dlq: '/api/rttm/dlq',                // GET DLQ data

    // WS
    wsMetrics: '/ws/rttm/metrics',       // emits real-time metrics
    wsPipeline: '/ws/rttm/pipeline',     // emits pipeline updates
    wsAlerts: '/ws/rttm/alerts'          // emits Alert[]
  }
};

export const httpUrl = (base: string, path: string) => `${base}${path}`;
export const wsUrl = (base: string, path: string) => `${base}${path}`;

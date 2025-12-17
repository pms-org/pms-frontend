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
    baseWs: 'ws://localhost:8083',
    wsSnapshots: '/ws/leaderboard'
  }
};

export const httpUrl = (base: string, path: string) => `${base}${path}`;
export const wsUrl = (base: string, path: string) => `${base}${path}`;

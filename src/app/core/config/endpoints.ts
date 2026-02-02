// NOTE: This file now uses environment imports as fallback.
// The actual runtime configuration is injected via RuntimeConfigService
// which reads from window.__ENV__ (set by env.js)

import { environment } from '../../../environments/environment';

export const ENDPOINTS = {
  analytics: {
    // These will be overridden by RuntimeConfigService at runtime
    baseHttp: environment.analytics.baseHttp,
    baseWs: environment.analytics.baseWs,

    // REST
    analysisAll: '/api/analysis/all',
    sectorOverall: '/api/sectors/overall',
    initialUnrealizedPnl: '/api/analytics/initial-unrealized-pnl',
    portfolioSector: (portfolioId: string) => `/api/sectors/portfolio-wise/${portfolioId}`,
    sectorDrilldown: (sector: string) => `/api/sectors/sector-wise/${sector}`,
    portfolioSectorDrilldown: (portfolioId: string, sector: string) =>
      `/api/sectors/portfolio-wise/${portfolioId}/sector-wise/${sector}`,
    portfolioHistory: (portfolioId: string) => `/api/portfolio_value/history/${portfolioId}`,

    // WS
    wsEndpoint: `${environment.analytics.baseWs}/ws`,
    topicPositions: '/topic/position-update',
    topicUnrealised: '/topic/unrealized-pnl',
  },

  leaderboard: {
    baseHttp: environment.leaderboard.baseHttp,
    baseWs: environment.leaderboard.baseWs,

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
    baseHttp: environment.rttm.baseHttp,
    baseWs: environment.rttm.baseWs,

    // REST
    metrics: '/api/rttm/metrics', // GET MetricCard[]
    pipeline: '/api/rttm/pipeline', // GET PipelineStage[]
    dlq: '/api/rttm/dlq', // GET DLQ data
    telemetrySnapshot: '/api/rttm/telemetry-snapshot',

    // WS
    wsMetrics: '/ws/rttm/metrics', // emits real-time metrics
    wsPipeline: '/ws/rttm/pipeline', // emits pipeline updates
    wsTelemetrySnapshot: '/ws/rttm/telemetry', // emits Alert[]
    wsDlq: '/ws/rttm/dlq', // emits DLQResponse[]
    wsAlerts: '/ws/rttm/alerts', // emits Alert[]
  },
};

export const httpUrl = (base: string, path: string) => `${base}${path}`;
export const wsUrl = (base: string, path: string) =>
  // ensure ws:// or wss:// is preserved when concatenating
  `${base}${path}`;

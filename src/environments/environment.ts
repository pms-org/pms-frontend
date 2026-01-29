// Runtime configuration loaded from window.__ENV__ (injected by Kubernetes ConfigMap)
// Falls back to localhost for local development
const runtimeEnv = (window as any).__ENV__ || {};

export const environment = {
  production: false,
  apiGateway: {
    baseHttp: runtimeEnv.API_GATEWAY_HTTP || 'http://localhost:8088',
    baseWs: runtimeEnv.API_GATEWAY_WS || 'ws://localhost:8088',
  },
  auth: {
    baseHttp: runtimeEnv.AUTH_HTTP || 'http://localhost:8081',
  },
  portfolio: {
    baseHttp: runtimeEnv.PORTFOLIO_HTTP || 'http://localhost:8095',
    baseWs: runtimeEnv.PORTFOLIO_WS || 'ws://localhost:8095',
  },
  analytics: {
    baseHttp: runtimeEnv.ANALYTICS_HTTP || 'http://localhost:8086',
    baseWs: runtimeEnv.ANALYTICS_WS || 'ws://localhost:8086',
  },
  leaderboard: {
    baseHttp: runtimeEnv.LEADERBOARD_HTTP || 'http://localhost:8000',
    baseWs: runtimeEnv.LEADERBOARD_WS || 'ws://localhost:8000',
  },
  rttm: {
    baseHttp: runtimeEnv.RTTM_HTTP || 'http://localhost:8087',
    baseWs: runtimeEnv.RTTM_WS || 'ws://localhost:8087',
  },
};

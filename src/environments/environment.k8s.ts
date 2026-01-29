// Runtime configuration loaded from window.__ENV__ (injected by Kubernetes ConfigMap)
// This file is used for Kubernetes deployments - all values come from Helm templates
const runtimeEnv = (window as any).__ENV__ || {};

export const environment = {
  production: true,
  apiGateway: {
    baseHttp: runtimeEnv.API_GATEWAY_HTTP || 'http://apigateway',
    baseWs: runtimeEnv.API_GATEWAY_WS || 'ws://apigateway',
  },
  auth: {
    baseHttp: runtimeEnv.AUTH_HTTP || 'http://auth',
  },
  portfolio: {
    baseHttp: runtimeEnv.PORTFOLIO_HTTP || 'http://portfolio',
    baseWs: runtimeEnv.PORTFOLIO_WS || 'ws://portfolio',
  },
  analytics: {
    baseHttp: runtimeEnv.ANALYTICS_HTTP || 'http://analytics',
    baseWs: runtimeEnv.ANALYTICS_WS || 'ws://analytics',
  },
  leaderboard: {
    baseHttp: runtimeEnv.LEADERBOARD_HTTP || 'http://leaderboard',
    baseWs: runtimeEnv.LEADERBOARD_WS || 'ws://leaderboard',
  },
};

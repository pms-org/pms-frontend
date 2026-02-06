// EKS/K8s Environment - Runtime configuration via ConfigMap
// The env.js file is mounted via ConfigMap and loaded in index.html
// This provides fallback values if env.js is not available

// Check if runtime config is available from env.js
const runtimeEnv = (window as any).__ENV__ || {};

export const environment = {
  production: true,
  
  analytics: {
    baseHttp: runtimeEnv.ANALYTICS_HTTP || 'http://apigateway-service:8088',
    baseWs: runtimeEnv.ANALYTICS_WS || 'ws://apigateway-service:8088',
  },
  
  leaderboard: {
    baseHttp: runtimeEnv.LEADERBOARD_HTTP || 'http://apigateway-service:8088',
    baseWs: runtimeEnv.LEADERBOARD_WS || 'ws://apigateway-service:8088',
  },
  
  rttm: {
    baseHttp: runtimeEnv.RTTM_HTTP || 'http://apigateway-service:8088',
    baseWs: runtimeEnv.RTTM_WS || 'ws://apigateway-service:8088',
  },
  
  portfolio: {
    baseHttp: runtimeEnv.PORTFOLIO_HTTP || 'http://apigateway-service:8088',
  },
  
  auth: {
    baseHttp: runtimeEnv.AUTH_HTTP || 'http://apigateway-service:8088',
  },
};

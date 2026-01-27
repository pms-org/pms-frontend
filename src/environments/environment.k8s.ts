export const environment = {
  production: true,
  analytics: {
    baseHttp: 'http://analytics-service:8082',
    baseWs: 'ws://analytics-service:8082',
  },
  leaderboard: {
    baseHttp: 'http://leaderboard-service:8000',
    baseWs: 'ws://leaderboard-service:8000',
  },
  rttm: {
    baseHttp: 'http://rttm-service:8085',
    baseWs: 'ws://rttm-service:8085',
  },
  portfolio: {
    baseHttp: 'http://portfolio-service:8084',
    baseWs: 'ws://portfolio-service:8084',
  },
  apiGateway: {
    baseHttp: 'http://api-gateway-service:8080',
    baseWs: 'ws://api-gateway-service:8080',
  }
};

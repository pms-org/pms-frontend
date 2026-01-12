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
};
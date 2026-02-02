export interface RuntimeConfig {
  apiGateway: string;
  auth: {
    baseHttp: string;
  };
  analytics: {
    baseHttp: string;
    baseWs: string;
  };
  leaderboard: {
    baseHttp: string;
    baseWs: string;
  };
  rttm: {
    baseHttp: string;
    baseWs: string;
  };
  portfolio: {
    baseHttp: string;
  };
}

declare global {
  interface Window {
    __ENV__?: RuntimeConfig;
  }
}

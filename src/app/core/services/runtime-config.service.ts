import { Injectable } from '@angular/core';
import { RuntimeConfig } from '../config/runtime-config.interface';

// Interface for the actual env.js structure
interface EnvJsConfig {
  API_GATEWAY_HTTP?: string;
  API_GATEWAY_WS?: string;
  AUTH_HTTP?: string;
  ANALYTICS_HTTP?: string;
  ANALYTICS_WS?: string;
  LEADERBOARD_HTTP?: string;
  LEADERBOARD_WS?: string;
  RTTM_HTTP?: string;
  RTTM_WS?: string;
  PORTFOLIO_HTTP?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RuntimeConfigService {
  private config: RuntimeConfig;

  constructor() {
    // Read runtime config from window.__ENV__ (flat structure from env.js)
    // and transform it to our nested RuntimeConfig structure
    const envJs = (window as any).__ENV__ as EnvJsConfig | undefined;
    this.config = envJs ? this.transformEnvJsConfig(envJs) : this.getDefaultConfig();
  }

  getConfig(): RuntimeConfig {
    return this.config;
  }

  get apiGateway(): string {
    return this.config.apiGateway;
  }

  get auth(): { baseHttp: string } {
    return this.config.auth;
  }

  get analytics(): { baseHttp: string; baseWs: string } {
    return this.config.analytics;
  }

  get leaderboard(): { baseHttp: string; baseWs: string } {
    return this.config.leaderboard;
  }

  get rttm(): { baseHttp: string; baseWs: string } {
    return this.config.rttm;
  }

  get portfolio(): { baseHttp: string } {
    return this.config.portfolio;
  }

  private transformEnvJsConfig(envJs: EnvJsConfig): RuntimeConfig {
    // Transform flat env.js structure to nested RuntimeConfig
    const apiGateway = envJs.API_GATEWAY_HTTP || envJs.AUTH_HTTP || 'http://localhost:8088';

    return {
      apiGateway,
      auth: {
        baseHttp: envJs.AUTH_HTTP || apiGateway,
      },
      analytics: {
        baseHttp: envJs.ANALYTICS_HTTP || apiGateway,
        baseWs: envJs.ANALYTICS_WS || apiGateway.replace('http', 'ws'),
      },
      leaderboard: {
        baseHttp: envJs.LEADERBOARD_HTTP || apiGateway,
        baseWs: envJs.LEADERBOARD_WS || apiGateway.replace('http', 'ws'),
      },
      rttm: {
        baseHttp: envJs.RTTM_HTTP || apiGateway,
        baseWs: envJs.RTTM_WS || apiGateway.replace('http', 'ws'),
      },
      portfolio: {
        baseHttp: envJs.PORTFOLIO_HTTP || apiGateway,
      },
    };
  }

  private getDefaultConfig(): RuntimeConfig {
    // Fallback to localhost for development
    return {
      apiGateway: 'http://localhost:8088',
      auth: {
        baseHttp: 'http://localhost:8088',
      },
      analytics: {
        baseHttp: 'http://localhost:8088',
        baseWs: 'ws://localhost:8088',
      },
      leaderboard: {
        baseHttp: 'http://localhost:8088',
        baseWs: 'ws://localhost:8088',
      },
      rttm: {
        baseHttp: 'http://localhost:8088',
        baseWs: 'ws://localhost:8088',
      },
      portfolio: {
        baseHttp: 'http://localhost:8088',
      },
    };
  }
}

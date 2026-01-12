// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Client, IMessage } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// import { ENDPOINTS } from '../config/endpoints';
// import { AnalysisEntityDto, UnrealisedPnlWsDto } from '../models/analytics.models';

// @Injectable({ providedIn: 'root' })
// export class AnalyticsStompService {
//   private client?: Client;

//   // ✅ 1. Track Connection Status
//   private readonly connectedSubject = new BehaviorSubject<boolean>(false);
//   readonly connected$ = this.connectedSubject.asObservable();

//   private readonly positionUpdateSubject = new BehaviorSubject<AnalysisEntityDto | null>(null);
//   readonly positionUpdate$: Observable<AnalysisEntityDto | null> =
//     this.positionUpdateSubject.asObservable();

//   private readonly unrealisedSubject = new BehaviorSubject<UnrealisedPnlWsDto | null>(null);
//   readonly unrealised$: Observable<UnrealisedPnlWsDto | null> =
//     this.unrealisedSubject.asObservable();

//   connect(): void {
//     if (this.connectedSubject.value) return; 

//     const sockJsUrl = ENDPOINTS.analytics.wsEndpoint; 

//     this.client = new Client({
//       webSocketFactory: () => new SockJS(sockJsUrl),
//       reconnectDelay: 5000,
//       heartbeatIncoming: 10000,
//       heartbeatOutgoing: 10000,
//       debug: (str) => console.log('[STOMP]', str),
//     });

//     this.client.onConnect = () => {
//       console.log('✅ STOMP Connected');
//       this.connectedSubject.next(true);

//       // ✅ 2. Fix Array Parsing for Positions
//       this.client?.subscribe(ENDPOINTS.analytics.topicPositions, (msg: IMessage) => {
//         try {
//           const raw = JSON.parse(msg.body);
//           if (Array.isArray(raw)) {
//             raw.forEach(item => this.positionUpdateSubject.next(this.normalizePosition(item)));
//           } else {
//             this.positionUpdateSubject.next(this.normalizePosition(raw));
//           }
//         } catch (e) {
//           console.error('Error parsing position update', e);
//         }
//       });

//       this.client?.subscribe(ENDPOINTS.analytics.topicUnrealised, (msg: IMessage) => {
//         try {
//           const raw = JSON.parse(msg.body);
//           this.unrealisedSubject.next(this.normalizeUnrealised(raw));
//         } catch (e) {
//           console.error('Error parsing unrealized pnl', e);
//         }
//       });
//     };

//     this.client.onWebSocketClose = () => {
//       console.warn('⚠️ WebSocket Closed');
//       this.connectedSubject.next(false);
//     };

//     this.client.activate();
//   }

//   disconnect(): void {
//     this.client?.deactivate();
//     this.connectedSubject.next(false);
//   }

//   private normalizePosition(raw: any): AnalysisEntityDto {
//     const portfolioId = raw?.id?.portfolioId ?? raw?.portfolioId ?? raw?.portfolio_id ?? '';
//     const symbol = raw?.id?.symbol ?? raw?.symbol ?? '';
//     return {
//       id: { portfolioId, symbol },
//       holdings: Number(raw?.holdings ?? 0),
//       totalInvested: Number(raw?.totalInvested ?? raw?.total_invested ?? 0),
//       realizedPnl: Number(raw?.realizedPnl ?? raw?.realisedPnl ?? raw?.realized_pnl ?? 0),
//       createdAt: raw?.createdAt,
//       updatedAt: raw?.updatedAt,
//     };
//   }

//   private normalizeUnrealised(raw: any): UnrealisedPnlWsDto {
//     return {
//       symbol: raw?.symbol ?? {},
//       overallUnrealised_Pnl: Number(raw?.overallUnrealised_Pnl ?? raw?.overallUnrealisedPnl ?? 0),
//       portfolio_id: raw?.portfolio_id ?? raw?.portfolioId ?? '',
//     };
//   }
// }




import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { ENDPOINTS } from '../config/endpoints';
import { AnalysisEntityDto, UnrealisedPnlWsDto } from '../models/analytics.models';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsStompService {
  private client?: Client;
  private readonly logger = inject(LoggerService);

  private readonly connectedSubject = new BehaviorSubject<boolean>(false);
  readonly connected$ = this.connectedSubject.asObservable();

  private readonly positionUpdateSubject = new BehaviorSubject<AnalysisEntityDto | null>(null);
  readonly positionUpdate$ = this.positionUpdateSubject.asObservable();

  private readonly unrealisedSubject = new BehaviorSubject<UnrealisedPnlWsDto[]>([]);
  readonly unrealised$ = this.unrealisedSubject.asObservable();

  connect(): void {
    if (this.connectedSubject.value) return; 

    const sockJsUrl = ENDPOINTS.analytics.wsEndpoint; 

    this.client = new Client({
      webSocketFactory: () => new SockJS(sockJsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str: string) => this.logger.debug('[STOMP]', str),
    });

    this.client.onConnect = () => {
      this.logger.info('STOMP Connected');
      this.connectedSubject.next(true);

      this.client?.subscribe(ENDPOINTS.analytics.topicPositions, (msg: IMessage) => {
        try {
          const raw = JSON.parse(msg.body);
          if (Array.isArray(raw)) {
            raw.forEach(item => this.positionUpdateSubject.next(this.normalizePosition(item)));
          } else {
            this.positionUpdateSubject.next(this.normalizePosition(raw));
          }
        } catch (e) {
          this.logger.error('Error parsing position update', e);
        }
      });

      this.client?.subscribe(ENDPOINTS.analytics.topicUnrealised, (msg: IMessage) => {
        try {
          const raw = JSON.parse(msg.body);
          if (Array.isArray(raw)) {
            const normalized = raw.map(item => this.normalizeUnrealised(item));
            this.unrealisedSubject.next(normalized);
          } else {
            this.unrealisedSubject.next([this.normalizeUnrealised(raw)]);
          }
        } catch (e) {
          this.logger.error('Error parsing unrealized pnl', e);
        }
      });
    };

    this.client.onWebSocketClose = () => {
      this.logger.warn('WebSocket Closed');
      this.connectedSubject.next(false);
    };

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connectedSubject.next(false);
  }

  private normalizePosition(raw: any): AnalysisEntityDto {
    const portfolioId = raw?.id?.portfolioId ?? raw?.portfolioId ?? raw?.portfolio_id ?? '';
    const symbol = raw?.id?.symbol ?? raw?.symbol ?? '';
    return {
      id: { portfolioId, symbol },
      holdings: Number(raw?.holdings ?? 0),
      totalInvested: Number(raw?.totalInvested ?? raw?.total_invested ?? 0),
      realizedPnl: Number(raw?.realizedPnl ?? raw?.realisedPnl ?? raw?.realized_pnl ?? 0),
      createdAt: raw?.createdAt,
      updatedAt: raw?.updatedAt,
    };
  }

  private normalizeUnrealised(raw: any): UnrealisedPnlWsDto {
    return {
      symbol: raw?.symbol ?? {},
      overallUnrealised_Pnl: Number(raw?.overallUnrealised_Pnl ?? raw?.overallUnrealisedPnl ?? 0),
      portfolio_id: raw?.portfolio_id ?? raw?.portfolioId ?? '',
    };
  }
}
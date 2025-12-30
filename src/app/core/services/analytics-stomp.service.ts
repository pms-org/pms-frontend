import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { ENDPOINTS } from '../config/endpoints';
import { AnalysisEntityDto, UnrealisedPnlWsDto } from '../models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsStompService {
  private client?: Client;
  private connected = false;

  private readonly positionUpdateSubject = new BehaviorSubject<AnalysisEntityDto | null>(null);
  readonly positionUpdate$: Observable<AnalysisEntityDto | null> =
    this.positionUpdateSubject.asObservable();

  private readonly unrealisedSubject = new BehaviorSubject<UnrealisedPnlWsDto | null>(null);
  readonly unrealised$: Observable<UnrealisedPnlWsDto | null> =
    this.unrealisedSubject.asObservable();

  connect(): void {
    if (this.connected) return;

    // IMPORTANT: use proxied relative path so Angular dev proxy forwards it to 18.118.149.115:8082
    const sockJsUrl = ENDPOINTS.analytics.wsEndpoint; // should be "/ws"

    this.client = new Client({
      // SockJS transport (required because backend uses withSockJS())
      webSocketFactory: () => new SockJS(sockJsUrl),

      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}
    });

    this.client.onConnect = () => {
      this.connected = true;

      this.client?.subscribe(ENDPOINTS.analytics.topicPositions, (msg: IMessage) => {
        const raw = JSON.parse(msg.body);
        this.positionUpdateSubject.next(this.normalizePosition(raw));
      });

      this.client?.subscribe(ENDPOINTS.analytics.topicUnrealised, (msg: IMessage) => {
        const raw = JSON.parse(msg.body);
        this.unrealisedSubject.next(this.normalizeUnrealised(raw));
      });
    };

    this.client.onWebSocketClose = () => { this.connected = false; };
    this.client.onStompError = (frame) => {
      console.error('STOMP broker error:', frame.headers['message'], frame.body);
    };

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected = false;
  }

  private normalizePosition(raw: any): AnalysisEntityDto {
    const portfolioId = raw?.id?.portfolioId ?? raw?.portfolioId ?? raw?.portfolio_id ?? '';
    const symbol = raw?.id?.symbol ?? raw?.symbol ?? '';
    return {
      id: { portfolioId, symbol },
      holdings: Number(raw?.holdings ?? 0),
      totalInvested: Number(raw?.totalInvested ?? raw?.total_invested ?? 0),
      realizedPnl: Number(raw?.realizedPnl ?? raw?.realisedPnl ?? raw?.realized_pnl ?? 0),
      createdAt: raw?.createdAt ?? raw?.created_at,
      updatedAt: raw?.updatedAt ?? raw?.updated_at
    };
  }

  private normalizeUnrealised(raw: any): UnrealisedPnlWsDto {
    return {
      symbol: raw?.symbol ?? {},
      overallUnrealised_Pnl: Number(raw?.overallUnrealised_Pnl ?? raw?.overallUnrealisedPnl ?? 0),
      portfolio_id: raw?.portfolio_id ?? raw?.portfolioId ?? ''
    };
  }
}

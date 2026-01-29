import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { MetricCard } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsMetricsService {
  private socket$?: WebSocketSubject<MetricCard[]>;

  stream(): Observable<MetricCard[]> {
    if (!this.socket$) {
      this.socket$ = webSocket<MetricCard[]>({
        url: wsUrl(ENDPOINTS.rttm.baseWs, ENDPOINTS.rttm.wsMetrics),
        WebSocketCtor: WebSocket,
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.socket$.pipe(share());
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }
}

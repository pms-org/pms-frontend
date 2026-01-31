import { Injectable, inject } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { RuntimeConfigService } from './runtime-config.service';
import { MetricCard } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsMetricsService {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private socket$?: WebSocketSubject<MetricCard[]>;

  stream(): Observable<MetricCard[]> {
    if (!this.socket$) {
      this.socket$ = webSocket<MetricCard[]>({
        url: `${this.runtimeConfig.rttm.baseWs}/ws/rttm/metrics`,
        WebSocketCtor: WebSocket,
        deserializer: (event) => JSON.parse((event as MessageEvent).data),
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

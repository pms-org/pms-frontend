import { Injectable, inject } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { RuntimeConfigService } from './runtime-config.service';
import { Alert } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsAlertsService {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private socket$?: WebSocketSubject<Alert[]>;

  stream(): Observable<Alert[]> {
    if (!this.socket$) {
      this.socket$ = webSocket<Alert[]>({
        url: `${this.runtimeConfig.rttm.baseWs}/ws/rttm/alerts`,
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

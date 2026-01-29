import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { TelemetryMessage } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsTelemetryService {
  private socket$?: WebSocketSubject<TelemetryMessage>;

  stream(): Observable<TelemetryMessage> {
    if (!this.socket$) {
      this.socket$ = webSocket<TelemetryMessage>({
        url: wsUrl(ENDPOINTS.rttm.baseWs, ENDPOINTS.rttm.wsTelemetrySnapshot),
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
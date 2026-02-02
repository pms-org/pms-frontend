import { Injectable, inject } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { RuntimeConfigService } from './runtime-config.service';
import { TelemetryMessage } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsTelemetryService {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private socket$?: WebSocketSubject<TelemetryMessage>;

  stream(): Observable<TelemetryMessage> {
    if (!this.socket$) {
      this.socket$ = webSocket<TelemetryMessage>({
        url: `${this.runtimeConfig.rttm.baseWs}/ws/rttm/telemetry`,
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

import { Injectable, inject } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { RuntimeConfigService } from './runtime-config.service';
import { DLQResponse } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsDlqService {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private socket$?: WebSocketSubject<DLQResponse>;

  stream(): Observable<DLQResponse> {
    if (!this.socket$) {
      this.socket$ = webSocket<DLQResponse>({
        url: `${this.runtimeConfig.rttm.baseWs}/ws/rttm/dlq`,
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

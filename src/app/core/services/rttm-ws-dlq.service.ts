import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { DLQResponse } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsDlqService {
  private socket$?: WebSocketSubject<DLQResponse>;

  stream(): Observable<DLQResponse> {
    if (!this.socket$) {
      this.socket$ = webSocket<DLQResponse>({
        url: wsUrl(ENDPOINTS.rttm.baseWs, ENDPOINTS.rttm.wsDlq),
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
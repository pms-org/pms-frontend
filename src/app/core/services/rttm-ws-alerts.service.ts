import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { Alert } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsAlertsService {
  private socket$?: WebSocketSubject<Alert[]>;

  stream(): Observable<Alert[]> {
    if (!this.socket$) {
      this.socket$ = webSocket<Alert[]>({
        url: wsUrl(ENDPOINTS.rttm.baseWs, ENDPOINTS.rttm.wsAlerts),
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.socket$.pipe(share());
  }
}

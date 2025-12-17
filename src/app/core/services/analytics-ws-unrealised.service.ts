import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { UnrealisedPnlWsDto } from '../models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsWsUnrealisedService {
  private socket$?: WebSocketSubject<UnrealisedPnlWsDto>;

  stream(): Observable<UnrealisedPnlWsDto> {
    if (!this.socket$) {
      this.socket$ = webSocket<UnrealisedPnlWsDto>({
        url: wsUrl(ENDPOINTS.analytics.baseWs, ENDPOINTS.analytics.wsUnrealised),
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.socket$.pipe(share());
  }
}

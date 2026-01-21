import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { PipelineStage } from '../models/rttm.models';

@Injectable({ providedIn: 'root' })
export class RttmWsPipelineService {
  private socket$?: WebSocketSubject<PipelineStage[]>;

  stream(): Observable<PipelineStage[]> {
    if (!this.socket$) {
      this.socket$ = webSocket<PipelineStage[]>({
        url: wsUrl(ENDPOINTS.rttm.baseWs, ENDPOINTS.rttm.wsPipeline),
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

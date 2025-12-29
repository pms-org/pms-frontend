import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { LeaderboardSnapshot } from '../models/leaderboard.models';

@Injectable({ providedIn: 'root' })
export class LeaderboardWsService {
  private socket$?: WebSocketSubject<LeaderboardSnapshot>;
  private topSocket$?: WebSocketSubject<any>;
  private aroundSocket$?: WebSocketSubject<any>;

  stream(): Observable<LeaderboardSnapshot> {
    if (!this.socket$) {
      this.socket$ = webSocket<LeaderboardSnapshot>({
        url: wsUrl(ENDPOINTS.leaderboard.baseWs, ENDPOINTS.leaderboard.wsSnapshots),
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.socket$.pipe(share());
  }

  streamTop(): Observable<any> {
    if (!this.topSocket$) {
      this.topSocket$ = webSocket<any>({
        url: wsUrl(ENDPOINTS.leaderboard.baseWs, ENDPOINTS.leaderboard.wsTop),
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.topSocket$.pipe(share());
  }

  streamAround(): Observable<any> {
    if (!this.aroundSocket$) {
      this.aroundSocket$ = webSocket<any>({
        url: wsUrl(ENDPOINTS.leaderboard.baseWs, ENDPOINTS.leaderboard.wsAround),
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.aroundSocket$.pipe(share());
  }
}

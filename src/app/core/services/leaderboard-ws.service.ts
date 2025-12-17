import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { LeaderboardSnapshot } from '../models/leaderboard.models';

@Injectable({ providedIn: 'root' })
export class LeaderboardWsService {
  private socket$?: WebSocketSubject<LeaderboardSnapshot>;

  stream(): Observable<LeaderboardSnapshot> {
    if (!this.socket$) {
      this.socket$ = webSocket<LeaderboardSnapshot>({
        url: wsUrl(ENDPOINTS.leaderboard.baseWs, ENDPOINTS.leaderboard.wsSnapshots),
        deserializer: (event) => JSON.parse((event as MessageEvent).data)
      });
    }
    return this.socket$.pipe(share());
  }
}

import { Injectable } from '@angular/core';
import { Observable, share, EMPTY, catchError, tap, Subject, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';

@Injectable({ providedIn: 'root' })
export class LeaderboardWsService {
  private socket$?: WebSocketSubject<any>;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);

  stream(): Observable<any> {
    if (!this.socket$) {
      const url = wsUrl(ENDPOINTS.leaderboard.baseWs, ENDPOINTS.leaderboard.wsSnapshots);
      console.log('Connecting to WebSocket:', url);
      
      this.socket$ = webSocket<any>({
        url,
        openObserver: {
          next: () => {
            console.log('WebSocket connected successfully');
            this.connectionStatus$.next(true);
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket connection closed');
            this.connectionStatus$.next(false);
            this.socket$ = undefined;
          }
        }
      });
    }
    
    return this.socket$.pipe(
      tap(data => console.log('WebSocket data received:', data)),
      catchError(error => {
        console.error('WebSocket error:', error);
        this.connectionStatus$.next(false);
        this.socket$ = undefined;
        return EMPTY;
      }),
      share()
    );
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  isServerAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
      this.connectionStatus$.next(false);
    }
  }
}
import { Injectable, inject } from '@angular/core';
import { Observable, share, EMPTY, catchError, tap, Subject, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ENDPOINTS, wsUrl } from '../config/endpoints';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardWsService {
  private socket$?: WebSocketSubject<any>;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private readonly logger = inject(LoggerService);

  stream(): Observable<any> {
    if (!this.socket$) {
      const url = wsUrl(ENDPOINTS.leaderboard.baseWs, ENDPOINTS.leaderboard.wsSnapshots);
      this.logger.info('Connecting to WebSocket', { url });
      
      this.socket$ = webSocket<any>({
        url,
        WebSocketCtor: WebSocket,
        openObserver: {
          next: () => {
            this.logger.info('WebSocket connected successfully');
            this.connectionStatus$.next(true);
          }
        },
        closeObserver: {
          next: () => {
            this.logger.info('WebSocket connection closed');
            this.connectionStatus$.next(false);
            this.socket$ = undefined;
          }
        }
      });
    }
    
    return this.socket$.pipe(
      tap(data => this.logger.debug('WebSocket data received', data)),
      catchError(error => {
        this.logger.error('WebSocket error', error);
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
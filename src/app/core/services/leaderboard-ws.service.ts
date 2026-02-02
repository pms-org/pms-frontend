import { Injectable, inject } from '@angular/core';
import { Observable, share, EMPTY, catchError, tap, Subject, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { RuntimeConfigService } from './runtime-config.service';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardWsService {
  private socket$?: WebSocketSubject<any>;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private readonly logger = inject(LoggerService);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  stream(): Observable<any> {
    if (!this.socket$) {
      const url = `${this.runtimeConfig.leaderboard.baseWs}/ws/updates`;
      this.logger.info('Connecting to WebSocket', { url });

      this.socket$ = webSocket<any>({
        url,
        WebSocketCtor: WebSocket,
        openObserver: {
          next: () => {
            this.logger.info('WebSocket connected successfully');
            this.connectionStatus$.next(true);
          },
        },
        closeObserver: {
          next: () => {
            this.logger.info('WebSocket connection closed');
            this.connectionStatus$.next(false);
            this.socket$ = undefined;
          },
        },
      });
    }

    return this.socket$.pipe(
      tap((data) => this.logger.debug('WebSocket data received', data)),
      catchError((error) => {
        this.logger.error('WebSocket error', error);
        this.connectionStatus$.next(false);
        this.socket$ = undefined;
        return EMPTY;
      }),
      share(),
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

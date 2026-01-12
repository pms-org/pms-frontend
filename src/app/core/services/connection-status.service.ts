import { Injectable, signal } from '@angular/core';

export type ConnectionStatus = 'disconnected' | 'api' | 'websocket';

@Injectable({ providedIn: 'root' })
export class ConnectionStatusService {
  private _status = signal<ConnectionStatus>('disconnected');
  
  status = this._status.asReadonly();

  setApiConnected() {
    if (this._status() === 'disconnected') {
      this._status.set('api');
    }
  }

  setWebSocketConnected() {
    this._status.set('websocket');
  }

  setDisconnected() {
    this._status.set('disconnected');
  }
}
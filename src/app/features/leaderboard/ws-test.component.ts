import { Component, OnInit, OnDestroy } from '@angular/core';
import { LeaderboardWsService } from '../../core/services/leaderboard-ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ws-test',
  template: `
    <div>
      <h3>WebSocket Test</h3>
      <p>Status: {{ status }}</p>
      <p>Messages received: {{ messageCount }}</p>
      <button (click)="connect()">Connect</button>
      <button (click)="disconnect()">Disconnect</button>
    </div>
  `
})
export class WsTestComponent implements OnInit, OnDestroy {
  status = 'Disconnected';
  messageCount = 0;
  private subscription?: Subscription;

  constructor(private wsService: LeaderboardWsService) {}

  ngOnInit() {
    this.connect();
  }

  connect() {
    this.status = 'Connecting...';
    this.subscription = this.wsService.stream().subscribe({
      next: (data) => {
        this.status = 'Connected';
        this.messageCount++;
        console.log('Test received:', data);
      },
      error: (error) => {
        this.status = 'Error: ' + error.message;
        console.error('Test error:', error);
      }
    });
  }

  disconnect() {
    this.subscription?.unsubscribe();
    this.status = 'Disconnected';
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
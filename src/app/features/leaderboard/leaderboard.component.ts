import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardWsService } from '../../core/services/leaderboard-ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard">
      <h2>Live Leaderboard</h2>
      <div *ngFor="let entry of snapshot?.entries" class="entry">
        <span>{{ entry.rank }}</span>
        <span>{{ entry.name }}</span>
        <span>{{ entry.score }}</span>
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  snapshot?: any;
  private subscription?: Subscription;

  constructor(private wsService: LeaderboardWsService) {}

  ngOnInit() {
    this.subscription = this.wsService.stream().subscribe(
      data => this.snapshot = data
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
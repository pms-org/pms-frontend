import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionStatusService } from '../../../core/services/connection-status.service';

@Component({
  selector: 'app-summary-24h',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl px-4 py-2">
      <div [class]="textColorClass()" class="text-sm">Last 24h data</div>
    </div>
  `
})
export class Summary24hComponent {
  private connectionStatus = inject(ConnectionStatusService);

  textColorClass = computed(() => {
    const status = this.connectionStatus.status();
    if (status === 'websocket') return 'text-green-400';
    if (status === 'api') return 'text-yellow-400';
    return 'text-red-400';
  });
}

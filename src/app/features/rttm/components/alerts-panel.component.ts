import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../../../core/models/rttm.models';
import { ConnectionStatusService } from '../../../core/services/connection-status.service';

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-panel.component.html',
  styleUrls: ['./alerts-panel.component.css']
})
export class AlertsPanelComponent {
  alerts = input<Alert[]>([]);
  connectionStatus = inject(ConnectionStatusService);

  textColorClass = computed(() => {
    const status = this.connectionStatus.status();
    if (status === 'websocket') return 'text-green-400';
    if (status === 'api') return 'text-yellow-400';
    return 'text-red-400';
  });

  getSeverityClass(severity: string): string {
    return severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  }
}

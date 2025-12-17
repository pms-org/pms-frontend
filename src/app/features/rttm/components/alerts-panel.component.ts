import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../../../core/models/rttm.models';

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-panel.component.html',
  styleUrls: ['./alerts-panel.component.css']
})
export class AlertsPanelComponent {
  alerts = input<Alert[]>([]);

  getSeverityClass(severity: string): string {
    return severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  }
}

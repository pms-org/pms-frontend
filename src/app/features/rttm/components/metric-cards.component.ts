import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCard } from '../../../core/models/rttm.models';

@Component({
  selector: 'app-metric-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-cards.component.html',
  styleUrls: ['./metric-cards.component.css']
})
export class MetricCardsComponent {
  metrics = input<MetricCard[]>([]);

  getStatusClass(status: string): string {
    if (status === 'healthy') return 'text-green-400';
    if (status === 'warning') return 'text-yellow-400';
    return 'text-red-400';
  }

  getStatusBg(status: string): string {
    if (status === 'healthy') return 'bg-green-500/10';
    if (status === 'warning') return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  }
}

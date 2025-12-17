import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoverRow } from '../../../core/models/ui.models';

@Component({
  selector: 'app-movers-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movers-panel.component.html',
  styleUrls: ['./movers-panel.component.css']
})
export class MoversPanelComponent {
  title = input<string>('');
  icon = input<'up' | 'down'>('up');
  rows = input<MoverRow[]>([]);
}
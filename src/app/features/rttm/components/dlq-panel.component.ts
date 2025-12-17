import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dlq-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dlq-panel.component.html',
  styleUrls: ['./dlq-panel.component.css']
})
export class DlqPanelComponent {
  dlq = input<{ total: number; lastError: string; errors: { stage: string; count: number }[] }>({
    total: 0,
    lastError: '',
    errors: []
  });
}

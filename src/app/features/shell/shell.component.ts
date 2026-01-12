import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConnectionStatusService } from '../../core/services/connection-status.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private connectionStatus = inject(ConnectionStatusService);
  
  statusColor = computed(() => {
    const status = this.connectionStatus.status();
    switch (status) {
      case 'websocket': return 'bg-green-500';
      case 'api': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  });
}

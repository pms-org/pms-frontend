import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConnectionStatusService } from '../../core/services/connection-status.service';
import { ToastComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private connectionStatus = inject(ConnectionStatusService);
  private router = inject(Router);
  
  statusColor = computed(() => {
    const status = this.connectionStatus.status();
    switch (status) {
      case 'websocket': return 'bg-green-500';
      case 'api': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  });

  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}

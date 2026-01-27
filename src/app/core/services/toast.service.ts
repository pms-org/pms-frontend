import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', duration = 5000) {
    const id = this.toastId++;
    const toast: Toast = { id, message, type };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    setTimeout(() => this.remove(id), duration);
  }

  error(message: string) {
    this.show(message, 'error');
  }

  success(message: string) {
    this.show(message, 'success');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}

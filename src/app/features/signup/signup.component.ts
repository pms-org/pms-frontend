import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  errorMessage = '';
  loading = false;
  response: any = null;

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.response = null;

    this.authService.signup({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.response = response;
        this.loading = false;
        localStorage.setItem('accessToken', response.accessToken);
        setTimeout(() => this.router.navigate(['/dashboard']), 3000);
      },
      error: (err) => {
        this.loading = false;
        
        if (err.status === 409 || err.status === 400) {
          this.errorMessage = 'Username already exists. Please choose a different username.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the server is running.';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
        }
      }
    });
  }
}

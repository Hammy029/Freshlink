import { Component, NgZone } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      return;
    }

    this.errorMessage = null;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        // ✅ Save required data to localStorage
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('userId', res.user._id);

        // ✅ Store role with fallback
        const role = res.user.role === 'admin' || res.user.role === 'user' ? res.user.role : 'user';
        localStorage.setItem('role', role);

        // ✅ Navigate within Angular zone
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  loginWithGoogle() {
    window.location.href = `${this.authService.googleAuthUrl}`;
  }
}

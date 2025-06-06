import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
//import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule,RouterLink],
  standalone: true,
})
export class RegisterComponent {
  username: string = '';
  phone_no: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid || this.password !== this.confirmPassword) {
      this.errorMessage = 'Please fill all fields correctly and ensure passwords match.';
      return;
    }

    this.errorMessage = null;

    const payload = {
      username: this.username,
      phone_no: this.phone_no,
      email: this.email,
      password: this.password,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: { error: { message: string } }) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }

  loginWithGoogle() {
    window.location.href = `${this.authService.googleAuthUrl}`;
  }
}

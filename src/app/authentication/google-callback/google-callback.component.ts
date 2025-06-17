import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss']
})
export class GoogleCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: (params) => {
        const token = params['token']; // ✅ matches your current URL
        const username = params['username'];
        const email = params['email'];
        const role = params['role'];

        if (token && username && email && role) {
          if (isPlatformBrowser(this.platformId)) {
            try {
              this.authService.setToken(token);
              this.authService.setUser({ username, email, role });
              this.authService.markAuthenticated(); // 👈 Explicitly set auth state

              console.log('✅ Google login successful. Redirecting...');
            } catch (e) {
              console.error('❌ Error storing token/user info:', e);
              alert('⚠️ Failed to store session.');
              this.router.navigate(['/login']);
              return;
            }
          }

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 300);
        } else {
          alert('❌ Missing token or user data. Login failed.');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('❌ Error reading query params:', error);
        alert('❌ Unexpected error occurred during login.');
        this.router.navigate(['/login']);
      }
    });
  }
}

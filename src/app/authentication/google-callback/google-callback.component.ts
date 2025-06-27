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
        const token = params['token'];

        if (token) {
          if (isPlatformBrowser(this.platformId)) {
            try {
              // ✅ Automatically sets authState, role, and user info
              this.authService.setToken(token);

              console.log('✅ Google login successful. Redirecting...');
            } catch (e) {
              console.error('❌ Error decoding token or storing session:', e);
              alert('⚠️ Failed to store session.');
              this.router.navigate(['/login']);
              return;
            }
          }

          // ✅ Optional delay to ensure reactivity completes before navigation
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 200);
        } else {
          alert('❌ Missing token from Google login. Please try again.');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('❌ Error reading Google OAuth params:', error);
        alert('❌ Unexpected error occurred during login.');
        this.router.navigate(['/login']);
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isAuthenticated = false;
  role: string = '';

  private authSub?: Subscription;
  private roleSub?: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authSub = this.authService.authState$.subscribe((auth) => {
      this.isAuthenticated = auth;
    });

    // Subscribe to role changes
    this.roleSub = this.authService.getRoleStream().subscribe((role) => {
      this.role = role || '';
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  get userRole(): string {
    return this.role;
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.roleSub?.unsubscribe();
  }
}

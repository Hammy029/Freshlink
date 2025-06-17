import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  isBaseDashboardRoute = false;
  role: 'admin' | 'user' = 'user'; // default fallback

  constructor(private router: Router) {
    // Retrieve and validate the role from localStorage
    const storedRole = localStorage.getItem('role');

    if (storedRole === 'admin' || storedRole === 'user') {
      this.role = storedRole;
    }

    // Determine if on base dashboard route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isBaseDashboardRoute = this.router.url === '/dashboard';
    });
  }
}

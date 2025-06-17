import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports:[CommonModule, RouterOutlet, RouterLink],
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  isAdminDashboardBase = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if current route is exactly /admin
    this.isAdminDashboardBase = this.router.url === '/admin';
  }
}

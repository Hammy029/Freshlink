import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Farmervendor';

  constructor(public router: Router) {}

  /**
   * ✅ Hide footer on specific routes (login, cart)
   */
  shouldShowFooter(): boolean {
    const excludedRoutes = ['/login', '/cart'];
    return !excludedRoutes.some(route => this.router.url.includes(route));
  }
}

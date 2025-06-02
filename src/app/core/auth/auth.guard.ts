import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const isAuthenticated = this.authService.isLoggedIn();

    if (!isAuthenticated) {
      // Not logged in, redirect to login page
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // User is authenticated, check for roles
    const expectedRoles = route.data['roles'] as Array<string> | undefined;
    if (expectedRoles && expectedRoles.length > 0) {
      const userRole = this.authService.getUserRole(); // Implement this to get role from stored token/session
      if (!userRole || !expectedRoles.includes(userRole)) {
        // User does not have required role, redirect or show error page
        this.router.navigate(['/']); // or redirect to a "not authorized" page
        return false;
      }
    }

    // User has required role or no role restrictions on this route
    return true;
  }
}

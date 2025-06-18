import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  user: any;
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  markAuthenticated /**
   * REGISTER a new user
   */ () {
    throw new Error('Method not implemented.');
  }

  private apiUrl = 'http://localhost:3000/auth'; // Adjust to your backend URL
  private currentUserRole = new BehaviorSubject<string | null>(null);
  private authState = new BehaviorSubject<boolean>(false);
  public authState$ = this.authState.asObservable();

  googleAuthUrl = `${this.apiUrl}/google`;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.authState.next(this.hasValidToken());

      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const role = parsedUser?.role || this.getUserRole();
      this.currentUserRole.next(role);
    }
  }

  /**
   * REGISTER a new user
   */
  register(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  /**
   * LOGIN user
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.setToken(res.access_token);
        this.setUser(res.user);
      })
    );
  }

  /**
   * UPDATE password after login
   */
  updatePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-password`, data);
  }

  /**
   * RESET password using a token
   */
  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  /**
   * GET current user info
   */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  /**
   * LOGIN with Google
   */
  googleLogin(): void {
    window.location.href = this.googleAuthUrl;
  }

  /**
   * LOGOUT and clear session
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.currentUserRole.next(null);
    this.authState.next(false);
    this.router.navigate(['/']);
  }

  /**
   * IS user logged in
   */
  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  /**
   * GET stored token
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('access_token');
  }

  /**
   * SET token (called on login or Google OAuth callback)
   */
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }

    const decoded = this.decodeToken(token);
    this.currentUserRole.next(decoded?.role ?? null);
    this.authState.next(true);

    // Set minimal user info from token or combine with existing
    if (decoded && decoded.email) {
      const existingUser = this.getUser();

      const userInfo = {
        _id: decoded.sub || existingUser?._id || null, // Ensure _id is preserved
        username: decoded.username || existingUser?.username || '',
        email: decoded.email,
        role: decoded.role || 'user',
        phone_no: existingUser?.phone_no || null, // optional extra
      };

      this.setUser(userInfo);
    }
  }

  /**
   * SET user info (can be from decoded token or direct response)
   */
  setUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserRole.next(user?.role ?? null);
    this.authState.next(true);
  }

  /**
   * GET full user object
   */
  getUser(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * GET role from user object or token
   */
  getUserRole(): string | null {
    const user = this.getUser();
    if (user && user.role) return user.role;

    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token)?.role ?? null;
  }

  /**
   * GET username
   */
  getUsername(): string | null {
    const user = this.getUser();
    return user?.username ?? null;
  }

  /**
   * DECODE token payload
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  /**
   * OBSERVABLE for user role changes
   */
  getRoleStream(): Observable<string | null> {
    return this.currentUserRole.asObservable();
  }

  /**
   * CHECK if token is valid and not expired
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }
}

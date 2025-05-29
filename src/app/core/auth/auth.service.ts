import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // Adjust to your backend URL
  private currentUserRole = new BehaviorSubject<string | null>(null);

  // Initialize authState with false, update it after platform check in constructor
  private authState = new BehaviorSubject<boolean>(false);
  public authState$ = this.authState.asObservable();

  googleAuthUrl = `${this.apiUrl}/google`; // Set this if needed

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only check token if running in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.authState.next(this.hasValidToken());
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
    }
    this.currentUserRole.next(null);
    this.authState.next(false); // update auth state to logged out
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
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('access_token');
  }

  /**
   * SET token (called on login or google OAuth callback)
   */
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
    const decoded = this.decodeToken(token);
    this.currentUserRole.next(decoded?.role ?? null);
    this.authState.next(true); // update auth state to logged in
  }

  /**
   * GET role from decoded token
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token)?.role ?? null;
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
   * Helper to check if token exists and valid
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    // Check expiration (exp in seconds)
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }
}

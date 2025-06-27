import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface FarmProduct {
  quantity: any;
  _id: string;
  name: string;
  description?: string;
  price: number;
  status: string;
  category?: any;
  farm?: any;
}

export interface User {
  username: any;
  phone_no: any;
  _id: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private baseUrl = 'http://localhost:3000/farm';
  private isBrowser: boolean;
  private currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      this.currentUser = user ? JSON.parse(user) : null;
    }
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (this.isBrowser) {
      token = localStorage.getItem('access_token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Public products (no login required)
  getAvailableProductsPublic(): Observable<FarmProduct[]> {
    return this.http.get<FarmProduct[]>(`${this.baseUrl}/public`);
  }

  // ✅ Unified fetch method that switches based on user role
  getProducts(): Observable<FarmProduct[]> {
    if (!this.currentUser) return of([]); // Not logged in

    const url =
      this.currentUser.role === 'admin'
        ? `${this.baseUrl}/admin-products`
        : `${this.baseUrl}/my-products`;

    return this.http.get<FarmProduct[]>(url, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Optionally keep separate admin + user methods if needed
  getAllProductsAdmin(): Observable<FarmProduct[]> {
    return this.http.get<FarmProduct[]>(`${this.baseUrl}/admin-products`, {
      headers: this.getAuthHeaders()
    });
  }

  getMyProducts(): Observable<FarmProduct[]> {
    return this.http.get<FarmProduct[]>(`${this.baseUrl}/my-products`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Add a new product (auto-linked by backend to current user)
  addProduct(product: any): Observable<FarmProduct> {
    return this.http.post<FarmProduct>(this.baseUrl, product, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Update existing product
  updateProduct(id: string, updatedData: any): Observable<FarmProduct> {
    return this.http.patch<FarmProduct>(`${this.baseUrl}/${id}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Delete product
  deleteProduct(id: string): Observable<FarmProduct> {
    return this.http.delete<FarmProduct>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Mark product as sold
  markAsSold(id: string): Observable<FarmProduct> {
    return this.updateProduct(id, { status: 'Sold' });
  }

  // ✅ Utility: check if current user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}

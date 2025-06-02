import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// Define a FarmProduct interface to strongly type the products
export interface FarmProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  status: string; // e.g. 'Available' or 'Sold'
  category?: any;
  farm?: any; // owner user
  // add other relevant fields here...
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private baseUrl = 'http://localhost:3000/farm';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Helper method to include Authorization header
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

  // Public: get all available products without auth header (for public UI)
  getAvailableProductsPublic(): Observable<FarmProduct[]> {
    // Assumes backend endpoint GET /farm/public or public access to GET /farm
    return this.http.get<FarmProduct[]>(`${this.baseUrl}/public`);
  }

  // New method to fetch all farm products for farmer UI (requires auth)
  getAllProducts(): Observable<FarmProduct[]> {
    return this.http.get<FarmProduct[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

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

  addProduct(product: any): Observable<FarmProduct> {
    return this.http.post<FarmProduct>(this.baseUrl, product, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(id: string, updatedData: any): Observable<FarmProduct> {
    return this.http.patch<FarmProduct>(`${this.baseUrl}/${id}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(id: string): Observable<FarmProduct> {
    return this.http.delete<FarmProduct>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  markAsSold(id: string): Observable<FarmProduct> {
    return this.updateProduct(id, { status: 'Sold' });
  }
}

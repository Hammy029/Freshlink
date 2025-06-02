import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private baseUrl = 'http://localhost:3000/farm';

  constructor(private http: HttpClient) {}

  // Helper method to include Authorization header
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllProductsAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin-products`, {
      headers: this.getAuthHeaders()
    });
  }

  getMyProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-products`, {
      headers: this.getAuthHeaders()
    });
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, product, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(id: string, updatedData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  markAsSold(id: string): Observable<any> {
    return this.updateProduct(id, { status: 'Sold' });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserorderService {
  private baseUrl = 'http://localhost:3000/order';

  constructor(private http: HttpClient) {}

  /** Get Authorization header with token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Get product details by productId (used in component) */
  getProductById(productId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/farm/${productId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** Place a new order */
  placeOrder(orderData: {
    productId: string;
    quantity: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/order`, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  /** Update an existing order */
  updateOrder(
    orderId: string,
    orderData: {
      productId: string;
      quantity: number;
      notes?: string;
    }
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/update/${orderId}`, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  /** Cancel an order by ID */
  cancelOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cancel/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** Fetch all orders made by the current user */
  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-orders`, {
      headers: this.getAuthHeaders()
    });
  }
}

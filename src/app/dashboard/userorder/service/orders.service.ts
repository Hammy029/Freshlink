import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private baseUrl = 'http://localhost:3000/order'; // ✅ Change if hosted elsewhere

  constructor(private http: HttpClient) {}

  /**
   * ✅ Create a new order from cart or product view
   */
  placeOrder(orderData: { productId: any; quantity: any; notes: any }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, orderData);
  }

  /**
   * ✅ Update an existing order
   */
  updateOrder(editingOrderId: string, orderData: { productId: any; quantity: any; notes: any }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${editingOrderId}`, orderData);
  }

  /**
   * ✅ Cancel/Delete an order (if owner or admin)
   */
  cancelOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${orderId}`);
  }

  /**
   * ✅ Get all orders — Admin use
   */
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  /**
   * ✅ Get orders made by the currently logged-in user
   */
  getMyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-orders`);
  }

  /**
   * ✅ Get orders for farm products owned by the logged-in farmer
   */
  getOrdersForFarmer(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/farmer-orders`);
  }

  /**
   * ✅ Get details of a specific order by ID
   */
  getOrderById(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${orderId}`);
  }

  /**
   * ✅ Notify farmer about a new order (mock implementation supported)
   */
  notifyFarmer(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${orderId}/notify-farmer`, {});
  }
}

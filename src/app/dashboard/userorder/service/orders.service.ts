import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define types to strengthen typing
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: OrderItem[];
  grandTotal: number;
}

export interface Order {
  _id: string;
  userId: any;
  items: {
    product: any;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private baseUrl = 'http://localhost:3000/order'; // ✅ Adjust for production

  constructor(private http: HttpClient) {}

  /**
   * ✅ Create a new order from cart
   */
  placeOrder(orderData: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}`, orderData);
  }

  /**
   * ✅ Update an existing order (admin or owner)
   */
  updateOrder(id: string, orderData: Partial<CreateOrderDto>): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}`, orderData);
  }

  /**
   * ✅ Cancel/Delete an order (admin or owner)
   */
  cancelOrder(orderId: string): Observable<Order> {
    return this.http.delete<Order>(`${this.baseUrl}/${orderId}`);
  }

  /**
   * ✅ Admin: Get all orders
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

  /**
   * ✅ Logged-in user: Get their own orders
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/my-orders`);
  }

  /**
   * ✅ Farmer: Get orders for products they posted
   */
  getOrdersForFarmer(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/farmer-orders`);
  }

  /**
   * ✅ Get details of a specific order
   */
  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  /**
   * ✅ Notify farmer(s) after order placement
   */
  notifyFarmer(orderId: string): Observable<{ message: string; orderId: string }> {
    return this.http.post<{ message: string; orderId: string }>(
      `${this.baseUrl}/${orderId}/notify-farmer`,
      {}
    );
  }
}

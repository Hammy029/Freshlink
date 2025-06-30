import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface FarmProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: any;
  status: string;
  imageUrl?: string;
  category?: any;
  farm?: any;
}

export interface User {
  username: any;
  phone_no: any;
  _id: string;
  role: 'admin' | 'user';
}

// ✅ Added Order interface for type safety
export interface Order {
  items: any;
  _id?: string;
  id?: string;
  userId?: string;
  customerId?: string;
  buyerId?: string;
  products: any[];
  total: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private baseUrl = 'http://localhost:3000/farm';
  private ordersUrl = 'http://localhost:3000/order';
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

  // =============== PRODUCT METHODS ===============

  getAvailableProductsPublic(): Observable<FarmProduct[]> {
    return this.http.get<FarmProduct[]>(`${this.baseUrl}/public`);
  }

  getProducts(): Observable<FarmProduct[]> {
    if (!this.currentUser) return of([]);
    const url =
      this.currentUser.role === 'admin'
        ? `${this.baseUrl}/admin-products`
        : `${this.baseUrl}/my-products`;

    return this.http.get<FarmProduct[]>(url, {
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

  addProduct(product: Partial<FarmProduct>): Observable<FarmProduct> {
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

  reduceProductQuantity(productId: string, quantity: number): Observable<FarmProduct> {
    return this.http.patch<FarmProduct>(
      `${this.baseUrl}/${productId}/reduce-quantity`,
      { quantity },
      { headers: this.getAuthHeaders() }
    );
  }

  // =============== ORDER METHODS ===============

  getOrders(): Observable<Order[]> {
    if (!this.currentUser) return of([]);
    const userId = this.currentUser._id;
    const url =
      this.currentUser.role === 'admin'
        ? `${this.ordersUrl}`
        : `${this.ordersUrl}/my-orders?userId=${userId}`;

    return this.http.get<Order[]>(url, {
      headers: this.getAuthHeaders()
    });
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  getMyOrders(): Observable<Order[]> {
    if (!this.currentUser) return of([]);
    const userId = this.currentUser._id;
    return this.http.get<Order[]>(`${this.ordersUrl}/my-orders?userId=${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/my-orders?userId=${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getFarmerOrders(farmerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/farmer-orders?farmerId=${farmerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.ordersUrl, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrder(orderId: string, updatedData: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${orderId}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.delete<Order>(`${this.ordersUrl}/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.ordersUrl}/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  removeProductFromOrder(orderId: string, productId: string): Observable<Order> {
    return this.http.patch<Order>(
      `${this.ordersUrl}/${orderId}/remove-item/${productId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${orderId}/status`, 
      { status }, 
      { headers: this.getAuthHeaders() }
    );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.ordersUrl}/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  notifyFarmer(orderId: string): Observable<{ message: string; orderId: string }> {
    return this.http.post<{ message: string; orderId: string }>(
      `${this.ordersUrl}/${orderId}/notify-farmer`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // =============== UTILITY METHODS ===============

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.currentUser?._id || null;
  }

  canModifyOrder(order: Order): boolean {
    if (this.isAdmin()) return true;
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return false;
    return (
      order.userId === currentUserId ||
      order.customerId === currentUserId ||
      order.buyerId === currentUserId
    );
  }

  canModifyProduct(product: FarmProduct): boolean {
    if (this.isAdmin()) return true;
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return false;
    return product.farm === currentUserId;
  }

  refreshCurrentUser(): void {
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      this.currentUser = user ? JSON.parse(user) : null;
    }
  }
}

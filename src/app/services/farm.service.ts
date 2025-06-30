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
  private ordersUrl = 'http://localhost:3000/orders'; // ✅ Added orders endpoint
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
  addProduct(product: Partial<FarmProduct>): Observable<FarmProduct> {
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

  // ✅ NEW: Reduce quantity of a product (after add-to-cart)
  reduceProductQuantity(productId: string, quantity: number): Observable<FarmProduct> {
    return this.http.patch<FarmProduct>(
      `${this.baseUrl}/${productId}/reduce-quantity`,
      { quantity },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // =============== ORDER METHODS ===============

  // ✅ Unified order fetch method that switches based on user role
  getOrders(): Observable<Order[]> {
    if (!this.currentUser) return of([]); // Not logged in

    const url =
      this.currentUser.role === 'admin'
        ? `${this.ordersUrl}/admin/all`
        : `${this.ordersUrl}/my-orders`;

    return this.http.get<Order[]>(url, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Get all orders (admin only)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/admin/all`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Get current user's orders only
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/my-orders`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Get orders by specific user ID (admin only)
  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Create a new order
  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.ordersUrl, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Update an existing order
  updateOrder(orderId: string, updatedData: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${orderId}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Cancel an order
  cancelOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${orderId}/cancel`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Delete an order (admin only)
  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.ordersUrl}/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Remove a product from an order
  removeProductFromOrder(orderId: string, productId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${orderId}/remove-product`, 
      { productId }, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Update order status (admin)
  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${orderId}/status`, 
      { status }, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Get order by ID
  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.ordersUrl}/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // =============== UTILITY METHODS ===============

  // ✅ Utility: check if current user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // ✅ Get current user info
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ✅ Get current user ID
  getCurrentUserId(): string | null {
    return this.currentUser?._id || null;
  }

  // ✅ Check if user can modify a specific order
  canModifyOrder(order: Order): boolean {
    if (this.isAdmin()) return true;
    
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return false;
    
    return order.userId === currentUserId || 
           order.customerId === currentUserId ||
           order.buyerId === currentUserId;
  }

  // ✅ Check if user can modify a specific product
  canModifyProduct(product: FarmProduct): boolean {
    if (this.isAdmin()) return true;
    
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return false;
    
    return product.farm === currentUserId;
  }

  // ✅ Refresh current user data from localStorage
  refreshCurrentUser(): void {
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      this.currentUser = user ? JSON.parse(user) : null;
    }
  }
}
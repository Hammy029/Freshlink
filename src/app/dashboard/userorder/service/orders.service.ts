import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Strongly typed interfaces for populated data
export interface PopulatedFarm {
  _id: string;
  username: string;
  email: string;
  phone_no: string;
}

export interface PopulatedCategory {
  _id: string;
  name: string;
}

export interface PopulatedProduct {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  category: PopulatedCategory;
  farm: PopulatedFarm;
}

// ✅ Used when placing an order
export interface OrderItemInput {
  productId: string;
  quantity: number;
}

// ✅ Create order DTO for POST
export interface CreateOrderDto {
  items: OrderItemInput[];
  grandTotal: number;
}

// ✅ Returned item format from backend (with populated product)
export interface OrderItem {
  product: PopulatedProduct;
  quantity: number;
}

// ✅ Full order returned from backend
export interface Order {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    phone_no: string;
  };
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private baseUrl = 'http://localhost:3000/order'; // 🔁 Use environment var in production

  constructor(private http: HttpClient) {}

  /**
   * ✅ Place a new order
   */
  placeOrder(orderData: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}`, orderData);
  }

  /**
   * ✅ Update an order (admin/owner)
   */
  updateOrder(id: string, orderData: Partial<CreateOrderDto>): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}`, orderData);
  }

  /**
   * ✅ Cancel/delete an order
   */
  cancelOrder(orderId: string): Observable<Order> {
    return this.http.delete<Order>(`${this.baseUrl}/${orderId}`);
  }

  /**
   * ✅ Admin: Fetch all orders
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

  /**
   * ✅ User: Fetch only their orders
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/my-orders`);
  }

  /**
   * ✅ Farmer: Fetch orders for their products
   */
  getOrdersForFarmer(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/farmer-orders`);
  }

  /**
   * ✅ Get a specific order by ID
   */
  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  /**
   * ✅ Notify farmers of new order
   */
  notifyFarmer(orderId: string): Observable<{ message: string; orderId: string }> {
    return this.http.post<{ message: string; orderId: string }>(
      `${this.baseUrl}/${orderId}/notify-farmer`,
      {}
    );
  }
}

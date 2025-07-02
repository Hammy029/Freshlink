import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError, BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  availableQuantity: number;
}

export interface EnhancedOrderData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  paymentMethod?: 'mpesa' | 'cash';
  paymentData?: any;
  mpesaReceiptNumber?: string;
  orderReference?: string;
  deliveryFee?: number;
  taxAmount?: number;
  finalTotal?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];
  private apiUrl = 'http://localhost:3000/order';
  private isBrowser: boolean;

  // Observable for cart updates
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadCartFromStorage();
    }
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  addToCart(product: any): void {
    const productId = product.productId || product._id;
    const quantity = product.orderQuantity || product.quantity || 1;

    const existing = this.cart.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      existing.total = existing.price * existing.quantity;
    } else {
      const newItem: CartItem = {
        productId,
        title: product.title,
        price: product.price,
        quantity,
        total: product.price * quantity,
        availableQuantity: product.availableQuantity || product.quantity || 0,
      };
      this.cart.push(newItem);
    }

    this.saveCartToStorage();
    console.log('🛒 Cart updated:', this.cart);
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter((item) => item.productId !== productId);
    this.saveCartToStorage();
  }

  increaseQuantity(productId: string): void {
    const item = this.cart.find((i) => i.productId === productId);
    if (item && item.quantity < item.availableQuantity) {
      item.quantity++;
      item.total = item.price * item.quantity;
      this.saveCartToStorage();
    }
  }

  decreaseQuantity(productId: string): void {
    const item = this.cart.find((i) => i.productId === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      item.total = item.price * item.quantity;
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    this.cart = [];
    this.saveCartToStorage();
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.total, 0);
  }

  // Get cart item count
  getCartCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  // Check if cart is empty
  isEmpty(): boolean {
    return this.cart.length === 0;
  }

  // Get cart item by product ID
  getCartItem(productId: string): CartItem | undefined {
    return this.cart.find((item) => item.productId === productId);
  }

  // Check if product is in cart
  isInCart(productId: string): boolean {
    return this.cart.some((item) => item.productId === productId);
  }

  /**
   * Enhanced sendCartToBackend method that supports both basic and enhanced order data
   * Maintains backward compatibility with existing backend structure
   */
  sendCartToBackend(enhancedData?: EnhancedOrderData): Observable<any> {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (!userStr || !token) {
        console.error('❌ Missing user or token in localStorage.');
        throw new Error('User not logged in or token missing.');
      }

      let parsedUser: any;
      try {
        parsedUser = JSON.parse(userStr);
      } catch (jsonError) {
        console.error(
          '❌ Failed to parse user JSON from localStorage.',
          jsonError
        );
        throw new Error('Corrupted user data.');
      }

      const userId = parsedUser._id || parsedUser.id;
      if (!userId) {
        console.error('❌ User ID missing in parsed user object:', parsedUser);
        throw new Error('Invalid user data.');
      }

      // ✅ Base payload structure (compatible with existing backend)
      const payload: any = {
        userId,
        items: this.cart.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          availableQuantity: item.availableQuantity,
        })),
        grandTotal: this.getTotal(),
      };

      // ✅ Add enhanced data if provided (for new features)
      if (enhancedData) {
        payload.customerInfo = {
          fullName: enhancedData.fullName,
          phoneNumber: enhancedData.phoneNumber,
          address: enhancedData.address,
        };

        payload.paymentInfo = {
          method: enhancedData.paymentMethod || 'cash',
          mpesaReceiptNumber: enhancedData.mpesaReceiptNumber,
          paymentData: enhancedData.paymentData,
        };

        payload.orderDetails = {
          orderReference: enhancedData.orderReference || `ORD-${Date.now()}`,
          deliveryFee: enhancedData.deliveryFee || 0,
          taxAmount: enhancedData.taxAmount || 0,
          finalTotal: enhancedData.finalTotal || this.getTotal(),
        };

        // Add timestamp
        payload.createdAt = new Date().toISOString();
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      console.log('📦 Sending order payload:', payload);

      return this.http.post(this.apiUrl, payload, { headers });
    } catch (error) {
      console.error('❌ sendCartToBackend() error:', error);
      return throwError(() => error);
    }
  }

  /**
   * Convenience method for sending M-Pesa orders with payment data
   */
  sendMpesaOrder(
    customerData: any,
    paymentData: any,
    orderTotals: any
  ): Observable<any> {
    const enhancedData: EnhancedOrderData = {
      fullName: customerData.fullName,
      phoneNumber: customerData.phoneNumber,
      address: customerData.address,
      paymentMethod: 'mpesa',
      paymentData: paymentData,
      mpesaReceiptNumber: paymentData.MpesaReceiptNumber,
      orderReference: `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`,
      deliveryFee: orderTotals.deliveryFee,
      taxAmount: orderTotals.taxAmount,
      finalTotal: orderTotals.finalTotal,
    };

    return this.sendCartToBackend(enhancedData);
  }

  /**
   * Convenience method for sending cash orders with customer data
   */
  sendCashOrder(customerData: any, orderTotals: any): Observable<any> {
    const enhancedData: EnhancedOrderData = {
      fullName: customerData.fullName,
      phoneNumber: customerData.phoneNumber,
      address: customerData.address,
      paymentMethod: 'cash',
      orderReference: `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`,
      deliveryFee: orderTotals.deliveryFee,
      taxAmount: orderTotals.taxAmount,
      finalTotal: orderTotals.finalTotal,
    };

    return this.sendCartToBackend(enhancedData);
  }

  // Validate cart before checkout
  validateCart(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.isEmpty()) {
      errors.push('Cart is empty');
    }

    this.cart.forEach((item) => {
      if (item.quantity > item.availableQuantity) {
        errors.push(`${item.title}: Quantity exceeds available stock`);
      }
      if (item.quantity <= 0) {
        errors.push(`${item.title}: Invalid quantity`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get order history
  getOrderHistory(): Observable<any> {
    const headers = this.getAuthHeaders();

    if (!headers) {
      throw new Error('User not authenticated');
    }

    return this.http.get(`${this.apiUrl}/history`, { headers });
  }

  // Track order
  trackOrder(orderReference: string): Observable<any> {
    const headers = this.getAuthHeaders();

    if (!headers) {
      throw new Error('User not authenticated');
    }

    return this.http.get(`${this.apiUrl}/track/${orderReference}`, { headers });
  }

  // Get authentication headers
  private getAuthHeaders(): HttpHeaders | null {
    if (!this.isBrowser) return null;

    const token = localStorage.getItem('access_token');
    if (!token) {
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private saveCartToStorage(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.cartSubject.next([...this.cart]); // Emit cart updates
      } catch (e) {
        console.error('❌ Failed to save cart to localStorage:', e);
      }
    }
  }

  private loadCartFromStorage(): void {
    if (this.isBrowser) {
      try {
        const saved = localStorage.getItem('cart');
        if (saved) {
          this.cart = JSON.parse(saved);
          this.cartSubject.next([...this.cart]); // Emit initial cart state
        }
      } catch (e) {
        console.error('❌ Failed to load cart from localStorage:', e);
        this.cart = [];
      }
    }
  }
}

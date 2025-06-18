import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  availableQuantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];
  private apiUrl = 'http://localhost:3000/order'; // ✅ Backend order endpoint
  private isBrowser: boolean;

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

    const existing = this.cart.find(item => item.productId === productId);

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
    this.cart = this.cart.filter(item => item.productId !== productId);
    this.saveCartToStorage();
  }

  increaseQuantity(productId: string): void {
    const item = this.cart.find(i => i.productId === productId);
    if (item && item.quantity < item.availableQuantity) {
      item.quantity++;
      item.total = item.price * item.quantity;
      this.saveCartToStorage();
    }
  }

  decreaseQuantity(productId: string): void {
    const item = this.cart.find(i => i.productId === productId);
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

  /**
   * Sends the cart to the backend as a properly formatted order payload.
   * Includes Authorization header with token from localStorage.
   */
  sendCartToBackend(): Observable<any> {
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
        console.error('❌ Failed to parse user JSON from localStorage.', jsonError);
        throw new Error('Corrupted user data.');
      }

      const userId = parsedUser._id || parsedUser.id;
      if (!userId) {
        console.error('❌ User ID missing in parsed user object:', parsedUser);
        throw new Error('Invalid user data.');
      }

      const payload = {
        userId,
        items: this.cart.map(item => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        totalAmount: this.getTotal(),
      };

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

  private saveCartToStorage(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cart));
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
        }
      } catch (e) {
        console.error('❌ Failed to load cart from localStorage:', e);
        this.cart = [];
      }
    }
  }
}

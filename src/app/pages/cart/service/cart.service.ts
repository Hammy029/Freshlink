import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/cart';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadCartFromStorage(); // ✅ Safe for browser only
    }
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  addToCart(product: any): void {
    const existing = this.cart.find(item => item.productId === product._id);
    if (existing) {
      existing.quantity += product.orderQuantity;
      existing.total = existing.price * existing.quantity;
    } else {
      this.cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: product.orderQuantity,
        total: product.price * product.orderQuantity,
        availableQuantity: product.quantity || 0
      });
    }
    this.saveCartToStorage();
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

  sendCartToBackend(userId: string): Observable<any> {
    const payload = {
      userId,
      items: this.cart,
      grandTotal: this.getTotal(),
    };
    return this.http.post(this.apiUrl, payload);
  }

  private saveCartToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cart));
    }
  }

  private loadCartFromStorage(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cart = JSON.parse(saved);
    }
  }
}

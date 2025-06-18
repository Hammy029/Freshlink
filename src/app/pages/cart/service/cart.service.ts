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
      this.loadCartFromStorage();
    }
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  addToCart(product: any): void {
    const productId = product.productId || product._id; // allow compatibility from UI
    const quantity = product.orderQuantity || product.quantity || 1;

    const existing = this.cart.find(item => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      existing.total = existing.price * existing.quantity;
    } else {
      const newItem: CartItem = {
        productId: productId,
        title: product.title,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity,
        availableQuantity: product.availableQuantity || product.quantity || 0
      };
      this.cart.push(newItem);
    }

    this.saveCartToStorage();
    console.log('Cart:', this.cart);
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
    if (this.isBrowser) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        this.cart = JSON.parse(saved);
      }
    }
  }
}

import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, CartService } from './service/cart.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  grandTotal: number = 0;
  isBrowser: boolean;

  constructor(
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadCart();
    }
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCart();
    this.calculateGrandTotal();
  }

  increaseQty(item: CartItem): void {
    if (item.quantity < item.availableQuantity) {
      this.cartService.increaseQuantity(item.productId);
      this.loadCart();
    }
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.decreaseQuantity(item.productId);
      this.loadCart();
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.productId);
    this.loadCart();
  }

  calculateGrandTotal(): void {
    this.grandTotal = this.cartService.getTotal();
  }

  submitCart(): void {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      alert('Please log in to place an order.');
      return;
    }

    try {
      console.log('Sending cart to backend...');
      this.cartService.sendCartToBackend().subscribe({
        next: (response) => {
          console.log('✅ Order placed:', response);
          alert('Order placed successfully!');
          this.cartService.clearCart();
          this.loadCart();
        },
        error: (error) => {
          console.error('❌ Order failed:', error);
          alert('Failed to place order. Check console for details.');
        },
      });
    } catch (error) {
      console.error('❌ Unexpected client error:', error);
      alert('Unexpected error. Possibly corrupted user data.');
    }
  }
}

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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?._id;

    if (!userId) {
      alert('Please log in to place an order.');
      return;
    }

    this.cartService.sendCartToBackend(userId).subscribe({
      next: () => {
        alert('Order placed successfully!');
        this.cartService.clearCart();
        this.loadCart();
      },
      error: () => alert('Failed to place order'),
    });
  }
}

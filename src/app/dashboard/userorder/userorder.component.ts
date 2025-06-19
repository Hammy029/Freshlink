import { Component, OnInit } from '@angular/core';
import { OrdersService, Order } from './service/orders.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-userorder',
  standalone: true,
  templateUrl: './userorder.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./userorder.component.css'],
})
export class UserorderComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  copyToastVisible = false; // ✅ Toast state

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  /**
   * ✅ Lifecycle hook: Load orders
   */
  ngOnInit(): void {
    this.loadAllOrders();
  }

  /**
   * ✅ Fetch all orders for admin view
   */
  loadAllOrders(): void {
    this.loading = true;
    this.ordersService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.loading = false;
        console.log('Admin orders:', this.orders);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      },
    });
  }

  /**
   * ✅ Admin cancels an order with confirmation
   */
  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.ordersService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('✅ Order canceled successfully!');
          this.loadAllOrders();
        },
        error: (err) => {
          console.error('❌ Failed to cancel order:', err);
          alert('❌ Failed to cancel order.');
        },
      });
    }
  }

  /**
   * ✅ Remove a specific product from an order
   */
  removeItemFromOrder(orderId: string, productId: string): void {
    if (confirm('Remove this product from the order?')) {
      this.ordersService.removeProductFromOrder(orderId, productId).subscribe({
        next: () => {
          alert('🗑️ Product removed from order.');
          this.loadAllOrders();
        },
        error: (err) => {
          console.error('❌ Failed to remove product from order:', err);
          alert('❌ Failed to remove product.');
        },
      });
    }
  }

  /**
   * ✅ Copies product ID and shows toast
   */
  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.showCopyToast();
    }).catch(err => {
      console.error('❌ Clipboard copy failed:', err);
    });
  }

  /**
   * ✅ Displays toast for 2 seconds
   */
  showCopyToast(): void {
    this.copyToastVisible = true;
    setTimeout(() => {
      this.copyToastVisible = false;
    }, 2000);
  }
}

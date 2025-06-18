import { Component, OnInit } from '@angular/core';
import { OrdersService, Order } from './service/orders.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-userorder',
  templateUrl: './userorder.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./userorder.component.css'],
})
export class UserorderComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  /**
   * ✅ Load all orders (admin view)
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
   * ✅ Admin cancels an order
   */
  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.ordersService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order canceled successfully!');
          this.loadAllOrders();
        },
        error: (err) => {
          console.error('Failed to cancel order', err);
          alert('Failed to cancel order.');
        },
      });
    }
  }

  /**
   * ✅ Copy product ID to clipboard
   */
  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Product ID copied to clipboard!');
    }).catch(err => {
      console.error('Clipboard copy failed', err);
    });
  }
}

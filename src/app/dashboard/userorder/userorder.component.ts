import { Component, OnInit } from '@angular/core';
import { OrdersService } from './service/orders.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-userorder',
  templateUrl: './userorder.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./userorder.component.css']
})
export class UserorderComponent implements OnInit {
  orders: any[] = [];

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  /**
   * ✅ Load all orders with populated user and product data
   */
  loadAllOrders(): void {
    this.ordersService.getAllOrders().subscribe({
      next: (data: any[]) => {
        this.orders = data;
        console.log('Admin orders:', this.orders);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
      }
    });
  }

  /**
   * ✅ Optionally cancel order as admin
   */
  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.ordersService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order canceled successfully!');
          this.loadAllOrders();
        },
        error: (err: any) => {
          console.error('Failed to cancel order', err);
          alert('Failed to cancel order.');
        }
      });
    }
  }
}
